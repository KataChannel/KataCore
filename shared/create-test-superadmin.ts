#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestSuperAdmin() {
  try {
    console.log('🚀 Creating test Super Administrator...');
    
    // 1. Create Super Admin Role first
    const superAdminRole = await prisma.role.upsert({
      where: { name: 'Super Administrator' },
      update: {
        description: 'Super Administrator with full system access',
        permissions: JSON.stringify([
          'system:admin', 'system:manage', 'system:configure',
          'create:*', 'read:*', 'update:*', 'delete:*', 'manage:*'
        ]),
      },
      create: {
        name: 'Super Administrator',
        description: 'Super Administrator with full system access',
        permissions: JSON.stringify([
          'system:admin', 'system:manage', 'system:configure',
          'create:*', 'read:*', 'update:*', 'delete:*', 'manage:*'
        ]),
      },
    });

    console.log('✅ Super Admin Role created/updated');

    // 2. Hash the exact password you're using
    const password = 'SuperAdmin@2024';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log('✅ Password hashed');

    // 3. Create the user with exact credentials
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@tazacore.com' },
      update: {
        username: 'superadmin_taza',  // Use different username to avoid conflict
        password: hashedPassword,
        displayName: 'Super Administrator',
        roleId: superAdminRole.id,
        isActive: true,
        isVerified: true,
      },
      create: {
        email: 'superadmin@tazacore.com',
        username: 'superadmin_taza',  // Use different username to avoid conflict
        password: hashedPassword,
        displayName: 'Super Administrator',
        roleId: superAdminRole.id,
        isActive: true,
        isVerified: true,
      },
      include: { role: true },
    });

    console.log('✅ Super Admin User created/updated');
    console.log('📧 Email:', superAdmin.email);
    console.log('👤 Username:', superAdmin.username);
    console.log('🔐 Password:', password);
    console.log('🎯 Role:', superAdmin.role.name);
    console.log('✅ Active:', superAdmin.isActive);
    console.log('✅ Verified:', superAdmin.isVerified);

    // 4. Test the password verification
    const isPasswordValid = await bcrypt.compare(password, superAdmin.password!);
    console.log('🔍 Password verification test:', isPasswordValid);

    // 5. Also check if there are any existing users with username 'superadmin'
    const existingUser = await prisma.user.findUnique({
      where: { username: 'superadmin' },
      include: { role: true }
    });

    if (existingUser) {
      console.log('\n⚠️ Existing user with username "superadmin":');
      console.log('📧 Email:', existingUser.email);
      console.log('👤 Username:', existingUser.username);
      console.log('🎯 Role:', existingUser.role?.name);
      console.log('✅ Active:', existingUser.isActive);
      console.log('✅ Verified:', existingUser.isVerified);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSuperAdmin();
