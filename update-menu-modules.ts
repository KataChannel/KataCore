#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Icon mapping from the modules to database string format
const iconMap = {
  ChartBarIcon: 'chart-bar',
  UsersIcon: 'users', 
  CubeIcon: 'cube',
  CurrencyDollarIcon: 'currency-dollar',
  UserGroupIcon: 'user-group',
  ClipboardDocumentListIcon: 'clipboard-document-list',
  CogIcon: 'cog',
  MegaphoneIcon: 'megaphone',
  ChatBubbleLeftRightIcon: 'chat-bubble-left-right',
  DocumentChartBarIcon: 'document-chart-bar',
  ComputerDesktopIcon: 'computer-desktop',
  HomeIcon: 'home',
  SwatchIcon: 'swatch',
};

// Updated menu structure based on your modules
const updatedMenuItems = [
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
    title: 'Sales Management',
    titleVi: 'Quản lý Bán hàng', 
    path: '/sales',
    icon: iconMap.ChartBarIcon,
    permission: 'read:order',
    sortOrder: 2,
    children: [
      {
        title: 'Dashboard',
        titleVi: 'Tổng quan',
        path: '/sales',
        icon: iconMap.ChartBarIcon,
        permission: 'read:order',
        sortOrder: 1,
      },
      {
        title: 'Orders',
        titleVi: 'Đơn hàng',
        path: '/sales/orders',
        icon: iconMap.ClipboardDocumentListIcon,
        permission: 'read:order',
        sortOrder: 2,
      },
      {
        title: 'Create Order',
        titleVi: 'Tạo đơn hàng',
        path: '/sales/orders/create',
        icon: iconMap.ClipboardDocumentListIcon,
        permission: 'create:order',
        sortOrder: 3,
      },
      {
        title: 'Pipeline',
        titleVi: 'Quy trình bán hàng',
        path: '/sales/pipeline',
        icon: iconMap.ChartBarIcon,
        permission: 'manage:pipeline',
        sortOrder: 4,
      },
    ],
  },
  {
    title: 'CRM',
    titleVi: 'Quản lý Khách hàng',
    path: '/admin/crm',
    icon: iconMap.UsersIcon,
    permission: 'read:admin',
    sortOrder: 3,
    children: [
      {
        title: 'Dashboard',
        titleVi: 'Tổng quan',
        path: '/admin/crm',
        icon: iconMap.ChartBarIcon,
        permission: 'read:admin',
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
        title: 'Leads',
        titleVi: 'Khách hàng tiềm năng',
        path: '/admin/crm/leads',
        icon: iconMap.UserGroupIcon,
        permission: 'read:lead',
        sortOrder: 3,
      },
      {
        title: 'Campaigns',
        titleVi: 'Chiến dịch',
        path: '/admin/crm/campaigns',
        icon: iconMap.MegaphoneIcon,
        permission: 'manage:campaign',
        sortOrder: 4,
      },
    ],
  },
  {
    title: 'Inventory Management',
    titleVi: 'Quản lý Kho',
    path: '/inventory',
    icon: iconMap.CubeIcon,
    permission: 'read:product',
    sortOrder: 4,
    children: [
      {
        title: 'Dashboard',
        titleVi: 'Tổng quan',
        path: '/inventory',
        icon: iconMap.ChartBarIcon,
        permission: 'read:product',
        sortOrder: 1,
      },
      {
        title: 'Products',
        titleVi: 'Sản phẩm',
        path: '/inventory/products',
        icon: iconMap.CubeIcon,
        permission: 'read:product',
        sortOrder: 2,
      },
      {
        title: 'Stock',
        titleVi: 'Tồn kho',
        path: '/inventory/stock',
        icon: iconMap.ClipboardDocumentListIcon,
        permission: 'read:stock',
        sortOrder: 3,
      },
      {
        title: 'Warehouse',
        titleVi: 'Kho hàng',
        path: '/inventory/warehouse',
        icon: iconMap.CubeIcon,
        permission: 'manage:warehouse',
        sortOrder: 4,
      },
    ],
  },
  {
    title: 'Accounting & Finance',
    titleVi: 'Quản lý Tài chính',
    path: '/finance',
    icon: iconMap.CurrencyDollarIcon,
    permission: 'read:invoice',
    sortOrder: 5,
    children: [
      {
        title: 'Dashboard',
        titleVi: 'Tổng quan',
        path: '/finance',
        icon: iconMap.ChartBarIcon,
        permission: 'read:invoice',
        sortOrder: 1,
      },
      {
        title: 'Invoices',
        titleVi: 'Hóa đơn',
        path: '/finance/invoices',
        icon: iconMap.ClipboardDocumentListIcon,
        permission: 'read:invoice',
        sortOrder: 2,
      },
      {
        title: 'Payments',
        titleVi: 'Thanh toán',
        path: '/finance/payments',
        icon: iconMap.CurrencyDollarIcon,
        permission: 'read:payment',
        sortOrder: 3,
      },
      {
        title: 'Financial Reports',
        titleVi: 'Báo cáo tài chính',
        path: '/finance/reports',
        icon: iconMap.DocumentChartBarIcon,
        permission: 'read:financial_reports',
        sortOrder: 4,
      },
    ],
  },
  {
    title: 'HRM',
    titleVi: 'Quản lý Nhân sự',
    path: '/hrm',
    icon: iconMap.UserGroupIcon,
    permission: 'read:employee',
    sortOrder: 6,
    children: [
      {
        title: 'Dashboard',
        titleVi: 'Tổng quan',
        path: '/hrm',
        icon: iconMap.ChartBarIcon,
        permission: 'read:employee',
        sortOrder: 1,
      },
      {
        title: 'Employees',
        titleVi: 'Nhân viên',
        path: '/hrm/employees',
        icon: iconMap.UsersIcon,
        permission: 'read:employee',
        sortOrder: 2,
      },
      {
        title: 'Attendance',
        titleVi: 'Chấm công',
        path: '/hrm/attendance',
        icon: iconMap.ClipboardDocumentListIcon,
        permission: 'read:attendance',
        sortOrder: 3,
      },
      {
        title: 'Payroll',
        titleVi: 'Bảng lương',
        path: '/hrm/payroll',
        icon: iconMap.CurrencyDollarIcon,
        permission: 'read:payroll',
        sortOrder: 4,
      },
    ],
  },
  {
    title: 'Project Management',
    titleVi: 'Quản lý Dự án',
    path: '/projects',
    icon: iconMap.ClipboardDocumentListIcon,
    permission: 'read:project',
    sortOrder: 7,
    children: [
      {
        title: 'Dashboard',
        titleVi: 'Tổng quan',
        path: '/projects',
        icon: iconMap.ChartBarIcon,
        permission: 'read:project',
        sortOrder: 1,
      },
      {
        title: 'Projects',
        titleVi: 'Dự án',
        path: '/projects/list',
        icon: iconMap.ClipboardDocumentListIcon,
        permission: 'read:project',
        sortOrder: 2,
      },
      {
        title: 'Tasks',
        titleVi: 'Nhiệm vụ',
        path: '/projects/tasks',
        icon: iconMap.ClipboardDocumentListIcon,
        permission: 'read:task',
        sortOrder: 3,
      },
      {
        title: 'Team Management',
        titleVi: 'Quản lý nhóm',
        path: '/projects/teams',
        icon: iconMap.UserGroupIcon,
        permission: 'manage:team',
        sortOrder: 4,
      },
    ],
  },
  {
    title: 'Manufacturing',
    titleVi: 'Quản lý Sản xuất',
    path: '/manufacturing',
    icon: iconMap.CogIcon,
    permission: 'read:production_plan',
    sortOrder: 8,
    children: [
      {
        title: 'Dashboard',
        titleVi: 'Tổng quan',
        path: '/manufacturing',
        icon: iconMap.ChartBarIcon,
        permission: 'read:production_plan',
        sortOrder: 1,
      },
      {
        title: 'Production Plan',
        titleVi: 'Kế hoạch sản xuất',
        path: '/manufacturing/production-plan',
        icon: iconMap.ClipboardDocumentListIcon,
        permission: 'read:production_plan',
        sortOrder: 2,
      },
      {
        title: 'Work Orders',
        titleVi: 'Lệnh sản xuất',
        path: '/manufacturing/work-orders',
        icon: iconMap.ClipboardDocumentListIcon,
        permission: 'read:work_order',
        sortOrder: 3,
      },
      {
        title: 'Quality Control',
        titleVi: 'Kiểm soát chất lượng',
        path: '/manufacturing/quality-control',
        icon: iconMap.CogIcon,
        permission: 'manage:quality_control',
        sortOrder: 4,
      },
    ],
  },
  {
    title: 'Digital Marketing',
    titleVi: 'Marketing',
    path: '/marketing',
    icon: iconMap.MegaphoneIcon,
    permission: 'read:campaign',
    sortOrder: 9,
    children: [
      {
        title: 'Dashboard',
        titleVi: 'Tổng quan',
        path: '/marketing',
        icon: iconMap.ChartBarIcon,
        permission: 'read:campaign',
        sortOrder: 1,
      },
      {
        title: 'Campaigns',
        titleVi: 'Chiến dịch',
        path: '/marketing/campaigns',
        icon: iconMap.MegaphoneIcon,
        permission: 'read:campaign',
        sortOrder: 2,
      },
      {
        title: 'Content',
        titleVi: 'Nội dung',
        path: '/marketing/content',
        icon: iconMap.DocumentChartBarIcon,
        permission: 'create:content',
        sortOrder: 3,
      },
      {
        title: 'Social Media',
        titleVi: 'Mạng xã hội',
        path: '/marketing/social-media',
        icon: iconMap.ChatBubbleLeftRightIcon,
        permission: 'manage:social_media',
        sortOrder: 4,
      },
    ],
  },
  {
    title: 'Customer Support',
    titleVi: 'Chăm sóc Khách hàng',
    path: '/support',
    icon: iconMap.ChatBubbleLeftRightIcon,
    permission: 'read:ticket',
    sortOrder: 10,
    children: [
      {
        title: 'Dashboard',
        titleVi: 'Tổng quan',
        path: '/support',
        icon: iconMap.ChartBarIcon,
        permission: 'read:ticket',
        sortOrder: 1,
      },
      {
        title: 'Tickets',
        titleVi: 'Yêu cầu hỗ trợ',
        path: '/support/tickets',
        icon: iconMap.ChatBubbleLeftRightIcon,
        permission: 'read:ticket',
        sortOrder: 2,
      },
      {
        title: 'Create Ticket',
        titleVi: 'Tạo yêu cầu',
        path: '/support/tickets/create',
        icon: iconMap.ChatBubbleLeftRightIcon,
        permission: 'create:ticket',
        sortOrder: 3,
      },
      {
        title: 'Knowledge Base',
        titleVi: 'Cơ sở tri thức',
        path: '/support/knowledge-base',
        icon: iconMap.DocumentChartBarIcon,
        permission: 'read:knowledge_base',
        sortOrder: 4,
      },
    ],
  },
  {
    title: 'Analytics',
    titleVi: 'Báo cáo & Phân tích',
    path: '/analytics',
    icon: iconMap.DocumentChartBarIcon,
    permission: 'read:dashboard',
    sortOrder: 11,
    children: [
      {
        title: 'Dashboard',
        titleVi: 'Tổng quan',
        path: '/analytics',
        icon: iconMap.ChartBarIcon,
        permission: 'read:dashboard',
        sortOrder: 1,
      },
      {
        title: 'Reports',
        titleVi: 'Báo cáo',
        path: '/analytics/reports',
        icon: iconMap.DocumentChartBarIcon,
        permission: 'read:report',
        sortOrder: 2,
      },
      {
        title: 'Business Intelligence',
        titleVi: 'Thông minh kinh doanh',
        path: '/analytics/business-intelligence',
        icon: iconMap.ChartBarIcon,
        permission: 'read:business_intelligence',
        sortOrder: 3,
      },
    ],
  },
  {
    title: 'E-commerce',
    titleVi: 'Thương mại Điện tử',
    path: '/ecommerce',
    icon: iconMap.ComputerDesktopIcon,
    permission: 'read:catalog',
    sortOrder: 12,
    children: [
      {
        title: 'Dashboard',
        titleVi: 'Tổng quan',
        path: '/ecommerce',
        icon: iconMap.ChartBarIcon,
        permission: 'read:catalog',
        sortOrder: 1,
      },
      {
        title: 'Catalog',
        titleVi: 'Danh mục sản phẩm',
        path: '/ecommerce/catalog',
        icon: iconMap.CubeIcon,
        permission: 'read:catalog',
        sortOrder: 2,
      },
      {
        title: 'Online Orders',
        titleVi: 'Đơn hàng online',
        path: '/ecommerce/orders',
        icon: iconMap.ClipboardDocumentListIcon,
        permission: 'read:online_order',
        sortOrder: 3,
      },
      {
        title: 'Website Management',
        titleVi: 'Quản lý website',
        path: '/ecommerce/website',
        icon: iconMap.ComputerDesktopIcon,
        permission: 'manage:website',
        sortOrder: 4,
      },
    ],
  },
  // Keep admin-specific modules
  {
    title: 'Role Management',
    titleVi: 'Phân Quyền',
    path: '/admin/permissions',
    icon: iconMap.CogIcon,
    permission: 'admin:system',
    sortOrder: 13,
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
    sortOrder: 14,
    children: [],
  },
  {
    title: 'Demo',
    titleVi: 'Demo',
    path: '/admin/monochrome-demo',
    icon: iconMap.SwatchIcon,
    permission: 'read:demo',
    sortOrder: 15,
    children: [],
  },
];

export async function updateMenuModules() {
  console.log('🔄 Updating menu items with new modules...');

  try {
    // Clear existing menu items and permissions
    console.log('🗑️ Clearing existing menu items...');
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
          permission: item.permission,
          sortOrder: item.sortOrder,
          parentId: parentId,
          isActive: true,
        },
      });

      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          await createMenuItem(child, menuItem.id);
        }
      }
      return menuItem;
    };

    // Create all menu items
    console.log('📝 Creating new menu items...');
    for (const item of updatedMenuItems) {
      await createMenuItem(item);
    }

    // Get all roles and menu items for permission assignment
    const roles = await prisma.roles.findMany();
    const allMenuItems = await prisma.menu_items.findMany();

    console.log(`📊 Found ${roles.length} roles and ${allMenuItems.length} menu items`);

    // Create permissions for each role
    console.log('🔐 Assigning permissions...');
    for (const role of roles) {
      for (const menuItem of allMenuItems) {
        let canAccess = false;
        let canView = false;

        // Super Administrator gets all permissions
        if (role.name === 'Super Administrator' || role.level >= 10) {
          canAccess = true;
          canView = true;
        }
        // Administrator gets most permissions except super admin specific
        else if (role.name === 'Administrator' || role.level >= 8) {
          canAccess = !menuItem.permission?.includes('admin:system');
          canView = true;
        }
        // Manager level roles get departmental permissions
        else if (role.level >= 6) {
          // HR Manager gets HR + basic permissions
          if (role.name.includes('HR') || role.name.includes('Manager')) {
            canAccess = menuItem.permission === 'read:dashboard' ||
                       (menuItem.permission?.includes('read:employee') ?? false) ||
                       (menuItem.permission?.includes('read:attendance') ?? false) ||
                       (menuItem.permission?.includes('read:payroll') ?? false) ||
                       (menuItem.permission?.includes('read:project') ?? false) ||
                       (menuItem.permission?.includes('read:task') ?? false) ||
                       (menuItem.permission?.includes('read:report') ?? false);
          }
          // Sales Manager gets sales + CRM permissions
          else if (role.name.includes('Sales')) {
            canAccess = menuItem.permission === 'read:dashboard' ||
                       (menuItem.permission?.includes('read:order') ?? false) ||
                       (menuItem.permission?.includes('create:order') ?? false) ||
                       (menuItem.permission?.includes('manage:pipeline') ?? false) ||
                       (menuItem.permission?.includes('read:customer') ?? false) ||
                       (menuItem.permission?.includes('read:lead') ?? false) ||
                       (menuItem.permission?.includes('manage:campaign') ?? false);
          }
          // Marketing Manager gets marketing permissions
          else if (role.name.includes('Marketing')) {
            canAccess = menuItem.permission === 'read:dashboard' ||
                       (menuItem.permission?.includes('read:campaign') ?? false) ||
                       (menuItem.permission?.includes('create:content') ?? false) ||
                       (menuItem.permission?.includes('manage:social_media') ?? false) ||
                       (menuItem.permission?.includes('read:customer') ?? false);
          }
          // Default manager permissions
          else {
            canAccess = menuItem.permission === 'read:dashboard' ||
                       (menuItem.permission?.includes('read:report') ?? false) ||
                       (menuItem.permission?.includes('read:business_intelligence') ?? false);
          }
          canView = canAccess;
        }
        // Employee gets basic permissions
        else if (role.name === 'Employee' || role.level >= 3) {
          canAccess = menuItem.permission === 'read:dashboard' ||
                     menuItem.permission === 'read:attendance' ||
                     menuItem.permission === 'create:ticket' ||
                     menuItem.permission === 'read:knowledge_base';
          canView = canAccess;
        }
        // Guest/Viewer gets minimal access
        else {
          canAccess = menuItem.permission === 'read:dashboard' ||
                     menuItem.permission === 'read:demo';
          canView = canAccess;
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

    // Summary
    const totalMenus = await prisma.menu_items.count();
    const totalPermissions = await prisma.role_menu_items.count();
    const parentMenus = await prisma.menu_items.count({ where: { parentId: null } });

    console.log('\n✅ Menu update completed successfully!');
    console.log('======================================');
    console.log(`📊 Total menu items: ${totalMenus}`);
    console.log(`📂 Parent menu items: ${parentMenus}`);
    console.log(`🔐 Total permissions: ${totalPermissions}`);
    console.log('\n📋 Updated menu structure based on modules:');
    
    const parentItems = await prisma.menu_items.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { sortOrder: 'asc' }
    });

    parentItems.forEach(item => {
      console.log(`${item.titleVi} (${item.path}) - ${item.children.length} children`);
    });

    console.log('\n🎯 Permissions Summary:');
    console.log('- Super Administrator: Full access to all modules');
    console.log('- Administrator: Access to all except system admin');
    console.log('- Managers: Departmental permissions based on role');
    console.log('- Employees: Basic dashboard and self-service features');
    console.log('- Guests/Viewers: Dashboard and demo access only');

  } catch (error) {
    console.error('❌ Error updating menu modules:', error);
    throw error;
  }
}

// Execute if run directly
updateMenuModules()
  .then(() => {
    console.log('\n🎉 Menu modules update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
