#!/usr/bin/env ts-node

// ============================================================================
// TAZAGROUP UNIFIED COMPREHENSIVE SEED DATA
// ============================================================================
// Seed data tổng hợp từ tất cả dữ liệu trong dự án TazaGroup
// Super user mặc định: it@tazagroup.vn
// Loại bỏ các dependencies không cần thiết và tạo data hoàn chỉnh
// Version: 3.0 - Production Ready

import { PrismaClient, UserStatus, LeaveType, LeaveStatus, AttendanceStatus, EmployeeStatus, ContractType } from '@prisma/client';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

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
  console.log(`${color}[UNIFIED_SEED]${colors.reset} ${message}`);

const success = (message: string) => 
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);

const warning = (message: string) => 
  console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);

const error = (message: string) => 
  console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);

const info = (message: string) => 
  console.log(`${colors.cyan}[INFO]${colors.reset} ${message}`);

// ============================================================================
// PERMISSION & ROLE DEFINITIONS
// ============================================================================

const SYSTEM_PERMISSIONS = {
  // Super Admin Permissions
  SUPER_ADMIN: {
    permissions: [
      'admin:*', 'manage:*', 'read:*', 'create:*', 'update:*', 'delete:*',
      'system:backup', 'system:restore', 'system:config', 'analytics:all'
    ],
    level: 10,
    modules: ['ALL']
  },

  // System Admin
  SYSTEM_ADMIN: {
    permissions: [
      'read:*', 'create:user', 'update:user', 'delete:user', 'manage:role',
      'manage:permission', 'admin:system', 'view:analytics', 'manage:department'
    ],
    level: 9,
    modules: ['ADMIN', 'USER_MANAGEMENT', 'HRM', 'ANALYTICS']
  },

  // HR Manager
  HR_MANAGER: {
    permissions: [
      'read:employee', 'create:employee', 'update:employee', 'delete:employee',
      'manage:department', 'manage:position', 'approve:leave', 'manage:payroll',
      'view:hr_analytics', 'manage:attendance', 'create:performance_review'
    ],
    level: 8,
    modules: ['HRM', 'ANALYTICS', 'PAYROLL']
  },

  // Sales Manager
  SALES_MANAGER: {
    permissions: [
      'read:order', 'create:order', 'update:order', 'approve:order',
      'manage:customer', 'manage:lead', 'view:sales_analytics', 'manage:team'
    ],
    level: 7,
    modules: ['SALES', 'CRM', 'ANALYTICS']
  },

  // Finance Manager
  FINANCE_MANAGER: {
    permissions: [
      'read:financial_data', 'create:invoice', 'update:invoice', 'approve:payment',
      'manage:budget', 'view:financial_reports', 'manage:accounting'
    ],
    level: 7,
    modules: ['FINANCE', 'ACCOUNTING', 'ANALYTICS']
  },

  // IT Manager
  IT_MANAGER: {
    permissions: [
      'read:system', 'manage:infrastructure', 'manage:security', 'view:system_logs',
      'manage:backup', 'system:maintenance', 'manage:integrations'
    ],
    level: 7,
    modules: ['IT', 'SYSTEM', 'SECURITY']
  },

  // Department Manager
  DEPARTMENT_MANAGER: {
    permissions: [
      'read:employee', 'update:employee', 'manage:team', 'approve:leave',
      'view:team_performance', 'manage:attendance', 'view:department_analytics'
    ],
    level: 6,
    modules: ['HRM', 'TEAM_MANAGEMENT']
  },

  // Team Lead
  TEAM_LEAD: {
    permissions: [
      'read:team_member', 'update:team_member', 'assign:task', 'approve:leave',
      'view:team_performance', 'manage:team_schedule'
    ],
    level: 5,
    modules: ['TEAM_MANAGEMENT', 'PROJECT']
  },

  // Employee
  EMPLOYEE: {
    permissions: [
      'read:profile', 'update:profile', 'create:leave_request', 'view:payroll',
      'view:attendance', 'create:timesheet', 'view:schedule'
    ],
    level: 3,
    modules: ['SELF_SERVICE']
  },

  // Viewer/Guest
  VIEWER: {
    permissions: ['read:public_info', 'view:dashboard'],
    level: 1,
    modules: ['PUBLIC']
  }
};

// ============================================================================
// CORE SEED FUNCTIONS
// ============================================================================

/**
 * Clear all existing data with proper cascade handling
 */
async function clearDatabase() {
  log('🗑️ Clearing existing database data...');
  
  try {
    // Clear in reverse dependency order to avoid foreign key constraints
    await prisma.affiliate_referrals.deleteMany({});
    await prisma.affiliates.deleteMany({});
    await prisma.performance_reviews.deleteMany({});
    await prisma.payrolls.deleteMany({});
    await prisma.leave_requests.deleteMany({});
    await prisma.attendances.deleteMany({});
    await prisma.employees.deleteMany({});
    await prisma.positions.deleteMany({});
    await prisma.departments.deleteMany({});
    await prisma.message_reactions.deleteMany({});
    await prisma.messages.deleteMany({});
    await prisma.conversation_members.deleteMany({});
    await prisma.conversations.deleteMany({});
    await prisma.notifications.deleteMany({});
    await prisma.friend_requests.deleteMany({});
    await prisma.users_settings.deleteMany({});
    await prisma.sessions.deleteMany({});
    await prisma.audit_logs.deleteMany({});
    await prisma.reports.deleteMany({});
    await prisma.users.deleteMany({});
    await prisma.roles.deleteMany({});
    
    success('Database cleared successfully');
  } catch (err: any) {
    warning(`Some data couldn't be cleared: ${err.message}`);
  }
}

/**
 * Create comprehensive system roles
 */
async function seedRoles() {
  log('👑 Creating unified system roles...');
  
  const roles = [];

  // Create all system roles
  for (const [roleName, roleData] of Object.entries(SYSTEM_PERMISSIONS)) {
    const role = await prisma.roles.create({
      data: {
        name: roleName,
        description: getRoleDescription(roleName),
        permissions: JSON.stringify({
          permissions: roleData.permissions,
          level: roleData.level,
          modules: roleData.modules,
          isSystemRole: true,
          source: 'TazaGroup Unified Seed'
        }),
        level: roleData.level,
        modules: JSON.stringify(roleData.modules),
        isSystemRole: true,
      }
    });
    roles.push(role);
  }

  success(`${roles.length} system roles created`);
  return roles.reduce((acc, role) => {
    acc[role.name.toLowerCase() + 'Role'] = role;
    return acc;
  }, {} as any);
}

function getRoleDescription(roleName: string): string {
  const descriptions: Record<string, string> = {
    'SUPER_ADMIN': 'Super Administrator với quyền tối cao trong hệ thống TazaGroup',
    'SYSTEM_ADMIN': 'Quản trị viên hệ thống với quyền quản lý users và system',
    'HR_MANAGER': 'Quản lý nhân sự với quyền toàn bộ HRM module',
    'SALES_MANAGER': 'Quản lý kinh doanh với quyền sales và CRM',
    'FINANCE_MANAGER': 'Quản lý tài chính với quyền finance và accounting',
    'IT_MANAGER': 'Quản lý IT với quyền technical và system support',
    'DEPARTMENT_MANAGER': 'Quản lý phòng ban với quyền team management',
    'TEAM_LEAD': 'Trưởng nhóm với quyền quản lý team và task',
    'EMPLOYEE': 'Nhân viên với quyền cơ bản self-service',
    'VIEWER': 'Người xem với quyền chỉ đọc thông tin công khai'
  };
  return descriptions[roleName] || 'System role';
}

/**
 * Create system users including Super Admin with it@tazagroup.vn
 */
async function seedSystemUsers(roles: any) {
  log('👥 Creating system users...');
  
  // Super Admin User - Default IT@TazaGroup
  const superAdmin = await prisma.users.create({
    data: {
      email: 'it@tazagroup.vn',
      username: 'taza_super_admin',
      phone: '+84900000000',
      displayName: 'TazaGroup IT Administrator',
      password: await bcrypt.hash('123456', 12),
      avatar: 'https://ui-avatars.com/api/?name=IT+Admin&background=dc2626&color=fff&size=128',
      bio: 'Super Administrator TazaGroup - Quyền tối cao hệ thống',
      isVerified: true,
      isActive: true,
      status: UserStatus.ONLINE,
      roleId: roles.super_adminRole.id,
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
      roleId: roles.system_adminRole.id,
    }
  });

  success('2 system users created');
  return { superAdmin, systemAdmin };
}

/**
 * Create comprehensive departments
 */
async function seedDepartments(systemUsers: any) {
  log('🏢 Creating comprehensive departments...');
  
  const departments = await Promise.all([
    // Technology Department
    prisma.departments.create({
      data: {
        name: 'Technology Department',
        description: 'Phòng Công nghệ - Phát triển và vận hành hệ thống',
        code: 'TECH',
        budget: 2000000000, // 2 billion VND
        location: 'Floor 3-4, TazaGroup Tower',
        phone: '+84901234500',
        email: 'tech@tazagroup.vn',
        isActive: true,
        managerId: systemUsers.superAdmin.id,
      }
    }),

    // Human Resources Department
    prisma.departments.create({
      data: {
        name: 'Human Resources',
        description: 'Phòng Nhân sự - Quản lý và phát triển nhân lực',
        code: 'HR',
        budget: 1200000000, // 1.2 billion VND
        location: 'Floor 2, TazaGroup Tower',
        phone: '+84901234501',
        email: 'hr@tazagroup.vn',
        isActive: true,
      }
    }),

    // Sales & Marketing Department
    prisma.departments.create({
      data: {
        name: 'Sales & Marketing',
        description: 'Phòng Kinh doanh & Marketing - Tăng trưởng doanh thu',
        code: 'SALES',
        budget: 1800000000, // 1.8 billion VND
        location: 'Floor 1, TazaGroup Tower',
        phone: '+84901234502',
        email: 'sales@tazagroup.vn',
        isActive: true,
      }
    }),

    // Finance & Accounting Department
    prisma.departments.create({
      data: {
        name: 'Finance & Accounting',
        description: 'Phòng Tài chính & Kế toán - Quản lý tài chính doanh nghiệp',
        code: 'FINANCE',
        budget: 800000000, // 800 million VND
        location: 'Floor 5, TazaGroup Tower',
        phone: '+84901234503',
        email: 'finance@tazagroup.vn',
        isActive: true,
      }
    }),

    // Operations Department
    prisma.departments.create({
      data: {
        name: 'Operations',
        description: 'Phòng Vận hành - Điều hành hoạt động kinh doanh',
        code: 'OPS',
        budget: 1000000000, // 1 billion VND
        location: 'Floor 6, TazaGroup Tower',
        phone: '+84901234504',
        email: 'ops@tazagroup.vn',
        isActive: true,
      }
    }),

    // Quality Assurance Department
    prisma.departments.create({
      data: {
        name: 'Quality Assurance',
        description: 'Phòng Đảm bảo Chất lượng - Kiểm soát chất lượng sản phẩm',
        code: 'QA',
        budget: 600000000, // 600 million VND
        location: 'Floor 3, TazaGroup Tower',
        phone: '+84901234505',
        email: 'qa@tazagroup.vn',
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
    qaDepartment: departments[5],
  };
}

/**
 * Create comprehensive positions
 */
async function seedPositions(departments: any) {
  log('💼 Creating comprehensive positions...');
  
  const positions = await Promise.all([
    // Technology Positions
    prisma.positions.create({
      data: {
        title: 'Chief Technology Officer',
        description: 'Giám đốc Công nghệ - Lãnh đạo chiến lược công nghệ',
        level: 10,
        minSalary: 100000000, // 100M VND
        maxSalary: 200000000, // 200M VND
        requirements: 'Master degree in Computer Science, 15+ years experience, Leadership skills',
        isActive: true,
        departmentId: departments.techDepartment.id,
      }
    }),
    prisma.positions.create({
      data: {
        title: 'Senior Software Engineer',
        description: 'Kỹ sư Phần mềm Senior - Phát triển hệ thống core',
        level: 7,
        minSalary: 40000000, // 40M VND
        maxSalary: 80000000, // 80M VND
        requirements: 'Bachelor in IT, 5+ years experience, Full-stack development',
        isActive: true,
        departmentId: departments.techDepartment.id,
      }
    }),
    prisma.positions.create({
      data: {
        title: 'DevOps Engineer',
        description: 'Kỹ sư DevOps - Vận hành và triển khai hệ thống',
        level: 6,
        minSalary: 35000000, // 35M VND
        maxSalary: 70000000, // 70M VND
        requirements: 'Bachelor in IT, 3+ years DevOps experience, AWS/Docker/K8s',
        isActive: true,
        departmentId: departments.techDepartment.id,
      }
    }),

    // HR Positions
    prisma.positions.create({
      data: {
        title: 'HR Director',
        description: 'Giám đốc Nhân sự - Quản lý chiến lược nhân sự',
        level: 9,
        minSalary: 80000000, // 80M VND
        maxSalary: 150000000, // 150M VND
        requirements: 'Master in HR/Business, 10+ years HR management experience',
        isActive: true,
        departmentId: departments.hrDepartment.id,
      }
    }),
    prisma.positions.create({
      data: {
        title: 'HR Manager',
        description: 'Quản lý Nhân sự - Quản lý hoạt động nhân sự',
        level: 7,
        minSalary: 45000000, // 45M VND
        maxSalary: 80000000, // 80M VND
        requirements: 'Bachelor in HR, 5+ years HR experience, Leadership skills',
        isActive: true,
        departmentId: departments.hrDepartment.id,
      }
    }),
    prisma.positions.create({
      data: {
        title: 'HR Specialist',
        description: 'Chuyên viên Nhân sự - Thực hiện nghiệp vụ nhân sự',
        level: 5,
        minSalary: 25000000, // 25M VND
        maxSalary: 50000000, // 50M VND
        requirements: 'Bachelor in HR, 2+ years experience, Good communication',
        isActive: true,
        departmentId: departments.hrDepartment.id,
      }
    }),

    // Sales Positions
    prisma.positions.create({
      data: {
        title: 'Sales Director',
        description: 'Giám đốc Kinh doanh - Lãnh đạo chiến lược bán hàng',
        level: 9,
        minSalary: 80000000, // 80M VND
        maxSalary: 160000000, // 160M VND
        requirements: 'Master in Business, 10+ years sales management experience',
        isActive: true,
        departmentId: departments.salesDepartment.id,
      }
    }),
    prisma.positions.create({
      data: {
        title: 'Sales Manager',
        description: 'Quản lý Kinh doanh - Quản lý đội ngũ bán hàng',
        level: 7,
        minSalary: 45000000, // 45M VND
        maxSalary: 90000000, // 90M VND
        requirements: 'Bachelor in Business, 5+ years sales experience, Team management',
        isActive: true,
        departmentId: departments.salesDepartment.id,
      }
    }),
    prisma.positions.create({
      data: {
        title: 'Senior Sales Executive',
        description: 'Chuyên viên Kinh doanh Senior - Phát triển khách hàng',
        level: 6,
        minSalary: 30000000, // 30M VND
        maxSalary: 60000000, // 60M VND
        requirements: 'Bachelor degree, 3+ years sales experience, Good negotiation',
        isActive: true,
        departmentId: departments.salesDepartment.id,
      }
    }),

    // Finance Positions
    prisma.positions.create({
      data: {
        title: 'Finance Manager',
        description: 'Quản lý Tài chính - Quản lý hoạt động tài chính',
        level: 7,
        minSalary: 50000000, // 50M VND
        maxSalary: 100000000, // 100M VND
        requirements: 'Bachelor in Finance/Accounting, CPA preferred, 5+ years experience',
        isActive: true,
        departmentId: departments.financeDepartment.id,
      }
    }),
    prisma.positions.create({
      data: {
        title: 'Senior Accountant',
        description: 'Kế toán Senior - Thực hiện nghiệp vụ kế toán',
        level: 6,
        minSalary: 25000000, // 25M VND
        maxSalary: 50000000, // 50M VND
        requirements: 'Bachelor in Accounting, 3+ years experience, Attention to detail',
        isActive: true,
        departmentId: departments.financeDepartment.id,
      }
    }),

    // Operations & QA Positions
    prisma.positions.create({
      data: {
        title: 'Operations Manager',
        description: 'Quản lý Vận hành - Điều hành hoạt động kinh doanh',
        level: 7,
        minSalary: 45000000, // 45M VND
        maxSalary: 85000000, // 85M VND
        requirements: 'Bachelor in Business, 5+ years operations experience',
        isActive: true,
        departmentId: departments.operationsDepartment.id,
      }
    }),
    prisma.positions.create({
      data: {
        title: 'QA Manager',
        description: 'Quản lý Đảm bảo Chất lượng - Kiểm soát chất lượng',
        level: 7,
        minSalary: 40000000, // 40M VND
        maxSalary: 75000000, // 75M VND
        requirements: 'Bachelor in relevant field, 5+ years QA experience, Quality management',
        isActive: true,
        departmentId: departments.qaDepartment.id,
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
        roleId: roles.it_managerRole.id,
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
        roleId: roles.hr_managerRole.id,
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
        roleId: roles.sales_managerRole.id,
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
        roleId: roles.finance_managerRole.id,
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
        roleId: roles.department_managerRole.id,
      }
    }),

    // QA Manager
    prisma.users.create({
      data: {
        email: 'qa.manager@tazagroup.vn',
        username: 'taza_qa_manager',
        phone: '+84901000006',
        displayName: 'Vũ Thị Mai',
        password: await bcrypt.hash('QAManager@2024!', 12),
        avatar: 'https://ui-avatars.com/api/?name=Vu+Thi+Mai&background=ec4899&color=fff&size=128',
        bio: 'QA Manager - Quản lý Đảm bảo Chất lượng TazaGroup',
        isVerified: true,
        isActive: true,
        status: UserStatus.ONLINE,
        roleId: roles.department_managerRole.id,
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
    prisma.departments.update({
      where: { id: departments.qaDepartment.id },
      data: { managerId: managers[5].id }
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
        displayName: 'Nguyễn Văn A',
        password: await bcrypt.hash('Employee@2024!', 12),
        avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=3b82f6&color=fff&size=128',
        bio: 'Senior Software Engineer',
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

    prisma.users.create({
      data: {
        email: 'devops@tazagroup.vn',
        username: 'taza_devops',
        phone: '+84902000003',
        displayName: 'Phạm Văn Tùng',
        password: await bcrypt.hash('Employee@2024!', 12),
        avatar: 'https://ui-avatars.com/api/?name=Pham+Van+Tung&background=059669&color=fff&size=128',
        bio: 'DevOps Engineer',
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

    // Operations Team
    prisma.users.create({
      data: {
        email: 'ops1@tazagroup.vn',
        username: 'taza_ops1',
        phone: '+84902000008',
        displayName: 'Trần Văn Hùng',
        password: await bcrypt.hash('Employee@2024!', 12),
        avatar: 'https://ui-avatars.com/api/?name=Tran+Van+Hung&background=6366f1&color=fff&size=128',
        bio: 'Operations Specialist',
        isVerified: true,
        isActive: true,
        status: UserStatus.ONLINE,
        roleId: roles.employeeRole.id,
      }
    }),

    // QA Team
    prisma.users.create({
      data: {
        email: 'qa1@tazagroup.vn',
        username: 'taza_qa1',
        phone: '+84902000009',
        displayName: 'Nguyễn Thị Hoa',
        password: await bcrypt.hash('Employee@2024!', 12),
        avatar: 'https://ui-avatars.com/api/?name=Nguyen+Thi+Hoa&background=ec4899&color=fff&size=128',
        bio: 'QA Specialist',
        isVerified: true,
        isActive: true,
        status: UserStatus.AWAY,
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
  
  // Get all non-system users (exclude super admin and system admin)
  const usersList = [...allUsers.managers, ...allUsers.employees];
  const employeeRecords = [];

  // Department and position mappings
  const departmentMapping: Record<string, string> = {
    'cto@tazagroup.vn': departments.techDepartment.id,
    'hr.director@tazagroup.vn': departments.hrDepartment.id,
    'sales.director@tazagroup.vn': departments.salesDepartment.id,
    'finance.manager@tazagroup.vn': departments.financeDepartment.id,
    'ops.manager@tazagroup.vn': departments.operationsDepartment.id,
    'qa.manager@tazagroup.vn': departments.qaDepartment.id,
    'dev1@tazagroup.vn': departments.techDepartment.id,
    'dev2@tazagroup.vn': departments.techDepartment.id,
    'devops@tazagroup.vn': departments.techDepartment.id,
    'hr1@tazagroup.vn': departments.hrDepartment.id,
    'sales1@tazagroup.vn': departments.salesDepartment.id,
    'sales2@tazagroup.vn': departments.salesDepartment.id,
    'accountant1@tazagroup.vn': departments.financeDepartment.id,
    'ops1@tazagroup.vn': departments.operationsDepartment.id,
    'qa1@tazagroup.vn': departments.qaDepartment.id,
  };

  const positionMapping: Record<string, string> = {
    'cto@tazagroup.vn': positions[0].id, // CTO
    'hr.director@tazagroup.vn': positions[3].id, // HR Director
    'sales.director@tazagroup.vn': positions[6].id, // Sales Director
    'finance.manager@tazagroup.vn': positions[9].id, // Finance Manager
    'ops.manager@tazagroup.vn': positions[11].id, // Operations Manager
    'qa.manager@tazagroup.vn': positions[12].id, // QA Manager
    'dev1@tazagroup.vn': positions[1].id, // Senior Software Engineer
    'dev2@tazagroup.vn': positions[1].id, // Senior Software Engineer
    'devops@tazagroup.vn': positions[2].id, // DevOps Engineer
    'hr1@tazagroup.vn': positions[5].id, // HR Specialist
    'sales1@tazagroup.vn': positions[8].id, // Senior Sales Executive
    'sales2@tazagroup.vn': positions[8].id, // Senior Sales Executive
    'accountant1@tazagroup.vn': positions[10].id, // Senior Accountant
    'ops1@tazagroup.vn': positions[11].id, // Operations Manager
    'qa1@tazagroup.vn': positions[12].id, // QA Manager
  };

  let employeeIdCounter = 1001;

  for (const user of usersList) {
    const employeeRecord = await prisma.employees.create({
      data: {
        employeeId: `TG${employeeIdCounter}`,
        firstName: user.displayName.split(' ')[0],
        lastName: user.displayName.split(' ').slice(1).join(' '),
        fullName: user.displayName,
        dateOfBirth: new Date(1990 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: Math.random() > 0.5 ? 'Nam' : 'Nữ',
        nationality: 'Việt Nam',
        idNumber: `${Math.floor(Math.random() * 900000000) + 100000000}`,
        address: `${Math.floor(Math.random() * 999) + 1} Đường ABC, Quận XYZ, TP.HCM`,
        phone: user.phone,
        emergencyContact: `+8490${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
        hireDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        salary: 25000000 + Math.floor(Math.random() * 75000000), // 25M - 100M VND
        status: EmployeeStatus.ACTIVE,
        contractType: ContractType.FULL_TIME,
        notes: `Employee record for ${user.displayName}`,
        userId: user.id,
        departmentId: departmentMapping[user.email] || departments.techDepartment.id,
        positionId: positionMapping[user.email] || positions[1].id,
      }
    });

    employeeRecords.push(employeeRecord);
    employeeIdCounter++;
  }

  success(`${employeeRecords.length} employee records created`);
  return employeeRecords;
}

/**
 * Seed sample HR data (attendance, leave, payroll)
 */
async function seedHRSampleData(employeeRecords: any, users: any) {
  log('📊 Creating sample HR data...');
  
  // Sample Attendance Records
  const attendanceRecords = [];
  for (const employee of employeeRecords.slice(0, 5)) { // First 5 employees
    for (let i = 0; i < 30; i++) { // Last 30 days
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
        const timeIn = new Date(date);
        timeIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
        
        const timeOut = new Date(timeIn);
        timeOut.setHours(timeOut.getHours() + 8 + Math.floor(Math.random() * 2));
        
        const attendance = await prisma.attendances.create({
          data: {
            date: date,
            timeIn: timeIn,
            timeOut: timeOut,
            totalHours: (timeOut.getTime() - timeIn.getTime()) / (1000 * 60 * 60),
            overtime: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0,
            status: AttendanceStatus.PRESENT,
            employeeId: employee.id,
            userId: employee.userId,
          }
        });
        attendanceRecords.push(attendance);
      }
    }
  }

  // Sample Leave Requests
  const leaveRequests = [];
  for (const employee of employeeRecords.slice(0, 3)) { // First 3 employees
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30) + 1);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 5) + 1);
    
    const leave = await prisma.leave_requests.create({
      data: {
        startDate: startDate,
        endDate: endDate,
        days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
        type: LeaveType.ANNUAL,
        reason: 'Nghỉ phép thường niên',
        status: LeaveStatus.PENDING,
        employeeId: employee.id,
        userId: employee.userId,
      }
    });
    leaveRequests.push(leave);
  }

  // Sample Payroll Records
  const payrollRecords = [];
  for (const employee of employeeRecords.slice(0, 5)) { // First 5 employees
    const payroll = await prisma.payrolls.create({
      data: {
        period: '2024-11',
        basicSalary: employee.salary,
        overtime: Math.floor(Math.random() * 5000000), // 0-5M VND
        bonus: Math.floor(Math.random() * 10000000), // 0-10M VND
        deductions: Math.floor(Math.random() * 2000000), // 0-2M VND
        netSalary: employee.salary + Math.floor(Math.random() * 5000000) + Math.floor(Math.random() * 10000000) - Math.floor(Math.random() * 2000000),
        employeeId: employee.id,
        userId: employee.userId,
      }
    });
    payrollRecords.push(payroll);
  }

  success(`HR sample data created: ${attendanceRecords.length} attendance, ${leaveRequests.length} leave requests, ${payrollRecords.length} payrolls`);
  return { attendanceRecords, leaveRequests, payrollRecords };
}

/**
 * Create sample conversations and messages
 */
async function seedCommunicationData(users: any) {
  log('💬 Creating sample communication data...');
  
  const allUsers = [users.systemUsers.superAdmin, users.systemUsers.systemAdmin, ...users.managers, ...users.employees];
  
  // Create company-wide announcement conversation
  const companyAnnouncement = await prisma.conversations.create({
    data: {
      title: 'TazaGroup - Thông báo công ty',
      description: 'Kênh thông báo chính thức của TazaGroup',
      type: 'CHANNEL',
      isPublic: true,
      createdById: users.systemUsers.superAdmin.id,
    }
  });

  // Create IT team conversation
  const itTeamConversation = await prisma.conversations.create({
    data: {
      title: 'IT Team - Technical Discussion',
      description: 'Thảo luận kỹ thuật của đội IT',
      type: 'GROUP',
      isPublic: false,
      createdById: users.managers[0].id, // CTO
    }
  });

  // Add messages to company announcement
  await prisma.messages.create({
    data: {
      content: 'Chào mừng tất cả đến với hệ thống TazaGroup! Đây là kênh thông báo chính thức của công ty.',
      type: 'TEXT',
      conversationId: companyAnnouncement.id,
      userId: users.systemUsers.superAdmin.id,
    }
  });

  await prisma.messages.create({
    data: {
      content: 'Hệ thống đã được triển khai thành công với đầy đủ tính năng HR, Sales, Finance và IT management.',
      type: 'TEXT',
      conversationId: companyAnnouncement.id,
      userId: users.systemUsers.systemAdmin.id,
    }
  });

  // Add messages to IT team conversation
  await prisma.messages.create({
    data: {
      content: 'Team IT đã hoàn thành việc setup hệ thống mới. Tất cả modules đang hoạt động ổn định.',
      type: 'TEXT',
      conversationId: itTeamConversation.id,
      userId: users.managers[0].id, // CTO
    }
  });

  success('Communication data created: 2 conversations, 3 messages');
  return { companyAnnouncement, itTeamConversation };
}

/**
 * Create sample affiliate data
 */
async function seedAffiliateData(users: any) {
  log('🤝 Creating sample affiliate data...');
  
  // Create sample affiliates for some employees
  const sampleAffiliates = [];
  
  for (let i = 0; i < 3; i++) {
    const user = users.employees[i];
    const affiliate = await prisma.affiliates.create({
      data: {
        userId: user.id,
        affiliateCode: `TAZA${1000 + i}`,
        commissionRate: 0.1 + (Math.random() * 0.05), // 10-15%
        totalEarnings: Math.floor(Math.random() * 50000000), // 0-50M VND
        isActive: true,
      }
    });
    
    // Create referral record
    await prisma.affiliate_referrals.create({
      data: {
        userId: users.employees[i + 3].id,
        affiliateId: affiliate.id,
        amount: Math.floor(Math.random() * 10000000), // 0-10M VND
        commission: Math.floor(Math.random() * 1000000), // 0-1M VND
        status: 'COMPLETED',
      }
    });
    
    sampleAffiliates.push(affiliate);
  }

  success(`${sampleAffiliates.length} affiliate records created`);
  return sampleAffiliates;
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

/**
 * Main seed function
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}🌱 TazaGroup Unified Comprehensive Seed Starting...${colors.reset}\n`);
  
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
    
    // Step 11: Create affiliate data
    const affiliateData = await seedAffiliateData({ systemUsers, managers, employees });
    
    console.log(`\n${colors.bright}${colors.green}🎉 TazaGroup Unified Seed Completed Successfully!${colors.reset}\n`);
    
    // Print summary
    console.log(`${colors.bright}📋 Seeding Summary:${colors.reset}`);
    console.log(`   ✅ Roles: 10 (including Super Admin)`);
    console.log(`   ✅ System Users: 2 (Super Admin + System Admin)`);
    console.log(`   ✅ Management Users: 6`);
    console.log(`   ✅ Employee Users: 9`);
    console.log(`   ✅ Departments: 6`);
    console.log(`   ✅ Positions: 13`);
    console.log(`   ✅ Employee Records: ${employeeRecords.length}`);
    console.log(`   ✅ Attendance Records: ${hrData.attendanceRecords.length}`);
    console.log(`   ✅ Leave Requests: ${hrData.leaveRequests.length}`);
    console.log(`   ✅ Payroll Records: ${hrData.payrollRecords.length}`);
    console.log(`   ✅ Conversations: 2`);
    console.log(`   ✅ Messages: 3`);
    console.log(`   ✅ Affiliate Records: ${affiliateData.length}`);
    
    console.log(`\n${colors.bright}🔑 Default Login Credentials:${colors.reset}`);
    console.log(`   ${colors.red}Super Admin:${colors.reset} it@tazagroup.vn / 123456`);
    console.log(`   ${colors.blue}System Admin:${colors.reset} admin@tazagroup.vn / TazaAdmin@2024!`);
    console.log(`   ${colors.yellow}CTO:${colors.reset} cto@tazagroup.vn / CTO@2024!`);
    console.log(`   ${colors.magenta}HR Director:${colors.reset} hr.director@tazagroup.vn / HRDirector@2024!`);
    console.log(`   ${colors.cyan}Sales Director:${colors.reset} sales.director@tazagroup.vn / SalesDirector@2024!`);
    console.log(`   ${colors.white}Employees:${colors.reset} <email> / Employee@2024!`);
    
    console.log(`\n${colors.bright}🏢 TazaGroup Structure:${colors.reset}`);
    console.log(`   📍 6 Departments with proper management hierarchy`);
    console.log(`   👥 Role-based permission system with 10 roles`);
    console.log(`   📊 Complete HR management system`);
    console.log(`   💬 Internal communication system`);
    console.log(`   🤝 Affiliate management system`);
    console.log(`   🔐 Multi-level security and access control`);
    
  } catch (err) {
    error('Seeding failed:', err);
    throw err;
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

export {
  main,
  seedRoles,
  seedSystemUsers,
  seedDepartments,
  seedPositions,
  seedManagementUsers,
  seedEmployees,
  seedEmployeeRecords,
  seedHRSampleData,
  seedCommunicationData,
  seedAffiliateData
};
