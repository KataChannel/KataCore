import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const BACKUP_ROOT_DIR = 'taza_json';

interface RestoreStats {
  tablesProcessed: number;
  recordsRestored: number;
  errors: string[];
  warnings: string[];
}

const stats: RestoreStats = {
  tablesProcessed: 0,
  recordsRestored: 0,
  errors: [],
  warnings: []
};

async function cleanupBeforeRestore(): Promise<void> {
  console.log('🧹 Dọn dẹp dữ liệu cũ trước khi restore...');
  
  try {
    // Delete in reverse dependency order to avoid FK constraint issues
    const cleanupOrder = [
      'dathangsanpham',
      'donhangsanpham', 
      'phieugiaohangsanpham',
      'phieunhapkhosanpham',
      'dathang',
      'donhang',
      'phieugiaohang',
      'phieunhapkho',
      'tonkho'
      // Keep core data like khachhang, nhacungcap, sanpham, users, kho
    ];
    
    let totalDeleted = 0;
    for (const table of cleanupOrder) {
      try {
        const model = (prisma as any)[table];
        if (model && typeof model.deleteMany === 'function') {
          const result = await model.deleteMany({});
          const deletedCount = result.count || 0;
          totalDeleted += deletedCount;
          console.log(`🗑️  Đã xóa ${deletedCount} records từ bảng ${table}`);
        }
      } catch (error) {
        const errorMsg = `Không thể xóa bảng ${table}: ${error}`;
        console.log(`⚠️  ${errorMsg}`);
        stats.warnings.push(errorMsg);
      }
    }
    
    console.log(`✅ Hoàn thành dọn dẹp ${totalDeleted} records`);
  } catch (error) {
    const errorMsg = `Lỗi khi dọn dẹp: ${error}`;
    console.error(`❌ ${errorMsg}`);
    stats.errors.push(errorMsg);
  }
}

async function getTables(): Promise<string[]> {
  const tables: { tablename: string }[] =
    await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
  return tables.map((table) => table.tablename);
}

async function validateBackupData(data: any[], table: string): Promise<any[]> {
  if (!Array.isArray(data)) {
    throw new Error(`Dữ liệu backup cho bảng ${table} không phải là array`);
  }
  
  if (data.length === 0) {
    return data;
  }
  
  // Basic data validation and cleaning
  const cleanedData = data.map((item, index) => {
    if (!item || typeof item !== 'object') {
      stats.warnings.push(`Record ${index} trong bảng ${table} không hợp lệ`);
      return null;
    }
    
    const newItem = { ...item };
    
    // Convert string numbers to actual numbers for common fields
    ['size', 'slton', 'slchogiao', 'slchonhap', 'soluong', 'giaban', 'giagoc'].forEach(field => {
      if (newItem[field] && typeof newItem[field] === 'string') {
        const trimmed = newItem[field].trim();
        if (trimmed === '') {
          newItem[field] = null;
        } else {
          const parsed = parseFloat(trimmed);
          newItem[field] = isNaN(parsed) ? null : parsed;
        }
      }
    });
    
    // Clean string fields
    Object.keys(newItem).forEach(key => {
      if (typeof newItem[key] === 'string') {
        newItem[key] = newItem[key].trim();
      }
    });
    
    return newItem;
  }).filter(item => item !== null);
  
  console.log(`🔍 Đã validate ${data.length} records cho bảng ${table}, ${cleanedData.length} records hợp lệ`);
  
  return cleanedData;
}

async function restoreTableFromJson(table: string): Promise<void> {
  try {
    const latestBackupDir = fs.readdirSync(BACKUP_ROOT_DIR).sort().reverse()[0];
    if (!latestBackupDir) {
      throw new Error(`Không tìm thấy thư mục backup.`);
    }
    
    const filePath: string = path.join(
      BACKUP_ROOT_DIR,
      latestBackupDir,
      `${table}.json`,
    );
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Không tìm thấy file backup cho bảng ${table}, bỏ qua.`);
      stats.warnings.push(`File backup không tồn tại cho bảng ${table}`);
      return;
    }
    
    console.log(`📥 Đọc dữ liệu cho bảng: ${table}`);
    const rawData: any[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!Array.isArray(rawData) || rawData.length === 0) {
      console.log(`⚠️  Bảng ${table} không có dữ liệu để restore`);
      return;
    }
    
    // Validate and clean data
    const processedData = await validateBackupData(rawData, table);
    
    if (processedData.length === 0) {
      console.log(`⚠️  Bảng ${table} không có dữ liệu hợp lệ sau validation`);
      return;
    }

    const model = (prisma as any)[table];
    if (!model || typeof model.createMany !== 'function') {
      console.log(`🔧 Bảng ${table} không có Prisma model, sử dụng raw SQL...`);
      await restoreWithRawSQL(table, processedData);
      return;
    }

    // Try batch insert first
    try {
      console.log(`⏳ Đang restore ${processedData.length} records cho bảng ${table}...`);
      
      await model.createMany({
        data: processedData,
        skipDuplicates: true,
      });
      
      stats.recordsRestored += processedData.length;
      console.log(`✅ Đã nhập ${processedData.length} records vào bảng ${table}`);
      
    } catch (fkError: any) {
      if (fkError.message && fkError.message.includes('Foreign key constraint')) {
        console.log(`⚠️  Foreign key constraint lỗi cho bảng ${table}, thử từng record...`);
        await restoreRecordsIndividually(model, table, processedData);
      } else {
        throw fkError;
      }
    }
    
    stats.tablesProcessed++;
    
  } catch (error) {
    const errorMsg = `Lỗi khôi phục bảng ${table}: ${error}`;
    console.error(`❌ ${errorMsg}`);
    stats.errors.push(errorMsg);
  }
}

async function restoreWithRawSQL(table: string, data: any[]): Promise<void> {
  try {
    const columns = Object.keys(data[0])
      .map((col) => `"${col}"`)
      .join(', ');

    const values = data
      .map((item) => {
        return (
          '(' +
          Object.values(item)
            .map((val) => {
              if (typeof val === 'string') {
                return `'${val.replace(/'/g, "''")}'`;
              } else if (val === null || val === undefined) {
                return 'NULL';
              }
              return val;
            })
            .join(', ') +
          ')'
        );
      })
      .join(', ');

    await prisma.$executeRawUnsafe(
      `INSERT INTO "${table}" (${columns}) VALUES ${values} ON CONFLICT DO NOTHING`,
    );
    
    stats.recordsRestored += data.length;
    console.log(`✅ Đã nhập ${data.length} records vào bảng ${table} (raw SQL)`);
    
  } catch (error) {
    throw new Error(`Raw SQL insert failed: ${error}`);
  }
}

async function restoreRecordsIndividually(model: any, table: string, data: any[]): Promise<void> {
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < data.length; i++) {
    try {
      await model.create({
        data: data[i]
      });
      successCount++;
      
      // Progress indicator for large datasets
      if (i % 100 === 0 && i > 0) {
        console.log(`   Progress: ${i}/${data.length} records processed...`);
      }
      
    } catch (recordError: any) {
      errorCount++;
      if (errorCount <= 5) { // Only log first 5 errors to avoid spam
        console.log(`   ⚠️  Error inserting record ${i}: ${recordError.message}`);
      }
    }
  }
  
  stats.recordsRestored += successCount;
  console.log(`✅ Bảng ${table}: ${successCount} thành công, ${errorCount} lỗi`);
  
  if (errorCount > 0) {
    stats.warnings.push(`Bảng ${table}: ${errorCount} records không thể restore`);
  }
}

async function restoreAllTablesFromJson(): Promise<void> {
  const tables: string[] = await getTables();
  console.log(`📊 Tìm thấy ${tables.length} bảng trong cơ sở dữ liệu.`);
  
  // Define table restore order based on foreign key dependencies
  const tableOrder = [
    // Core tables without dependencies first
    'khachhang',
    'nhacungcap', 
    'sanpham',
    'users',
    'kho',
    'tonkho',
    
    // Tables with dependencies
    'dathang',
    'donhang',
    'phieugiaohang',
    'phieunhapkho',
    
    // Junction/relationship tables last
    'dathangsanpham',
    'donhangsanpham',
    'phieugiaohangsanpham',
    'phieunhapkhosanpham',
    
    // Any remaining tables
    ...tables.filter(t => ![
      'khachhang', 'nhacungcap', 'sanpham', 'users', 'kho', 'tonkho',
      'dathang', 'donhang', 'phieugiaohang', 'phieunhapkho',
      'dathangsanpham', 'donhangsanpham', 'phieugiaohangsanpham', 'phieunhapkhosanpham'
    ].includes(t))
  ];
  
  // Filter to only include tables that actually exist
  const orderedTables = tableOrder.filter(table => tables.includes(table));
  
  console.log(`🔄 Sẽ restore ${orderedTables.length} bảng theo thứ tự dependency`);
  
  for (let i = 0; i < orderedTables.length; i++) {
    const table = orderedTables[i];
    if (!table) continue;
    console.log(`\n[${i + 1}/${orderedTables.length}] Restore bảng: ${table}`);
    await restoreTableFromJson(table);
  }
}

function printFinalStats(): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 KẾT QUẢ RESTORE DATA');
  console.log('='.repeat(60));
  console.log(`✅ Số bảng đã xử lý: ${stats.tablesProcessed}`);
  console.log(`📝 Tổng records restored: ${stats.recordsRestored.toLocaleString()}`);
  console.log(`⚠️  Số warnings: ${stats.warnings.length}`);
  console.log(`❌ Số errors: ${stats.errors.length}`);
  
  if (stats.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    stats.warnings.slice(0, 10).forEach((warning, i) => {
      console.log(`   ${i + 1}. ${warning}`);
    });
    if (stats.warnings.length > 10) {
      console.log(`   ... và ${stats.warnings.length - 10} warnings khác`);
    }
  }
  
  if (stats.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    stats.errors.slice(0, 5).forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
    if (stats.errors.length > 5) {
      console.log(`   ... và ${stats.errors.length - 5} errors khác`);
    }
  }
  
  console.log('='.repeat(60));
}

async function main(): Promise<void> {
  const startTime = Date.now();
  console.log('🚀 BẮT ĐẦU QUÁ TRÌNH RESTORE DỮ LIỆU');
  console.log(`⏰ Thời gian bắt đầu: ${new Date().toLocaleString()}`);
  
  try {
    // Step 1: Clean up existing data
    await cleanupBeforeRestore();
    
    // Step 2: Restore data in proper order
    await restoreAllTablesFromJson();
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n🎉 HOÀN THÀNH RESTORE! (${duration}s)`);
    
  } catch (error) {
    console.error(`💥 Restore process failed: ${error}`);
    stats.errors.push(`Main process error: ${error}`);
  } finally {
    printFinalStats();
  }
}

main()
  .then(() => {
    if (stats.errors.length === 0) {
      console.log('\n✅ Restore process completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Restore completed with errors!');
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
