#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

// ============================================================================
// LOGGING UTILITIES
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
  console.log(`${color}[DEFAULT_SUPER_USER_SEED]${colors.reset} ${message}`);

const success = (message: string) => 
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);

const warning = (message: string) => 
  console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);

const error = (message: string) => 
  console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);

const info = (message: string) => 
  console.log(`${colors.cyan}[INFO]${colors.reset} ${message}`);

// ============================================================================
// DEFAULT SUPER USER SEED
// ============================================================================

async function createDefaultSuperUser() {
  try {
    log('🚀 Starting default super user creation...');

    // First, ensure the Super Administrator role exists
    let superAdminRole = await prisma.roles.findFirst({
      where: {
        OR: [
          { name: 'Super Administrator' },
          { name: 'SUPER_ADMIN' },
          { name: 'super_admin' },
        ],
      },
    });

    if (!superAdminRole) {
      log('Creating Super Administrator role...');
      superAdminRole = await prisma.roles.create({
        data: {
          id: nanoid(),
          name: 'Super Administrator',
          description: 'Super Administrator với quyền tối cao trong hệ thống TazaGroup',
          permissions: JSON.stringify([
            'admin:*',
            'manage:*',
            'read:*',
            'create:*',
            'update:*',
            'delete:*',
            'system:backup',
            'system:restore',
            'system:config',
            'analytics:all'
          ]),
          level: 10,
          modules: JSON.stringify(['ALL']),
          isSystemRole: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      success('✓ Super Administrator role created');
    } else {
      info('✓ Super Administrator role already exists');
    }

    // Check if the default super user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: 'it@tazagroup.vn' },
    });

    if (existingUser) {
      warning('⚠️ Default super user already exists, updating...');
      
      // Update the existing user
      const updatedUser = await prisma.users.update({
        where: { email: 'it@tazagroup.vn' },
        data: {
          password: await bcrypt.hash('123456', 12),
          displayName: 'Super User',
          username: 'superuser',
          roleId: superAdminRole.id,
          isVerified: true,
          isActive: true,
          updatedAt: new Date(),
        },
        include: {
          roles: true,
        },
      });
      
      success('✓ Default super user updated successfully');
      info(`  Email: ${updatedUser.email}`);
      info(`  Name: ${updatedUser.displayName}`);
      info(`  Role: ${updatedUser.roles?.name}`);
      info(`  Active: ${updatedUser.isActive}`);
    } else {
      log('Creating default super user...');
      
      // Create the default super user
      const hashedPassword = await bcrypt.hash('123456', 12);
      
      const newUser = await prisma.users.create({
        data: {
          id: nanoid(),
          email: 'it@tazagroup.vn',
          username: 'superuser',
          displayName: 'Super User',
          password: hashedPassword,
          roleId: superAdminRole.id,
          isVerified: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          roles: true,
        },
      });

      success('✓ Default super user created successfully');
      info(`  Email: ${newUser.email}`);
      info(`  Name: ${newUser.displayName}`);
      info(`  Role: ${newUser.roles?.name}`);
      info(`  Active: ${newUser.isActive}`);
    }

    log('🎉 Default super user seed completed successfully!');
    
  } catch (err: any) {
    error(`❌ Failed to create default super user: ${err.message}`);
    console.error('Full error:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  try {
    await createDefaultSuperUser();
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

export { createDefaultSuperUser };
