import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MenuItemData {
  id: string;
  title: string;
  titleVi?: string;
  path: string;
  icon: string;
  permission?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
}

// Định nghĩa cấu trúc menu hoàn chình
const menuStructure: MenuItemData[] = [
  // Main Dashboard
  {
    id: 'dashboard',
    title: 'Dashboard',
    titleVi: 'Bảng điều khiển',
    path: '/admin',
    icon: 'HomeIcon',
    permission: 'admin.dashboard',
    sortOrder: 1,
    isActive: true
  },

  // User Management
  {
    id: 'user-management',
    title: 'User Management',
    titleVi: 'Quản lý người dùng', 
    path: '/admin/users',
    icon: 'UsersIcon',
    permission: 'admin.users',
    sortOrder: 2,
    isActive: true
  },

  // Permissions
  {
    id: 'permissions',
    title: 'Permissions',
    titleVi: 'Phân quyền',
    path: '/admin/permissions',
    icon: 'ShieldCheckIcon',
    permission: 'admin.permissions',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'permissions-users',
    title: 'User Permissions',
    titleVi: 'Phân quyền người dùng',
    path: '/admin/permissions/users',
    icon: 'UserIcon',
    permission: 'admin.permissions.users',
    parentId: 'permissions',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'permissions-roles',
    title: 'Role Management',
    titleVi: 'Quản lý vai trò',
    path: '/admin/permissions/roles',
    icon: 'KeyIcon',
    permission: 'admin.permissions.roles',
    parentId: 'permissions',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'permissions-user-roles',
    title: 'User Roles',
    titleVi: 'Vai trò người dùng',
    path: '/admin/permissions/user-roles',
    icon: 'UserGroupIcon',
    permission: 'admin.permissions.user-roles',
    parentId: 'permissions',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'permissions-menus',
    title: 'Menu Permissions',
    titleVi: 'Phân quyền menu',
    path: '/admin/permissions/menus',
    icon: 'Bars3Icon',
    permission: 'admin.permissions.menus',
    parentId: 'permissions',
    sortOrder: 4,
    isActive: true
  },

  // Social Media
  {
    id: 'social',
    title: 'Social Media',
    titleVi: 'Mạng xã hội',
    path: '/admin/social',
    icon: 'ShareIcon',
    permission: 'admin.social',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'social-facebook',
    title: 'Facebook Management',
    titleVi: 'Quản lý Facebook',
    path: '/admin/social/facebook',
    icon: 'DocumentTextIcon',
    permission: 'admin.social.facebook',
    parentId: 'social',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'social-facebook-config',
    title: 'Facebook Configuration',
    titleVi: 'Cấu hình Facebook',
    path: '/admin/social/facebook#configuration',
    icon: 'CogIcon',
    permission: 'admin.social.facebook.config',
    parentId: 'social-facebook',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'social-facebook-sync',
    title: 'Facebook Sync',
    titleVi: 'Đồng bộ Facebook',
    path: '/admin/social/facebook#sync',
    icon: 'ArrowPathIcon',
    permission: 'admin.social.facebook.sync',
    parentId: 'social-facebook',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'social-facebook-users',
    title: 'Facebook User Data',
    titleVi: 'Dữ liệu người dùng Facebook',
    path: '/admin/social/facebook#users',
    icon: 'UsersIcon',
    permission: 'admin.social.facebook.users',
    parentId: 'social-facebook',
    sortOrder: 3,
    isActive: true
  },

  // Chat System
  {
    id: 'chat',
    title: 'Chat System',
    titleVi: 'Hệ thống chat',
    path: '/admin/chat',
    icon: 'ChatBubbleLeftRightIcon',
    permission: 'admin.chat',
    sortOrder: 5,
    isActive: true
  },

  // Information Hub
  {
    id: 'information-hub',
    title: 'Information Hub',
    titleVi: 'Trung tâm thông tin',
    path: '/information-hub',
    icon: 'InformationCircleIcon',
    permission: 'information.hub',
    sortOrder: 6,
    isActive: true
  },

  // Call Center
  {
    id: 'call-center',
    title: 'Call Center',
    titleVi: 'Tổng đài',
    path: '/admin/call-center',
    icon: 'PhoneIcon',
    permission: 'admin.call-center',
    sortOrder: 7,
    isActive: true
  },

  // Reports
  {
    id: 'reports',
    title: 'Reports',
    titleVi: 'Báo cáo',
    path: '/admin/reports',
    icon: 'ChartBarIcon',
    permission: 'admin.reports',
    sortOrder: 8,
    isActive: true
  },

  // Settings
  {
    id: 'settings',
    title: 'Settings',
    titleVi: 'Cài đặt',
    path: '/admin/settings',
    icon: 'CogIcon',
    permission: 'admin.settings',
    sortOrder: 9,
    isActive: true
  },

  // Developer Tools
  {
    id: 'dev-tools',
    title: 'Developer Tools',
    titleVi: 'Công cụ phát triển',
    path: '/admin/dev',
    icon: 'CodeBracketIcon',
    permission: 'admin.dev',
    sortOrder: 10,
    isActive: true
  },
  {
    id: 'dev-graphql',
    title: 'GraphQL Playground',
    titleVi: 'GraphQL Playground',
    path: '/admin/permissions/graphql',
    icon: 'CommandLineIcon',
    permission: 'admin.dev.graphql',
    parentId: 'dev-tools',
    sortOrder: 1,
    isActive: true
  }
];

// Định nghĩa phân quyền mặc định theo role
const defaultRolePermissions = {
  // Super Admin - Full access
  'SUPER_ADMIN': {
    level: 10,
    permissions: menuStructure.map(m => m.id) // All menus
  },
  
  // System Admin - Most access except dev tools  
  'SYSTEM_ADMIN': {
    level: 9,
    permissions: menuStructure.filter(m => !m.id.startsWith('dev')).map(m => m.id)
  },
  
  // HR Manager - HR related permissions
  'HR_MANAGER': {
    level: 8,
    permissions: ['dashboard', 'user-management', 'permissions-users', 'permissions-user-roles', 'chat', 'reports']
  },
  
  // Sales Manager - Sales related permissions
  'SALES_MANAGER': {
    level: 7,
    permissions: ['dashboard', 'social', 'social-facebook', 'social-facebook-config', 'social-facebook-sync', 'social-facebook-users', 'chat', 'information-hub', 'call-center', 'reports']
  },
  
  // Department Manager - Basic management permissions
  'DEPARTMENT_MANAGER': {
    level: 6,
    permissions: ['dashboard', 'chat', 'information-hub', 'reports']
  },
  
  // Team Lead - Team related permissions
  'TEAM_LEAD': {
    level: 5,
    permissions: ['dashboard', 'chat', 'information-hub']
  },
  
  // Senior Employee - Extended permissions
  'SENIOR_EMPLOYEE': {
    level: 4,
    permissions: ['dashboard', 'chat', 'information-hub']
  },
  
  // Employee - Basic permissions
  'EMPLOYEE': {
    level: 3,
    permissions: ['dashboard', 'chat']
  }
};

async function seedMenuItems(): Promise<void> {
  console.log('🌱 Starting menu seeding...');
  
  try {
    // 1. Clear existing menu data
    console.log('🧹 Clearing existing menu data...');
    await prisma.role_menu_items.deleteMany({});
    await prisma.menu_items.deleteMany({});
    
    // 2. Insert parent menus first (no parentId)
    const parentMenus = menuStructure.filter(menu => !menu.parentId);
    console.log(`📋 Creating ${parentMenus.length} parent menus...`);
    
    for (const menu of parentMenus) {
      await prisma.menu_items.create({
        data: {
          id: menu.id,
          title: menu.title,
          titleVi: menu.titleVi,
          path: menu.path,
          icon: menu.icon,
          permission: menu.permission,
          sortOrder: menu.sortOrder,
          isActive: menu.isActive
        }
      });
      console.log(`  ✅ Created: ${menu.title}`);
    }
    
    // 3. Insert child menus
    const childMenus = menuStructure.filter(menu => menu.parentId);
    console.log(`📋 Creating ${childMenus.length} child menus...`);
    
    for (const menu of childMenus) {
      await prisma.menu_items.create({
        data: {
          id: menu.id,
          title: menu.title,
          titleVi: menu.titleVi,
          path: menu.path,
          icon: menu.icon,
          permission: menu.permission,
          parentId: menu.parentId,
          sortOrder: menu.sortOrder,
          isActive: menu.isActive
        }
      });
      console.log(`  ✅ Created: ${menu.title} (child of ${menu.parentId})`);
    }
    
    console.log(`✅ Successfully created ${menuStructure.length} menu items`);
    
  } catch (error) {
    console.error('❌ Error seeding menu items:', error);
    throw error;
  }
}

async function seedRoleMenuPermissions(): Promise<void> {
  console.log('🔑 Starting role menu permissions seeding...');
  
  try {
    // Get all roles from database
    const roles = await prisma.roles.findMany();
    console.log(`👥 Found ${roles.length} roles in database`);
    
    // Get all menu items
    const menus = await prisma.menu_items.findMany();
    console.log(`📋 Found ${menus.length} menu items`);
    
    let totalPermissions = 0;
    
    for (const role of roles) {
      const roleConfig = defaultRolePermissions[role.name as keyof typeof defaultRolePermissions];
      
      if (!roleConfig) {
        console.log(`⚠️  No permission config found for role: ${role.name}, granting basic access`);
        // Grant basic access to dashboard and chat for unknown roles
        const basicMenus = menus.filter(m => ['dashboard', 'chat'].includes(m.id));
        
        for (const menu of basicMenus) {
          await prisma.role_menu_items.create({
            data: {
              roleId: role.id,
              menuItemId: menu.id,
              canView: true,
              canAccess: true
            }
          });
          totalPermissions++;
        }
        continue;
      }
      
      console.log(`🔑 Setting permissions for role: ${role.name} (Level: ${role.level})`);
      
      // Grant permissions based on role configuration
      const allowedMenus = menus.filter(menu => roleConfig.permissions.includes(menu.id));
      
      for (const menu of allowedMenus) {
        await prisma.role_menu_items.create({
          data: {
            roleId: role.id,
            menuItemId: menu.id,
            canView: true,
            canAccess: true
          }
        });
        totalPermissions++;
      }
      
      console.log(`  ✅ Granted ${allowedMenus.length} menu permissions to ${role.name}`);
    }
    
    console.log(`✅ Successfully created ${totalPermissions} role menu permissions`);
    
  } catch (error) {
    console.error('❌ Error seeding role menu permissions:', error);
    throw error;
  }
}

async function main(): Promise<void> {
  const startTime = Date.now();
  console.log('🚀 BẮT ĐẦU KHÔI PHỤC MENU VÀ PHÂN QUYỀN');
  console.log(`⏰ Thời gian bắt đầu: ${new Date().toLocaleString()}`);
  
  try {
    // Step 1: Seed menu items
    await seedMenuItems();
    
    // Step 2: Seed role menu permissions
    await seedRoleMenuPermissions();
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n🎉 HOÀN THÀNH KHÔI PHỤC MENU! (${duration}s)`);
    
    // Verify results
    const menuCount = await prisma.menu_items.count();
    const permissionCount = await prisma.role_menu_items.count();
    
    console.log('\n📊 KẾT QUẢ KHÔI PHỤC:');
    console.log(`✅ Tổng menu items: ${menuCount}`);
    console.log(`✅ Tổng role permissions: ${permissionCount}`);
    
  } catch (error) {
    console.error(`💥 Menu restoration failed: ${error}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('\n✅ Menu restoration completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
