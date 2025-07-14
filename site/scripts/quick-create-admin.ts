#!/usr/bin/env ts-node
// Script tạo Super Administrator nhanh với thông tin mặc định
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(__dirname, '../.env') });

const prisma = new PrismaClient();

// Thông tin mặc định cho Super Admin
const DEFAULT_ADMIN = {
  email: 'admin@taza.com',
  username: 'superadmin',
  password: 'TazaAdmin@2024!',
  displayName: 'Super Administrator',
  phone: '+84-xxx-xxx-xxx',
};

// Tất cả quyền cho Super Administrator
const SUPER_ADMIN_PERMISSIONS = [
  // System permissions
  'system:admin',
  'system:manage',
  'system:configure',
  'system:audit',
  'system:backup',

  // User & Role management
  'create:user',
  'read:user',
  'update:user',
  'delete:user',
  'manage:user',
  'create:role',
  'read:role',
  'update:role',
  'delete:role',
  'manage:role',

  // Module admin permissions
  'admin:sales',
  'admin:crm',
  'admin:inventory',
  'admin:finance',
  'admin:hrm',
  'admin:projects',
  'admin:manufacturing',
  'admin:marketing',
  'admin:support',
  'admin:analytics',
  'admin:ecommerce',

  // Universal permissions
  'create:*',
  'read:*',
  'update:*',
  'delete:*',
  'manage:*',
  'admin:*',
];

const ALL_MODULES = [
  'sales',
  'crm',
  'inventory',
  'finance',
  'hrm',
  'projects',
  'manufacturing',
  'marketing',
  'support',
  'analytics',
  'ecommerce',
];

async function createQuickSuperAdmin() {
  try {
    console.log('🚀 Tạo Super Administrator với thông tin mặc định...');
    console.log('===================================================');

    // 1. Tạo Super Admin Role
    console.log('📝 Tạo Super Admin Role...');
    const superAdminRole = await prisma.role.upsert({
      where: { name: 'Super Administrator' },
      update: {
        description: 'Quản trị viên cấp cao nhất - có toàn quyền hệ thống TazaCore',
        permissions: JSON.stringify({
          permissions: SUPER_ADMIN_PERMISSIONS,
          modules: ALL_MODULES,
          level: 10,
          isSystemRole: true,
          scope: 'all',
        }),
      },
      create: {
        name: 'Super Administrator',
        description: 'Quản trị viên cấp cao nhất - có toàn quyền hệ thống TazaCore',
        permissions: JSON.stringify({
          permissions: SUPER_ADMIN_PERMISSIONS,
          modules: ALL_MODULES,
          level: 10,
          isSystemRole: true,
          scope: 'all',
        }),
      },
    });

    // 2. Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 12);

    // 3. Tạo hoặc cập nhật Super Admin User
    console.log('👤 Tạo/cập nhật Super Admin User...');
    const superAdmin = await prisma.user.upsert({
      where: { email: DEFAULT_ADMIN.email },
      update: {
        password: hashedPassword,
        displayName: DEFAULT_ADMIN.displayName,
        username: DEFAULT_ADMIN.username,
        phone: DEFAULT_ADMIN.phone,
        roleId: superAdminRole.id,
        isActive: true,
        isVerified: true,
        avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=dc2626&color=fff&size=128',
      },
      create: {
        email: DEFAULT_ADMIN.email,
        username: DEFAULT_ADMIN.username,
        password: hashedPassword,
        displayName: DEFAULT_ADMIN.displayName,
        phone: DEFAULT_ADMIN.phone,
        roleId: superAdminRole.id,
        isActive: true,
        isVerified: true,
        avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=dc2626&color=fff&size=128',
      },
      include: { role: true },
    });

    // 4. Tạo employee record (nếu có table)
    console.log('👨‍💼 Tạo Employee record...');
    try {
      await prisma.employee.upsert({
        where: { userId: superAdmin.id },
        update: {
          firstName: 'Super',
          lastName: 'Administrator',
          email: DEFAULT_ADMIN.email,
          phone: DEFAULT_ADMIN.phone,
          isActive: true,
        },
        create: {
          userId: superAdmin.id,
          employeeCode: `ADMIN-${Date.now()}`,
          firstName: 'Super',
          lastName: 'Administrator',
          email: DEFAULT_ADMIN.email,
          phone: DEFAULT_ADMIN.phone,
          isActive: true,
          hireDate: new Date(),
          status: 'ACTIVE',
          contractType: 'FULL_TIME',
        },
      });
      console.log('✅ Employee record created/updated');
    } catch (error) {
      console.log('ℹ️ Employee table not available, skipping...');
    }

    // 5. Tạo một số role khác cho hệ thống
    console.log('📚 Tạo các role khác...');
    const additionalRoles = [
      {
        name: 'Manager',
        description: 'Quản lý cấp trung',
        permissions: {
          permissions: [
            'read:user',
            'update:user',
            'manage:department',
            'manage:sales',
            'read:sales',
            'create:sales',
            'update:sales',
            'manage:crm',
            'read:crm',
            'create:crm',
            'update:crm',
            'read:inventory',
            'update:inventory',
            'read:hrm',
            'manage:hrm',
          ],
          modules: ['sales', 'crm', 'hrm'],
          level: 7,
          scope: 'department',
        },
      },
      {
        name: 'Employee',
        description: 'Nhân viên',
        permissions: {
          permissions: [
            'read:user',
            'update:user',
            'read:sales',
            'create:sales',
            'read:crm',
            'create:crm',
            'read:hrm',
          ],
          modules: ['sales', 'crm', 'hrm'],
          level: 3,
          scope: 'own',
        },
      },
      {
        name: 'Viewer',
        description: 'Chỉ xem',
        permissions: {
          permissions: ['read:user', 'read:sales', 'read:crm'],
          modules: ['sales', 'crm'],
          level: 1,
          scope: 'own',
        },
      },
    ];

    for (const role of additionalRoles) {
      await prisma.role.upsert({
        where: { name: role.name },
        update: {
          description: role.description,
          permissions: JSON.stringify(role.permissions),
        },
        create: {
          name: role.name,
          description: role.description,
          permissions: JSON.stringify(role.permissions),
        },
      });
    }

    // 6. Hiển thị kết quả
    console.log('\n🎉 Super Administrator đã được tạo thành công!');
    console.log('================================================');
    console.log(`📧 Email: ${DEFAULT_ADMIN.email}`);
    console.log(`👤 Username: ${DEFAULT_ADMIN.username}`);
    console.log(`🔐 Password: ${DEFAULT_ADMIN.password}`);
    console.log(`📝 Display Name: ${DEFAULT_ADMIN.displayName}`);
    console.log(`🆔 User ID: ${superAdmin.id}`);
    console.log(`🎯 Role: ${superAdmin.role.name}`);
    console.log(`📅 Created: ${superAdmin.createdAt}`);

    console.log('\n📋 Quyền hạn:');
    console.log('✅ Toàn quyền quản trị hệ thống');
    console.log('✅ Quản lý tất cả 11 modules');
    console.log('✅ Quản lý users và roles');
    console.log('✅ Cấu hình hệ thống');
    console.log('✅ Backup và restore');

    console.log('\n🔗 Đường dẫn truy cập:');
    console.log('🌐 Admin Panel: http://localhost:3000/admin');
    console.log('🔐 Login Page: http://localhost:3000/auth/login');
    console.log('🎮 Demo Page: http://localhost:3000/auth-demo');

    console.log('\n⚠️ Lưu ý bảo mật:');
    console.log('⚡ Đổi mật khẩu ngay sau lần đăng nhập đầu tiên');
    console.log('🔒 Không chia sẻ thông tin đăng nhập');
    console.log('🛡️ Kích hoạt 2FA nếu có thể');

    return superAdmin;
  } catch (error) {
    console.error('💥 Lỗi khi tạo Super Administrator:', error);
    throw error;
  }
}

async function main() {
  try {
    await createQuickSuperAdmin();
    console.log('\n🚀 Script hoàn thành thành công!');
  } catch (error) {
    console.error('💥 Script thất bại:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
if (require.main === module) {
  main();
}

export { createQuickSuperAdmin };
