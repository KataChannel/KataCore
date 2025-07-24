#!/usr/bin/env bun
/**
 * TazaCore Master Seed Script
 * Tạo tất cả dữ liệu ban đầu cho toàn bộ dự án
 * Bao gồm: Roles, Users, Departments, Positions, Employees, Conversations, Messages, và các dữ liệu demo
 */

import bcrypt from 'bcrypt';
import { 
  LeaveType, 
  LeaveStatus, 
  ContractType, 
  EmployeeStatus, 
  AttendanceStatus,
  UserStatus,
  ConversationType,
  MessageType
} from '@prisma/client';
import { prisma } from '../../lib/prisma';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = (message: string, color = colors.blue) => 
  console.log(`${color}[SEED]${colors.reset} ${message}`);

const success = (message: string) => 
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);

const warning = (message: string) => 
  console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);

const error = (message: string) => 
  console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);

/**
 * Clear all existing data
 */
async function clearDatabase() {
  log('🗑️ Clearing existing database...');
  
  // Clear in correct order to avoid foreign key constraints
  await prisma.messageReaction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.friendRequest.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.session.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  
  // Clear HR data
  await prisma.performanceReview.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.position.deleteMany();
  await prisma.department.deleteMany();
  
  // Clear users and roles last
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  
  success('Database cleared successfully');
}

/**
 * Seed system roles
 */
async function seedRoles() {
  log('👑 Creating system roles...');
  
  const superAdminRole = await prisma.role.create({
    data: {
      name: 'SUPER_ADMIN',
      description: 'Super Administrator với quyền tối cao',
      permissions: JSON.stringify({
        permissions: [
          'READ', 'WRITE', 'DELETE', 'MANAGE_USERS', 'MANAGE_SYSTEM',
          'MANAGE_ROLES', 'MANAGE_DEPARTMENTS', 'MANAGE_EMPLOYEES',
          'MANAGE_PAYROLL', 'APPROVE_LEAVE', 'VIEW_ANALYTICS',
          'SYSTEM_CONFIG', 'BACKUP_RESTORE'
        ],
        level: 10,
        modules: ['ALL'],
        isSystemRole: true
      })
    }
  });

  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'Quản trị viên hệ thống',
      permissions: JSON.stringify({
        permissions: [
          'READ', 'WRITE', 'DELETE', 'MANAGE_USERS',
          'MANAGE_DEPARTMENTS', 'VIEW_ANALYTICS'
        ],
        level: 8,
        modules: ['ADMIN', 'HRM', 'CHAT']
      })
    }
  });

  const hrManagerRole = await prisma.role.create({
    data: {
      name: 'HR_MANAGER',
      description: 'Quản lý nhân sự với quyền toàn bộ HRM',
      permissions: JSON.stringify({
        permissions: [
          'READ', 'WRITE', 'DELETE',
          'MANAGE_EMPLOYEES', 'MANAGE_PAYROLL', 'APPROVE_LEAVE',
          'VIEW_HR_ANALYTICS', 'MANAGE_DEPARTMENTS', 'MANAGE_POSITIONS'
        ],
        level: 7,
        modules: ['HRM', 'CHAT']
      })
    }
  });

  const departmentManagerRole = await prisma.role.create({
    data: {
      name: 'DEPARTMENT_MANAGER',
      description: 'Quản lý phòng ban',
      permissions: JSON.stringify({
        permissions: [
          'READ', 'WRITE', 'MANAGE_TEAM', 'APPROVE_LEAVE',
          'VIEW_TEAM_PERFORMANCE', 'MANAGE_ATTENDANCE'
        ],
        level: 6,
        modules: ['HRM', 'CHAT']
      })
    }
  });

  const employeeRole = await prisma.role.create({
    data: {
      name: 'EMPLOYEE',
      description: 'Nhân viên với quyền cơ bản',
      permissions: JSON.stringify({
        permissions: [
          'READ', 'WRITE', 'VIEW_PROFILE', 'REQUEST_LEAVE',
          'VIEW_PAYROLL', 'CHAT'
        ],
        level: 3,
        modules: ['HRM', 'CHAT']
      })
    }
  });

  const moderatorRole = await prisma.role.create({
    data: {
      name: 'MODERATOR',
      description: 'Điều hành viên chat',
      permissions: JSON.stringify({
        permissions: ['READ', 'WRITE', 'MODERATE', 'MANAGE_CONVERSATIONS'],
        level: 5,
        modules: ['CHAT']
      })
    }
  });

  const userRole = await prisma.role.create({
    data: {
      name: 'USER',
      description: 'Người dùng thông thường',
      permissions: JSON.stringify({
        permissions: ['READ', 'WRITE', 'CHAT'],
        level: 2,
        modules: ['CHAT']
      })
    }
  });

  const guestRole = await prisma.role.create({
    data: {
      name: 'GUEST',
      description: 'Khách với quyền chỉ đọc',
      permissions: JSON.stringify({
        permissions: ['READ'],
        level: 1,
        modules: ['CHAT']
      })
    }
  });

  success('8 system roles created');
  
  return {
    superAdminRole,
    adminRole,
    hrManagerRole,
    departmentManagerRole,
    employeeRole,
    moderatorRole,
    userRole,
    guestRole
  };
}

/**
 * Seed system users
 */
async function seedSystemUsers(roles: any) {
  log('👥 Creating system users...');
  
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@tazacore.com',
      username: 'superadmin',
      phone: '+84900000000',
      displayName: 'Super Administrator',
      password: await bcrypt.hash('SuperAdmin@2024', 10),
      avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=dc2626&color=fff',
      bio: 'Super Administrator với quyền tối cao trong hệ thống',
      isVerified: true,
      isActive: true,
      status: UserStatus.ONLINE,
      roleId: roles.superAdminRole.id,
    }
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@tazacore.com',
      username: 'admin',
      phone: '+84900000001',
      displayName: 'System Admin',
      password: await bcrypt.hash('Admin@2024', 10),
      avatar: 'https://ui-avatars.com/api/?name=System+Admin&background=1f2937&color=fff',
      bio: 'Quản trị viên hệ thống TazaCore',
      isVerified: true,
      isActive: true,
      status: UserStatus.ONLINE,
      roleId: roles.adminRole.id,
    }
  });

  success('2 system users created');
  
  return { superAdmin, admin };
}

/**
 * Seed departments
 */
async function seedDepartments(users: any) {
  log('🏢 Creating departments...');
  
  const ceoOffice = await prisma.department.create({
    data: {
      name: 'CEO Office',
      description: 'Văn phòng Tổng Giám đốc điều hành',
      code: 'CEO',
      budget: 2000000000,
      location: 'Tầng 10, Tòa nhà TazaCore',
      phone: '+84123456789',
      email: 'ceo@tazacore.com',
      managerId: users.superAdmin.id,
      isActive: true,
    }
  });

  const hrDepartment = await prisma.department.create({
    data: {
      name: 'Human Resources',
      description: 'Phòng Nhân sự - Quản lý nguồn nhân lực và phúc lợi',
      code: 'HR',
      budget: 800000000,
      location: 'Tầng 2, Tòa nhà TazaCore',
      phone: '+84123456790',
      email: 'hr@tazacore.com',
      parentId: ceoOffice.id,
      isActive: true,
    }
  });

  const itDepartment = await prisma.department.create({
    data: {
      name: 'Information Technology',
      description: 'Phòng Công nghệ Thông tin - Phát triển và vận hành hệ thống',
      code: 'IT',
      budget: 1500000000,
      location: 'Tầng 3-4, Tòa nhà TazaCore',
      phone: '+84123456791',
      email: 'it@tazacore.com',
      parentId: ceoOffice.id,
      isActive: true,
    }
  });

  const salesDepartment = await prisma.department.create({
    data: {
      name: 'Sales & Marketing',
      description: 'Phòng Kinh doanh và Marketing - Phát triển thị trường',
      code: 'SALES',
      budget: 1200000000,
      location: 'Tầng 1, Tòa nhà TazaCore',
      phone: '+84123456792',
      email: 'sales@tazacore.com',
      parentId: ceoOffice.id,
      isActive: true,
    }
  });

  const financeDepartment = await prisma.department.create({
    data: {
      name: 'Finance & Accounting',
      description: 'Phòng Tài chính Kế toán - Quản lý tài chính doanh nghiệp',
      code: 'FIN',
      budget: 600000000,
      location: 'Tầng 5, Tòa nhà TazaCore',
      phone: '+84123456793',
      email: 'finance@tazacore.com',
      parentId: ceoOffice.id,
      isActive: true,
    }
  });

  const operationsDepartment = await prisma.department.create({
    data: {
      name: 'Operations',
      description: 'Phòng Vận hành - Quản lý hoạt động và quy trình',
      code: 'OPS',
      budget: 700000000,
      location: 'Tầng 6, Tòa nhà TazaCore',
      phone: '+84123456794',
      email: 'operations@tazacore.com',
      parentId: ceoOffice.id,
      isActive: true,
    }
  });

  success('6 departments created');
  
  return {
    ceoOffice,
    hrDepartment,
    itDepartment,
    salesDepartment,
    financeDepartment,
    operationsDepartment
  };
}

/**
 * Seed positions
 */
async function seedPositions(departments: any) {
  log('💼 Creating positions...');
  
  const positions = await Promise.all([
    // CEO Office
    prisma.position.create({
      data: {
        title: 'Chief Executive Officer',
        description: 'Tổng Giám đốc điều hành',
        level: 10,
        minSalary: 100000000,
        maxSalary: 200000000,
        requirements: 'MBA, 15+ years experience in leadership',
        departmentId: departments.ceoOffice.id,
        isActive: true,
      }
    }),
    
    // HR Department
    prisma.position.create({
      data: {
        title: 'HR Manager',
        description: 'Quản lý nhân sự',
        level: 7,
        minSalary: 35000000,
        maxSalary: 50000000,
        requirements: 'Bachelor in HR/Business, 5+ years HR experience',
        departmentId: departments.hrDepartment.id,
        isActive: true,
      }
    }),
    prisma.position.create({
      data: {
        title: 'HR Specialist',
        description: 'Chuyên viên nhân sự',
        level: 5,
        minSalary: 20000000,
        maxSalary: 30000000,
        requirements: 'Bachelor in HR/Psychology, 2+ years experience',
        departmentId: departments.hrDepartment.id,
        isActive: true,
      }
    }),
    
    // IT Department
    prisma.position.create({
      data: {
        title: 'IT Director',
        description: 'Giám đốc Công nghệ',
        level: 8,
        minSalary: 50000000,
        maxSalary: 70000000,
        requirements: 'Computer Science degree, 7+ years IT leadership',
        departmentId: departments.itDepartment.id,
        isActive: true,
      }
    }),
    prisma.position.create({
      data: {
        title: 'Senior Software Engineer',
        description: 'Kỹ sư phần mềm cao cấp',
        level: 6,
        minSalary: 30000000,
        maxSalary: 45000000,
        requirements: 'Computer Science degree, 4+ years development experience',
        departmentId: departments.itDepartment.id,
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
        requirements: 'Computer Science degree, 2+ years development experience',
        departmentId: departments.itDepartment.id,
        isActive: true,
      }
    }),
    prisma.position.create({
      data: {
        title: 'Junior Developer',
        description: 'Lập trình viên junior',
        level: 3,
        minSalary: 12000000,
        maxSalary: 20000000,
        requirements: 'Computer Science degree, 0-1 year experience',
        departmentId: departments.itDepartment.id,
        isActive: true,
      }
    }),
    
    // Sales Department
    prisma.position.create({
      data: {
        title: 'Sales Manager',
        description: 'Quản lý kinh doanh',
        level: 7,
        minSalary: 40000000,
        maxSalary: 60000000,
        requirements: 'Business/Marketing degree, 5+ years sales experience',
        departmentId: departments.salesDepartment.id,
        isActive: true,
      }
    }),
    prisma.position.create({
      data: {
        title: 'Sales Executive',
        description: 'Nhân viên kinh doanh',
        level: 4,
        minSalary: 15000000,
        maxSalary: 25000000,
        requirements: 'Business degree, 1+ year sales experience',
        departmentId: departments.salesDepartment.id,
        isActive: true,
      }
    }),
    
    // Finance Department
    prisma.position.create({
      data: {
        title: 'Finance Manager',
        description: 'Quản lý tài chính',
        level: 7,
        minSalary: 35000000,
        maxSalary: 50000000,
        requirements: 'Finance/Accounting degree, CPA, 5+ years experience',
        departmentId: departments.financeDepartment.id,
        isActive: true,
      }
    }),
    prisma.position.create({
      data: {
        title: 'Accountant',
        description: 'Kế toán viên',
        level: 4,
        minSalary: 15000000,
        maxSalary: 25000000,
        requirements: 'Accounting degree, 2+ years experience',
        departmentId: departments.financeDepartment.id,
        isActive: true,
      }
    }),
    
    // Operations Department
    prisma.position.create({
      data: {
        title: 'Operations Manager',
        description: 'Quản lý vận hành',
        level: 7,
        minSalary: 35000000,
        maxSalary: 50000000,
        requirements: 'Business/Operations degree, 5+ years experience',
        departmentId: departments.operationsDepartment.id,
        isActive: true,
      }
    }),
  ]);

  success('12 positions created');
  
  return positions;
}

/**
 * Seed HR and department users
 */
async function seedHRAndDepartmentUsers(roles: any, departments: any, positions: any) {
  log('👨‍💼 Creating HR and department users...');
  
  // Update department managers
  const hrManager = await prisma.user.create({
    data: {
      email: 'hr.manager@tazacore.com',
      username: 'hr_manager',
      phone: '+84901000001',
      displayName: 'Nguyễn Thị Hương',
      password: await bcrypt.hash('Hr@2024', 10),
      avatar: 'https://ui-avatars.com/api/?name=Nguyen+Thi+Huong&background=e11d48&color=fff',
      bio: 'Quản lý nhân sự với 8 năm kinh nghiệm',
      isVerified: true,
      isActive: true,
      status: UserStatus.ONLINE,
      roleId: roles.hrManagerRole.id,
    }
  });

  const itDirector = await prisma.user.create({
    data: {
      email: 'it.director@tazacore.com',
      username: 'it_director',
      phone: '+84901000002',
      displayName: 'Trần Văn Minh',
      password: await bcrypt.hash('It@2024', 10),
      avatar: 'https://ui-avatars.com/api/?name=Tran+Van+Minh&background=3b82f6&color=fff',
      bio: 'Giám đốc IT với 10 năm kinh nghiệm công nghệ',
      isVerified: true,
      isActive: true,
      status: UserStatus.ONLINE,
      roleId: roles.departmentManagerRole.id,
    }
  });

  const salesManager = await prisma.user.create({
    data: {
      email: 'sales.manager@tazacore.com',
      username: 'sales_manager',
      phone: '+84901000003',
      displayName: 'Lê Thị Mai',
      password: await bcrypt.hash('Sales@2024', 10),
      avatar: 'https://ui-avatars.com/api/?name=Le+Thi+Mai&background=10b981&color=fff',
      bio: 'Quản lý kinh doanh với 7 năm kinh nghiệm bán hàng',
      isVerified: true,
      isActive: true,
      status: UserStatus.ONLINE,
      roleId: roles.departmentManagerRole.id,
    }
  });

  const financeManager = await prisma.user.create({
    data: {
      email: 'finance.manager@tazacore.com',
      username: 'finance_manager',
      phone: '+84901000004',
      displayName: 'Phạm Văn Đức',
      password: await bcrypt.hash('Finance@2024', 10),
      avatar: 'https://ui-avatars.com/api/?name=Pham+Van+Duc&background=f59e0b&color=fff',
      bio: 'Quản lý tài chính với chứng chỉ CPA',
      isVerified: true,
      isActive: true,
      status: UserStatus.ONLINE,
      roleId: roles.departmentManagerRole.id,
    }
  });

  const operationsManager = await prisma.user.create({
    data: {
      email: 'ops.manager@tazacore.com',
      username: 'ops_manager',
      phone: '+84901000005',
      displayName: 'Hoàng Thị Lan',
      password: await bcrypt.hash('Ops@2024', 10),
      avatar: 'https://ui-avatars.com/api/?name=Hoang+Thi+Lan&background=8b5cf6&color=fff',
      bio: 'Quản lý vận hành với 6 năm kinh nghiệm',
      isVerified: true,
      isActive: true,
      status: UserStatus.ONLINE,
      roleId: roles.departmentManagerRole.id,
    }
  });

  // Update department managers
  await Promise.all([
    prisma.department.update({
      where: { id: departments.hrDepartment.id },
      data: { managerId: hrManager.id }
    }),
    prisma.department.update({
      where: { id: departments.itDepartment.id },
      data: { managerId: itDirector.id }
    }),
    prisma.department.update({
      where: { id: departments.salesDepartment.id },
      data: { managerId: salesManager.id }
    }),
    prisma.department.update({
      where: { id: departments.financeDepartment.id },
      data: { managerId: financeManager.id }
    }),
    prisma.department.update({
      where: { id: departments.operationsDepartment.id },
      data: { managerId: operationsManager.id }
    }),
  ]);

  success('5 managers created and assigned to departments');
  
  return {
    hrManager,
    itDirector,
    salesManager,
    financeManager,
    operationsManager
  };
}

/**
 * Seed employees
 */
async function seedEmployees(roles: any, departments: any, positions: any, managers: any, systemUsers: any) {
  log('👥 Creating employee users...');
  
  const employees: any[] = [];
  
  // IT Department employees
  const itEmployees = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@tazacore.com',
        username: 'john_doe',
        phone: '+84902000001',
        displayName: 'John Doe',
        password: await bcrypt.hash('Employee@2024', 10),
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff',
        bio: 'Senior Full-stack Developer',
        isVerified: true,
        isActive: true,
        status: UserStatus.ONLINE,
        roleId: roles.employeeRole.id,
      }
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@tazacore.com',
        username: 'jane_smith',
        phone: '+84902000002',
        displayName: 'Jane Smith',
        password: await bcrypt.hash('Employee@2024', 10),
        avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=ec4899&color=fff',
        bio: 'Frontend Developer',
        isVerified: true,
        isActive: true,
        status: UserStatus.AWAY,
        roleId: roles.employeeRole.id,
      }
    }),
    prisma.user.create({
      data: {
        email: 'david.wilson@tazacore.com',
        username: 'david_wilson',
        phone: '+84902000003',
        displayName: 'David Wilson',
        password: await bcrypt.hash('Employee@2024', 10),
        avatar: 'https://ui-avatars.com/api/?name=David+Wilson&background=06b6d4&color=fff',
        bio: 'Backend Developer',
        isVerified: true,
        isActive: true,
        status: UserStatus.ONLINE,
        roleId: roles.employeeRole.id,
      }
    }),
  ]);

  // Sales employees
  const salesEmployees = await Promise.all([
    prisma.user.create({
      data: {
        email: 'sarah.johnson@tazacore.com',
        username: 'sarah_johnson',
        phone: '+84902000004',
        displayName: 'Sarah Johnson',
        password: await bcrypt.hash('Employee@2024', 10),
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=f59e0b&color=fff',
        bio: 'Senior Sales Executive',
        isVerified: true,
        isActive: true,
        status: UserStatus.BUSY,
        roleId: roles.employeeRole.id,
      }
    }),
    prisma.user.create({
      data: {
        email: 'mike.brown@tazacore.com',
        username: 'mike_brown',
        phone: '+84902000005',
        displayName: 'Mike Brown',
        password: await bcrypt.hash('Employee@2024', 10),
        avatar: 'https://ui-avatars.com/api/?name=Mike+Brown&background=84cc16&color=fff',
        bio: 'Sales Executive',
        isVerified: true,
        isActive: true,
        status: UserStatus.ONLINE,
        roleId: roles.employeeRole.id,
      }
    }),
  ]);

  // HR employees
  const hrEmployees = await Promise.all([
    prisma.user.create({
      data: {
        email: 'lisa.garcia@tazacore.com',
        username: 'lisa_garcia',
        phone: '+84902000006',
        displayName: 'Lisa Garcia',
        password: await bcrypt.hash('Employee@2024', 10),
        avatar: 'https://ui-avatars.com/api/?name=Lisa+Garcia&background=a855f7&color=fff',
        bio: 'HR Specialist',
        isVerified: true,
        isActive: true,
        status: UserStatus.ONLINE,
        roleId: roles.employeeRole.id,
      }
    }),
  ]);

  // Finance employees
  const financeEmployees = await Promise.all([
    prisma.user.create({
      data: {
        email: 'robert.davis@tazacore.com',
        username: 'robert_davis',
        phone: '+84902000007',
        displayName: 'Robert Davis',
        password: await bcrypt.hash('Employee@2024', 10),
        avatar: 'https://ui-avatars.com/api/?name=Robert+Davis&background=ef4444&color=fff',
        bio: 'Senior Accountant',
        isVerified: true,
        isActive: true,
        status: UserStatus.OFFLINE,
        roleId: roles.employeeRole.id,
      }
    }),
  ]);

  employees.push(...itEmployees, ...salesEmployees, ...hrEmployees, ...financeEmployees);

  success(`${employees.length} employee users created`);
  
  return {
    itEmployees,
    salesEmployees,
    hrEmployees,
    financeEmployees,
    allEmployees: employees
  };
}

/**
 * Create employee records for all users
 */
async function createEmployeeRecords(users: any, departments: any, positions: any) {
  log('📋 Creating employee records...');
  
  const employeeRecords: any[] = [];
  
  // CEO
  const ceoEmployee = await prisma.employee.create({
    data: {
      employeeId: 'CEO001',
      firstName: 'Super',
      lastName: 'Admin',
      fullName: 'Super Admin',
      dateOfBirth: new Date('1980-01-01'),
      gender: 'Nam',
      nationality: 'Vietnamese',
      idNumber: '001080000001',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      phone: '+84900000000',
      emergencyContact: 'Liên hệ khẩn cấp: +84900000099',
      hireDate: new Date('2020-01-01'),
      salary: 150000000,
      status: EmployeeStatus.ACTIVE,
      contractType: ContractType.FULL_TIME,
      notes: 'Founder & CEO của TazaCore',
      userId: users.systemUsers.superAdmin.id,
      departmentId: departments.ceoOffice.id,
      positionId: positions[0].id, // CEO position
    }
  });

  // HR Manager
  const hrManagerEmployee = await prisma.employee.create({
    data: {
      employeeId: 'HR001',
      firstName: 'Thị Hương',
      lastName: 'Nguyễn',
      fullName: 'Nguyễn Thị Hương',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'Nữ',
      nationality: 'Vietnamese',
      idNumber: '001085000002',
      address: '456 Đường DEF, Quận 3, TP.HCM',
      phone: '+84901000001',
      emergencyContact: 'Chồng: +84901000101',
      hireDate: new Date('2021-02-01'),
      salary: 42000000,
      status: EmployeeStatus.ACTIVE,
      contractType: ContractType.FULL_TIME,
      notes: 'Quản lý nhân sự giàu kinh nghiệm',
      userId: users.managers.hrManager.id,
      departmentId: departments.hrDepartment.id,
      positionId: positions[1].id, // HR Manager position
    }
  });

  // IT Director
  const itDirectorEmployee = await prisma.employee.create({
    data: {
      employeeId: 'IT001',
      firstName: 'Văn Minh',
      lastName: 'Trần',
      fullName: 'Trần Văn Minh',
      dateOfBirth: new Date('1982-07-20'),
      gender: 'Nam',
      nationality: 'Vietnamese',
      idNumber: '001082000003',
      address: '789 Đường GHI, Quận 7, TP.HCM',
      phone: '+84901000002',
      emergencyContact: 'Vợ: +84901000102',
      hireDate: new Date('2020-06-01'),
      salary: 60000000,
      status: EmployeeStatus.ACTIVE,
      contractType: ContractType.FULL_TIME,
      notes: 'Chuyên gia công nghệ hàng đầu',
      userId: users.managers.itDirector.id,
      departmentId: departments.itDepartment.id,
      positionId: positions[3].id, // IT Director position
    }
  });

  // Add more employee records for other users...
  // (This is a sample, you can extend this for all users)

  employeeRecords.push(ceoEmployee, hrManagerEmployee, itDirectorEmployee);

  success(`${employeeRecords.length} employee records created`);
  
  return employeeRecords;
}

/**
 * Seed chat-related data
 */
async function seedChatData(users: any, roles: any) {
  log('💬 Creating chat conversations and messages...');
  
  // Create a company-wide general channel
  const generalConversation = await prisma.conversation.create({
    data: {
      title: 'General Discussion',
      description: 'Kênh thảo luận chung của công ty',
      type: ConversationType.CHANNEL,
      isPublic: true,
      createdById: users.systemUsers.admin.id,
      participants: {
        connect: [
          { id: users.systemUsers.superAdmin.id },
          { id: users.systemUsers.admin.id },
          { id: users.managers.hrManager.id },
          { id: users.managers.itDirector.id },
          { id: users.managers.salesManager.id },
        ]
      }
    }
  });

  // Create IT team conversation
  const itTeamConversation = await prisma.conversation.create({
    data: {
      title: 'IT Team',
      description: 'Kênh thảo luận của team IT',
      type: ConversationType.GROUP,
      isPublic: false,
      createdById: users.managers.itDirector.id,
      participants: {
        connect: [
          { id: users.managers.itDirector.id },
          ...(users.employees.itEmployees || []).map((emp: any) => ({ id: emp.id }))
        ]
      }
    }
  });

  // Create some sample messages
  const messages = await Promise.all([
    prisma.message.create({
      data: {
        content: 'Chào mừng tất cả mọi người đến với TazaCore! 🎉',
        type: MessageType.TEXT,
        conversationId: generalConversation.id,
        userId: users.systemUsers.superAdmin.id,
      }
    }),
    prisma.message.create({
      data: {
        content: 'Cảm ơn CEO! Rất vui được làm việc tại đây 😊',
        type: MessageType.TEXT,
        conversationId: generalConversation.id,
        userId: users.managers.hrManager.id,
      }
    }),
    prisma.message.create({
      data: {
        content: 'Team IT đã sẵn sàng hỗ trợ mọi người với các vấn đề kỹ thuật!',
        type: MessageType.TEXT,
        conversationId: generalConversation.id,
        userId: users.managers.itDirector.id,
      }
    }),
    prisma.message.create({
      data: {
        content: 'Hôm nay chúng ta có cuộc họp team IT lúc 2PM nhé các bạn!',
        type: MessageType.TEXT,
        conversationId: itTeamConversation.id,
        userId: users.managers.itDirector.id,
      }
    }),
  ]);

  success(`2 conversations and ${messages.length} messages created`);
  
  return {
    generalConversation,
    itTeamConversation,
    messages
  };
}

/**
 * Seed sample attendance and HR data
 */
async function seedHRSampleData(employeeRecords: any) {
  log('📊 Creating sample HR data (attendance, leave requests)...');
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Create sample attendance records
  const attendanceRecords = await Promise.all([
    prisma.attendance.create({
      data: {
        date: yesterday,
        timeIn: new Date(`${yesterday.toISOString().split('T')[0]}T08:00:00Z`),
        timeOut: new Date(`${yesterday.toISOString().split('T')[0]}T17:30:00Z`),
        totalHours: 8.5,
        overtime: 0.5,
        status: AttendanceStatus.PRESENT,
        notes: 'Làm việc bình thường',
        employeeId: employeeRecords[0].id,
        userId: employeeRecords[0].userId,
      }
    }),
    prisma.attendance.create({
      data: {
        date: today,
        timeIn: new Date(`${today.toISOString().split('T')[0]}T08:15:00Z`),
        status: AttendanceStatus.LATE,
        notes: 'Đến muộn 15 phút do kẹt xe',
        employeeId: employeeRecords[1].id,
        userId: employeeRecords[1].userId,
      }
    }),
  ]);

  // Create sample leave request
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const endOfNextWeek = new Date(nextWeek);
  endOfNextWeek.setDate(endOfNextWeek.getDate() + 2);

  const leaveRequests = await Promise.all([
    prisma.leaveRequest.create({
      data: {
        startDate: nextWeek,
        endDate: endOfNextWeek,
        days: 3,
        type: LeaveType.ANNUAL,
        reason: 'Nghỉ phép thường niên - du lịch gia đình',
        status: LeaveStatus.PENDING,
        employeeId: employeeRecords[1].id,
        userId: employeeRecords[1].userId,
      }
    }),
  ]);

  success(`${attendanceRecords.length} attendance records and ${leaveRequests.length} leave requests created`);
  
  return {
    attendanceRecords,
    leaveRequests
  };
}

/**
 * Main seed function
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}🌱 TazaCore Master Seed Starting...${colors.reset}\n`);
  
  try {
    // Clear existing data
    await clearDatabase();
    
    // Seed roles
    const roles = await seedRoles();
    
    // Seed system users
    const systemUsers = await seedSystemUsers(roles);
    
    // Seed departments
    const departments = await seedDepartments(systemUsers);
    
    // Seed positions
    const positions = await seedPositions(departments);
    
    // Seed HR and department managers
    const managers = await seedHRAndDepartmentUsers(roles, departments, positions);
    
    // Seed regular employees
    const employees = await seedEmployees(roles, departments, positions, managers, systemUsers);
    
    // Create employee records
    const employeeRecords = await createEmployeeRecords(
      { systemUsers, managers, employees }, 
      departments, 
      positions
    );
    
    // Seed chat data
    await seedChatData({ systemUsers, managers, employees }, roles);
    
    // Seed HR sample data
    await seedHRSampleData(employeeRecords);
    
    console.log(`\n${colors.bright}${colors.green}🎉 TazaCore Master Seed Completed Successfully!${colors.reset}\n`);
    
    // Print summary
    console.log(`${colors.bright}📋 Seeding Summary:${colors.reset}`);
    console.log(`   ✅ Roles: 8`);
    console.log(`   ✅ Users: ${2 + 5 + employees.allEmployees.length}`);
    console.log(`   ✅ Departments: 6`);
    console.log(`   ✅ Positions: 12`);
    console.log(`   ✅ Employee Records: ${employeeRecords.length}`);
    console.log(`   ✅ Conversations: 2`);
    console.log(`   ✅ Messages: 4`);
    console.log(`   ✅ Attendance Records: Sample data`);
    console.log(`   ✅ Leave Requests: Sample data`);
    
    console.log(`\n${colors.bright}🔑 Default Login Credentials:${colors.reset}`);
    console.log(`   Super Admin: superadmin@tazacore.com / SuperAdmin@2024`);
    console.log(`   Admin: admin@tazacore.com / Admin@2024`);
    console.log(`   HR Manager: hr.manager@tazacore.com / Hr@2024`);
    console.log(`   IT Director: it.director@tazacore.com / It@2024`);
    console.log(`   Sales Manager: sales.manager@tazacore.com / Sales@2024`);
    console.log(`   Employees: <email> / Employee@2024`);
    
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
