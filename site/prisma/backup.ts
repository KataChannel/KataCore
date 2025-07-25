import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const BACKUP_ROOT_DIR = '../taza_json';

function getFormattedDate(): string {
  const now = new Date();
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}_${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}`;
}

const BACKUP_DIR = path.join(BACKUP_ROOT_DIR, getFormattedDate());

async function getTables(): Promise<string[]> {
  const tables: { tablename: string }[] = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
  return tables.map((table) => table.tablename);
}

async function backupTableToJson(table: string): Promise<void> {
  try {
    const data: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "${table}"`);
    const filePath: string = path.join(BACKUP_DIR, `${table}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Backup JSON thành công: ${filePath}`);
  } catch (error) {
    console.error(`❌ Lỗi backup bảng ${table}:`, error);
  }
}

async function backupAllTablesToJson(): Promise<void> {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const tables: string[] = await getTables();
  for (const table of tables) {
    await backupTableToJson(table);
  }
}

async function restoreTableFromJson(table: string): Promise<void> {
  try {
    const latestBackupDir = fs.readdirSync(BACKUP_ROOT_DIR).sort().reverse()[0];
    if (!latestBackupDir) {
      console.error(`❌ Không tìm thấy thư mục backup.`);
      return;
    }
    const filePath: string = path.join(BACKUP_ROOT_DIR, latestBackupDir, `${table}.json`);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Không tìm thấy file backup cho bảng ${table}`);
      return;
    }

    const data: any[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const row of data) {
      await prisma.$queryRawUnsafe(
        `INSERT INTO "${table}" (${Object.keys(row).join(', ')}) VALUES (${Object.values(row).map((_, i) => `$${i + 1}`).join(', ')})`,
        ...Object.values(row)
      );
    }
    console.log(`✅ Khôi phục dữ liệu thành công cho bảng ${table}`);
  } catch (error) {
    console.error(`❌ Lỗi khôi phục bảng ${table}:`, error);
  }
}

async function restoreAllTablesFromJson(): Promise<void> {
  const tables: string[] = await getTables();
  for (const table of tables) {
    await restoreTableFromJson(table);
  }
}

backupAllTablesToJson()
  .then(() => console.log('🎉 Backup JSON hoàn tất!'))
  .catch((err) => console.error('Lỗi:', err))
  .finally(() => prisma.$disconnect());

// Để khôi phục dữ liệu, chạy restoreAllTablesFromJson()
// restoreAllTablesFromJson()
//   .then(() => console.log('🎉 Khôi phục dữ liệu JSON hoàn tất!'))
//   .catch((err) => console.error('Lỗi:', err))
//   .finally(() => prisma.$disconnect());
