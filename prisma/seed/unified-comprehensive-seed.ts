#!/usr/bin/env ts-node

// ============================================================================
// TAZAGROUP UNIFIED COMPREHENSIVE SEED DATA - FIXED VERSION
// ============================================================================
// Seed data tổng hợp từ tất cả dữ liệu trong dự án TazaGroup
// Super user mặc định: it@tazagroup.vn
// Loại bỏ các dependencies không cần thiết và tạo data hoàn chỉnh
// Version: 4.0 - TypeScript Fixed

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
    await prisma.user_settings.deleteMany({});
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
        id: nanoid(),
        name: roleName,
        description: `${roleName} with level ${roleData.level} permissions`,
        permissions: JSON.stringify(roleData.permissions),
        level: roleData.level,
        modules: JSON.stringify(roleData.modules),
        isSystemRole: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    roles.push(role);
    info(`✓ Created role: ${roleName} (Level ${roleData.level})`);
  }

  success(`Created ${roles.length} system roles`);
  return roles;
}

/**
 * Create admin users
 */
async function seedAdminUsers(roles: any[]) {
  log('👤 Creating admin users...');
  
  const hashedPassword = await bcrypt.hash('TazaGroup@2024!', 10);
  const superAdminRole = roles.find(r => r.name === 'SUPER_ADMIN');
  const systemAdminRole = roles.find(r => r.name === 'SYSTEM_ADMIN');

  // Super Admin
  const superAdmin = await prisma.users.create({
    data: {
      id: nanoid(),
      email: 'it@tazagroup.vn',
      username: 'superadmin',
      phone: '+84901234567',
      displayName: 'IT TazaGroup',
      password: hashedPassword,
      avatar: 'https://ui-avatars.com/api/?name=IT+TazaGroup&background=4f46e5&color=fff',
      bio: 'Super Administrator - Full system access',
      isVerified: true,
      isActive: true,
      status: UserStatus.ONLINE,
      roleId: superAdminRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  // System Admin  
  const systemAdmin = await prisma.users.create({
    data: {
      id: nanoid(),
      email: 'admin@tazagroup.vn',
      username: 'admin',
      phone: '+84901234568',
      displayName: 'System Admin',
      password: hashedPassword,
      avatar: 'https://ui-avatars.com/api/?name=System+Admin&background=059669&color=fff',
      bio: 'System Administrator - Manage users and system',
      isVerified: true,
      isActive: true,
      status: UserStatus.ONLINE,
      roleId: systemAdminRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  success('Created admin users');
  return { superAdmin, systemAdmin };
}

/**
 * Create departments
 */
async function seedDepartments(adminUsers: any) {
  log('🏢 Creating departments...');
  
  const departments = [];

  // Technology Department with manager
  const techDept = await prisma.departments.create({
    data: {
      id: nanoid(),
      name: 'Technology Department',
      description: 'Software Development and IT Infrastructure',
      code: 'TECH',
      budget: 500000,
      location: 'Floor 5, TazaGroup Building',
      phone: '+84901234580',
      email: 'tech@tazagroup.vn',
      isActive: true,
      managerId: adminUsers.superAdmin.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  departments.push(techDept);

  // HR Department
  const hrDept = await prisma.departments.create({
    data: {
      id: nanoid(),
      name: 'Human Resources',
      description: 'Human Resource Management and Development',
      code: 'HR',
      budget: 200000,
      location: 'Floor 2, TazaGroup Building',
      phone: '+84901234581',
      email: 'hr@tazagroup.vn',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  departments.push(hrDept);

  // Sales Department
  const salesDept = await prisma.departments.create({
    data: {
      id: nanoid(),
      name: 'Sales & Marketing',
      description: 'Sales Operations and Marketing Strategies',
      code: 'SALES',
      budget: 300000,
      location: 'Floor 3, TazaGroup Building',
      phone: '+84901234582',
      email: 'sales@tazagroup.vn',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  departments.push(salesDept);

  // Finance Department
  const financeDept = await prisma.departments.create({
    data: {
      id: nanoid(),
      name: 'Finance & Accounting',
      description: 'Financial Management and Accounting Operations',
      code: 'FINANCE',
      budget: 250000,
      location: 'Floor 4, TazaGroup Building',
      phone: '+84901234583',
      email: 'finance@tazagroup.vn',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  departments.push(financeDept);

  // Operations Department
  const opsDept = await prisma.departments.create({
    data: {
      id: nanoid(),
      name: 'Operations',
      description: 'Business Operations and Process Management',
      code: 'OPS',
      budget: 180000,
      location: 'Floor 1, TazaGroup Building',
      phone: '+84901234584',
      email: 'ops@tazagroup.vn',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  departments.push(opsDept);

  // QA Department
  const qaDept = await prisma.departments.create({
    data: {
      id: nanoid(),
      name: 'Quality Assurance',
      description: 'Quality Control and Testing',
      code: 'QA',
      budget: 150000,
      location: 'Floor 5, TazaGroup Building',
      phone: '+84901234585',
      email: 'qa@tazagroup.vn',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  departments.push(qaDept);

  success(`Created ${departments.length} departments`);
  return { techDept, hrDept, salesDept, financeDept, opsDept, qaDept };
}

/**
 * Create positions
 */
async function seedPositions(departments: any) {
  log('💼 Creating positions...');
  
  const positions = [];

  // Technology positions
  const ctoPosition = await prisma.positions.create({
    data: {
      id: nanoid(),
      title: 'Chief Technology Officer',
      description: 'Lead technology strategy and development team',
      level: 9,
      minSalary: 100000,
      maxSalary: 150000,
      requirements: '10+ years experience, Leadership skills, Technical expertise',
      isActive: true,
      departmentId: departments.techDept.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  positions.push(ctoPosition);

  const seniorDevPosition = await prisma.positions.create({
    data: {
      id: nanoid(),
      title: 'Senior Software Engineer',
      description: 'Develop and maintain software applications',
      level: 7,
      minSalary: 40000,
      maxSalary: 60000,
      requirements: '5+ years experience in software development',
      isActive: true,
      departmentId: departments.techDept.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  positions.push(seniorDevPosition);

  const devopsPosition = await prisma.positions.create({
    data: {
      id: nanoid(),
      title: 'DevOps Engineer',
      description: 'Manage infrastructure and deployment pipelines',
      level: 6,
      minSalary: 35000,
      maxSalary: 50000,
      requirements: '3+ years DevOps experience, AWS/Azure knowledge',
      isActive: true,
      departmentId: departments.techDept.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  positions.push(devopsPosition);

  // HR positions
  const hrDirectorPosition = await prisma.positions.create({
    data: {
      id: nanoid(),
      title: 'HR Director',
      description: 'Lead human resources strategy and operations',
      level: 8,
      minSalary: 60000,
      maxSalary: 80000,
      requirements: '8+ years HR experience, Leadership skills',
      isActive: true,
      departmentId: departments.hrDept.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  positions.push(hrDirectorPosition);

  const hrManagerPosition = await prisma.positions.create({
    data: {
      id: nanoid(),
      title: 'HR Manager',
      description: 'Manage HR operations and employee relations',
      level: 6,
      minSalary: 30000,
      maxSalary: 45000,
      requirements: '5+ years HR experience',
      isActive: true,
      departmentId: departments.hrDept.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  positions.push(hrManagerPosition);

  const hrSpecialistPosition = await prisma.positions.create({
    data: {
      id: nanoid(),
      title: 'HR Specialist',
      description: 'Handle recruitment and employee development',
      level: 4,
      minSalary: 20000,
      maxSalary: 30000,
      requirements: '2+ years HR experience',
      isActive: true,
      departmentId: departments.hrDept.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  positions.push(hrSpecialistPosition);

  // Sales positions
  const salesDirectorPosition = await prisma.positions.create({
    data: {
      id: nanoid(),
      title: 'Sales Director',
      description: 'Lead sales strategy and team management',
      level: 8,
      minSalary: 50000,
      maxSalary: 75000,
      requirements: '7+ years sales experience, Team leadership',
      isActive: true,
      departmentId: departments.salesDept.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  positions.push(salesDirectorPosition);

  const salesManagerPosition = await prisma.positions.create({
    data: {
      id: nanoid(),
      title: 'Sales Manager',
      description: 'Manage sales operations and client relationships',
      level: 6,
      minSalary: 25000,
      maxSalary: 40000,
      requirements: '4+ years sales experience',
      isActive: true,
      departmentId: departments.salesDept.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  positions.push(salesManagerPosition);

  const seniorSalesPosition = await prisma.positions.create({
    data: {
      id: nanoid(),
      title: 'Senior Sales Executive',
      description: 'Handle key accounts and business development',
      level: 5,
      minSalary: 20000,
      maxSalary: 35000,
      requirements: '3+ years sales experience',
      isActive: true,
      departmentId: departments.salesDept.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  positions.push(seniorSalesPosition);

  // Finance positions
  const financeManagerPosition = await prisma.positions.create({
    data: {
      id: nanoid(),
      title: 'Finance Manager',
      description: 'Manage financial planning and analysis',
      level: 7,
      minSalary: 35000,
      maxSalary: 50000,
      requirements: '5+ years finance experience, CPA preferred',
      isActive: true,
      departmentId: departments.financeDept.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  positions.push(financeManagerPosition);

  const seniorAccountantPosition = await prisma.positions.create({
    data: {
      id: nanoid(),
      title: 'Senior Accountant',
      description: 'Handle accounting operations and reporting',
      level: 5,
      minSalary: 22000,
      maxSalary: 32000,
      requirements: '3+ years accounting experience',
      isActive: true,
      departmentId: departments.financeDept.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  positions.push(seniorAccountantPosition);

  // Operations positions
  const opsManagerPosition = await prisma.positions.create({
    data: {
      id: nanoid(),
      title: 'Operations Manager',
      description: 'Manage business operations and processes',
      level: 6,
      minSalary: 30000,
      maxSalary: 45000,
      requirements: '4+ years operations experience',
      isActive: true,
      departmentId: departments.opsDept.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  positions.push(opsManagerPosition);

  // QA positions
  const qaManagerPosition = await prisma.positions.create({
    data: {
      id: nanoid(),
      title: 'QA Manager',
      description: 'Lead quality assurance and testing processes',
      level: 6,
      minSalary: 28000,
      maxSalary: 42000,
      requirements: '4+ years QA experience, Testing methodologies',
      isActive: true,
      departmentId: departments.qaDept.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  positions.push(qaManagerPosition);

  success(`Created ${positions.length} positions`);
  return {
    ctoPosition, seniorDevPosition, devopsPosition,
    hrDirectorPosition, hrManagerPosition, hrSpecialistPosition,
    salesDirectorPosition, salesManagerPosition, seniorSalesPosition,
    financeManagerPosition, seniorAccountantPosition,
    opsManagerPosition, qaManagerPosition
  };
}

/**
 * Create department managers and employees
 */
async function seedUsers(roles: any[], departments: any, positions: any) {
  log('👥 Creating department managers and employees...');
  
  const hashedPassword = await bcrypt.hash('TazaGroup@2024!', 10);
  const departmentManagerRole = roles.find(r => r.name === 'DEPARTMENT_MANAGER');
  const employeeRole = roles.find(r => r.name === 'EMPLOYEE');
  
  const users = [];

  // Department Managers
  const cto = await prisma.users.create({
    data: {
      id: nanoid(),
      email: 'cto@tazagroup.vn',
      username: 'cto',
      phone: '+84901234590',
      displayName: 'Nguyễn Văn Anh',
      password: hashedPassword,
      avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+Anh&background=7c3aed&color=fff',
      bio: 'Chief Technology Officer - Leading digital transformation',
      isVerified: true,
      isActive: true,
      status: UserStatus.ONLINE,
      roleId: departmentManagerRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  users.push(cto);

  const hrDirector = await prisma.users.create({
    data: {
      id: nanoid(),
      email: 'hr.director@tazagroup.vn',
      username: 'hrdirector',
      phone: '+84901234591',
      displayName: 'Trần Thị Bình',
      password: hashedPassword,
      avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+Binh&background=dc2626&color=fff',
      bio: 'HR Director - Building great workplace culture',
      isVerified: true,
      isActive: true,
      status: UserStatus.ONLINE,
      roleId: departmentManagerRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  users.push(hrDirector);

  const salesDirector = await prisma.users.create({
    data: {
      id: nanoid(),
      email: 'sales.director@tazagroup.vn',
      username: 'salesdirector',
      phone: '+84901234592',
      displayName: 'Lê Minh Công',
      password: hashedPassword,
      avatar: 'https://ui-avatars.com/api/?name=Le+Minh+Cong&background=059669&color=fff',
      bio: 'Sales Director - Driving revenue growth',
      isVerified: true,
      isActive: true,
      status: UserStatus.ONLINE,
      roleId: departmentManagerRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  users.push(salesDirector);

  const financeManager = await prisma.users.create({
    data: {
      id: nanoid(),
      email: 'finance.manager@tazagroup.vn',
      username: 'financemanager',
      phone: '+84901234593',
      displayName: 'Phạm Thị Dung',
      password: hashedPassword,
      avatar: 'https://ui-avatars.com/api/?name=Pham+Thi+Dung&background=ea580c&color=fff',
      bio: 'Finance Manager - Managing financial operations',
      isVerified: true,
      isActive: true,
      status: UserStatus.ONLINE,
      roleId: departmentManagerRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  users.push(financeManager);

  const opsManager = await prisma.users.create({
    data: {
      id: nanoid(),
      email: 'ops.manager@tazagroup.vn',
      username: 'opsmanager',
      phone: '+84901234594',
      displayName: 'Hoàng Văn Em',
      password: hashedPassword,
      avatar: 'https://ui-avatars.com/api/?name=Hoang+Van+Em&background=0891b2&color=fff',
      bio: 'Operations Manager - Optimizing business processes',
      isVerified: true,
      isActive: true,
      status: UserStatus.ONLINE,
      roleId: departmentManagerRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  users.push(opsManager);

  const qaManager = await prisma.users.create({
    data: {
      id: nanoid(),
      email: 'qa.manager@tazagroup.vn',
      username: 'qamanager',
      phone: '+84901234595',
      displayName: 'Đỗ Thị Phương',
      password: hashedPassword,
      avatar: 'https://ui-avatars.com/api/?name=Do+Thi+Phuong&background=7c2d12&color=fff',
      bio: 'QA Manager - Ensuring product quality',
      isVerified: true,
      isActive: true,
      status: UserStatus.ONLINE,
      roleId: departmentManagerRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  users.push(qaManager);

  // Regular Employees
  const employees = [
    { email: 'dev1@tazagroup.vn', username: 'dev1', phone: '+84901234600', name: 'Nguyễn Văn Giang', dept: 'tech', status: UserStatus.ONLINE },
    { email: 'dev2@tazagroup.vn', username: 'dev2', phone: '+84901234601', name: 'Trần Thị Hạnh', dept: 'tech', status: UserStatus.ONLINE },
    { email: 'devops@tazagroup.vn', username: 'devops', phone: '+84901234602', name: 'Lê Minh Inh', dept: 'tech', status: UserStatus.ONLINE },
    { email: 'hr1@tazagroup.vn', username: 'hr1', phone: '+84901234603', name: 'Phạm Thị Kiều', dept: 'hr', status: UserStatus.ONLINE },
    { email: 'sales1@tazagroup.vn', username: 'sales1', phone: '+84901234604', name: 'Hoàng Văn Long', dept: 'sales', status: UserStatus.BUSY },
    { email: 'sales2@tazagroup.vn', username: 'sales2', phone: '+84901234605', name: 'Đỗ Thị Mai', dept: 'sales', status: UserStatus.ONLINE },
    { email: 'accountant1@tazagroup.vn', username: 'accountant1', phone: '+84901234606', name: 'Nguyễn Văn Nam', dept: 'finance', status: UserStatus.OFFLINE },
    { email: 'ops1@tazagroup.vn', username: 'ops1', phone: '+84901234607', name: 'Trần Thị Oanh', dept: 'ops', status: UserStatus.ONLINE },
    { email: 'qa1@tazagroup.vn', username: 'qa1', phone: '+84901234608', name: 'Lê Minh Phúc', dept: 'qa', status: UserStatus.AWAY },
  ];

  for (const emp of employees) {
    const user = await prisma.users.create({
      data: {
        id: nanoid(),
        email: emp.email,
        username: emp.username,
        phone: emp.phone,
        displayName: emp.name,
        password: hashedPassword,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=6366f1&color=fff`,
        bio: `${emp.name} - TazaGroup Team Member`,
        isVerified: true,
        isActive: true,
        status: emp.status,
        roleId: employeeRole.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    users.push(user);
  }

  success(`Created ${users.length} users (6 managers + 9 employees)`);
  return { managers: users.slice(0, 6), employees: users.slice(6) };
}

/**
 * Create employee records
 */
async function seedEmployees(users: any, departments: any, positions: any) {
  log('📋 Creating employee records...');
  
  let employeeIdCounter = 1001;
  const employees = [];

  // Map users to departments and positions
  const userMapping = [
    { user: users.managers[0], dept: departments.techDept, pos: positions.ctoPosition },
    { user: users.managers[1], dept: departments.hrDept, pos: positions.hrDirectorPosition },
    { user: users.managers[2], dept: departments.salesDept, pos: positions.salesDirectorPosition },
    { user: users.managers[3], dept: departments.financeDept, pos: positions.financeManagerPosition },
    { user: users.managers[4], dept: departments.opsDept, pos: positions.opsManagerPosition },
    { user: users.managers[5], dept: departments.qaDept, pos: positions.qaManagerPosition },
    // Employees
    { user: users.employees[0], dept: departments.techDept, pos: positions.seniorDevPosition },
    { user: users.employees[1], dept: departments.techDept, pos: positions.seniorDevPosition },
    { user: users.employees[2], dept: departments.techDept, pos: positions.devopsPosition },
    { user: users.employees[3], dept: departments.hrDept, pos: positions.hrSpecialistPosition },
    { user: users.employees[4], dept: departments.salesDept, pos: positions.seniorSalesPosition },
    { user: users.employees[5], dept: departments.salesDept, pos: positions.salesManagerPosition },
    { user: users.employees[6], dept: departments.financeDept, pos: positions.seniorAccountantPosition },
    { user: users.employees[7], dept: departments.opsDept, pos: positions.opsManagerPosition },
    { user: users.employees[8], dept: departments.qaDept, pos: positions.qaManagerPosition },
  ];

  for (const mapping of userMapping) {
    const names = mapping.user.displayName.split(' ');
    const firstName = names[names.length - 1];
    const lastName = names.slice(0, -1).join(' ');

    const employee = await prisma.employees.create({
      data: {
        id: nanoid(),
        employeeId: `TG${employeeIdCounter++}`,
        firstName: firstName,
        lastName: lastName,
        fullName: mapping.user.displayName,
        dateOfBirth: new Date(1990 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        nationality: 'Vietnamese',
        idNumber: `${Math.floor(Math.random() * 100000000000)}`,
        address: `${Math.floor(Math.random() * 999) + 1} Nguyen Trai Street, District 1, Ho Chi Minh City`,
        phone: mapping.user.phone,
        emergencyContact: `+8490${Math.floor(Math.random() * 10000000)}`,
        hireDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        salary: mapping.pos.minSalary + Math.floor(Math.random() * (mapping.pos.maxSalary - mapping.pos.minSalary)),
        status: EmployeeStatus.ACTIVE,
        contractType: ContractType.FULL_TIME,
        notes: `Employee record for ${mapping.user.displayName}`,
        userId: mapping.user.id,
        departmentId: mapping.dept.id,
        positionId: mapping.pos.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    employees.push(employee);
  }

  success(`Created ${employees.length} employee records`);
  return employees;
}

/**
 * Create sample HR data
 */
async function seedHRData(employees: any[], users: any) {
  log('📊 Creating sample HR data...');
  
  // Sample Attendance
  for (let i = 0; i < 5; i++) {
    const employee = employees[i];
    const user = users.managers.find((u: any) => u.id === employee.userId) || users.employees.find((u: any) => u.id === employee.userId);
    
    for (let day = 1; day <= 5; day++) {
      const date = new Date(2024, 10, day); // November 2024
      const timeIn = new Date(date);
      timeIn.setHours(8, Math.floor(Math.random() * 30));
      
      const timeOut = new Date(date);
      timeOut.setHours(17, Math.floor(Math.random() * 60));
      
      await prisma.attendances.create({
        data: {
          id: nanoid(),
          date: date,
          timeIn: timeIn,
          timeOut: timeOut,
          totalHours: 8 + Math.random() * 2,
          overtime: Math.random() > 0.7 ? Math.random() * 3 : 0,
          status: AttendanceStatus.PRESENT,
          employeeId: employee.id,
          userId: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
    }
  }

  // Sample Leave Requests
  for (let i = 0; i < 3; i++) {
    const employee = employees[i];
    const user = users.managers.find((u: any) => u.id === employee.userId) || users.employees.find((u: any) => u.id === employee.userId);
    
    const startDate = new Date(2024, 11, 15 + i); // December 2024
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2);

    await prisma.leave_requests.create({
      data: {
        id: nanoid(),
        startDate: startDate,
        endDate: endDate,
        days: 3,
        type: LeaveType.ANNUAL,
        reason: `Annual leave for personal activities - Employee ${i + 1}`,
        status: LeaveStatus.PENDING,
        employeeId: employee.id,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
  }

  // Sample Payroll
  for (let i = 0; i < 5; i++) {
    const employee = employees[i];
    const user = users.managers.find((u: any) => u.id === employee.userId) || users.employees.find((u: any) => u.id === employee.userId);
    
    const basicSalary = employee.salary;
    const overtime = Math.floor(Math.random() * 5000);
    const bonus = Math.floor(Math.random() * 10000);
    const deductions = Math.floor(Math.random() * 2000);

    await prisma.payrolls.create({
      data: {
        id: nanoid(),
        period: '2024-11',
        basicSalary: basicSalary,
        overtime: overtime,
        bonus: bonus,
        deductions: deductions,
        netSalary: basicSalary + overtime + bonus - deductions,
        employeeId: employee.id,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
  }

  success('Created sample HR data (attendance, leave requests, payroll)');
}

/**
 * Create sample communication data
 */
async function seedCommunicationData(users: any) {
  log('💬 Creating sample communication data...');
  
  // Create conversations
  const announcement = await prisma.conversations.create({
    data: {
      id: nanoid(),
      title: 'TazaGroup - Thông báo công ty',
      description: 'Kênh thông báo chính thức của TazaGroup',
      type: 'CHANNEL',
      isPublic: true,
      createdById: users.managers[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  const itTeam = await prisma.conversations.create({
    data: {
      id: nanoid(),
      title: 'IT Team - Technical Discussion',
      description: 'Thảo luận kỹ thuật của team IT',
      type: 'GROUP',
      isPublic: false,
      createdById: users.managers[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  // Create sample messages
  await prisma.messages.create({
    data: {
      id: nanoid(),
      content: 'Chào mừng tất cả đến với hệ thống TazaGroup! Đây là kênh thông báo chính thức của công ty.',
      type: 'TEXT',
      conversationId: announcement.id,
      userId: users.managers[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  await prisma.messages.create({
    data: {
      id: nanoid(),
      content: 'Hệ thống đã được triển khai thành công với đầy đủ tính năng HR, Sales, Finance và IT management.',
      type: 'TEXT',
      conversationId: announcement.id,
      userId: users.managers[1].id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  await prisma.messages.create({
    data: {
      id: nanoid(),
      content: 'Team IT đã hoàn thành việc setup hệ thống mới. Tất cả modules đang hoạt động ổn định.',
      type: 'TEXT',
      conversationId: itTeam.id,
      userId: users.employees[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  success('Created sample communication data');
}

/**
 * Create affiliate system data
 */
async function seedAffiliateData(users: any) {
  log('🤝 Creating affiliate system data...');
  
  // Create affiliate records for some users
  for (let i = 0; i < 3; i++) {
    const user = users.employees[i];
    
    const affiliate = await prisma.affiliates.create({
      data: {
        id: nanoid(),
        userId: user.id,
        affiliateCode: `TG${user.username.toUpperCase()}${Math.floor(Math.random() * 1000)}`,
        commissionRate: 0.1 + Math.random() * 0.05, // 10-15%
        totalEarnings: Math.floor(Math.random() * 50000),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    // Create sample referral
    await prisma.affiliate_referrals.create({
      data: {
        id: nanoid(),
        userId: users.employees[i + 3].id,
        affiliateId: affiliate.id,
        amount: 100000 + Math.floor(Math.random() * 500000),
        commission: 10000 + Math.floor(Math.random() * 50000),
        status: 'COMPLETED',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
  }

  success('Created affiliate system data');
}

/**
 * Create user settings for all users
 */
async function seedUserSettings(users: any) {
  log('⚙️ Creating user settings...');
  
  const allUsers = [...users.managers, ...users.employees];
  
  for (const user of allUsers) {
    await prisma.user_settings.create({
      data: {
        id: nanoid(),
        userId: user.id,
        theme: Math.random() > 0.5 ? 'LIGHT' : 'DARK',
        language: 'vi',
        notificationEnabled: true,
        soundEnabled: Math.random() > 0.3,
        showOnlineStatus: true,
        allowFriendRequests: true,
        allowDirectMessages: true,
        emailNotifications: Math.random() > 0.5,
        pushNotifications: true,
      }
    });
  }

  success(`Created user settings for ${allUsers.length} users`);
}

// ============================================================================
// MAIN SEED EXECUTION
// ============================================================================

async function main() {
  try {
    log('🚀 Starting unified comprehensive seed process...');
    
    // Step 1: Clear existing data
    await clearDatabase();
    
    // Step 2: Create roles
    const roles = await seedRoles();
    
    // Step 3: Create admin users
    const adminUsers = await seedAdminUsers(roles);
    
    // Step 4: Create departments
    const departments = await seedDepartments(adminUsers);
    
    // Step 5: Create positions
    const positions = await seedPositions(departments);
    
    // Step 6: Create users
    const users = await seedUsers(roles, departments, positions);
    
    // Step 7: Create employee records
    const employees = await seedEmployees(users, departments, positions);
    
    // Step 8: Create HR data
    await seedHRData(employees, users);
    
    // Step 9: Create communication data
    await seedCommunicationData(users);
    
    // Step 10: Create affiliate data
    await seedAffiliateData(users);
    
    // Step 11: Create user settings
    await seedUserSettings(users);
    
    // Final summary
    success('🎉 UNIFIED COMPREHENSIVE SEED COMPLETED!');
    info('='.repeat(60));
    info('TAZAGROUP SYSTEM - LOGIN CREDENTIALS');
    info('='.repeat(60));
    info('🔑 SUPER ADMIN:');
    info('   Email: it@tazagroup.vn');
    info('   Password: TazaGroup@2024!');
    info('   Level: 10 (Full Access)');
    info('');
    info('🔑 SYSTEM ADMIN:');
    info('   Email: admin@tazagroup.vn');
    info('   Password: TazaGroup@2024!');
    info('   Level: 9 (System Management)');
    info('');
    info('🔑 DEPARTMENT MANAGERS:');
    info('   CTO: cto@tazagroup.vn');
    info('   HR Director: hr.director@tazagroup.vn');
    info('   Sales Director: sales.director@tazagroup.vn');
    info('   Finance Manager: finance.manager@tazagroup.vn');
    info('   Operations Manager: ops.manager@tazagroup.vn');
    info('   QA Manager: qa.manager@tazagroup.vn');
    info('   Password: TazaGroup@2024! (for all)');
    info('');
    info('🔑 EMPLOYEES (Sample):');
    info('   dev1@tazagroup.vn, dev2@tazagroup.vn, devops@tazagroup.vn');
    info('   hr1@tazagroup.vn, sales1@tazagroup.vn, sales2@tazagroup.vn');
    info('   accountant1@tazagroup.vn, ops1@tazagroup.vn, qa1@tazagroup.vn');
    info('   Password: TazaGroup@2024! (for all)');
    info('');
    info('📊 DATA SUMMARY:');
    info(`   • ${roles.length} Roles`);
    info(`   • ${Object.keys(departments).length} Departments`);
    info(`   • ${Object.keys(positions).length} Positions`);
    info(`   • ${users.managers.length + users.employees.length} Users`);
    info(`   • ${employees.length} Employee Records`);
    info('   • Sample HR Data (Attendance, Leave, Payroll)');
    info('   • Communication System (Conversations, Messages)');
    info('   • Affiliate System (Referrals, Commissions)');
    info('='.repeat(60));
    
  } catch (err: any) {
    error(`Seeding failed: ${err.message}`);
    console.error(err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the main function
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
