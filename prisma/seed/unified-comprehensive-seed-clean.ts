#!/usr/bin/env ts-node

// ============================================================================
// TAZAGROUP UNIFIED COMPREHENSIVE SEED DATA - CLEAN VERSION
// ============================================================================
// Simplified seed data without HR/HRM models for TazaGroup
// Super user: it@tazagroup.vn
// Version: 5.0 - Cleaned for Next.js v15

import { PrismaClient, UserStatus } from '@prisma/client';
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
      'manage:permission', 'admin:system', 'view:analytics'
    ],
    level: 9,
    modules: ['ADMIN', 'USER_MANAGEMENT', 'ANALYTICS']
  },

  // Department Manager
  DEPARTMENT_MANAGER: {
    permissions: [
      'read:employee', 'update:employee', 'manage:team', 'view:team_performance'
    ],
    level: 6,
    modules: ['TEAM_MANAGEMENT']
  },

  // Team Lead
  TEAM_LEAD: {
    permissions: [
      'read:team_member', 'update:team_member', 'assign:task', 'view:team_performance'
    ],
    level: 5,
    modules: ['TEAM_MANAGEMENT', 'PROJECT']
  },

  // Employee
  EMPLOYEE: {
    permissions: [
      'read:profile', 'update:profile', 'view:schedule'
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
  
  const hashedPassword = await bcrypt.hash('123456', 10);
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
 * Create department managers and employees
 */
async function seedUsers(roles: any[]) {
  log('👥 Creating department managers and employees...');
  
  const hashedPassword = await bcrypt.hash('123456', 10);
  const departmentManagerRole = roles.find(r => r.name === 'DEPARTMENT_MANAGER');
  const employeeRole = roles.find(r => r.name === 'EMPLOYEE');
  
  const users = [];

  // Department Managers
  const managers = [
    { email: 'cto@tazagroup.vn', username: 'cto', phone: '+84901234590', name: 'Nguyễn Văn Anh', bio: 'Chief Technology Officer', bg: '7c3aed' },
    { email: 'hr.director@tazagroup.vn', username: 'hrdirector', phone: '+84901234591', name: 'Trần Thị Bình', bio: 'HR Director', bg: 'dc2626' },
    { email: 'sales.director@tazagroup.vn', username: 'salesdirector', phone: '+84901234592', name: 'Lê Minh Công', bio: 'Sales Director', bg: '059669' },
    { email: 'finance.manager@tazagroup.vn', username: 'financemanager', phone: '+84901234593', name: 'Phạm Thị Dung', bio: 'Finance Manager', bg: 'ea580c' },
    { email: 'ops.manager@tazagroup.vn', username: 'opsmanager', phone: '+84901234594', name: 'Hoàng Văn Em', bio: 'Operations Manager', bg: '0891b2' },
    { email: 'qa.manager@tazagroup.vn', username: 'qamanager', phone: '+84901234595', name: 'Đỗ Thị Phương', bio: 'QA Manager', bg: '7c2d12' },
  ];

  for (const mgr of managers) {
    const user = await prisma.users.create({
      data: {
        id: nanoid(),
        email: mgr.email,
        username: mgr.username,
        phone: mgr.phone,
        displayName: mgr.name,
        password: hashedPassword,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(mgr.name)}&background=${mgr.bg}&color=fff`,
        bio: mgr.bio,
        isVerified: true,
        isActive: true,
        status: UserStatus.ONLINE,
        roleId: departmentManagerRole.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    users.push(user);
  }

  // Regular Employees
  const employees = [
    { email: 'dev1@tazagroup.vn', username: 'dev1', phone: '+84901234600', name: 'Nguyễn Văn Giang', status: UserStatus.ONLINE },
    { email: 'dev2@tazagroup.vn', username: 'dev2', phone: '+84901234601', name: 'Trần Thị Hạnh', status: UserStatus.ONLINE },
    { email: 'devops@tazagroup.vn', username: 'devops', phone: '+84901234602', name: 'Lê Minh Inh', status: UserStatus.ONLINE },
    { email: 'hr1@tazagroup.vn', username: 'hr1', phone: '+84901234603', name: 'Phạm Thị Kiều', status: UserStatus.ONLINE },
    { email: 'sales1@tazagroup.vn', username: 'sales1', phone: '+84901234604', name: 'Hoàng Văn Long', status: UserStatus.BUSY },
    { email: 'sales2@tazagroup.vn', username: 'sales2', phone: '+84901234605', name: 'Đỗ Thị Mai', status: UserStatus.ONLINE },
    { email: 'accountant1@tazagroup.vn', username: 'accountant1', phone: '+84901234606', name: 'Nguyễn Văn Nam', status: UserStatus.OFFLINE },
    { email: 'ops1@tazagroup.vn', username: 'ops1', phone: '+84901234607', name: 'Trần Thị Oanh', status: UserStatus.ONLINE },
    { email: 'qa1@tazagroup.vn', username: 'qa1', phone: '+84901234608', name: 'Lê Minh Phúc', status: UserStatus.AWAY },
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
      content: 'Hệ thống đã được triển khai thành công với Next.js v15 và tính năng quản lý người dùng hiện đại.',
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
      content: 'Team IT đã hoàn thành việc setup hệ thống mới. Performance đã được tối ưu hóa đáng kể.',
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
    log('🚀 Starting TazaGroup unified seed process...');
    
    // Step 1: Clear existing data
    await clearDatabase();
    
    // Step 2: Create roles
    const roles = await seedRoles();
    
    // Step 3: Create admin users
    const adminUsers = await seedAdminUsers(roles);
    
    // Step 4: Create users
    const users = await seedUsers(roles);
    
    // Step 5: Create communication data
    await seedCommunicationData(users);
    
    // Step 6: Create user settings
    await seedUserSettings(users);
    
    // Final summary
    success('🎉 TAZAGROUP SEED COMPLETED!');
    info('='.repeat(60));
    info('TAZAGROUP SYSTEM - LOGIN CREDENTIALS');
    info('='.repeat(60));
    info('🔑 SUPER ADMIN:');
    info('   Email: it@tazagroup.vn');
    info('   Password: 123456');
    info('   Level: 10 (Full Access)');
    info('');
    info('🔑 SYSTEM ADMIN:');
    info('   Email: admin@tazagroup.vn');
    info('   Password: 123456');
    info('   Level: 9 (System Management)');
    info('');
    info('🔑 DEPARTMENT MANAGERS:');
    info('   CTO: cto@tazagroup.vn');
    info('   HR Director: hr.director@tazagroup.vn');
    info('   Sales Director: sales.director@tazagroup.vn');
    info('   Finance Manager: finance.manager@tazagroup.vn');
    info('   Operations Manager: ops.manager@tazagroup.vn');
    info('   QA Manager: qa.manager@tazagroup.vn');
    info('   Password: 123456 (for all)');
    info('');
    info('🔑 EMPLOYEES (Sample):');
    info('   dev1@tazagroup.vn, dev2@tazagroup.vn, devops@tazagroup.vn');
    info('   hr1@tazagroup.vn, sales1@tazagroup.vn, sales2@tazagroup.vn');
    info('   accountant1@tazagroup.vn, ops1@tazagroup.vn, qa1@tazagroup.vn');
    info('   Password: 123456 (for all)');
    info('');
    info('📊 DATA SUMMARY:');
    info(`   • ${roles.length} Roles`);
    info(`   • ${users.managers.length + users.employees.length} Users`);
    info('   • Communication System (Conversations, Messages)');
    info('   • User Settings and Preferences');
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
