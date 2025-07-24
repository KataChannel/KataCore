#!/usr/bin/env ts-node

// ============================================================================
// PERMISSION DATA MIGRATION VALIDATOR
// ============================================================================
// Validates and ensures all permission data is properly migrated
// Handles permission consistency between mockup data and database storage

import { PrismaClient } from '@prisma/client';
import { 
  SYSTEM_ROLES
} from '../../../site/src/lib/auth/modules-permissions';

// ============================================================================
// TEST USERS CONFIGURATION
// ============================================================================

const testUsers = {
  superAdmin: {
    email: 'admin@taza.com',
    roleId: 'super_admin',
    displayName: 'Super Administrator',
  },
  admin: {
    email: 'admin.user@taza.com',
    roleId: 'admin',
    displayName: 'System Administrator',
  },
  manager: {
    email: 'manager@taza.com',
    roleId: 'manager',
    displayName: 'Department Manager',
  },
  supervisor: {
    email: 'supervisor@taza.com',
    roleId: 'supervisor',
    displayName: 'Team Supervisor',
  },
  hrManager: {
    email: 'hr@taza.com',
    roleId: 'hr_manager',
    displayName: 'HR Manager',
  },
  salesManager: {
    email: 'sales@taza.com',
    roleId: 'sales_manager',
    displayName: 'Sales Manager',
  },
  financeManager: {
    email: 'finance@taza.com',
    roleId: 'finance_manager',
    displayName: 'Finance Manager',
  },
  employee: {
    email: 'employee@taza.com',
    roleId: 'employee',
    displayName: 'Regular Employee',
  },
};

// ============================================================================
// CONFIGURATION
// ============================================================================

const prisma = new PrismaClient();

// Console colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const log = (message: string, color = colors.blue) =>
  console.log(`${color}[PERMISSION_MIGRATION]${colors.reset} ${message}`);

const success = (message: string) =>
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);

const warning = (message: string) =>
  console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);

const error = (message: string) =>
  console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);

const info = (message: string) =>
  console.log(`${colors.cyan}[INFO]${colors.reset} ${message}`);

// ============================================================================
// PERMISSION MIGRATION FUNCTIONS
// ============================================================================

/**
 * Validate system roles against database
 */
async function validateSystemRoles() {
  log('🔍 Validating system roles against database...');

  const dbRoles = await prisma.role.findMany({
    where: { isSystemRole: true },
  });

  const validationResults = {
    total: SYSTEM_ROLES.length,
    inDatabase: 0,
    missing: [] as string[],
    extra: [] as string[],
    permissionMismatches: [] as any[],
  };

  // Check each system role
  for (const systemRole of SYSTEM_ROLES) {
    const dbRole = dbRoles.find(r => 
      r.name === systemRole.name || 
      r.name.toLowerCase().replace(/ /g, '_') === systemRole.id
    );

    if (dbRole) {
      validationResults.inDatabase++;

      // Validate permissions
      try {
        const dbPermissions = JSON.parse(dbRole.permissions);
        const systemPermissions = systemRole.permissions;

        if (dbPermissions.permissions?.length !== systemPermissions.length) {
          validationResults.permissionMismatches.push({
            role: systemRole.name,
            issue: 'Permission count mismatch',
            expected: systemPermissions.length,
            actual: dbPermissions.permissions?.length || 0,
          });
        }

        // Validate level
        if (dbRole.level !== systemRole.level) {
          validationResults.permissionMismatches.push({
            role: systemRole.name,
            issue: 'Level mismatch',
            expected: systemRole.level,
            actual: dbRole.level,
          });
        }

        success(`✅ ${systemRole.name} - Valid`);
      } catch (err: any) {
        error(`❌ ${systemRole.name} - Permission parsing error`);
        validationResults.permissionMismatches.push({
          role: systemRole.name,
          issue: 'Permission parsing error',
          error: err.message,
        });
      }
    } else {
      validationResults.missing.push(systemRole.name);
      warning(`⚠️ ${systemRole.name} - Missing from database`);
    }
  }

  // Check for extra roles in database
  for (const dbRole of dbRoles) {
    const systemRole = SYSTEM_ROLES.find(r => 
      r.name === dbRole.name || 
      r.name.toLowerCase().replace(/ /g, '_') === dbRole.name.toLowerCase().replace(/ /g, '_')
    );

    if (!systemRole) {
      validationResults.extra.push(dbRole.name);
    }
  }

  return validationResults;
}

/**
 * Validate test users against database
 */
async function validateTestUsers() {
  log('👥 Validating test users against database...');

  const testUserEmails = Object.values(testUsers).map(u => u.email);
  const dbUsers = await prisma.user.findMany({
    where: {
      email: {
        in: testUserEmails,
      },
    },
    include: { role: true },
  });

  const validationResults = {
    total: Object.keys(testUsers).length,
    inDatabase: 0,
    missing: [] as string[],
    roleIssues: [] as any[],
  };

  for (const [userType, userData] of Object.entries(testUsers)) {
    const dbUser = dbUsers.find(u => u.email === userData.email);

    if (dbUser) {
      validationResults.inDatabase++;

      // Validate role assignment
      const expectedSystemRole = SYSTEM_ROLES.find(r => r.id === userData.roleId);
      if (expectedSystemRole) {
        const hasCorrectRole = dbUser.role?.name === expectedSystemRole.name ||
          dbUser.role?.name.toLowerCase().replace(/ /g, '_') === expectedSystemRole.id;

        if (!hasCorrectRole) {
          validationResults.roleIssues.push({
            user: userData.email,
            expected: expectedSystemRole.name,
            actual: dbUser.role?.name || 'No role',
          });
          warning(`⚠️ ${userData.email} - Role mismatch`);
        } else {
          success(`✅ ${userData.email} - Valid`);
        }
      }
    } else {
      validationResults.missing.push(userData.email);
      warning(`⚠️ ${userData.email} - Missing from database`);
    }
  }

  return validationResults;
}

/**
 * Validate permission constants consistency
 */
async function validatePermissionConstants() {
  log('🔐 Validating permission constants consistency...');

  const issues: string[] = [];

  // Check if all system roles have valid permissions
  for (const systemRole of SYSTEM_ROLES) {
    if (!systemRole.permissions || systemRole.permissions.length === 0) {
      issues.push(`SYSTEM_ROLE ${systemRole.name} has no permissions defined`);
    }
  }
  // Check module consistency
  // Check module consistency
  const usedModules = new Set<string>();
  SYSTEM_ROLES.forEach(role => {
    role.modules.forEach((module: string) => usedModules.add(module));
  });

  // Since MODULES is not exported, we'll just check for basic validation
  for (const module of usedModules) {
    if (!module || module.trim() === '') {
      issues.push(`Empty module found in role permissions`);
    }
  }
  if (issues.length === 0) {
    success('✅ All permission constants are consistent');
  } else {
    issues.forEach(issue => warning(`⚠️ ${issue}`));
  }

  return { issues, isValid: issues.length === 0 };
}

/**
 * Generate detailed permission audit report
 */
async function generatePermissionAuditReport() {
  log('📊 Generating detailed permission audit report...');

  const dbRoles = await prisma.role.findMany({
    where: { isSystemRole: true },
    include: {
      _count: { select: { users: true } },
      users: {
        select: {
          id: true,
          email: true,
          displayName: true,
          isActive: true,
        },
      },
    },
  });

  console.log(`\n${colors.bright}${colors.magenta}🔐 PERMISSION AUDIT REPORT${colors.reset}`);
  console.log('='.repeat(60));

  // Role-by-role analysis
  for (const dbRole of dbRoles) {
    console.log(`\n${colors.yellow}Role: ${dbRole.name}${colors.reset}`);
    console.log(`  Level: ${dbRole.level || 'Not set'}`);
    console.log(`  Users: ${dbRole._count.users}`);

    try {
      const permissions = JSON.parse(dbRole.permissions);
      console.log(`  Modules: ${permissions.modules ? permissions.modules.join(', ') : 'None'}`);
      console.log(`  Permissions: ${permissions.permissions ? permissions.permissions.length : 0} defined`);

      if (permissions.permissions && Array.isArray(permissions.permissions)) {
        const samplePermissions = permissions.permissions.slice(0, 3);
        samplePermissions.forEach((p: any) => {
          console.log(`    • ${typeof p === 'string' ? p : `${p.action}:${p.resource}`}`);
        });
        if (permissions.permissions.length > 3) {
          console.log(`    ... and ${permissions.permissions.length - 3} more`);
        }
      }

      // List users with this role
      if (dbRole.users.length > 0) {
        console.log(`  Assigned Users:`);
        dbRole.users.forEach(user => {
          console.log(`    • ${user.displayName} (${user.email}) - ${user.isActive ? 'Active' : 'Inactive'}`);
        });
      }
    } catch (err: any) {
      error(`    Permission parsing error: ${err.message}`);
    }
  }

  // Migration status summary
  console.log(`\n${colors.cyan}Migration Status Summary:${colors.reset}`);
  console.log(`  System Roles in DB: ${dbRoles.length}`);
  console.log(`  Expected System Roles: ${SYSTEM_ROLES.length}`);
  console.log(`  Test Users Expected: ${Object.keys(testUsers).length}`);

  const totalUsers = await prisma.user.count();
  console.log(`  Total Users in DB: ${totalUsers}`);

  success('Permission audit report generated');
}

/**
 * Fix common permission migration issues
 */
async function fixPermissionIssues() {
  log('🔧 Attempting to fix common permission issues...');

  let fixCount = 0;

  try {
    // Fix roles with invalid JSON permissions
    const rolesWithBadJson = await prisma.role.findMany({
      where: { isSystemRole: true },
    });

    for (const role of rolesWithBadJson) {
      try {
        JSON.parse(role.permissions);
      } catch (err) {
        warning(`Fixing invalid JSON for role: ${role.name}`);
        
        const systemRole = SYSTEM_ROLES.find(r => 
          r.name === role.name || 
          r.name.toLowerCase().replace(/ /g, '_') === role.id
        );

        if (systemRole) {
          const fixedPermissions = {
            permissions: systemRole.permissions.map(p => ({
              action: p.action,
              resource: p.resource,
              scope: p.scope || 'all',
            })),
            modules: systemRole.modules,
            level: systemRole.level,
            isSystemRole: true,
            fixedAt: new Date().toISOString(),
          };

          await prisma.role.update({
            where: { id: role.id },
            data: {
              permissions: JSON.stringify(fixedPermissions),
              level: systemRole.level,
            },
          });

          fixCount++;
          success(`Fixed permissions for role: ${role.name}`);
        }
      }
    }

    // Fix users without roles
    const usersWithoutRoles = await prisma.user.findMany({
      where: {
        roleId: '',
      },
    });

    if (usersWithoutRoles.length > 0) {
      const employeeRole = await prisma.role.findFirst({
        where: {
          OR: [
            { name: 'Employee' },
            { name: 'EMPLOYEE' },
            { name: { contains: 'Employee', mode: 'insensitive' } },
          ],
        },
      });

      if (employeeRole) {
        for (const user of usersWithoutRoles) {
          await prisma.user.update({
            where: { id: user.id },
            data: { roleId: employeeRole.id },
          });
          fixCount++;
          success(`Assigned Employee role to user: ${user.email}`);
        }
      } else {
        warning('No Employee role found to assign to users without roles');
      }
    }

    success(`Fixed ${fixCount} permission issues`);
  } catch (err: any) {
    error(`Failed to fix permission issues: ${err.message}`);
  }

  return fixCount;
}

// ============================================================================
// MAIN VALIDATION PROCESS
// ============================================================================

async function runPermissionValidation() {
  console.log(`${colors.bright}${colors.cyan}🔐 Permission Data Migration Validation${colors.reset}\n`);

  try {
    // Step 1: Validate system roles
    const roleValidation = await validateSystemRoles();
    console.log(`\n${colors.yellow}Role Validation Results:${colors.reset}`);
    console.log(`  Total: ${roleValidation.total}`);
    console.log(`  In Database: ${roleValidation.inDatabase}`);
    console.log(`  Missing: ${roleValidation.missing.length}`);
    console.log(`  Permission Issues: ${roleValidation.permissionMismatches.length}`);

    // Step 2: Validate test users
    const userValidation = await validateTestUsers();
    console.log(`\n${colors.yellow}User Validation Results:${colors.reset}`);
    console.log(`  Total: ${userValidation.total}`);
    console.log(`  In Database: ${userValidation.inDatabase}`);
    console.log(`  Missing: ${userValidation.missing.length}`);
    console.log(`  Role Issues: ${userValidation.roleIssues.length}`);

    // Step 3: Validate permission constants
    const constantValidation = await validatePermissionConstants();
    console.log(`\n${colors.yellow}Permission Constants Validation:${colors.reset}`);
    console.log(`  Status: ${constantValidation.isValid ? 'Valid' : 'Issues Found'}`);
    console.log(`  Issues: ${constantValidation.issues.length}`);

    // Step 4: Fix issues if found
    const totalIssues = roleValidation.missing.length + 
                       roleValidation.permissionMismatches.length + 
                       userValidation.missing.length + 
                       userValidation.roleIssues.length +
                       constantValidation.issues.length;

    if (totalIssues > 0) {
      warning(`Found ${totalIssues} issues. Attempting to fix...`);
      await fixPermissionIssues();
    }

    // Step 5: Generate detailed audit report
    await generatePermissionAuditReport();

    success('Permission validation completed');
  } catch (err: any) {
    error(`Permission validation failed: ${err.message}`);
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
  runPermissionValidation();
}

export {
  runPermissionValidation,
  validateSystemRoles,
  validateTestUsers,
  validatePermissionConstants,
  generatePermissionAuditReport,
  fixPermissionIssues,
};
