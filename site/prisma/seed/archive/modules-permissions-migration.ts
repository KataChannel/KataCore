// ============================================================================
// MODULES PERMISSIONS MIGRATION SCRIPT
// ============================================================================
// Migrates data from modules-permissions.ts to database
// Senior level implementation with comprehensive role management

import { SYSTEM_ROLES, SALES_PERMISSIONS, CRM_PERMISSIONS, INVENTORY_PERMISSIONS, FINANCE_PERMISSIONS, HRM_PERMISSIONS, PROJECT_PERMISSIONS, MANUFACTURING_PERMISSIONS, MARKETING_PERMISSIONS, SUPPORT_PERMISSIONS, ANALYTICS_PERMISSIONS, ECOMMERCE_PERMISSIONS, ALL_MODULE_PERMISSIONS } from "@/lib/auth/modules-permissions";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";



// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

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
 * Clear existing data with proper foreign key handling
 */
async function clearExistingData() {
  log('🗑️ Clearing existing permission data...');
  
  try {
    // Clear in correct order to avoid foreign key constraints
    await prisma.sessions.deleteMany();
    await prisma.notifications.deleteMany();
    await prisma.audit_logs.deleteMany();
    
    // Clear conversation-related data first
    await prisma.message_reactions.deleteMany();
    await prisma.messages.deleteMany();
    await prisma.conversation_members.deleteMany();
    await prisma.conversations.deleteMany();
    
    // Clear call center data
    await prisma.call_history_overview.deleteMany();
    await prisma.call_extension_users.deleteMany();
    await prisma.call_extensions.deleteMany();
    
    // Clear friend requests
    await prisma.friend_requests.deleteMany();
    
    // Clear user settings
    await prisma.user_settings.deleteMany();
    
    // Clear reports
    await prisma.reports.deleteMany();
    
    // Clear HR data
    await prisma.performance_reviews.deleteMany();
    await prisma.payrolls.deleteMany();
    await prisma.leave_requests.deleteMany();
    await prisma.attendances.deleteMany();
    await prisma.employees.deleteMany();
    await prisma.positions.deleteMany();
    await prisma.departments.deleteMany();
    
    // Clear users and roles last
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();
    
    success('Existing data cleared successfully');
  } catch (err) {
    error(`Failed to clear existing data: ${err}`);
    throw err;
  }
}

/**
 * Migrate system roles from modules-permissions.ts
 */
async function migrateSystemRoles() {
  log('👥 Migrating system roles...');
  
  const createdRoles = [];
  
  for (const systemRole of SYSTEM_ROLES) {
    try {
      // Convert permissions array to JSON string for database storage
      const permissionsJson = JSON.stringify({
        permissions: systemRole.permissions,
        version: '1.0',
        source: 'modules-permissions-migration',
        createdAt: new Date().toISOString()
      });
      
      // Convert modules array to JSON string
      const modulesJson = JSON.stringify(systemRole.modules);
      
      const role = await prisma.roles.create({
        data: {
          id: systemRole.id,
          name: systemRole.name,
          description: systemRole.description,
          permissions: permissionsJson,
          level: systemRole.level,
          modules: modulesJson,
          isSystemRole: true,
          updatedAt: new Date(),
        },
      });
      
      createdRoles.push(role);
      success(`✅ Created role: ${role.name} (Level ${role.level})`);
      
    } catch (err) {
      error(`Failed to create role ${systemRole.name}: ${err}`);
      
      // Try to update if already exists
      try {
        const permissionsJson = JSON.stringify({
          permissions: systemRole.permissions,
          version: '1.0',
          source: 'modules-permissions-migration',
          updatedAt: new Date().toISOString()
        });
        
        const modulesJson = JSON.stringify(systemRole.modules);
        
        const updatedRole = await prisma.roles.update({
          where: { name: systemRole.name },
          data: {
            description: systemRole.description,
            permissions: permissionsJson,
            level: systemRole.level,
            modules: modulesJson,
            isSystemRole: true,
          },
        });
        
        createdRoles.push(updatedRole);
        warning(`⚠️ Updated existing role: ${updatedRole.name}`);
      } catch (updateErr) {
        error(`Failed to update role ${systemRole.name}: ${updateErr}`);
      }
    }
  }
  
  info(`Created/updated ${createdRoles.length} system roles`);
  return createdRoles;
}

/**
 * Create system admin users
 */
async function createSystemUsers(roles: any[]) {
  log('👤 Creating system users...');
  
  const superAdminRole = roles.find(r => r.name === 'Super Administrator');
  const adminRole = roles.find(r => r.name === 'Sales Manager');
  const managerRole = roles.find(r => r.name === 'Finance Manager');
  const employeeRole = roles.find(r => r.name === 'Employee');
  
  if (!superAdminRole) {
    throw new Error('Super Administrator role not found');
  }
  
  const systemUsers = [
    {
      email: 'admin@taza.com',
      username: 'superadmin',
      displayName: 'Super Administrator',
      password: await bcrypt.hash('TazaAdmin@2024!', 12),
      roleId: superAdminRole.id,
      isVerified: true,
      isActive: true,
    },
    {
      email: 'sales@taza.com',
      username: 'salesmanager',
      displayName: 'Sales Manager',
      password: await bcrypt.hash('Sales@2024!', 12),
      roleId: adminRole?.id || superAdminRole.id,
      isVerified: true,
      isActive: true,
    },
    {
      email: 'finance@taza.com',
      username: 'financemanager',
      displayName: 'Finance Manager',
      password: await bcrypt.hash('Finance@2024!', 12),
      roleId: managerRole?.id || superAdminRole.id,
      isVerified: true,
      isActive: true,
    },
    {
      email: 'employee@taza.com',
      username: 'employee',
      displayName: 'Test Employee',
      password: await bcrypt.hash('Employee@2024!', 12),
      roleId: employeeRole?.id || superAdminRole.id,
      isVerified: true,
      isActive: true,
    },
  ];
  
  const createdUsers = [];
  
  for (const userData of systemUsers) {
    try {
      const user = await prisma.users.create({
        data: {
          email: userData.email,
          username: userData.username,
          displayName: userData.displayName,
          password: userData.password,
          roles: {
            connect: { id: userData.roleId }
          },
          isVerified: userData.isVerified,
          isActive: userData.isActive,
          updatedAt: new Date(),
        },
        include: { roles: true }
      });
      
      createdUsers.push(user);
      success(`✅ Created user: ${user.email} (${user.roles.name})`);
      
    } catch (err) {
      error(`Failed to create user ${userData.email}: ${err}`);
    }
  }
  
  info(`Created ${createdUsers.length} system users`);
  return createdUsers;
}

/**
 * Create demo departments
 */
async function createDemoDepartments(users: any[]) {
  log('🏢 Creating demo departments...');
  
  const managers = users.filter(u => 
    ['Sales Manager', 'Finance Manager'].includes(u.role.name)
  );
  
  const departments = [
    {
      name: 'Sales Department',
      code: 'SALES',
      description: 'Handles all sales operations and customer relationships',
      budget: 1000000,
      managerId: managers.find(m => m.role.name === 'Sales Manager')?.id,
    },
    {
      name: 'Finance Department',
      code: 'FINANCE',
      description: 'Manages financial operations and accounting',
      budget: 500000,
      managerId: managers.find(m => m.role.name === 'Finance Manager')?.id,
    },
    {
      name: 'Human Resources',
      code: 'HR',
      description: 'Employee management and organizational development',
      budget: 300000,
    },
    {
      name: 'IT Department',
      code: 'IT',
      description: 'Technology infrastructure and development',
      budget: 800000,
    },
  ];
  
  const createdDepartments = [];
  
  for (const deptData of departments) {
    try {
      const department = await prisma.departments.create({
        data: {
          name: deptData.name,
          code: deptData.code,
          description: deptData.description,
          budget: deptData.budget,
          ...(deptData.managerId && { managerId: deptData.managerId })
        },
      });
      
      createdDepartments.push(department);
      success(`✅ Created department: ${department.name}`);
      
    } catch (err) {
      error(`Failed to create department ${deptData.name}: ${err}`);
    }
  }
  
  info(`Created ${createdDepartments.length} departments`);
  return createdDepartments;
}

/**
 * Validate migration results
 */
async function validateMigration() {
  log('🔍 Validating migration results...');
  
  try {
    // Check roles
    const roleCount = await prisma.roles.count();
    const systemRoleCount = await prisma.roles.count({
      where: { isSystemRole: true }
    });
    
    // Check users
    const userCount = await prisma.users.count();
    const activeUserCount = await prisma.users.count({
      where: { isActive: true }
    });
    
    // Check departments
    const deptCount = await prisma.departments.count();
    
    // Validation results
    const validationResults = {
      roles: {
        total: roleCount,
        system: systemRoleCount,
        expected: SYSTEM_ROLES.length,
        valid: systemRoleCount >= SYSTEM_ROLES.length,
      },
      users: {
        total: userCount,
        active: activeUserCount,
        expected: 4, // Super Admin + 3 test users
        valid: userCount >= 4,
      },
      departments: {
        total: deptCount,
        expected: 4,
        valid: deptCount >= 4,
      }
    };
    
    info('📊 Migration Validation Results:');
    console.table(validationResults);
    
    // Check specific permissions
    const superAdminRole = await prisma.roles.findUnique({
      where: { name: 'Super Administrator' }
    });
    
    if (superAdminRole) {
      const permissions = JSON.parse(superAdminRole.permissions);
      const permissionCount = permissions.permissions?.length || 0;
      
      info(`🔐 Super Admin has ${permissionCount} permissions`);
      
      if (permissionCount > 0) {
        success('✅ Permissions migration successful');
      } else {
        warning('⚠️ No permissions found for Super Admin');
      }
    }
    
    return validationResults;
    
  } catch (err) {
    error(`Validation failed: ${err}`);
    throw err;
  }
}

/**
 * Generate migration report
 */
async function generateMigrationReport() {
  log('📋 Generating migration report...');
  
  try {
    const roles = await prisma.roles.findMany({
      include: { _count: { select: { users: true } } }
    });
    
    const users = await prisma.users.findMany({
      include: { roles: true }
    });

    const departments = await prisma.departments.findMany({
      include: {
        _count: { select: { employees: true } }
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 MODULES PERMISSIONS MIGRATION REPORT');
    console.log('='.repeat(80));
    
    console.log('\n🏷️ ROLES CREATED:');
    roles.forEach((role:any) => {
      const modules = role.modules ? JSON.parse(role.modules) : [];
      console.log(`  • ${role.name} (Level ${role.level})`);
      console.log(`    - Users: ${role._count.users}`);
      console.log(`    - Modules: ${modules.length} (${modules.join(', ')})`);
      console.log(`    - System Role: ${role.isSystemRole ? 'Yes' : 'No'}`);
    });
    
    console.log('\n👤 USERS CREATED:');
    users.forEach((user:any) => {
      console.log(`  • ${user.displayName} (${user.email})`);
      console.log(`    - Role: ${user.role.name}`);
      console.log(`    - Active: ${user.isActive ? 'Yes' : 'No'}`);
      console.log(`    - Verified: ${user.isVerified ? 'Yes' : 'No'}`);
    });
    
    console.log('\n🏢 DEPARTMENTS CREATED:');
    departments.forEach((dept:any) => {
      console.log(`  • ${dept.name}`);
      console.log(`    - Manager ID: ${dept.managerId || 'None'}`);
      console.log(`    - Budget: $${dept.budget?.toLocaleString() || 'N/A'}`);
      console.log(`    - Employees: ${dept._count.employees}`);
    });
    console.log('\n🔐 PERMISSION MODULES AVAILABLE:');
    const moduleList = [
      { name: 'Sales', permissions: Object.keys(SALES_PERMISSIONS).length },
      { name: 'CRM', permissions: Object.keys(CRM_PERMISSIONS).length },
      { name: 'Inventory', permissions: Object.keys(INVENTORY_PERMISSIONS).length },
      { name: 'Finance', permissions: Object.keys(FINANCE_PERMISSIONS).length },
      { name: 'HRM', permissions: Object.keys(HRM_PERMISSIONS).length },
      { name: 'Projects', permissions: Object.keys(PROJECT_PERMISSIONS).length },
      { name: 'Manufacturing', permissions: Object.keys(MANUFACTURING_PERMISSIONS).length },
      { name: 'Marketing', permissions: Object.keys(MARKETING_PERMISSIONS).length },
      { name: 'Support', permissions: Object.keys(SUPPORT_PERMISSIONS).length },
      { name: 'Analytics', permissions: Object.keys(ANALYTICS_PERMISSIONS).length },
      { name: 'E-commerce', permissions: Object.keys(ECOMMERCE_PERMISSIONS).length },
    ];
    
    moduleList.forEach(module => {
      console.log(`  • ${module.name}: ${module.permissions} permissions`);
    });
    
    console.log(`\n📈 TOTAL: ${Object.keys(ALL_MODULE_PERMISSIONS).length} permissions across ${moduleList.length} modules`);
    
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('  • Super Admin: admin@taza.com / TazaAdmin@2024!');
    console.log('  • Sales Manager: sales@taza.com / Sales@2024!');
    console.log('  • Finance Manager: finance@taza.com / Finance@2024!');
    console.log('  • Employee: employee@taza.com / Employee@2024!');
    
    console.log('\n' + '='.repeat(80));
    success('Migration completed successfully! 🎉');
    console.log('='.repeat(80) + '\n');
    
  } catch (err) {
    error(`Failed to generate report: ${err}`);
  }
}

// ============================================================================
// MAIN MIGRATION FUNCTION
// ============================================================================

async function runModulesPermissionsMigration() {
  const startTime = Date.now();
  
  try {
    console.log('\n' + '='.repeat(80));
    log('🚀 Starting Modules Permissions Migration...');
    console.log('='.repeat(80));
    
    // Step 1: Clear existing data
    await clearExistingData();
    
    // Step 2: Migrate system roles
    const roles = await migrateSystemRoles();
    
    // Step 3: Create system users
    const users = await createSystemUsers(roles);
    
    // Step 4: Create demo departments
    const departments = await createDemoDepartments(users);
    
    // Step 5: Validate migration
    const validation = await validateMigration();
    
    // Step 6: Generate report
    await generateMigrationReport();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    success(`🎉 Migration completed in ${duration.toFixed(2)} seconds`);
    
    return {
      success: true,
      roles: roles.length,
      users: users.length,
      departments: departments.length,
      duration,
      validation
    };
    
  } catch (err) {
    error(`Migration failed: ${err}`);
    throw err;
  }
}

// ============================================================================
// EXPORT AND EXECUTION
// ============================================================================

export default runModulesPermissionsMigration;

// For direct execution
if (require.main === module) {
  runModulesPermissionsMigration()
    .then((result) => {
      console.log('\n✅ Migration Result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
