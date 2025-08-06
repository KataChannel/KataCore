const { PrismaClient } = require('@prisma/client');

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
    title: 'HR Management',
    titleVi: 'Quản lý Nhân sự',
    path: '/admin/hr',
    icon: iconMap.UsersIcon,
    permission: 'read:hrm',
    sortOrder: 2,
    children: [
      {
        title: 'Dashboard',
        titleVi: 'Tổng quan',
        path: '/admin/hr',
        icon: iconMap.ChartBarIcon,
        permission: 'read:hrm',
        sortOrder: 1,
      },
      {
        title: 'Employees',
        titleVi: 'Nhân viên',
        path: '/admin/hr/employees',
        icon: iconMap.UsersIcon,
        permission: 'read:employee',
        sortOrder: 2,
      },
      {
        title: 'Departments',
        titleVi: 'Phòng ban',
        path: '/admin/hr/departments',
        icon: iconMap.BuildingOfficeIcon,
        permission: 'read:department',
        sortOrder: 3,
      },
      {
        title: 'Positions',
        titleVi: 'Vị trí',
        path: '/admin/hr/positions',
        icon: iconMap.BriefcaseIcon,
        permission: 'read:position',
        sortOrder: 4,
      },
      {
        title: 'Attendance',
        titleVi: 'Chấm công',
        path: '/admin/hr/attendance',
        icon: iconMap.ClockIcon,
        permission: 'read:attendance',
        sortOrder: 5,
      },
      {
        title: 'Leave Requests',
        titleVi: 'Yêu cầu nghỉ phép',
        path: '/admin/hr/leave-requests',
        icon: iconMap.CalendarIcon,
        permission: 'read:leave_request',
        sortOrder: 6,
      },
      {
        title: 'Payroll',
        titleVi: 'Bảng lương',
        path: '/admin/hr/payroll',
        icon: iconMap.CurrencyDollarIcon,
        permission: 'read:payroll',
        sortOrder: 7,
      },
      {
        title: 'Performance',
        titleVi: 'Hiệu suất',
        path: '/admin/hr/performance',
        icon: iconMap.ChartBarIcon,
        permission: 'read:performance',
        sortOrder: 8,
      },
      {
        title: 'Reports',
        titleVi: 'Báo cáo',
        path: '/admin/hr/reports',
        icon: iconMap.DocumentTextIcon,
        permission: 'read:report',
        sortOrder: 9,
      },
      {
        title: 'Settings',
        titleVi: 'Cài đặt',
        path: '/admin/hr/settings',
        icon: iconMap.CogIcon,
        permission: 'admin:hrm',
        sortOrder: 10,
      },
    ],
  },
  {
    title: 'CRM',
    titleVi: 'CRM',
    path: '/admin/crm',
    icon: iconMap.UserIcon,
    permission: 'read:crm',
    sortOrder: 3,
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
      {
        title: 'Call Center',
        titleVi: 'Trung tâm cuộc gọi',
        path: '/admin/crm/callcenter',
        icon: iconMap.BellIcon,
        permission: 'read:call_center',
        sortOrder: 3,
      },
    ],
  },
  {
    title: 'Social Media',
    titleVi: 'Mạng xã hội',
    path: '/admin/social',
    icon: iconMap.UserIcon,
    permission: 'read:social',
    sortOrder: 4,
    children: [
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
    ],
  },
  {
    title: 'Website Management',
    titleVi: 'Quản lý Website',
    path: '/admin/website',
    icon: iconMap.ComputerDesktopIcon,
    permission: 'manage:website',
    sortOrder: 5,
    children: [
      {
        title: 'Dashboard',
        titleVi: 'Tổng quan',
        path: '/admin/website',
        icon: iconMap.ChartBarIcon,
        permission: 'read:website',
        sortOrder: 1,
      },
      {
        title: 'Builder',
        titleVi: 'Trình tạo',
        path: '/admin/website/builder',
        icon: iconMap.ComputerDesktopIcon,
        permission: 'manage:website',
        sortOrder: 2,
      },
    ],
  },
  {
    title: 'Analytics',
    titleVi: 'Phân tích',
    path: '/admin/analytics',
    icon: iconMap.ChartBarIcon,
    permission: 'read:analytics',
    sortOrder: 6,
    children: [],
  },
  {
    title: 'Role Management',
    titleVi: 'Phân Quyền',
    path: '/admin/permissions',
    icon: iconMap.CogIcon,
    permission: 'admin:system',
    sortOrder: 7,
    children: [
      {
        title: 'Roles',
        titleVi: 'Vai trò',
        path: '/admin/permissions/roles',
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
    sortOrder: 8,
    children: [],
  },
  {
    title: 'Demo',
    titleVi: 'Demo',
    path: '/admin/monochrome-demo',
    icon: iconMap.SwatchIcon,
    permission: 'read:demo',
    sortOrder: 9,
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
    const createMenuItem = async (item, parentId = null) => {
      const menuItem = await prisma.menu_items.create({
        data: {
          title: item.title,
          titleVi: item.titleVi,
          path: item.path,
          icon: item.icon,
          permission: item.permission || null,
          parentId: parentId,
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

        // Super Administrator gets all permissions
        if (role.name === 'Super Administrator') {
          canAccess = true;
          canView = true;
        }
        // Administrator gets most permissions except super admin specific
        else if (role.name === 'Administrator') {
          canAccess = !menuItem.permission?.includes('admin:system');
          canView = true;
        }
        // HR Manager gets HR specific permissions
        else if (role.name === 'HR Manager') {
          canAccess = menuItem.permission?.includes('read:hrm') ||
                     menuItem.permission?.includes('read:employee') ||
                     menuItem.permission?.includes('read:department') ||
                     menuItem.permission?.includes('read:position') ||
                     menuItem.permission?.includes('read:attendance') ||
                     menuItem.permission?.includes('read:leave_request') ||
                     menuItem.permission?.includes('read:payroll') ||
                     menuItem.permission?.includes('read:performance') ||
                     menuItem.permission?.includes('read:report') ||
                     menuItem.permission === 'read:dashboard';
          canView = canAccess;
        }
        // Employee gets basic permissions
        else if (role.name === 'Employee') {
          canAccess = menuItem.permission === 'read:dashboard' ||
                     (menuItem.permission?.includes('read:hrm') && menuItem.path === '/admin/hr') ||
                     menuItem.permission?.includes('read:attendance');
          canView = canAccess;
        }
        // Default for other roles - minimal access
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

// Execute if run directly
if (require.main === module) {
  seedMenuItems()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedMenuItems, menuItemsData };
