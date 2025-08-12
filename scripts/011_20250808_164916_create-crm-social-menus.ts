import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Icon mapping to match your layout
const iconMap = {
  ChartBarIcon: 'ChartBarIcon',
  UsersIcon: 'UsersIcon',
  BellIcon: 'BellIcon',
  ComputerDesktopIcon: 'ComputerDesktopIcon',
  UserIcon: 'UserIcon',
};

async function createCRMAndSocialMenus() {
  try {
    console.log('🚀 Creating CRM and Social Media menu items...\n');

    // 1. Find or create CRM parent menu
    let crmParent = await prisma.menu_items.findFirst({
      where: { 
        title: 'CRM',
        parentId: null 
      }
    });

    if (!crmParent) {
      crmParent = await prisma.menu_items.create({
        data: {
          title: 'CRM',
          titleVi: 'Quản lý khách hàng',
          path: '/admin/crm',
          icon: iconMap.UsersIcon,
          permission: 'read:crm',
          sortOrder: 10,
          isActive: true,
        }
      });
      console.log('✅ Created CRM parent menu');
    } else {
      console.log('📋 CRM parent menu already exists');
    }

    // 2. Find or create Social parent menu
    let socialParent = await prisma.menu_items.findFirst({
      where: { 
        title: 'Social',
        parentId: null 
      }
    });

    if (!socialParent) {
      socialParent = await prisma.menu_items.create({
        data: {
          title: 'Social',
          titleVi: 'Mạng xã hội',
          path: '/admin/social',
          icon: iconMap.UserIcon,
          permission: 'read:social',
          sortOrder: 11,
          isActive: true,
        }
      });
      console.log('✅ Created Social parent menu');
    } else {
      console.log('📋 Social parent menu already exists');
    }

    // 3. Create CRM submenus
    const crmSubMenus = [
      {
        title: 'Dashboard',
        titleVi: 'Tổng quan',
        path: '/admin/crm',
        icon: iconMap.ChartBarIcon,
        permission: 'read:crm',
        sortOrder: 1,
      },
      {
        title: 'Customers',
        titleVi: 'Khách hàng',
        path: '/admin/crm/customers',
        icon: iconMap.UsersIcon,
        permission: 'read:customer',
        sortOrder: 2,
      },
      {
        title: 'Call Center',
        titleVi: 'Trung tâm cuộc gọi',
        path: '/admin/crm/callcenter',
        icon: iconMap.BellIcon,
        permission: 'read:call_center',
        sortOrder: 3,
      },
    ];

    console.log('\n📂 Creating CRM submenus:');
    for (const submenu of crmSubMenus) {
      const existing = await prisma.menu_items.findFirst({
        where: { 
          path: submenu.path, 
          parentId: crmParent.id 
        }
      });

      if (!existing) {
        await prisma.menu_items.create({
          data: {
            ...submenu,
            parentId: crmParent.id,
            isActive: true,
          }
        });
        console.log(`   ✅ Created: ${submenu.title} (${submenu.path})`);
      } else {
        console.log(`   📋 Already exists: ${submenu.title}`);
      }
    }

    // 4. Create Social Media submenus
    const socialSubMenus = [
      {
        title: 'Dashboard',
        titleVi: 'Tổng quan',
        path: '/admin/social',
        icon: iconMap.ChartBarIcon,
        permission: 'read:social',
        sortOrder: 1,
      },
      {
        title: 'Facebook',
        titleVi: 'Facebook',
        path: '/admin/social/facebook',
        icon: iconMap.ComputerDesktopIcon,
        permission: 'manage:social',
        sortOrder: 2,
      },
      {
        title: 'Instagram',
        titleVi: 'Instagram',
        path: '/admin/social/instagram',
        icon: iconMap.UserIcon,
        permission: 'manage:social',
        sortOrder: 3,
      },
      {
        title: 'Twitter',
        titleVi: 'Twitter',
        path: '/admin/social/twitter',
        icon: iconMap.UserIcon,
        permission: 'manage:social',
        sortOrder: 4,
      },
      {
        title: 'LinkedIn',
        titleVi: 'LinkedIn',
        path: '/admin/social/linkedin',
        icon: iconMap.UserIcon,
        permission: 'manage:social',
        sortOrder: 5,
      },
    ];

    console.log('\n📱 Creating Social Media submenus:');
    for (const submenu of socialSubMenus) {
      const existing = await prisma.menu_items.findFirst({
        where: { 
          path: submenu.path, 
          parentId: socialParent.id 
        }
      });

      if (!existing) {
        await prisma.menu_items.create({
          data: {
            ...submenu,
            parentId: socialParent.id,
            isActive: true,
          }
        });
        console.log(`   ✅ Created: ${submenu.title} (${submenu.path})`);
      } else {
        console.log(`   📋 Already exists: ${submenu.title}`);
      }
    }

    // 5. Create role permissions for all menu items
    console.log('\n🔐 Setting up role permissions...');
    
    const roles = await prisma.roles.findMany();
    const allNewMenuItems = await prisma.menu_items.findMany({
      where: {
        OR: [
          { parentId: crmParent.id },
          { parentId: socialParent.id },
          { id: crmParent.id },
          { id: socialParent.id }
        ]
      }
    });

    for (const role of roles) {
      for (const menuItem of allNewMenuItems) {
        // Check if permission already exists
        const existingPermission = await prisma.role_menu_items.findFirst({
          where: {
            roleId: role.id,
            menuItemId: menuItem.id,
          }
        });

        if (!existingPermission) {
          let canView = false;
          let canAccess = false;

          // Permission logic based on role level and name
          if (role.level >= 10 || role.name.includes('SUPER_ADMIN')) {
            // Super Admin gets all permissions
            canView = true;
            canAccess = true;
          }
          else if (role.level >= 9 || role.name.includes('SYSTEM_ADMIN')) {
            // System Admin gets all permissions
            canView = true;
            canAccess = true;
          }
          else if (role.level >= 8 || role.name.includes('ADMIN')) {
            // Admin gets most permissions except system admin
            canView = true;
            canAccess = !menuItem.permission?.includes('admin:system');
          }
          else if (role.level >= 7 || role.name.includes('MANAGER')) {
            // Managers get CRM and Social access
            canAccess = menuItem.permission === 'read:dashboard' ||
                       (menuItem.permission?.includes('read:crm') ?? false) ||
                       (menuItem.permission?.includes('read:customer') ?? false) ||
                       (menuItem.permission?.includes('read:call_center') ?? false) ||
                       (menuItem.permission?.includes('read:social') ?? false) ||
                       (menuItem.permission?.includes('manage:social') ?? false);
            canView = canAccess;
          }
          else if (role.level >= 6 || role.name.includes('HR')) {
            // HR gets CRM access
            canAccess = menuItem.permission === 'read:dashboard' ||
                       (menuItem.permission?.includes('read:crm') ?? false) ||
                       (menuItem.permission?.includes('read:customer') ?? false) ||
                       (menuItem.permission?.includes('read:call_center') ?? false);
            canView = canAccess;
          }
          else if (role.level >= 3 || role.name.includes('EMPLOYEE')) {
            // Employees get limited access
            canAccess = (menuItem.permission === 'read:dashboard') ||
                       (menuItem.permission === 'read:crm');
            canView = canAccess || (menuItem.permission === 'read:social');
          }
          else {
            // Viewers get basic dashboard access only
            canAccess = (menuItem.permission === 'read:dashboard');
            canView = canAccess;
          }

          await prisma.role_menu_items.create({
            data: {
              roleId: role.id,
              menuItemId: menuItem.id,
              canView,
              canAccess,
            },
          });
        }
      }
      console.log(`   ✅ Updated permissions for: ${role.name}`);
    }

    // 6. Display final summary
    const totalMenus = await prisma.menu_items.count();
    const totalPermissions = await prisma.role_menu_items.count();
    const crmMenuCount = await prisma.menu_items.count({
      where: {
        OR: [
          { parentId: crmParent.id },
          { id: crmParent.id }
        ]
      }
    });
    const socialMenuCount = await prisma.menu_items.count({
      where: {
        OR: [
          { parentId: socialParent.id },
          { id: socialParent.id }
        ]
      }
    });

    console.log('\n🎉 Menu creation completed successfully!');
    console.log('======================================');
    console.log(`📊 Total menu items in system: ${totalMenus}`);
    console.log(`🔐 Total role permissions: ${totalPermissions}`);
    console.log(`📂 CRM menu items: ${crmMenuCount}`);
    console.log(`📱 Social menu items: ${socialMenuCount}`);
    
    console.log('\n📋 Created menu structure:');
    console.log('CRM/');
    console.log('├── Dashboard (/admin/crm) - Permission: read:crm');
    console.log('├── Customers (/admin/crm/customers) - Permission: read:customer');
    console.log('└── Call Center (/admin/crm/callcenter) - Permission: read:call_center');
    console.log('');
    console.log('Social Media/');
    console.log('├── Dashboard (/admin/social) - Permission: read:social');
    console.log('├── Facebook (/admin/social/facebook) - Permission: manage:social');
    console.log('├── Instagram (/admin/social/instagram) - Permission: manage:social');
    console.log('├── Twitter (/admin/social/twitter) - Permission: manage:social');
    console.log('└── LinkedIn (/admin/social/linkedin) - Permission: manage:social');

    console.log('\n🔐 Role Access Summary:');
    console.log('Super Admin/System Admin: Full access to all menus');
    console.log('Administrators: Access to all except system admin features');
    console.log('Managers: Access to CRM and Social Media features');
    console.log('HR Roles: Access to CRM and customer management');
    console.log('Employees: Limited access to dashboard and basic CRM');
    console.log('Viewers: Dashboard access only');

  } catch (error) {
    console.error('❌ Error creating menu items:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createCRMAndSocialMenus()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { createCRMAndSocialMenus };
