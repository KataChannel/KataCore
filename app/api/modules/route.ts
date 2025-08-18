import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Use a singleton pattern for Prisma client to avoid connection issues
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
  prisma = (global as any).prisma;
}

export async function GET(request: NextRequest) {
  let isConnected = false;
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const roleId = searchParams.get('roleId');

    console.log('📡 Fetching modules for:', { userId, roleId });

    // Test database connection
    await prisma.$connect();
    isConnected = true;
    console.log('✅ Database connected successfully');

    // Fetch main modules from menu_items (only top-level items without parent)
    console.log('🔍 Querying menu_items...');
    const menuItems = await Promise.race([
      prisma.menu_items.findMany({
        where: {
          isActive: true,
          parentId: null, // Only top-level items as modules
        },
        orderBy: {
          sortOrder: 'asc',
        },
        include: {
          children: {
            where: {
              isActive: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
        take: 50, // Limit results to prevent timeout
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Menu items query timeout')), 5000)
      )
    ]) as any[];

    console.log(`📊 Found ${menuItems.length} menu items`);

    // Get user's role permissions if provided
    let userRoleModules: string[] = [];
    let roleMenuPermissions: any[] = [];
    
    if (userId && roleId) {
      console.log('🔐 Checking role permissions...');
      
      // Get role information with timeout
      const role = await Promise.race([
        prisma.roles.findUnique({
          where: { id: roleId },
          select: { modules: true, level: true, name: true },
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Role query timeout')), 5000)
        )
      ]) as any;

      if (role?.modules) {
        try {
          userRoleModules = JSON.parse(role.modules);
        } catch (e) {
          // If modules is not JSON, treat as comma-separated string
          userRoleModules = role.modules.split(',').map((m: string) => m.trim());
        }
      }

      // Get specific menu permissions for this role with timeout
      roleMenuPermissions = await Promise.race([
        prisma.role_menu_items.findMany({
          where: {
            roleId: roleId,
          },
          include: {
            menuItem: true,
          },
          take: 100, // Limit results
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Menu permissions query timeout')), 5000)
        )
      ]) as any[];

      console.log(`🎯 Found ${roleMenuPermissions.length} role menu permissions`);
    }

    // Transform menu items to modules format
    const transformedModules = menuItems.map(item => {
      // Check if user has access to this module
      const hasRoleModuleAccess = userRoleModules.length === 0 || 
        userRoleModules.includes(item.path.replace('/', '')) ||
        userRoleModules.includes('*');

      // Check specific menu permissions
      const menuPermission = roleMenuPermissions.find(rmp => rmp.menuItemId === item.id);
      const hasMenuAccess = menuPermission ? menuPermission.canAccess : hasRoleModuleAccess;

      // Map to expected module format
      return {
        id: item.id,
        title: item.titleVi || item.title,
        titleVi: item.titleVi || item.title,
        subtitle: getModuleSubtitle(item.path),
        description: getModuleDescription(item.path),
        icon: item.icon,
        href: item.path,
        color: getModuleColor(item.path),
        module: item.path.replace('/', '').replace('/admin/', ''),
        permissions: getModulePermissions(item.path),
        isActive: item.isActive,
        sortOrder: item.sortOrder,
        hasAccess: hasMenuAccess,
        canView: menuPermission?.canView ?? true,
        children: item.children?.map((child: any) => ({
          id: child.id,
          name: child.titleVi || child.title,
          nameVi: child.titleVi || child.title,
          href: child.path,
          icon: child.icon,
          permission: child.permission,
          canAccess: true,
        })) || [],
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedModules,
    });

  } catch (error) {
    console.error('❌ Error fetching modules:', error);
    
    // Return fallback modules data when database fails
    const fallbackModules = [
      {
        id: 'crm-fallback',
        title: 'CRM',
        titleVi: 'CRM',
        subtitle: 'CRM',
        description: 'Tổ chức thông tin khách hàng, tăng cường quan hệ và cải thiện tỷ lệ chuyển đổi đơn hàng.',
        icon: 'UserGroupIcon',
        href: '/admin/crm',
        color: 'from-green-500 to-emerald-500',
        module: 'crm',
        permissions: ['read:admin', 'read:customer'],
        isActive: true,
        sortOrder: 1,
        hasAccess: true,
        canView: true,
        children: [],
      },
      {
        id: 'hrm-fallback',
        title: 'HRM',
        titleVi: 'HRM',
        subtitle: 'HRM',
        description: 'Quản lý thông tin nhân viên, lương thưởng, chấm công.',
        icon: 'UsersIcon',
        href: '/admin/hrm',
        color: 'from-purple-500 to-pink-500',
        module: 'hrm',
        permissions: ['read:employee'],
        isActive: true,
        sortOrder: 2,
        hasAccess: true,
        canView: true,
        children: [],
      },
    ];

    return NextResponse.json({
      success: false,
      error: 'Database connection failed, using fallback data',
      data: fallbackModules,
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    // Only disconnect if we successfully connected
    if (isConnected) {
      try {
        await prisma.$disconnect();
        console.log('🔌 Database disconnected successfully');
      } catch (disconnectError) {
        console.error('❌ Error disconnecting from database:', disconnectError);
      }
    }
  }
}

// Helper functions to map modules to UI properties
function getModuleSubtitle(path: string): string {
  const subtitles: Record<string, string> = {
    '/admin/crm': 'CRM',
    '/admin/hrm': 'HRM', 
    '/sales': 'Sales Management',
    '/inventory': 'Inventory Management',
    '/finance': 'Accounting & Finance',
    '/projects': 'Project Management',
    '/manufacturing': 'Manufacturing',
    '/marketing': 'Digital Marketing',
    '/support': 'Customer Support',
    '/analytics': 'Analytics',
    '/ecommerce': 'E-commerce',
  };
  return subtitles[path] || 'Module';
}

function getModuleDescription(path: string): string {
  const descriptions: Record<string, string> = {
    '/admin/crm': 'Tổ chức thông tin khách hàng, tăng cường quan hệ và cải thiện tỷ lệ chuyển đổi đơn hàng.',
    '/admin/hrm': 'Quản lý thông tin nhân viên, lương thưởng, chấm công. Quan trọng cho SMEs có đội ngũ lớn.',
    '/sales': 'Quản lý quy trình bán hàng, theo dõi đơn hàng và doanh thu. Cốt lõi để tạo dòng tiền cho doanh nghiệp.',
    '/inventory': 'Theo dõi tồn kho, nhập/xuất hàng. Thiết yếu cho bán lẻ, phân phối hoặc sản xuất.',
    '/finance': 'Quản lý dòng tiền, hóa đơn điện tử, báo cáo thuế, đảm bảo tuân thủ pháp luật.',
    '/projects': 'Theo dõi tiến độ dự án, phân công nhiệm vụ, hỗ trợ quản lý nội bộ.',
    '/manufacturing': 'Quản lý quy trình sản xuất, tối ưu hóa nguồn lực. Chỉ cần cho SMEs trong ngành sản xuất.',
    '/marketing': 'Hỗ trợ xây dựng chiến dịch tiếp thị, quản lý kênh truyền thông. Thường tận dụng kênh miễn phí cho SMEs nhỏ.',
    '/support': 'Quản lý yêu cầu hỗ trợ, cải thiện trải nghiệm khách hàng.',
    '/analytics': 'Cung cấp dữ liệu để ra quyết định, phân tích hiệu suất kinh doanh.',
    '/ecommerce': 'Quản lý nền tảng bán hàng online, tối ưu website. Phù hợp cho SMEs có kênh bán hàng trực tuyến.',
  };
  return descriptions[path] || 'Module description';
}

function getModuleColor(path: string): string {
  const colors: Record<string, string> = {
    '/admin/crm': 'from-green-500 to-emerald-500',
    '/admin/hrm': 'from-purple-500 to-pink-500',
    '/sales': 'from-blue-500 to-cyan-500',
    '/inventory': 'from-orange-500 to-red-500',
    '/finance': 'from-yellow-500 to-orange-500',
    '/projects': 'from-indigo-500 to-purple-500',
    '/manufacturing': 'from-gray-500 to-slate-500',
    '/marketing': 'from-pink-500 to-rose-500',
    '/support': 'from-teal-500 to-cyan-500',
    '/analytics': 'from-violet-500 to-purple-500',
    '/ecommerce': 'from-emerald-500 to-teal-500',
  };
  return colors[path] || 'from-gray-500 to-gray-600';
}

function getModulePermissions(path: string): string[] {
  const permissions: Record<string, string[]> = {
    '/admin/crm': ['read:admin', 'read:customer', 'read:lead', 'manage:campaign'],
    '/admin/hrm': ['read:employee', 'read:attendance', 'read:payroll'],
    '/sales': ['read:order', 'create:order', 'manage:pipeline'],
    '/inventory': ['read:product', 'read:stock', 'manage:warehouse'],
    '/finance': ['read:invoice', 'read:payment', 'read:financial_reports'],
    '/projects': ['read:project', 'read:task', 'manage:team'],
    '/manufacturing': ['read:production_plan', 'read:work_order', 'manage:quality_control'],
    '/marketing': ['read:campaign', 'create:content', 'manage:social_media'],
    '/support': ['read:ticket', 'create:ticket', 'read:knowledge_base'],
    '/analytics': ['read:dashboard', 'read:report', 'read:business_intelligence'],
    '/ecommerce': ['read:catalog', 'read:online_order', 'manage:website'],
  };
  return permissions[path] || [];
}
