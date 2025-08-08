#!/usr/bin/env ts-node

// ============================================================================
// TAZAGROUP MASTER SEED DATA - COMPREHENSIVE
// ============================================================================
// Tạo seed data tổng hợp từ tất cả modules và systems trong dự án
// Super user mặc định: it@tazagroup.vn
// Version: 2.0 - Unified & Comprehensive

import { PrismaClient, UserStatus, LeaveType, LeaveStatus, AttendanceStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { SYSTEM_ROLES } from '../src/lib/auth/unified-permission.service';
import { ALL_MODULE_PERMISSIONS } from '../src/lib/auth/modules-permissions';

// ============================================================================
// CONFIGURATION
// ============================================================================

const prisma = new PrismaClient();

// Console colors for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const log = (message: string, color = colors.blue) => 
  console.log(`${color}[MASTER_SEED]${colors.reset} ${message}`);

const success = (message: string) => 
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);

const warning = (message: string) => 
  console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);

const error = (message: string) => 
  console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);

const info = (message: string) => 
  console.log(`${colors.cyan}[INFO]${colors.reset} ${message}`);

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

/**
 * Clear all existing data with proper cascade handling
 */
async function clearDatabase() {
  log('🧹 Clearing existing database data...');
  
  try {
    // Clear trong order phù hợp với foreign key constraints
    await prisma.performanceReview.deleteMany();
    await prisma.payroll.deleteMany();
    await prisma.leaveRequest.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.employees.deleteMany();
    await prisma.position.deleteMany();
    await prisma.departments.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();

    success('Database cleared successfully');
  } catch (err: any) {
    error(`Failed to clear database: ${err.message}`);
    throw err;
  }
}

/**
 * Create comprehensive system roles
 */
async function seedRoles() {
  log('👑 Creating comprehensive system roles...');
  
  const roles = [];

  // Super Admin Role
  const superAdminRole = await prisma.roles.create({
    data: {
      name: 'SUPER_ADMIN',
      description: 'Super Administrator với quyền tối cao trong hệ thống TazaGroup',
      permissions: JSON.stringify({
        permissions: [
          'admin:*',
          'manage:*',
          'read:*',
          'create:*',
          'update:*',
          'delete:*',
          'system:backup',
          'system:restore',
          'system:config'
        ],
        level: 10,
        modules: ['ALL'],
        isSystemRole: true,
        source: 'TazaGroup Master Seed'
      }),
      level: 10,
      modules: JSON.stringify(['ALL']),
      isSystemRole: true,
    }
  });

  // System Admin Role
  const systemAdminRole = await prisma.roles.create({
    data: {
      name: 'SYSTEM_ADMIN',
      description: 'Quản trị viên hệ thống với quyền quản lý users và system',
      permissions: JSON.stringify({
        permissions: [
          'read:*',
          'create:user',
          'update:user',
          'delete:user',
          'manage:role',
          'manage:permission',
          'admin:system',
          'view:analytics'
        ],
        level: 9,
        modules: ['ADMIN', 'USER_MANAGEMENT', 'ANALYTICS'],
        isSystemRole: true
      }),
      level: 9,
      modules: JSON.stringify(['ADMIN', 'USER_MANAGEMENT', 'ANALYTICS']),
      isSystemRole: true,
    }
  });

  // HR Manager Role
  const hrManagerRole = await prisma.roles.create({
    data: {
      name: 'HR_MANAGER',
      description: 'Quản lý nhân sự với quyền toàn bộ HRM module',
      permissions: JSON.stringify({
        permissions: [
          'read:employee',
          'create:employee',
          'update:employee',
          'delete:employee',
          'manage:department',
          'manage:position',
          'approve:leave',
          'manage:payroll',
          'view:hr_analytics'
        ],
        level: 8,
        modules: ['HRM', 'ANALYTICS'],
        isSystemRole: true
      }),
      level: 8,
      modules: JSON.stringify(['HRM', 'ANALYTICS']),
      isSystemRole: true,
    }
  });

  // Sales Manager Role
  const salesManagerRole = await prisma.roles.create({
    data: {
      name: 'SALES_MANAGER',
      description: 'Quản lý kinh doanh với quyền sales và CRM',
      permissions: JSON.stringify({
        permissions: [
          'read:order',
          'create:order',
          'update:order',
          'approve:order',
          'manage:customer',
          'manage:lead',
          'view:sales_analytics'
        ],
        level: 7,
        modules: ['SALES', 'CRM', 'ANALYTICS'],
        isSystemRole: true
      }),
      level: 7,
      modules: JSON.stringify(['SALES', 'CRM', 'ANALYTICS']),
      isSystemRole: true,
    }
  });

  // IT Manager Role
  const itManagerRole = await prisma.roles.create({
    data: {
      name: 'IT_MANAGER',
      description: 'Quản lý IT với quyền technical và system support',
      permissions: JSON.stringify({
        permissions: [
          'read:system',
          'manage:infrastructure',
          'manage:security',
          'view:system_logs',
          'manage:backup'
        ],
        level: 7,
        modules: ['IT', 'SYSTEM', 'SECURITY'],
        isSystemRole: true
      }),
      level: 7,
      modules: JSON.stringify(['IT', 'SYSTEM', 'SECURITY']),
      isSystemRole: true,
    }
  });

  // Department Manager Role
  const departmentManagerRole = await prisma.roles.create({
    data: {
      name: 'DEPARTMENT_MANAGER',
      description: 'Quản lý phòng ban',
      permissions: JSON.stringify({
        permissions: [
          'read:employee',
          'update:employee',
          'manage:team',
          'approve:leave',
          'view:team_performance'
        ],
        level: 6,
        modules: ['HRM', 'TEAM_MANAGEMENT'],
        isSystemRole: true
      }),
      level: 6,
      modules: JSON.stringify(['HRM', 'TEAM_MANAGEMENT']),
      isSystemRole: true,
    }
  });

  // Employee Role
  const employeeRole = await prisma.roles.create({
    data: {
      name: 'EMPLOYEE',
      description: 'Nhân viên với quyền cơ bản',
      permissions: JSON.stringify({
        permissions: [
          'read:profile',
          'update:profile',
          'create:leave_request',
          'view:payroll',
          'view:attendance'
        ],
        level: 3,
        modules: ['SELF_SERVICE'],
        isSystemRole: true
      }),
      level: 3,
      modules: JSON.stringify(['SELF_SERVICE']),
      isSystemRole: true,
    }
  });

  // Viewer Role
  const viewerRole = await prisma.roles.create({
    data: {
      name: 'VIEWER',
      description: 'Người xem với quyền chỉ đọc',
      permissions: JSON.stringify({
        permissions: [
          'read:public_info',
          'view:dashboard'
        ],
        level: 1,
        modules: ['PUBLIC'],
        isSystemRole: true
      }),
      level: 1,
      modules: JSON.stringify(['PUBLIC']),
      isSystemRole: true,
    }
  });

  roles.push(
    superAdminRole,
    systemAdminRole, 
    hrManagerRole,
    salesManagerRole,
    itManagerRole,
    departmentManagerRole,
    employeeRole,
    viewerRole
  );

  success(`${roles.length} system roles created`);
  return {
    superAdminRole,
    systemAdminRole,
    hrManagerRole,
    salesManagerRole,
    itManagerRole,
    departmentManagerRole,
    employeeRole,
    viewerRole
  };
}

/**
 * Create system users including Super Admin
 */
async function seedSystemUsers(roles: any) {
  log('👥 Creating system users...');
  
  // Super Admin User - Default IT@TazaGroup
  const superAdmin = await prisma.users.create({
    data: {
      email: 'it@tazagroup.vn',
      username: 'taza_super_admin',
      phone: '+84900000000',
      displayName: 'TazaGroup Super Administrator',
      password: await bcrypt.hash('123456', 12),
      avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=dc2626&color=fff&size=128',
      bio: 'Super Administrator TazaGroup - Quyền tối cao hệ thống',
      isVerified: true,
      isActive: true,
      status: UserStatus.ONLINE,
      roleId: roles.superAdminRole.id,
    }
  });

  // System Admin
  const systemAdmin = await prisma.users.create({
    data: {
      email: 'admin@tazagroup.vn',
      username: 'taza_admin',
      phone: '+84900000001',
      displayName: 'TazaGroup System Admin',
      password: await bcrypt.hash('TazaAdmin@2024!', 12),
      avatar: 'https://ui-avatars.com/api/?name=System+Admin&background=1f2937&color=fff&size=128',
      bio: 'System Administrator TazaGroup',
      isVerified: true,
      isActive: true,
      status: UserStatus.ONLINE,
      roleId: roles.systemAdminRole.id,
    }
  });

  success('2 system users created');
  return { superAdmin, systemAdmin };
}

/**
 * Create departments
 */
async function seedDepartments(systemUsers: any) {
  log('🏢 Creating departments...');
  
  const departments = await Promise.all([
    // Technology Department
    prisma.departments.create({
      data: {
        name: 'Technology Department',
        code: 'TECH',
        description: 'Phòng Công nghệ - Phát triển và vận hành hệ thống công nghệ',
        budget: 2000000000, // 2 tỷ VNĐ
        location: 'Tầng 8, TazaGroup Tower',
        phone: '+842812345678',
        email: 'tech@tazagroup.vn',
        isActive: true,
      }
    }),

    // Human Resources Department
    prisma.departments.create({
      data: {
        name: 'Human Resources',
        code: 'HR',
        description: 'Phòng Nhân sự - Quản lý nguồn nhân lực và phát triển tổ chức',
        budget: 800000000, // 800M VNĐ
        location: 'Tầng 5, TazaGroup Tower',
        phone: '+842812345679',
        email: 'hr@tazagroup.vn',
        isActive: true,
      }
    }),

    // Sales & Marketing Department
    prisma.departments.create({
      data: {
        name: 'Sales & Marketing',
        code: 'SALES',
        description: 'Phòng Kinh doanh & Marketing - Phát triển thị trường và bán hàng',
        budget: 1500000000, // 1.5 tỷ VNĐ
        location: 'Tầng 6, TazaGroup Tower',
        phone: '+842812345680',
        email: 'sales@tazagroup.vn',
        isActive: true,
      }
    }),

    // Finance & Accounting Department
    prisma.departments.create({
      data: {
        name: 'Finance & Accounting',
        code: 'FINANCE',
        description: 'Phòng Tài chính Kế toán - Quản lý tài chính và kế toán',
        budget: 600000000, // 600M VNĐ
        location: 'Tầng 4, TazaGroup Tower',
        phone: '+842812345681',
        email: 'finance@tazagroup.vn',
        isActive: true,
      }
    }),

    // Operations Department
    prisma.departments.create({
      data: {
        name: 'Operations',
        code: 'OPS',
        description: 'Phòng Vận hành - Quản lý vận hành và quy trình',
        budget: 1000000000, // 1 tỷ VNĐ
        location: 'Tầng 7, TazaGroup Tower',
        phone: '+842812345682',
        email: 'ops@tazagroup.vn',
        isActive: true,
      }
    }),

    // Executive Office
    prisma.departments.create({
      data: {
        name: 'Executive Office',
        code: 'EXEC',
        description: 'Văn phòng Điều hành - Ban lãnh đạo và quản lý cấp cao',
        budget: 500000000, // 500M VNĐ
        location: 'Tầng 10, TazaGroup Tower',
        phone: '+842812345683',
        email: 'exec@tazagroup.vn',
        isActive: true,
      }
    }),
  ]);

  success(`${departments.length} departments created`);
  return {
    techDepartment: departments[0],
    hrDepartment: departments[1],
    salesDepartment: departments[2],
    financeDepartment: departments[3],
    operationsDepartment: departments[4],
    executiveDepartment: departments[5],
  };
}

/**
 * Create positions
 */
async function seedPositions(departments: any) {
  log('💼 Creating positions...');
  
  const positions = await Promise.all([
    // Technology Positions
    prisma.position.create({
      data: {
        title: 'Chief Technology Officer',
        description: 'Giám đốc Công nghệ - Lãnh đạo chiến lược công nghệ',
        level: 10,
        minSalary: 80000000,
        maxSalary: 120000000,
        requirements: 'Master degree in IT, 10+ years experience, Leadership skills',
        departmentId: departments.techDepartment.id,
        isActive: true,
      }
    }),

    prisma.position.create({
      data: {
        title: 'Senior Software Engineer',
        description: 'Kỹ sư phần mềm cấp cao',
        level: 7,
        minSalary: 35000000,
        maxSalary: 55000000,
        requirements: 'Bachelor in IT, 5+ years experience',
        departmentId: departments.techDepartment.id,
        isActive: true,
      }
    }),

    prisma.position.create({
      data: {
        title: 'Software Engineer',
        description: 'Kỹ sư phần mềm',
        level: 5,
        minSalary: 20000000,
        maxSalary: 35000000,
        requirements: 'Bachelor in IT, 2+ years experience',
        departmentId: departments.techDepartment.id,
        isActive: true,
      }
    }),

    // HR Positions
    prisma.position.create({
      data: {
        title: 'HR Director',
        description: 'Giám đốc Nhân sự',
        level: 9,
        minSalary: 60000000,
        maxSalary: 90000000,
        requirements: 'Master in HR/Business, 8+ years experience',
        departmentId: departments.hrDepartment.id,
        isActive: true,
      }
    }),

    prisma.position.create({
      data: {
        title: 'HR Manager',
        description: 'Quản lý Nhân sự',
        level: 7,
        minSalary: 30000000,
        maxSalary: 50000000,
        requirements: 'Bachelor in HR, 5+ years experience',
        departmentId: departments.hrDepartment.id,
        isActive: true,
      }
    }),

    prisma.position.create({
      data: {
        title: 'HR Specialist',
        description: 'Chuyên viên Nhân sự',
        level: 5,
        minSalary: 18000000,
        maxSalary: 30000000,
        requirements: 'Bachelor in HR, 2+ years experience',
        departmentId: departments.hrDepartment.id,
        isActive: true,
      }
    }),

    // Sales Positions
    prisma.position.create({
      data: {
        title: 'Sales Director',
        description: 'Giám đốc Kinh doanh',
        level: 9,
        minSalary: 50000000,
        maxSalary: 80000000,
        requirements: 'Bachelor in Business, 7+ years sales experience',
        departmentId: departments.salesDepartment.id,
        isActive: true,
      }
    }),

    prisma.position.create({
      data: {
        title: 'Sales Manager',
        description: 'Quản lý Kinh doanh',
        level: 7,
        minSalary: 25000000,
        maxSalary: 45000000,
        requirements: 'Bachelor degree, 4+ years sales experience',
        departmentId: departments.salesDepartment.id,
        isActive: true,
      }
    }),

    prisma.position.create({
      data: {
        title: 'Sales Executive',
        description: 'Nhân viên Kinh doanh',
        level: 4,
        minSalary: 15000000,
        maxSalary: 25000000,
        requirements: 'Bachelor degree, 1+ years experience',
        departmentId: departments.salesDepartment.id,
        isActive: true,
      }
    }),

    // Finance Positions
    prisma.position.create({
      data: {
        title: 'Finance Manager',
        description: 'Quản lý Tài chính',
        level: 8,
        minSalary: 35000000,
        maxSalary: 60000000,
        requirements: 'Bachelor in Finance/Accounting, CPA preferred',
        departmentId: departments.financeDepartment.id,
        isActive: true,
      }
    }),

    prisma.position.create({
      data: {
        title: 'Accountant',
        description: 'Kế toán viên',
        level: 5,
        minSalary: 18000000,
        maxSalary: 30000000,
        requirements: 'Bachelor in Accounting, 2+ years experience',
        departmentId: departments.financeDepartment.id,
        isActive: true,
      }
    }),

    // Operations Positions
    prisma.position.create({
      data: {
        title: 'Operations Manager',
        description: 'Quản lý Vận hành',
        level: 8,
        minSalary: 30000000,
        maxSalary: 50000000,
        requirements: 'Bachelor degree, 5+ years operations experience',
        departmentId: departments.operationsDepartment.id,
        isActive: true,
      }
    }),
  ]);

  success(`${positions.length} positions created`);
  return positions;
}

/**
 * Create management users
 */
async function seedManagementUsers(roles: any, departments: any, positions: any) {
  log('👨‍💼 Creating management users...');
  
  const managers = await Promise.all([
    // CTO
    prisma.users.create({
      data: {
        email: 'cto@tazagroup.vn',
        username: 'taza_cto',
        phone: '+84901000001',
        displayName: 'Nguyễn Văn Minh',
        password: await bcrypt.hash('CTO@2024!', 12),
        avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+Minh&background=3b82f6&color=fff&size=128',
        bio: 'Chief Technology Officer - TazaGroup',
        isVerified: true,
        isActive: true,
        status: UserStatus.ONLINE,
        roleId: roles.itManagerRole.id,
      }
    }),

    // HR Director
    prisma.users.create({
      data: {
        email: 'hr.director@tazagroup.vn',
        username: 'taza_hr_director',
        phone: '+84901000002',
        displayName: 'Trần Thị Hương',
        password: await bcrypt.hash('HRDirector@2024!', 12),
        avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+Huong&background=e11d48&color=fff&size=128',
        bio: 'HR Director - Giám đốc Nhân sự TazaGroup',
        isVerified: true,
        isActive: true,
        status: UserStatus.ONLINE,
        roleId: roles.hrManagerRole.id,
      }
    }),

    // Sales Director
    prisma.users.create({
      data: {
        email: 'sales.director@tazagroup.vn',
        username: 'taza_sales_director',
        phone: '+84901000003',
        displayName: 'Lê Văn Thành',
        password: await bcrypt.hash('SalesDirector@2024!', 12),
        avatar: 'https://ui-avatars.com/api/?name=Le+Van+Thanh&background=10b981&color=fff&size=128',
        bio: 'Sales Director - Giám đốc Kinh doanh TazaGroup',
        isVerified: true,
        isActive: true,
        status: UserStatus.ONLINE,
        roleId: roles.salesManagerRole.id,
      }
    }),

    // Finance Manager
    prisma.users.create({
      data: {
        email: 'finance.manager@tazagroup.vn',
        username: 'taza_finance_manager',
        phone: '+84901000004',
        displayName: 'Phạm Thị Lan',
        password: await bcrypt.hash('FinanceManager@2024!', 12),
        avatar: 'https://ui-avatars.com/api/?name=Pham+Thi+Lan&background=f59e0b&color=fff&size=128',
        bio: 'Finance Manager - Quản lý Tài chính TazaGroup',
        isVerified: true,
        isActive: true,
        status: UserStatus.ONLINE,
        roleId: roles.departmentManagerRole.id,
      }
    }),

    // Operations Manager
    prisma.users.create({
      data: {
        email: 'ops.manager@tazagroup.vn',
        username: 'taza_ops_manager',
        phone: '+84901000005',
        displayName: 'Hoàng Văn Đức',
        password: await bcrypt.hash('OpsManager@2024!', 12),
        avatar: 'https://ui-avatars.com/api/?name=Hoang+Van+Duc&background=8b5cf6&color=fff&size=128',
        bio: 'Operations Manager - Quản lý Vận hành TazaGroup',
        isVerified: true,
        isActive: true,
        status: UserStatus.ONLINE,
        roleId: roles.departmentManagerRole.id,
      }
    }),
  ]);

  // Update departments with managers
  await Promise.all([
    prisma.departments.update({
      where: { id: departments.techDepartment.id },
      data: { managerId: managers[0].id }
    }),
    prisma.departments.update({
      where: { id: departments.hrDepartment.id },
      data: { managerId: managers[1].id }
    }),
    prisma.departments.update({
      where: { id: departments.salesDepartment.id },
      data: { managerId: managers[2].id }
    }),
    prisma.departments.update({
      where: { id: departments.financeDepartment.id },
      data: { managerId: managers[3].id }
    }),
    prisma.departments.update({
      where: { id: departments.operationsDepartment.id },
      data: { managerId: managers[4].id }
    }),
  ]);

  success(`${managers.length} management users created and assigned to departments`);
  return managers;
}

/**
 * Create employee users
 */
async function seedEmployees(roles: any, departments: any, positions: any) {
  log('👥 Creating employee users...');
  
  const employees = await Promise.all([
    // Tech Team
    prisma.users.create({
      data: {
        email: 'dev1@tazagroup.vn',
        username: 'taza_dev1',
        phone: '+84902000001',
        displayName: 'Nguyễn Văn An',
        password: await bcrypt.hash('Employee@2024!', 12),
        avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+An&background=6366f1&color=fff&size=128',
        bio: 'Senior Full-stack Developer',
        isVerified: true,
        isActive: true,
        status: UserStatus.ONLINE,
        roleId: roles.employeeRole.id,
      }
    }),

    prisma.users.create({
      data: {
        email: 'dev2@tazagroup.vn',
        username: 'taza_dev2',
        phone: '+84902000002',
        displayName: 'Trần Thị Bích',
        password: await bcrypt.hash('Employee@2024!', 12),
        avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+Bich&background=ec4899&color=fff&size=128',
        bio: 'Frontend Developer',
        isVerified: true,
        isActive: true,
        status: UserStatus.AWAY,
        roleId: roles.employeeRole.id,
      }
    }),

    prisma.users.create({
      data: {
        email: 'dev3@tazagroup.vn',
        username: 'taza_dev3',
        phone: '+84902000003',
        displayName: 'Lê Văn Cường',
        password: await bcrypt.hash('Employee@2024!', 12),
        avatar: 'https://ui-avatars.com/api/?name=Le+Van+Cuong&background=06b6d4&color=fff&size=128',
        bio: 'Backend Developer',
        isVerified: true,
        isActive: true,
        status: UserStatus.ONLINE,
        roleId: roles.employeeRole.id,
      }
    }),

    // HR Team
    prisma.users.create({
      data: {
        email: 'hr1@tazagroup.vn',
        username: 'taza_hr1',
        phone: '+84902000004',
        displayName: 'Phạm Thị Dung',
        password: await bcrypt.hash('Employee@2024!', 12),
        avatar: 'https://ui-avatars.com/api/?name=Pham+Thi+Dung&background=a855f7&color=fff&size=128',
        bio: 'HR Specialist',
        isVerified: true,
        isActive: true,
        status: UserStatus.ONLINE,
        roleId: roles.employeeRole.id,
      }
    }),

    // Sales Team
    prisma.users.create({
      data: {
        email: 'sales1@tazagroup.vn',
        username: 'taza_sales1',
        phone: '+84902000005',
        displayName: 'Vũ Văn Ê',
        password: await bcrypt.hash('Employee@2024!', 12),
        avatar: 'https://ui-avatars.com/api/?name=Vu+Van+E&background=f59e0b&color=fff&size=128',
        bio: 'Senior Sales Executive',
        isVerified: true,
        isActive: true,
        status: UserStatus.BUSY,
        roleId: roles.employeeRole.id,
      }
    }),

    prisma.users.create({
      data: {
        email: 'sales2@tazagroup.vn',
        username: 'taza_sales2',
        phone: '+84902000006',
        displayName: 'Hoàng Thị Phượng',
        password: await bcrypt.hash('Employee@2024!', 12),
        avatar: 'https://ui-avatars.com/api/?name=Hoang+Thi+Phuong&background=84cc16&color=fff&size=128',
        bio: 'Sales Executive',
        isVerified: true,
        isActive: true,
        status: UserStatus.ONLINE,
        roleId: roles.employeeRole.id,
      }
    }),

    // Finance Team
    prisma.users.create({
      data: {
        email: 'accountant1@tazagroup.vn',
        username: 'taza_accountant1',
        phone: '+84902000007',
        displayName: 'Đỗ Văn Giang',
        password: await bcrypt.hash('Employee@2024!', 12),
        avatar: 'https://ui-avatars.com/api/?name=Do+Van+Giang&background=ef4444&color=fff&size=128',
        bio: 'Senior Accountant',
        isVerified: true,
        isActive: true,
        status: UserStatus.OFFLINE,
        roleId: roles.employeeRole.id,
      }
    }),
  ]);

  success(`${employees.length} employee users created`);
  return employees;
}

/**
 * Create employee records
 */
async function seedEmployeeRecords(allUsers: any, departments: any, positions: any) {
  log('📋 Creating employee records...');
  
  const employeeRecords = [];
  const userDepartmentMapping = [
    // Managers
    { user: allUsers.managers[0], department: departments.techDepartment, position: positions[0] }, // CTO
    { user: allUsers.managers[1], department: departments.hrDepartment, position: positions[3] }, // HR Director
    { user: allUsers.managers[2], department: departments.salesDepartment, position: positions[6] }, // Sales Director
    { user: allUsers.managers[3], department: departments.financeDepartment, position: positions[9] }, // Finance Manager
    { user: allUsers.managers[4], department: departments.operationsDepartment, position: positions[11] }, // Ops Manager
    
    // Employees
    { user: allUsers.employees[0], department: departments.techDepartment, position: positions[1] }, // Senior Dev
    { user: allUsers.employees[1], department: departments.techDepartment, position: positions[2] }, // Dev
    { user: allUsers.employees[2], department: departments.techDepartment, position: positions[2] }, // Dev
    { user: allUsers.employees[3], department: departments.hrDepartment, position: positions[5] }, // HR Specialist
    { user: allUsers.employees[4], department: departments.salesDepartment, position: positions[8] }, // Sales Exec
    { user: allUsers.employees[5], department: departments.salesDepartment, position: positions[8] }, // Sales Exec
    { user: allUsers.employees[6], department: departments.financeDepartment, position: positions[10] }, // Accountant
  ];

  for (let i = 0; i < userDepartmentMapping.length; i++) {
    const { user, department, position } = userDepartmentMapping[i];
    
    const employeeRecord = await prisma.employees.create({
      data: {
        employeeId: `TZG${String(i + 1).padStart(4, '0')}`,
        firstName: user.displayName.split(' ')[0],
        lastName: user.displayName.split(' ').slice(1).join(' '),
        fullName: user.displayName,
        dateOfBirth: new Date(1985 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        nationality: 'Vietnamese',
        idNumber: `${Math.floor(100000000 + Math.random() * 900000000)}`,
        address: `${i + 1} TazaGroup Street, Ho Chi Minh City, Vietnam`,
        phone: user.phone,
        emergencyContact: `+8490${String(i + 1).padStart(7, '0')}`,
        hireDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        salary: position.minSalary + Math.floor(Math.random() * (position.maxSalary - position.minSalary)),
        status: 'ACTIVE',
        contractType: 'FULL_TIME',
        notes: `Employee record for ${user.displayName}`,
        userId: user.id,
        departmentId: department.id,
        positionId: position.id,
      },
    });

    employeeRecords.push(employeeRecord);
  }

  success(`${employeeRecords.length} employee records created`);
  return employeeRecords;
}

/**
 * Seed sample HR data (attendance, leave, payroll)
 */
async function seedHRSampleData(employeeRecords: any, users: any) {
  log('📊 Creating sample HR data...');
  
  // Create attendance records for last 30 days
  const attendanceRecords = [];
  for (let day = 29; day >= 0; day--) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    for (const employee of employeeRecords) {
      if (Math.random() > 0.05) { // 95% attendance rate
        const timeIn = new Date(date);
        timeIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
        
        const timeOut = new Date(date);
        timeOut.setHours(17 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60));
        
        const totalHours = (timeOut.getTime() - timeIn.getTime()) / (1000 * 60 * 60);
        
        const attendance = await prisma.attendance.create({
          data: {
            date: date,
            timeIn: timeIn,
            timeOut: timeOut,
            totalHours: totalHours,
            overtime: Math.max(0, totalHours - 8),
            status: Math.random() > 0.95 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
            notes: Math.random() > 0.9 ? 'Làm việc dự án quan trọng' : null,
            employeeId: employee.id,
            userId: employee.userId,
          },
        });
        attendanceRecords.push(attendance);
      }
    }
  }

  // Create leave requests
  const leaveRequests = [];
  for (let i = 0; i < 10; i++) {
    const employee = employeeRecords[Math.floor(Math.random() * employeeRecords.length)];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60) + 1);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 5) + 1);
    
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        startDate: startDate,
        endDate: endDate,
        days: daysDiff,
        type: Math.random() > 0.5 ? LeaveType.ANNUAL : LeaveType.SICK,
        reason: `${Math.random() > 0.5 ? 'Nghỉ phép thường niên' : 'Nghỉ ốm'} - ${employee.fullName}`,
        status: Math.random() > 0.3 ? LeaveStatus.APPROVED : LeaveStatus.PENDING,
        employeeId: employee.id,
        userId: employee.userId,
      },
    });
    leaveRequests.push(leaveRequest);
  }

  // Create payroll records for current month
  const payrollRecords = [];
  const currentDate = new Date();
  
  for (const employee of employeeRecords) {
    const baseSalary = employee.salary;
    const overtimeHours = Math.floor(Math.random() * 20);
    const overtimePay = overtimeHours * (baseSalary / 160) * 1.5; // 150% for overtime
    const bonus = Math.random() > 0.7 ? Math.floor(Math.random() * 5000000) : 0; // Random bonus
    const deductions = Math.floor(Math.random() * 1000000); // Random deductions
    
    const grossSalary = baseSalary + overtimePay + bonus;
    const netSalary = grossSalary - deductions;
    
    const payroll = await prisma.payroll.create({
      data: {
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        baseSalary: baseSalary,
        overtimeHours: overtimeHours,
        overtimePay: overtimePay,
        bonus: bonus,
        deductions: deductions,
        grossSalary: grossSalary,
        netSalary: netSalary,
        status: 'PAID',
        payDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25),
        employeeId: employee.id,
        userId: employee.userId,
      },
    });
    payrollRecords.push(payroll);
  }

  success(`${attendanceRecords.length} attendance records, ${leaveRequests.length} leave requests, ${payrollRecords.length} payroll records created`);
  return { attendanceRecords, leaveRequests, payrollRecords };
}

/**
 * Create sample conversations and messages
 */
async function seedCommunicationData(users: any) {
  log('💬 Creating communication data...');
  
  const allUsers = [
    ...users.systemUsers,
    ...users.managers,
    ...users.employees
  ];

  // Company-wide announcement
  const announcementConversation = await prisma.conversation.create({
    data: {
      title: 'TazaGroup - Thông báo chung',
      description: 'Kênh thông báo chính thức của TazaGroup',
      isPublic: true,
      createdById: users.systemUsers[0].id, // Super Admin
      participants: {
        connect: allUsers.map(user => ({ id: user.id }))
      },
    },
  });

  // Tech team discussion
  const techConversation = await prisma.conversation.create({
    data: {
      title: 'Technology Team - Technical Discussion',
      description: 'Thảo luận kỹ thuật của team Technology',
      isPublic: false,
      createdById: users.managers[0].id, // CTO
      participants: {
        connect: [
          users.managers[0],
          ...users.employees.slice(0, 3)
        ].map(user => ({ id: user.id }))
      },
    },
  });

  // Create sample messages
  const messages = await Promise.all([
    prisma.message.create({
      data: {
        content: 'Chào mừng tất cả đến với TazaGroup! Đây là kênh thông báo chính thức của công ty.',
        conversationId: announcementConversation.id,
        userId: users.systemUsers[0].id,
      },
    }),
    
    prisma.message.create({
      data: {
        content: 'Xin chào team Tech! Hôm nay chúng ta sẽ thảo luận về kiến trúc hệ thống mới.',
        conversationId: techConversation.id,
        userId: users.managers[0].id,
      },
    }),

    prisma.message.create({
      data: {
        content: 'Em đã hoàn thành nghiên cứu về microservices architecture. Sẽ chia sẻ trong meeting.',
        conversationId: techConversation.id,
        userId: users.employees[0].id,
      },
    }),
  ]);

  success(`2 conversations and ${messages.length} messages created`);
  return { conversations: [announcementConversation, techConversation], messages };
}

/**
 * Main seed function
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}🌱 TazaGroup Master Seed - Comprehensive Version Starting...${colors.reset}\n`);
  
  try {
    // Step 1: Clear existing data
    await clearDatabase();
    
    // Step 2: Create roles
    const roles = await seedRoles();
    
    // Step 3: Create system users (including Super Admin)
    const systemUsers = await seedSystemUsers(roles);
    
    // Step 4: Create departments
    const departments = await seedDepartments(systemUsers);
    
    // Step 5: Create positions
    const positions = await seedPositions(departments);
    
    // Step 6: Create management users
    const managers = await seedManagementUsers(roles, departments, positions);
    
    // Step 7: Create employee users
    const employees = await seedEmployees(roles, departments, positions);
    
    // Step 8: Create employee records
    const employeeRecords = await seedEmployeeRecords(
      { systemUsers, managers, employees }, 
      departments, 
      positions
    );
    
    // Step 9: Create HR sample data
    const hrData = await seedHRSampleData(employeeRecords, { systemUsers, managers, employees });
    
    // Step 10: Create communication data
    const commData = await seedCommunicationData({ systemUsers, managers, employees });
    
    console.log(`\n${colors.bright}${colors.green}🎉 TazaGroup Master Seed Completed Successfully!${colors.reset}\n`);
    
    // Print summary
    console.log(`${colors.bright}📋 Seeding Summary:${colors.reset}`);
    console.log(`   ✅ Roles: 8 (including Super Admin)`);
    console.log(`   ✅ System Users: 2 (Super Admin + System Admin)`);
    console.log(`   ✅ Management Users: 5`);
    console.log(`   ✅ Employee Users: 7`);
    console.log(`   ✅ Total Users: ${2 + 5 + 7}`);
    console.log(`   ✅ Departments: 6`);
    console.log(`   ✅ Positions: 12`);
    console.log(`   ✅ Employee Records: ${employeeRecords.length}`);
    console.log(`   ✅ Attendance Records: ${hrData.attendanceRecords.length}`);
    console.log(`   ✅ Leave Requests: ${hrData.leaveRequests.length}`);
    console.log(`   ✅ Payroll Records: ${hrData.payrollRecords.length}`);
    console.log(`   ✅ Conversations: ${commData.conversations.length}`);
    console.log(`   ✅ Messages: ${commData.messages.length}`);
    
    console.log(`\n${colors.bright}🔑 Default Login Credentials:${colors.reset}`);
    console.log(`   ${colors.green}Super Admin:${colors.reset} it@tazagroup.vn / 123456`);
    console.log(`   ${colors.blue}System Admin:${colors.reset} admin@tazagroup.vn / TazaAdmin@2024!`);
    console.log(`   ${colors.yellow}CTO:${colors.reset} cto@tazagroup.vn / CTO@2024!`);
    console.log(`   ${colors.magenta}HR Director:${colors.reset} hr.director@tazagroup.vn / HRDirector@2024!`);
    console.log(`   ${colors.cyan}Sales Director:${colors.reset} sales.director@tazagroup.vn / SalesDirector@2024!`);
    console.log(`   ${colors.white}Employees:${colors.reset} <email> / Employee@2024!`);
    
    console.log(`\n${colors.bright}🏢 TazaGroup Structure:${colors.reset}`);
    console.log(`   📍 6 Departments with proper management hierarchy`);
    console.log(`   👥 Role-based permission system`);
    console.log(`   📊 Complete HR management system`);
    console.log(`   💬 Internal communication system`);
    console.log(`   🔐 Multi-level security and access control`);
    
  } catch (error) {
    error('Seeding failed:', error);
    throw error;
  }
}

// Run the seed
if (require.main === module) {
  main()
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default main;
