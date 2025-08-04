import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

  // Specific module permissions
  'manage:sales',
  'approve:sales',
  'export:sales',
  'import:sales',
  'manage:crm',
  'export:crm',
  'import:crm',
  'manage:inventory',
  'approve:inventory',
  'export:inventory',
  'import:inventory',
  'manage:finance',
  'approve:finance',
  'export:finance',
  'audit:finance',
  'manage:hrm',
  'approve:hrm',
  'export:hrm',
  'import:hrm',
  'manage:projects',
  'approve:projects',
  'export:projects',
  'manage:manufacturing',
  'approve:manufacturing',
  'export:manufacturing',
  'manage:marketing',
  'approve:marketing',
  'export:marketing',
  'manage:support',
  'export:support',
  'manage:analytics',
  'export:analytics',
  'manage:ecommerce',
  'approve:ecommerce',
  'export:ecommerce',
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email = 'admin@taza.com',
      username = 'superadmin',
      password = 'TazaAdmin@2024!',
      displayName = 'Super Administrator',
      phone,
      force = false,
    } = body;

    console.log('🚀 Creating Super Administrator via API...');

    // Kiểm tra Super Admin đã tồn tại chưa
    if (!force) {
      const existingSuperAdmin = await prisma.user.findFirst({
        where: {
          role: {
            name: 'Super Administrator',
          },
        },
        include: { role: true },
      });

      if (existingSuperAdmin) {
        return NextResponse.json(
          {
            success: false,
            error: 'Super Administrator already exists',
            existing: {
              id: existingSuperAdmin.id,
              email: existingSuperAdmin.email,
              displayName: existingSuperAdmin.displayName,
              createdAt: existingSuperAdmin.createdAt,
            },
          },
          { status: 400 }
        );
      }
    }

    // 1. Tạo Super Admin Role
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
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Tạo hoặc cập nhật Super Admin User
    const superAdmin = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        displayName,
        username,
        phone,
        roleId: superAdminRole.id,
        isActive: true,
        isVerified: true,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=dc2626&color=fff&size=128`,
      },
      create: {
        email,
        username,
        password: hashedPassword,
        displayName,
        phone,
        roleId: superAdminRole.id,
        isActive: true,
        isVerified: true,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=dc2626&color=fff&size=128`,
      },
      include: { role: true },
    });

    // 4. Tạo employee record (optional)
    let employeeCreated = false;
    try {
      await prisma.employee.upsert({
        where: { userId: superAdmin.id },
        update: {
          firstName: displayName.split(' ')[0] || 'Super',
          lastName: displayName.split(' ').slice(1).join(' ') || 'Admin',
          email,
          phone,
          isActive: true,
        },
        create: {
          userId: superAdmin.id,
          employeeCode: `ADMIN-${Date.now()}`,
          firstName: displayName.split(' ')[0] || 'Super',
          lastName: displayName.split(' ').slice(1).join(' ') || 'Admin',
          email,
          phone,
          isActive: true,
          hireDate: new Date(),
          status: 'ACTIVE',
          contractType: 'FULL_TIME',
        },
      });
      employeeCreated = true;
    } catch (error) {
      console.log('Employee table not available, skipping...');
    }

    console.log('✅ Super Administrator created successfully');

    return NextResponse.json({
      success: true,
      message: 'Super Administrator created successfully',
      data: {
        user: {
          id: superAdmin.id,
          email: superAdmin.email,
          username: superAdmin.username,
          displayName: superAdmin.displayName,
          role: superAdmin.role.name,
          createdAt: superAdmin.createdAt,
        },
        role: {
          id: superAdminRole.id,
          name: superAdminRole.name,
          description: superAdminRole.description,
        },
        employeeCreated,
        credentials: {
          email,
          password,
          username,
        },
        permissions: SUPER_ADMIN_PERMISSIONS,
        modules: ALL_MODULES,
        loginUrls: {
          admin: 'http://localhost:3000/admin',
          login: 'http://localhost:3000/auth/login',
          demo: 'http://localhost:3000/auth-demo',
        },
        security: {
          changePasswordAfterFirstLogin: true,
          enableTwoFactor: true,
          doNotShareCredentials: true,
        },
      },
    });
  } catch (error: any) {
    console.error('Error creating Super Administrator:', error);

    // Handle specific database errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: 'Email or username already exists',
          details: error.meta,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create Super Administrator',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Kiểm tra Super Admin có tồn tại không
export async function GET(request: NextRequest) {
  try {
    const superAdmins = await prisma.user.findMany({
      where: {
        role: {
          name: 'Super Administrator',
        },
      },
      include: {
        role: true,
        employee: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (superAdmins.length === 0) {
      return NextResponse.json({
        exists: false,
        count: 0,
        message: 'No Super Administrator found in system',
      });
    }

    return NextResponse.json({
      exists: true,
      count: superAdmins.length,
      superAdmins: superAdmins.map((admin) => ({
        id: admin.id,
        email: admin.email,
        username: admin.username,
        displayName: admin.displayName,
        isActive: admin.isActive,
        isVerified: admin.isVerified,
        createdAt: admin.createdAt,
        lastLoginAt: admin.lastLoginAt,
        role: admin.role,
        employee: admin.employee,
      })),
    });
  } catch (error: any) {
    console.error('Error checking Super Administrator:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check Super Administrator',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
