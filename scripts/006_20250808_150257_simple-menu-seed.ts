import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Icon mapping from Heroicons to string
const iconMap = {
  HomeIcon: 'home',
  UsersIcon: 'users',
  UserIcon: 'user',
  BuildingOfficeIcon: 'building-office',
  ChartBarIcon: 'chart-bar',
  ComputerDesktopIcon: 'computer-desktop',
  CogIcon: 'cog',
  BriefcaseIcon: 'briefcase',
  ClockIcon: 'clock',
  CalendarIcon: 'calendar',
  CurrencyDollarIcon: 'currency-dollar',
  DocumentTextIcon: 'document-text',
  SwatchIcon: 'swatch',
  BellIcon: 'bell',
};

const menuItemsData = [
  {
    title: 'Dashboard',
    titleVi: 'Tổng quan',
    path: '/admin',
    icon: iconMap.HomeIcon,
    permission: 'read:dashboard',
    sortOrder: 1,
    children: [],
  },
  {
    title: 'CRM',
    titleVi: 'CRM',
    path: '/admin/crm',
    icon: iconMap.UserIcon,
    permission: 'read:crm',
    sortOrder: 2,
    children: [
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
    ],
  },
  {
    title: 'Role Management',
    titleVi: 'Phân Quyền',
    path: '/admin/permissions',
    icon: iconMap.CogIcon,
    permission: 'admin:system',
    sortOrder: 3,
    children: [
      {
        title: 'Users',
        titleVi: 'Người dùng',
        path: '/admin/permissions',
        icon: iconMap.UsersIcon,
        permission: 'admin:system',
        sortOrder: 1,
      },
      {
        title: 'Menu Permissions',
        titleVi: 'Quyền truy cập Menu',
        path: '/admin/permissions/menus',
        icon: iconMap.CogIcon,
        permission: 'admin:system',
        sortOrder: 2,
      },
    ],
  },
  {
    title: 'Settings',
    titleVi: 'Cài đặt',
    path: '/admin/settings',
    icon: iconMap.CogIcon,
    permission: 'admin:system',
    sortOrder: 4,
    children: [],
  },
];

async function seedMenuItems() {
  console.log('🌱 Seeding menu items...');

  try {
    // Clear existing menu items
    await prisma.role_menu_items.deleteMany();
    await prisma.menu_items.deleteMany();

    // Function to create menu items recursively
    const createMenuItem = async (item: any, parentId?: string | null) => {
      const menuItem = await prisma.menu_items.create({
        data: {
          title: item.title,
          titleVi: item.titleVi,
          path: item.path,
          icon: item.icon,
          permission: item.permission || null,
          parentId: parentId || null,
          sortOrder: item.sortOrder,
          isActive: true,
        },
      });

      // Create children if they exist
      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          await createMenuItem(child, menuItem.id);
        }
      }

      return menuItem;
    };

    // Create all menu items
    for (const item of menuItemsData) {
      await createMenuItem(item);
    }

    // Get all roles to create default permissions
    const roles = await prisma.roles.findMany();
    const allMenuItems = await prisma.menu_items.findMany();

    console.log(`Found ${roles.length} roles and ${allMenuItems.length} menu items`);

    // Create default role-menu associations
    for (const role of roles) {
      for (const menuItem of allMenuItems) {
        let canAccess = false;
        let canView = false;

        // Super Admin gets all permissions
        if (role.name === 'SUPER_ADMIN') {
          canAccess = true;
          canView = true;
        }
        // System Admin gets most permissions
        else if (role.name === 'SYSTEM_ADMIN') {
          canAccess = true;
          canView = true;
        }
        // Other roles get limited access
        else {
          canAccess = menuItem.permission === 'read:dashboard';
          canView = menuItem.permission === 'read:dashboard';
        }

        await prisma.role_menu_items.create({
          data: {
            roleId: role.id,
            menuItemId: menuItem.id,
            canView: canView,
            canAccess: canAccess,
          },
        });
      }
    }

    console.log('✅ Menu items seeded successfully!');
    console.log(`📁 Created ${allMenuItems.length} menu items`);
    console.log(`🔗 Created ${roles.length * allMenuItems.length} role-menu associations`);

  } catch (error) {
    console.error('❌ Error seeding menu items:', error);
    throw error;
  }
}

seedMenuItems()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
