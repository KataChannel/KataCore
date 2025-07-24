#!/usr/bin/env ts-node

// ============================================================================
// TAZACORE DATA MIGRATION SCRIPT
// ============================================================================
// Senior-level approach to migrate mockup data to database
// Migrates system roles, test users, and permission data with proper relationships

import { PrismaClient, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { SYSTEM_ROLES } from '../../site/src/lib/auth/unified-permission.service';
import { testUsers } from '../../site/src/lib/auth/permission-tests';
import { ROLE_PERMISSION_SETS, getRoleModules } from '../../site/src/lib/auth/permissions-constants';

// ============================================================================
// CONFIGURATION
// ============================================================================

const prisma = new PrismaClient();

// Console colors for better output readability
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Default passwords for migrated users
const DEFAULT_PASSWORDS = {
  superAdmin: 'SuperAdmin@2024!',
  hrManager: 'HRManager@2024!',
  salesManager: 'SalesManager@2024!',
  employee: 'Employee@2024!',
  financeManager: 'FinanceManager@2024!',
  inventoryManager: 'InventoryManager@2024!',
  departmentManager: 'DeptManager@2024!',
  teamLead: 'TeamLead@2024!',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const log = (message: string, color = colors.blue) =>
  console.log(`${color}[MIGRATION]${colors.reset} ${message}`);

const success = (message: string) =>
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);

const warning = (message: string) =>
  console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);

const error = (message: string) =>
  console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);

const info = (message: string) =>
  console.log(`${colors.cyan}[INFO]${colors.reset} ${message}`);

// ============================================================================
// MIGRATION FUNCTIONS
// ============================================================================

/**
 * Clear existing migration-related data
 */
async function clearMigrationData() {
  log('🗑️ Clearing existing migration data...');

  try {
    // Only clear test users and non-essential data to avoid breaking existing systems
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'superadmin@taza.com',
            'hrmanager@taza.com',
            'salesmanager@taza.com',
            'employee@taza.com',
            'financemanager@taza.com',
            'inventorymanager@taza.com',
            'departmentmanager@taza.com',
            'teamlead@taza.com',
          ],
        },
      },
    });

    success('Migration data cleared');
  } catch (err: any) {
    warning(`Some data couldn't be cleared: ${err.message}`);
  }
}

/**
 * Migrate SYSTEM_ROLES to database
 */
async function migrateSystemRoles() {
  log('👑 Migrating system roles to database...');

  const migratedRoles: any = {};

  for (const systemRole of SYSTEM_ROLES) {
    try {
      // Convert permissions to the database format
      const permissionsData = {
        permissions: systemRole.permissions.map(p => ({
          action: p.action,
          resource: p.resource,
          scope: p.scope || 'all',
        })),
        modules: systemRole.modules,
        level: systemRole.level,
        isSystemRole: true,
        createdAt: new Date().toISOString(),
      };

      // Upsert role to handle both creation and updates
      const dbRole = await prisma.role.upsert({
        where: { name: systemRole.name },
        update: {
          description: systemRole.description,
          permissions: JSON.stringify(permissionsData),
          level: systemRole.level,
          modules: JSON.stringify(systemRole.modules),
          isSystemRole: true,
        },
        create: {
          name: systemRole.name,
          description: systemRole.description,
          permissions: JSON.stringify(permissionsData),
          level: systemRole.level,
          modules: JSON.stringify(systemRole.modules),
          isSystemRole: true,
        },
      });

      migratedRoles[systemRole.id] = dbRole;
      success(`Role migrated: ${systemRole.name} (${systemRole.id})`);
    } catch (err: any) {
      error(`Failed to migrate role ${systemRole.name}: ${err.message}`);
    }
  }

  success(`${Object.keys(migratedRoles).length} system roles migrated`);
  return migratedRoles;
}

/**
 * Migrate test users to database with proper role relationships
 */
async function migrateTestUsers(roles: any) {
  log('👥 Migrating test users to database...');

  const migratedUsers: any = {};

  // Extended test users with additional system roles
  const extendedTestUsers = {
    ...testUsers,
    financeManager: {
      id: 'user_finance_manager',
      displayName: 'Finance Manager User',
      name: 'Finance Manager User',
      email: 'financemanager@taza.com',
      roleId: 'finance_manager',
      isActive: true,
      isVerified: true,
      provider: 'email',
      modules: ['finance', 'analytics'],
      permissions: [],
    },
    inventoryManager: {
      id: 'user_inventory_manager',
      displayName: 'Inventory Manager User',
      name: 'Inventory Manager User',
      email: 'inventorymanager@taza.com',
      roleId: 'inventory_manager',
      isActive: true,
      isVerified: true,
      provider: 'email',
      modules: ['inventory', 'analytics'],
      permissions: [],
    },
    departmentManager: {
      id: 'user_department_manager',
      displayName: 'Department Manager User',
      name: 'Department Manager User',
      email: 'departmentmanager@taza.com',
      roleId: 'department_manager',
      isActive: true,
      isVerified: true,
      provider: 'email',
      modules: ['hrm', 'analytics'],
      permissions: [],
    },
    teamLead: {
      id: 'user_team_lead',
      displayName: 'Team Lead User',
      name: 'Team Lead User',
      email: 'teamlead@taza.com',
      roleId: 'team_lead',
      isActive: true,
      isVerified: true,
      provider: 'email',
      modules: ['hrm'],
      permissions: [],
    },
  };

  for (const [userType, userData] of Object.entries(extendedTestUsers)) {
    try {
      // Find corresponding role in database
      let dbRole = null;
      for (const [roleId, roleData] of Object.entries(roles)) {
        if (roleId === userData.roleId || roleData.name.toLowerCase().includes(userData.roleId.replace('_', ' '))) {
          dbRole = roleData;
          break;
        }
      }

      if (!dbRole) {
        warning(`No database role found for user ${userType} with roleId ${userData.roleId}`);
        continue;
      }

      // Generate secure password
      const password = (DEFAULT_PASSWORDS as any)[userType] || 'DefaultPassword@2024!';
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user data
      const userCreateData = {
        email: userData.email,
        username: userData.email.split('@')[0],
        displayName: userData.displayName,
        password: hashedPassword,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.displayName)}&background=random&color=fff&size=128`,
        bio: `Test user for ${userData.displayName} role - migrated from mockup data`,
        isVerified: userData.isVerified,
        isActive: userData.isActive,
        status: UserStatus.OFFLINE,
        roleId: dbRole.id,
      };

      // Upsert user
      const dbUser = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          displayName: userData.displayName,
          roleId: dbRole.id,
          isActive: userData.isActive,
          isVerified: userData.isVerified,
        },
        create: userCreateData,
        include: { role: true },
      });

      migratedUsers[userType] = dbUser;
      success(`User migrated: ${userData.displayName} (${userData.email})`);
      info(`  Password: ${password}`);
      info(`  Role: ${dbRole.name} (Level ${dbRole.level})`);
    } catch (err: any) {
      error(`Failed to migrate user ${userType}: ${err.message}`);
    }
  }

  success(`${Object.keys(migratedUsers).length} test users migrated`);
  return migratedUsers;
}

/**
 * Create sample departments for organizational structure
 */
async function createSampleDepartments(users: any) {
  log('🏢 Creating sample departments...');

  try {
    const departments = await Promise.all([
      prisma.department.upsert({
        where: { code: 'IT' },
        update: {},
        create: {
          name: 'Information Technology',
          description: 'IT Department - System development and maintenance',
          code: 'IT',
          budget: 1000000,
          location: 'Floor 3',
          phone: '+84901234567',
          email: 'it@taza.com',
          isActive: true,
        },
      }),
      prisma.department.upsert({
        where: { code: 'HR' },
        update: {},
        create: {
          name: 'Human Resources',
          description: 'HR Department - People management and development',
          code: 'HR',
          budget: 800000,
          location: 'Floor 2',
          phone: '+84901234568',
          email: 'hr@taza.com',
          isActive: true,
        },
      }),
      prisma.department.upsert({
        where: { code: 'SALES' },
        update: {},
        create: {
          name: 'Sales & Marketing',
          description: 'Sales Department - Customer acquisition and retention',
          code: 'SALES',
          budget: 1200000,
          location: 'Floor 1',
          phone: '+84901234569',
          email: 'sales@taza.com',
          isActive: true,
        },
      }),
      prisma.department.upsert({
        where: { code: 'FIN' },
        update: {},
        create: {
          name: 'Finance',
          description: 'Finance Department - Financial planning and control',
          code: 'FIN',
          budget: 600000,
          location: 'Floor 4',
          phone: '+84901234570',
          email: 'finance@taza.com',
          isActive: true,
        },
      }),
    ]);

    success(`${departments.length} departments created/updated`);
    return departments;
  } catch (err: any) {
    error(`Failed to create departments: ${err.message}`);
    return [];
  }
}

/**
 * Create sample positions for job roles
 */
async function createSamplePositions(departments: any[]) {
  log('💼 Creating sample positions...');

  if (departments.length === 0) {
    warning('No departments available for position creation');
    return [];
  }

  try {
    const positions = await Promise.all([
      // IT Positions
      prisma.position.upsert({
        where: { code: 'IT_DEV' },
        update: {},
        create: {
          title: 'Software Developer',
          description: 'Full-stack software development',
          code: 'IT_DEV',
          level: 'MID',
          minSalary: 20000000,
          maxSalary: 35000000,
          departmentId: departments.find(d => d.code === 'IT')?.id || departments[0].id,
          isActive: true,
        },
      }),
      // HR Positions
      prisma.position.upsert({
        where: { code: 'HR_MGR' },
        update: {},
        create: {
          title: 'HR Manager',
          description: 'Human resources management and strategy',
          code: 'HR_MGR',
          level: 'SENIOR',
          minSalary: 30000000,
          maxSalary: 50000000,
          departmentId: departments.find(d => d.code === 'HR')?.id || departments[1].id,
          isActive: true,
        },
      }),
      // Sales Positions
      prisma.position.upsert({
        where: { code: 'SALES_MGR' },
        update: {},
        create: {
          title: 'Sales Manager',
          description: 'Sales team management and strategy',
          code: 'SALES_MGR',
          level: 'SENIOR',
          minSalary: 25000000,
          maxSalary: 40000000,
          departmentId: departments.find(d => d.code === 'SALES')?.id || departments[2].id,
          isActive: true,
        },
      }),
      // Finance Positions
      prisma.position.upsert({
        where: { code: 'FIN_MGR' },
        update: {},
        create: {
          title: 'Finance Manager',
          description: 'Financial planning and analysis',
          code: 'FIN_MGR',
          level: 'SENIOR',
          minSalary: 28000000,
          maxSalary: 45000000,
          departmentId: departments.find(d => d.code === 'FIN')?.id || departments[3].id,
          isActive: true,
        },
      }),
    ]);

    success(`${positions.length} positions created/updated`);
    return positions;
  } catch (err: any) {
    error(`Failed to create positions: ${err.message}`);
    return [];
  }
}

/**
 * Validate migration integrity
 */
async function validateMigration() {
  log('✅ Validating migration integrity...');

  try {
    // Count migrated data
    const roleCount = await prisma.role.count({ where: { isSystemRole: true } });
    const userCount = await prisma.user.count();
    const departmentCount = await prisma.department.count();
    const positionCount = await prisma.position.count();

    info(`Validation Results:`);
    info(`  System Roles: ${roleCount}`);
    info(`  Users: ${userCount}`);
    info(`  Departments: ${departmentCount}`);
    info(`  Positions: ${positionCount}`);

    // Verify role-user relationships
    const usersWithRoles = await prisma.user.count({
      where: { roleId: { not: null } },
    });

    info(`  Users with roles: ${usersWithRoles}`);

    // Check for orphaned data
    const orphanedUsers = await prisma.user.count({
      where: { role: null },
    });

    if (orphanedUsers > 0) {
      warning(`${orphanedUsers} users found without valid roles`);
    }

    success('Migration validation completed');
    return true;
  } catch (err: any) {
    error(`Validation failed: ${err.message}`);
    return false;
  }
}

/**
 * Generate migration summary report
 */
async function generateMigrationReport() {
  log('📊 Generating migration report...');

  try {
    // Get all system roles with user counts
    const roles = await prisma.role.findMany({
      where: { isSystemRole: true },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    // Get all migrated users
    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { role: { level: 'desc' } },
    });

    console.log(`\n${colors.bright}${colors.cyan}📋 MIGRATION REPORT${colors.reset}`);
    console.log('='.repeat(50));

    console.log(`\n${colors.yellow}System Roles:${colors.reset}`);
    roles.forEach(role => {
      const permissions = role.permissions ? JSON.parse(role.permissions) : {};
      console.log(`  • ${role.name} (Level ${role.level}) - ${role._count.users} users`);
      console.log(`    Modules: ${permissions.modules ? permissions.modules.join(', ') : 'None'}`);
    });

    console.log(`\n${colors.yellow}Migrated Users:${colors.reset}`);
    users.forEach(user => {
      console.log(`  • ${user.displayName} (${user.email})`);
      console.log(`    Role: ${user.role.name} (Level ${user.role.level})`);
      console.log(`    Status: ${user.isActive ? 'Active' : 'Inactive'} | Verified: ${user.isVerified}`);
    });

    console.log(`\n${colors.green}Migration completed successfully!${colors.reset}`);
    console.log(`${colors.cyan}Next steps:${colors.reset}`);
    console.log('1. Test login with migrated users');
    console.log('2. Verify permission system functionality');
    console.log('3. Create additional users as needed');
    console.log('4. Configure department assignments');

    success('Migration report generated');
  } catch (err: any) {
    error(`Failed to generate report: ${err.message}`);
  }
}

// ============================================================================
// MAIN MIGRATION PROCESS
// ============================================================================

async function runMigration() {
  console.log(`${colors.bright}${colors.cyan}🚀 TazaCore Data Migration Starting...${colors.reset}\n`);

  try {
    // Step 1: Clear existing migration data
    await clearMigrationData();

    // Step 2: Migrate system roles
    const migratedRoles = await migrateSystemRoles();

    // Step 3: Migrate test users
    const migratedUsers = await migrateTestUsers(migratedRoles);

    // Step 4: Create sample organizational structure
    const departments = await createSampleDepartments(migratedUsers);
    const positions = await createSamplePositions(departments);

    // Step 5: Validate migration
    const isValid = await validateMigration();

    if (isValid) {
      // Step 6: Generate report
      await generateMigrationReport();
    } else {
      error('Migration validation failed!');
      process.exit(1);
    }

    success('Data migration completed successfully!');
  } catch (err: any) {
    error(`Migration failed: ${err.message}`);
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================================================
// CLI EXECUTION
// ============================================================================

if (require.main === module) {
  runMigration();
}

export {
  runMigration,
  migrateSystemRoles,
  migrateTestUsers,
  validateMigration,
};
