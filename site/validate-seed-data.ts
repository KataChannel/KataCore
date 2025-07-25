#!/usr/bin/env tsx

// ============================================================================
// TAZAGROUP UNIFIED SEED VALIDATION TEST
// ============================================================================
// Validates that the unified seed script created all data correctly
// Tests login functionality and data integrity

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Console colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const success = (message: string) => 
  console.log(`${colors.green}✅ ${message}${colors.reset}`);

const error = (message: string) => 
  console.log(`${colors.red}❌ ${message}${colors.reset}`);

const info = (message: string) => 
  console.log(`${colors.cyan}ℹ️  ${message}${colors.reset}`);

const warning = (message: string) => 
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);

async function validateSeedData() {
  console.log(`${colors.blue}🔍 VALIDATING TAZAGROUP UNIFIED SEED DATA${colors.reset}`);
  console.log('='.repeat(60));

  let allTestsPassed = true;

  try {
    // Test 1: Check roles
    info('Testing roles...');
    const roles = await prisma.roles.findMany();
    if (roles.length === 10) {
      success(`Found ${roles.length} roles`);
    } else {
      error(`Expected 10 roles, found ${roles.length}`);
      allTestsPassed = false;
    }

    // Test 2: Check super admin user
    info('Testing super admin user...');
    const superAdmin = await prisma.users.findUnique({
      where: { email: 'it@tazagroup.vn' },
      include: { roles: true }
    });

    if (superAdmin) {
      success('Super admin user exists');
      
      // Test password
      const passwordMatch = await bcrypt.compare('TazaGroup@2024!', superAdmin.password!);
      if (passwordMatch) {
        success('Super admin password is correct');
      } else {
        error('Super admin password is incorrect');
        allTestsPassed = false;
      }

      // Test role level
      if (superAdmin.roles.level === 10) {
        success('Super admin has correct access level (10)');
      } else {
        error(`Super admin has wrong access level: ${superAdmin.roles.level}`);
        allTestsPassed = false;
      }
    } else {
      error('Super admin user not found');
      allTestsPassed = false;
    }

    // Test 3: Check departments
    info('Testing departments...');
    const departments = await prisma.departments.findMany();
    if (departments.length === 6) {
      success(`Found ${departments.length} departments`);
    } else {
      error(`Expected 6 departments, found ${departments.length}`);
      allTestsPassed = false;
    }

    // Test 4: Check positions
    info('Testing positions...');
    const positions = await prisma.positions.findMany();
    if (positions.length === 13) {
      success(`Found ${positions.length} positions`);
    } else {
      error(`Expected 13 positions, found ${positions.length}`);
      allTestsPassed = false;
    }

    // Test 5: Check users
    info('Testing users...');
    const users = await prisma.users.findMany();
    if (users.length === 17) { // 2 admin + 15 others
      success(`Found ${users.length} users`);
    } else {
      warning(`Expected 17 users, found ${users.length} (may be correct depending on seed version)`);
    }

    // Test 6: Check employees
    info('Testing employees...');
    const employees = await prisma.employees.findMany();
    if (employees.length >= 15) {
      success(`Found ${employees.length} employee records`);
    } else {
      error(`Expected at least 15 employees, found ${employees.length}`);
      allTestsPassed = false;
    }

    // Test 7: Check attendance data
    info('Testing attendance data...');
    const attendance = await prisma.attendances.findMany();
    if (attendance.length > 0) {
      success(`Found ${attendance.length} attendance records`);
    } else {
      warning('No attendance records found');
    }

    // Test 8: Check conversations
    info('Testing communication data...');
    const conversations = await prisma.conversations.findMany();
    if (conversations.length > 0) {
      success(`Found ${conversations.length} conversations`);
    } else {
      warning('No conversations found');
    }

    // Test 9: Check messages
    const messages = await prisma.messages.findMany();
    if (messages.length > 0) {
      success(`Found ${messages.length} messages`);
    } else {
      warning('No messages found');
    }

    // Test 10: Check affiliates
    info('Testing affiliate system...');
    const affiliates = await prisma.affiliates.findMany();
    if (affiliates.length > 0) {
      success(`Found ${affiliates.length} affiliate records`);
    } else {
      warning('No affiliate records found');
    }

    // Test 11: Check user settings
    info('Testing user settings...');
    const userSettings = await prisma.user_settings.findMany();
    if (userSettings.length > 0) {
      success(`Found ${userSettings.length} user settings`);
    } else {
      warning('No user settings found');
    }

    // Test 12: Validate data relationships
    info('Testing data relationships...');
    const usersWithRoles = await prisma.users.findMany({
      include: { roles: true }
    });
    
    const usersWithoutRoles = usersWithRoles.filter(u => !u.roles);
    if (usersWithoutRoles.length === 0) {
      success('All users have valid role assignments');
    } else {
      error(`${usersWithoutRoles.length} users have invalid role assignments`);
      allTestsPassed = false;
    }

    // Final result
    console.log('='.repeat(60));
    if (allTestsPassed) {
      success('🎉 ALL VALIDATION TESTS PASSED!');
      console.log(`${colors.green}The unified seed data is correctly created and ready for use.${colors.reset}`);
    } else {
      error('❌ SOME VALIDATION TESTS FAILED!');
      console.log(`${colors.red}Please check the seed script and database.${colors.reset}`);
    }
    console.log('='.repeat(60));

    // Login test summary
    console.log('\n🔑 LOGIN CREDENTIALS READY:');
    console.log(`${colors.cyan}Super Admin: it@tazagroup.vn / TazaGroup@2024!${colors.reset}`);
    console.log(`${colors.cyan}System Admin: admin@tazagroup.vn / TazaGroup@2024!${colors.reset}`);
    console.log(`${colors.cyan}All Users: {email} / TazaGroup@2024!${colors.reset}`);

  } catch (err: any) {
    error(`Validation failed: ${err.message}`);
    console.error(err);
    allTestsPassed = false;
  } finally {
    await prisma.$disconnect();
  }

  process.exit(allTestsPassed ? 0 : 1);
}

// Execute validation
validateSeedData();
