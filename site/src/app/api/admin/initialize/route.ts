// System Initialization API - For first-time setup only
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SYSTEM_ROLES, ALL_MODULE_PERMISSIONS } from '@/lib/auth/modules-permissions';
import bcrypt from 'bcryptjs';

// POST - Initialize system with Super Admin and default roles
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { setupKey, adminData } = body;

    // Basic security check - you should set this in environment variables
    const SETUP_KEY = process.env.SYSTEM_SETUP_KEY || 'TazaSetup2024';

    if (setupKey !== SETUP_KEY) {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 401 });
    }

    // Check if system is already initialized
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        role: {
          name: {
            in: ['Super Administrator', 'super_administrator'],
          },
        },
      },
    });

    if (existingSuperAdmin) {
      return NextResponse.json({ error: 'System already initialized' }, { status: 409 });
    }

    // Initialize system
    const result = await initializeSystem(adminData);

    return NextResponse.json({
      success: true,
      message: 'System initialized successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('System initialization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize system' },
      { status: 500 }
    );
  }
}

// GET - Check system initialization status
export async function GET(request: NextRequest) {
  try {
    const superAdminExists = await prisma.user.findFirst({
      where: {
        role: {
          name: {
            in: ['Super Administrator', 'super_administrator'],
          },
        },
      },
      select: { id: true, email: true, createdAt: true },
    });

    const systemStats = await getInitializationStats();

    return NextResponse.json({
      initialized: !!superAdminExists,
      superAdmin: superAdminExists
        ? {
            exists: true,
            email: superAdminExists.email,
            createdAt: superAdminExists.createdAt,
          }
        : { exists: false },
      stats: systemStats,
    });
  } catch (error) {
    console.error('Error checking initialization status:', error);
    return NextResponse.json({ error: 'Failed to check system status' }, { status: 500 });
  }
}

async function initializeSystem(adminData?: any) {
  const defaultAdminData = {
    email: 'admin@taza.com',
    password: 'TazaAdmin@2024!',
    displayName: 'Super Administrator',
    username: 'superadmin',
    firstName: 'Super',
    lastName: 'Administrator',
  };

  const data = { ...defaultAdminData, ...adminData };

  return await prisma.$transaction(async (tx) => {
    console.log('🚀 Starting system initialization...');

    // 1. Create all system roles
    const roles = await createSystemRoles(tx);
    console.log('✅ System roles created');

    // 2. Create Super Administrator
    const superAdmin = await createSuperAdministrator(tx, data, roles.superAdminRole);
    console.log('✅ Super Administrator created');

    // 3. Create default departments and positions
    const orgStructure = await createOrganizationStructure(tx);
    console.log('✅ Organization structure created');

    // 4. Create system configuration
    const systemConfig = await createSystemConfiguration(tx);
    console.log('✅ System configuration created');

    console.log('🎉 System initialization completed successfully!');

    return {
      superAdmin,
      roles,
      orgStructure,
      systemConfig,
      credentials: {
        email: data.email,
        password: data.password,
        warning: 'Please change the default password immediately after first login!',
      },
    };
  });
}

async function createSystemRoles(tx: any) {
  console.log('Creating system roles...');

  // Define all permissions for Super Administrator
  const allPermissions = [
    // System administration
    { action: 'admin', resource: 'system' },
    { action: 'manage', resource: 'system' },
    { action: 'configure', resource: 'system' },
    { action: 'backup', resource: 'system' },
    { action: 'restore', resource: 'system' },

    // User and role management
    { action: 'create', resource: 'users' },
    { action: 'read', resource: 'users' },
    { action: 'update', resource: 'users' },
    { action: 'delete', resource: 'users' },
    { action: 'manage', resource: 'users' },
    { action: 'admin', resource: 'users' },

    { action: 'create', resource: 'roles' },
    { action: 'read', resource: 'roles' },
    { action: 'update', resource: 'roles' },
    { action: 'delete', resource: 'roles' },
    { action: 'manage', resource: 'roles' },
    { action: 'admin', resource: 'roles' },

    // All module permissions
    ...Object.values(ALL_MODULE_PERMISSIONS).flatMap((permission) => [
      { action: 'create', resource: permission.resource },
      { action: 'read', resource: permission.resource },
      { action: 'update', resource: permission.resource },
      { action: 'delete', resource: permission.resource },
      { action: 'manage', resource: permission.resource },
      { action: 'admin', resource: permission.resource },
      { action: 'export', resource: permission.resource },
      { action: 'import', resource: permission.resource },
      { action: 'approve', resource: permission.resource },
      { action: 'reject', resource: permission.resource },
    ]),

    // Global permissions
    { action: 'create', resource: '*' },
    { action: 'read', resource: '*' },
    { action: 'update', resource: '*' },
    { action: 'delete', resource: '*' },
    { action: 'manage', resource: '*' },
    { action: 'admin', resource: '*' },
  ];

  // Create Super Administrator Role
  const superAdminRole = await tx.role.upsert({
    where: { name: 'Super Administrator' },
    update: {
      description: 'Super Administrator with full system access and control',
      permissions: JSON.stringify(allPermissions),
      isSystemRole: true,
      level: 10,
    },
    create: {
      id: 'super_administrator',
      name: 'Super Administrator',
      description: 'Super Administrator with full system access and control',
      permissions: JSON.stringify(allPermissions),
      isSystemRole: true,
      level: 10,
    },
  });

  // Create Administrator Role
  const administratorRole = await tx.role.upsert({
    where: { name: 'Administrator' },
    update: {
      description: 'System Administrator with elevated privileges',
      permissions: JSON.stringify([
        { action: 'manage', resource: 'system' },
        { action: 'read', resource: 'users' },
        { action: 'update', resource: 'users' },
        { action: 'manage', resource: 'users' },
        ...Object.values(ALL_MODULE_PERMISSIONS).flatMap((permission) => [
          { action: 'read', resource: permission.resource },
          { action: 'create', resource: permission.resource },
          { action: 'update', resource: permission.resource },
          { action: 'delete', resource: permission.resource },
          { action: 'manage', resource: permission.resource },
        ]),
      ]),
      isSystemRole: true,
      level: 8,
    },
    create: {
      id: 'administrator',
      name: 'Administrator',
      description: 'System Administrator with elevated privileges',
      permissions: JSON.stringify([
        { action: 'manage', resource: 'system' },
        { action: 'read', resource: 'users' },
        { action: 'update', resource: 'users' },
        { action: 'manage', resource: 'users' },
        ...Object.values(ALL_MODULE_PERMISSIONS).flatMap((permission) => [
          { action: 'read', resource: permission.resource },
          { action: 'create', resource: permission.resource },
          { action: 'update', resource: permission.resource },
          { action: 'delete', resource: permission.resource },
          { action: 'manage', resource: permission.resource },
        ]),
      ]),
      isSystemRole: true,
      level: 8,
    },
  });

  // Create Manager Role
  const managerRole = await tx.role.upsert({
    where: { name: 'Manager' },
    update: {
      description: 'Department Manager with supervisory permissions',
      permissions: JSON.stringify([
        { action: 'read', resource: 'users' },
        ...Object.values(ALL_MODULE_PERMISSIONS).flatMap((permission) => [
          { action: 'read', resource: permission.resource },
          { action: 'create', resource: permission.resource },
          { action: 'update', resource: permission.resource },
          { action: 'delete', resource: permission.resource },
        ]),
      ]),
      isSystemRole: true,
      level: 6,
    },
    create: {
      id: 'manager',
      name: 'Manager',
      description: 'Department Manager with supervisory permissions',
      permissions: JSON.stringify([
        { action: 'read', resource: 'users' },
        ...Object.values(ALL_MODULE_PERMISSIONS).flatMap((permission) => [
          { action: 'read', resource: permission.resource },
          { action: 'create', resource: permission.resource },
          { action: 'update', resource: permission.resource },
          { action: 'delete', resource: permission.resource },
        ]),
      ]),
      isSystemRole: true,
      level: 6,
    },
  });

  // Create Employee Role
  const employeeRole = await tx.role.upsert({
    where: { name: 'Employee' },
    update: {
      description: 'Standard Employee with basic access',
      permissions: JSON.stringify([
        ...Object.values(ALL_MODULE_PERMISSIONS).flatMap((permission) => [
          { action: 'read', resource: permission.resource },
          { action: 'create', resource: permission.resource },
          { action: 'update', resource: permission.resource },
        ]),
      ]),
      isSystemRole: true,
      level: 4,
    },
    create: {
      id: 'employee',
      name: 'Employee',
      description: 'Standard Employee with basic access',
      permissions: JSON.stringify([
        ...Object.values(ALL_MODULE_PERMISSIONS).flatMap((permission) => [
          { action: 'read', resource: permission.resource },
          { action: 'create', resource: permission.resource },
          { action: 'update', resource: permission.resource },
        ]),
      ]),
      isSystemRole: true,
      level: 4,
    },
  });

  // Create Viewer Role
  const viewerRole = await tx.role.upsert({
    where: { name: 'Viewer' },
    update: {
      description: 'Read-only access to system',
      permissions: JSON.stringify([
        ...Object.values(ALL_MODULE_PERMISSIONS).map((permission) => ({
          action: 'read',
          resource: permission.resource,
        })),
      ]),
      isSystemRole: true,
      level: 2,
    },
    create: {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to system',
      permissions: JSON.stringify([
        ...Object.values(ALL_MODULE_PERMISSIONS).map((permission) => ({
          action: 'read',
          resource: permission.resource,
        })),
      ]),
      isSystemRole: true,
      level: 2,
    },
  });

  return {
    superAdminRole,
    administratorRole,
    managerRole,
    employeeRole,
    viewerRole,
  };
}

async function createSuperAdministrator(tx: any, data: any, superAdminRole: any) {
  console.log('Creating Super Administrator...');

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 12);

  // Create Super Admin user
  const superAdmin = await tx.user.upsert({
    where: { email: data.email },
    update: {
      password: hashedPassword,
      displayName: data.displayName,
      username: data.username,
      roleId: superAdminRole.id,
      isActive: true,
      isVerified: true,
    },
    create: {
      email: data.email,
      password: hashedPassword,
      displayName: data.displayName,
      username: data.username,
      roleId: superAdminRole.id,
      isActive: true,
      isVerified: true,
    },
  });

  return superAdmin;
}

async function createOrganizationStructure(tx: any) {
  console.log('Creating organization structure...');

  // Create default department
  const adminDepartment = await tx.department.upsert({
    where: { name: 'Administration' },
    update: {
      description: 'System Administration Department',
    },
    create: {
      name: 'Administration',
      description: 'System Administration Department',
      isActive: true,
    },
  });

  // Create default position
  const superAdminPosition = await tx.position.upsert({
    where: { title: 'Super Administrator' },
    update: {
      description: 'Super Administrator Position',
      departmentId: adminDepartment.id,
    },
    create: {
      title: 'Super Administrator',
      description: 'Super Administrator Position',
      departmentId: adminDepartment.id,
      isActive: true,
    },
  });

  return {
    adminDepartment,
    superAdminPosition,
  };
}

async function createSystemConfiguration(tx: any) {
  console.log('Creating system configuration...');

  // Create default system settings
  const config = {
    systemName: 'TazaCore Management System',
    version: '1.0.0',
    initialized: true,
    initializedAt: new Date().toISOString(),
    features: {
      multiTenant: false,
      advancedSecurity: true,
      auditLog: true,
      backup: true,
    },
  };

  return config;
}

async function getInitializationStats() {
  try {
    const [userCount, roleCount, departmentCount, positionCount] = await Promise.all([
      prisma.user.count(),
      prisma.role.count(),
      prisma.department.count(),
      prisma.position.count(),
    ]);

    return {
      users: userCount,
      roles: roleCount,
      departments: departmentCount,
      positions: positionCount,
    };
  } catch (error) {
    console.error('Error getting initialization stats:', error);
    return {
      users: 0,
      roles: 0,
      departments: 0,
      positions: 0,
    };
  }
}
