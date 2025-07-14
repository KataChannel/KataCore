import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// All available modules in TazaCore system
const ALL_MODULES = [
  'sales', 'crm', 'inventory', 'finance', 'hrm', 'projects',
  'manufacturing', 'marketing', 'support', 'analytics', 'ecommerce'
];

// Comprehensive permissions for Super Administrator
const SUPER_ADMIN_PERMISSIONS = [
  // System-wide permissions
  'system:admin', 'system:manage', 'system:configure', 'system:audit',
  
  // User and role management
  'create:user', 'read:user', 'update:user', 'delete:user', 'manage:user',
  'create:role', 'read:role', 'update:role', 'delete:role', 'manage:role',
  
  // All modules admin permissions
  'admin:sales', 'admin:crm', 'admin:inventory', 'admin:finance',
  'admin:hrm', 'admin:projects', 'admin:manufacturing', 'admin:marketing',
  'admin:support', 'admin:analytics', 'admin:ecommerce',
  
  // Full CRUD for all modules
  'create:*', 'read:*', 'update:*', 'delete:*', 'manage:*'
];

export async function POST(request: NextRequest) {
  try {
    // Security check - only allow if no super admin exists
    const existingSuperAdmin = await prisma.user.findFirst({
      include: { role: true },
      where: {
        role: {
          name: 'Super Administrator'
        }
      }
    });

    if (existingSuperAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Super Administrator đã tồn tại',
        existing: {
          email: existingSuperAdmin.email,
          displayName: existingSuperAdmin.displayName,
          createdAt: existingSuperAdmin.createdAt
        }
      }, { status: 400 });
    }

    // Create Super Admin Role
    const superAdminRole = await prisma.role.upsert({
      where: { name: 'Super Administrator' },
      update: {
        description: 'Quản trị viên cấp cao nhất - có toàn quyền hệ thống TazaCore',
        permissions: JSON.stringify(SUPER_ADMIN_PERMISSIONS)
      },
      create: {
        name: 'Super Administrator',
        description: 'Quản trị viên cấp cao nhất - có toàn quyền hệ thống TazaCore',
        permissions: JSON.stringify(SUPER_ADMIN_PERMISSIONS)
      }
    });

    // Generate secure password
    const defaultPassword = 'TazaAdmin@2024!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    // Create Super Admin User
    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@taza.com',
        username: 'superadmin',
        password: hashedPassword,
        displayName: 'TazaCore System Administrator',
        isActive: true,
        isVerified: true,
        roleId: superAdminRole.id,
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=dc2626&color=fff&size=128',
        phone: '+84-xxx-xxx-xxx'
      },
      include: {
        role: true
      }
    });

    // Update role with user count tracking in permissions metadata
    await prisma.role.update({
      where: { id: superAdminRole.id },
      data: { 
        permissions: JSON.stringify({
          permissions: SUPER_ADMIN_PERMISSIONS,
          userCount: 1,
          level: 10,
          modules: ALL_MODULES,
          isSystemRole: true,
          isActive: true
        })
      }
    });

    // Try to create employee record if HRM module exists
    let employeeCreated = false;
    try {
      // First check if required tables exist
      const departments = await prisma.department.findMany({ take: 1 });
      const positions = await prisma.position.findMany({ take: 1 });
      
      if (departments.length > 0 && positions.length > 0) {
        await prisma.employee.create({
          data: {
            userId: superAdmin.id,
            employeeId: 'ADMIN001',
            firstName: 'Super',
            lastName: 'Admin',
            fullName: 'Super Admin',
            hireDate: new Date(),
            status: 'ACTIVE',
            contractType: 'FULL_TIME',
            departmentId: departments[0].id,
            positionId: positions[0].id
          }
        });
        employeeCreated = true;
      }
    } catch (error) {
      // Employee table or related tables might not exist yet
      console.log('Employee/Department/Position tables not found, skipping employee record creation');
    }

    return NextResponse.json({
      success: true,
      message: 'Super Administrator đã được tạo thành công!',
      admin: {
        id: superAdmin.id,
        email: superAdmin.email,
        username: superAdmin.username,
        displayName: superAdmin.displayName,
        role: superAdmin.role.name,
        roleLevel: 10, // Static value since schema doesn't have level field
        modules: ALL_MODULES,
        defaultPassword: defaultPassword,
        employeeCreated: employeeCreated
      },
      permissions: SUPER_ADMIN_PERMISSIONS,
      instructions: {
        login: 'Đăng nhập tại http://localhost:3002',
        demo: 'Thử nghiệm tại http://localhost:3002/auth-demo',
        security: [
          'Đổi mật khẩu ngay sau khi đăng nhập lần đầu',
          'Không chia sẻ thông tin đăng nhập',
          'Kích hoạt 2FA nếu có thể',
          'Theo dõi hoạt động tài khoản thường xuyên'
        ]
      }
    });

  } catch (error: any) {
    console.error('Error creating super admin:', error);
    
    // Handle specific database errors
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'Email hoặc username đã tồn tại',
        details: error.meta
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Không thể tạo Super Administrator',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET method to check if super admin exists
export async function GET(request: NextRequest) {
  try {
    const superAdmin = await prisma.user.findFirst({
      include: { role: true },
      where: {
        role: {
          name: 'Super Administrator'
        }
      }
    });

    if (superAdmin) {
      return NextResponse.json({
        exists: true,
        admin: {
          id: superAdmin.id,
          email: superAdmin.email,
          displayName: superAdmin.displayName,
          username: superAdmin.username,
          isActive: superAdmin.isActive,
          isVerified: superAdmin.isVerified,
          createdAt: superAdmin.createdAt,
          role: superAdmin.role.name,
          roleLevel: 10 // Static value since schema doesn't have level field
        }
      });
    }

    return NextResponse.json({
      exists: false,
      message: 'Chưa có Super Administrator trong hệ thống'
    });

  } catch (error: any) {
    console.error('Error checking super admin:', error);
    return NextResponse.json({
      error: 'Không thể kiểm tra Super Administrator',
      details: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
