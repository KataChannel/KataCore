import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Comprehensive menu structure based on (site)/page.tsx modules and existing admin structure
const menuStructure = [
  // Core Business Modules
  {
    title: 'Dashboard',
    titleVi: 'Bảng điều khiển',
    path: '/admin',
    icon: 'ChartBarIcon',
    permission: 'read:dashboard',
    sortOrder: 1,
    children: []
  },
  {
    title: 'Sales Management',
    titleVi: 'Quản lý Bán hàng',
    path: '/sales',
    icon: 'ChartBarIcon',
    permission: 'access:sales',
    sortOrder: 2,
    children: [
      {
        title: 'Orders',
        titleVi: 'Đơn hàng',
        path: '/sales/orders',
        icon: 'ClipboardDocumentListIcon',
        permission: 'read:order',
        sortOrder: 1
      },
      {
        title: 'Sales Pipeline',
        titleVi: 'Luồng bán hàng',
        path: '/sales/pipeline',
        icon: 'ArrowTrendingUpIcon',
        permission: 'manage:pipeline',
        sortOrder: 2
      },
      {
        title: 'Revenue Reports',
        titleVi: 'Báo cáo doanh thu',
        path: '/sales/reports',
        icon: 'DocumentChartBarIcon',
        permission: 'read:sales_reports',
        sortOrder: 3
      }
    ]
  },
  {
    title: 'CRM',
    titleVi: 'Quản lý Khách hàng',
    path: '/admin/crm',
    icon: 'UsersIcon',
    permission: 'access:crm',
    sortOrder: 3,
    children: [
      {
        title: 'Customers',
        titleVi: 'Khách hàng',
        path: '/admin/crm/customers',
        icon: 'UserIcon',
        permission: 'read:customer',
        sortOrder: 1
      },
      {
        title: 'Leads',
        titleVi: 'Khách hàng tiềm năng',
        path: '/admin/crm/leads',
        icon: 'UserPlusIcon',
        permission: 'read:lead',
        sortOrder: 2
      },
      {
        title: 'Call Center',
        titleVi: 'Tổng đài',
        path: '/admin/crm/callcenter',
        icon: 'PhoneIcon',
        permission: 'access:callcenter',
        sortOrder: 3
      },
      {
        title: 'Campaigns',
        titleVi: 'Chiến dịch',
        path: '/admin/crm/campaigns',
        icon: 'MegaphoneIcon',
        permission: 'manage:campaign',
        sortOrder: 4
      }
    ]
  },
  {
    title: 'Inventory',
    titleVi: 'Quản lý Kho',
    path: '/inventory',
    icon: 'CubeIcon',
    permission: 'access:inventory',
    sortOrder: 4,
    children: [
      {
        title: 'Products',
        titleVi: 'Sản phẩm',
        path: '/inventory/products',
        icon: 'SquaresPlusIcon',
        permission: 'read:product',
        sortOrder: 1
      },
      {
        title: 'Stock Management',
        titleVi: 'Quản lý tồn kho',
        path: '/inventory/stock',
        icon: 'ArchiveBoxIcon',
        permission: 'read:stock',
        sortOrder: 2
      },
      {
        title: 'Warehouse',
        titleVi: 'Kho hàng',
        path: '/inventory/warehouse',
        icon: 'BuildingStorefrontIcon',
        permission: 'manage:warehouse',
        sortOrder: 3
      }
    ]
  },
  {
    title: 'Finance',
    titleVi: 'Quản lý Tài chính',
    path: '/finance',
    icon: 'CurrencyDollarIcon',
    permission: 'access:finance',
    sortOrder: 5,
    children: [
      {
        title: 'Invoices',
        titleVi: 'Hóa đơn',
        path: '/finance/invoices',
        icon: 'DocumentTextIcon',
        permission: 'read:invoice',
        sortOrder: 1
      },
      {
        title: 'Payments',
        titleVi: 'Thanh toán',
        path: '/finance/payments',
        icon: 'CreditCardIcon',
        permission: 'read:payment',
        sortOrder: 2
      },
      {
        title: 'Financial Reports',
        titleVi: 'Báo cáo tài chính',
        path: '/finance/reports',
        icon: 'ChartPieIcon',
        permission: 'read:financial_reports',
        sortOrder: 3
      }
    ]
  },
  {
    title: 'HRM',
    titleVi: 'Quản lý Nhân sự',
    path: '/hrm',
    icon: 'UserGroupIcon',
    permission: 'access:hrm',
    sortOrder: 6,
    children: [
      {
        title: 'Employees',
        titleVi: 'Nhân viên',
        path: '/hrm/employees',
        icon: 'UsersIcon',
        permission: 'read:employee',
        sortOrder: 1
      },
      {
        title: 'Attendance',
        titleVi: 'Chấm công',
        path: '/hrm/attendance',
        icon: 'ClockIcon',
        permission: 'read:attendance',
        sortOrder: 2
      },
      {
        title: 'Payroll',
        titleVi: 'Lương thưởng',
        path: '/hrm/payroll',
        icon: 'BanknotesIcon',
        permission: 'read:payroll',
        sortOrder: 3
      }
    ]
  },
  {
    title: 'Projects',
    titleVi: 'Quản lý Dự án',
    path: '/projects',
    icon: 'ClipboardDocumentListIcon',
    permission: 'access:projects',
    sortOrder: 7,
    children: [
      {
        title: 'Project List',
        titleVi: 'Danh sách dự án',
        path: '/projects/list',
        icon: 'FolderIcon',
        permission: 'read:project',
        sortOrder: 1
      },
      {
        title: 'Tasks',
        titleVi: 'Nhiệm vụ',
        path: '/projects/tasks',
        icon: 'CheckCircleIcon',
        permission: 'read:task',
        sortOrder: 2
      },
      {
        title: 'Team Management',
        titleVi: 'Quản lý nhóm',
        path: '/projects/teams',
        icon: 'UserGroupIcon',
        permission: 'manage:team',
        sortOrder: 3
      }
    ]
  },
  {
    title: 'Manufacturing',
    titleVi: 'Quản lý Sản xuất',
    path: '/manufacturing',
    icon: 'CogIcon',
    permission: 'access:manufacturing',
    sortOrder: 8,
    children: [
      {
        title: 'Production Plans',
        titleVi: 'Kế hoạch sản xuất',
        path: '/manufacturing/plans',
        icon: 'CalendarIcon',
        permission: 'read:production_plan',
        sortOrder: 1
      },
      {
        title: 'Work Orders',
        titleVi: 'Lệnh sản xuất',
        path: '/manufacturing/orders',
        icon: 'ClipboardDocumentCheckIcon',
        permission: 'read:work_order',
        sortOrder: 2
      },
      {
        title: 'Quality Control',
        titleVi: 'Kiểm soát chất lượng',
        path: '/manufacturing/quality',
        icon: 'ShieldCheckIcon',
        permission: 'manage:quality_control',
        sortOrder: 3
      }
    ]
  },
  {
    title: 'Marketing',
    titleVi: 'Marketing',
    path: '/marketing',
    icon: 'MegaphoneIcon',
    permission: 'access:marketing',
    sortOrder: 9,
    children: [
      {
        title: 'Campaigns',
        titleVi: 'Chiến dịch',
        path: '/marketing/campaigns',
        icon: 'SpeakerWaveIcon',
        permission: 'read:campaign',
        sortOrder: 1
      },
      {
        title: 'Content Management',
        titleVi: 'Quản lý nội dung',
        path: '/marketing/content',
        icon: 'DocumentTextIcon',
        permission: 'create:content',
        sortOrder: 2
      },
      {
        title: 'Social Media',
        titleVi: 'Mạng xã hội',
        path: '/admin/social',
        icon: 'ChatBubbleOvalLeftIcon',
        permission: 'manage:social_media',
        sortOrder: 3
      }
    ]
  },
  {
    title: 'Customer Support',
    titleVi: 'Chăm sóc Khách hàng',
    path: '/support',
    icon: 'ChatBubbleLeftRightIcon',
    permission: 'access:support',
    sortOrder: 10,
    children: [
      {
        title: 'Tickets',
        titleVi: 'Yêu cầu hỗ trợ',
        path: '/support/tickets',
        icon: 'TicketIcon',
        permission: 'read:ticket',
        sortOrder: 1
      },
      {
        title: 'Knowledge Base',
        titleVi: 'Cơ sở kiến thức',
        path: '/support/knowledge',
        icon: 'BookOpenIcon',
        permission: 'read:knowledge_base',
        sortOrder: 2
      },
      {
        title: 'Chat System',
        titleVi: 'Hệ thống chat',
        path: '/admin/chat',
        icon: 'ChatBubbleBottomCenterTextIcon',
        permission: 'access:chat',
        sortOrder: 3
      }
    ]
  },
  {
    title: 'Analytics',
    titleVi: 'Báo cáo & Phân tích',
    path: '/analytics',
    icon: 'DocumentChartBarIcon',
    permission: 'access:analytics',
    sortOrder: 11,
    children: [
      {
        title: 'Dashboard Analytics',
        titleVi: 'Phân tích tổng quan',
        path: '/analytics/dashboard',
        icon: 'PresentationChartBarIcon',
        permission: 'read:dashboard',
        sortOrder: 1
      },
      {
        title: 'Reports',
        titleVi: 'Báo cáo',
        path: '/admin/reports',
        icon: 'DocumentChartBarIcon',
        permission: 'read:report',
        sortOrder: 2
      },
      {
        title: 'Business Intelligence',
        titleVi: 'Thông tin kinh doanh',
        path: '/analytics/business-intelligence',
        icon: 'LightBulbIcon',
        permission: 'read:business_intelligence',
        sortOrder: 3
      }
    ]
  },
  {
    title: 'E-commerce',
    titleVi: 'Thương mại Điện tử',
    path: '/ecommerce',
    icon: 'ComputerDesktopIcon',
    permission: 'access:ecommerce',
    sortOrder: 12,
    children: [
      {
        title: 'Product Catalog',
        titleVi: 'Danh mục sản phẩm',
        path: '/ecommerce/catalog',
        icon: 'RectangleGroupIcon',
        permission: 'read:catalog',
        sortOrder: 1
      },
      {
        title: 'Online Orders',
        titleVi: 'Đơn hàng online',
        path: '/ecommerce/orders',
        icon: 'ShoppingCartIcon',
        permission: 'read:online_order',
        sortOrder: 2
      },
      {
        title: 'Website Management',
        titleVi: 'Quản lý website',
        path: '/admin/website',
        icon: 'GlobeAltIcon',
        permission: 'manage:website',
        sortOrder: 3
      }
    ]
  },
  {
    title: 'Social Media',
    titleVi: 'Mạng xã hội',
    path: '/admin/social',
    icon: 'ShareIcon',
    permission: 'access:social',
    sortOrder: 13,
    children: [
      {
        title: 'Facebook Management',
        titleVi: 'Quản lý Facebook',
        path: '/admin/social/facebook',
        icon: 'SpeakerWaveIcon',
        permission: 'manage:facebook',
        sortOrder: 1
      }
    ]
  },
  {
    title: 'Information Hub',
    titleVi: 'Trung tâm thông tin',
    path: '/information-hub',
    icon: 'InformationCircleIcon',
    permission: 'access:information_hub',
    sortOrder: 14,
    children: []
  },
  {
    title: 'Permissions',
    titleVi: 'Phân quyền',
    path: '/admin/permissions',
    icon: 'ShieldCheckIcon',
    permission: 'access:permissions',
    sortOrder: 15,
    children: [
      {
        title: 'User Permissions',
        titleVi: 'Quyền người dùng',
        path: '/admin/permissions/users',
        icon: 'UserIcon',
        permission: 'manage:user_permissions',
        sortOrder: 1
      },
      {
        title: 'Role Management',
        titleVi: 'Quản lý vai trò',
        path: '/admin/permissions/roles',
        icon: 'UserGroupIcon',
        permission: 'manage:roles',
        sortOrder: 2
      },
      {
        title: 'User Roles',
        titleVi: 'Vai trò người dùng',
        path: '/admin/permissions/user-roles',
        icon: 'IdentificationIcon',
        permission: 'manage:user_roles',
        sortOrder: 3
      },
      {
        title: 'Menu Permissions',
        titleVi: 'Quyền menu',
        path: '/admin/permissions/menus',
        icon: 'BarsArrowDownIcon',
        permission: 'manage:menu_permissions',
        sortOrder: 4
      }
    ]
  },
  {
    title: 'Settings',
    titleVi: 'Cài đặt',
    path: '/admin/settings',
    icon: 'CogIcon',
    permission: 'access:settings',
    sortOrder: 16,
    children: [
      {
        title: 'System Settings',
        titleVi: 'Cài đặt hệ thống',
        path: '/admin/settings/system',
        icon: 'ComputerDesktopIcon',
        permission: 'manage:system_settings',
        sortOrder: 1
      }
    ]
  },
  {
    title: 'Developer Tools',
    titleVi: 'Công cụ phát triển',
    path: '/admin/dev',
    icon: 'CommandLineIcon',
    permission: 'access:dev_tools',
    sortOrder: 17,
    children: [
      {
        title: 'GraphQL Playground',
        titleVi: 'GraphQL Playground',
        path: '/admin/permissions/graphql',
        icon: 'CodeBracketIcon',
        permission: 'access:graphql',
        sortOrder: 1
      }
    ]
  }
];

async function updateComprehensiveMenu() {
  try {
    console.log('🔄 Starting comprehensive menu update...');

    // Clear existing menu structure
    console.log('🗑️ Clearing existing menu items...');
    await prisma.role_menu_items.deleteMany({});
    await prisma.menu_items.deleteMany({});

    // Create parent menus first
    console.log('📋 Creating parent menu items...');
    const parentMenuMap = new Map();

    for (const menu of menuStructure) {
      const parentMenu = await prisma.menu_items.create({
        data: {
          title: menu.title,
          titleVi: menu.titleVi,
          path: menu.path,
          icon: menu.icon,
          permission: menu.permission,
          sortOrder: menu.sortOrder,
          isActive: true
        }
      });
      
      parentMenuMap.set(menu.title, parentMenu.id);
      console.log(`✅ Created parent menu: ${menu.title}`);
    }

    // Create child menus
    console.log('📝 Creating child menu items...');
    let childrenCreated = 0;

    for (const menu of menuStructure) {
      if (menu.children && menu.children.length > 0) {
        const parentId = parentMenuMap.get(menu.title);
        
        for (const child of menu.children) {
          await prisma.menu_items.create({
            data: {
              title: child.title,
              titleVi: child.titleVi,
              path: child.path,
              icon: child.icon,
              permission: child.permission,
              parentId: parentId,
              sortOrder: child.sortOrder,
              isActive: true
            }
          });
          
          childrenCreated++;
          console.log(`  ➡️ Created child menu: ${child.title} under ${menu.title}`);
        }
      }
    }

    // Get all menu items to assign permissions
    const allMenus = await prisma.menu_items.findMany();
    console.log(`📊 Total menus created: ${allMenus.length} (${menuStructure.length} parents + ${childrenCreated} children)`);

    // Get admin roles (level >= 8 or specific admin role names)
    const adminRoles = await prisma.roles.findMany({
      where: {
        OR: [
          { level: { gte: 8 } },
          { name: { in: ['Super Administrator', 'ADMIN', 'Administrator', 'System Admin'] } }
        ]
      }
    });

    console.log(`👑 Found ${adminRoles.length} admin roles:`, adminRoles.map((r: any) => r.name));

    // Grant full access to all menus for admin roles
    console.log('🔐 Granting full menu access to admin roles...');
    let permissionsGranted = 0;

    for (const role of adminRoles) {
      for (const menu of allMenus) {
        await prisma.role_menu_items.create({
          data: {
            roleId: role.id,
            menuItemId: menu.id,
            canView: true,
            canAccess: true
          }
        });
        permissionsGranted++;
      }
      console.log(`✅ Granted ${allMenus.length} menu permissions to role: ${role.name}`);
    }

    console.log(`🎉 Menu update completed successfully!`);
    console.log(`📈 Summary:`);
    console.log(`   - Parent menus: ${menuStructure.length}`);
    console.log(`   - Child menus: ${childrenCreated}`);
    console.log(`   - Total menus: ${allMenus.length}`);
    console.log(`   - Admin roles: ${adminRoles.length}`);
    console.log(`   - Total permissions granted: ${permissionsGranted}`);

  } catch (error) {
    console.error('❌ Error updating menu:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateComprehensiveMenu()
  .then(() => {
    console.log('✅ Menu update script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
