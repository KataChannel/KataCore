// Comprehensive menu structure for TazaGroup Admin Panel
// Updated: August 2025

export interface MenuItemData {
  id: string;
  title: string;
  titleVi: string;
  path: string;
  icon: string;
  permission: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  description?: string;
  children?: MenuItemData[];
}

export const COMPREHENSIVE_ADMIN_MENU: MenuItemData[] = [
  // Dashboard
  {
    id: 'dashboard',
    title: 'Dashboard',
    titleVi: 'Tổng quan',
    path: '/admin',
    icon: 'HomeIcon',
    permission: 'read:dashboard',
    sortOrder: 1,
    isActive: true,
    description: 'Main admin dashboard with analytics and overview'
  },

  // CMS Module
  {
    id: 'cms',
    title: 'Content Management',
    titleVi: 'Quản lý nội dung',
    path: '/admin/cms',
    icon: 'DocumentTextIcon',
    permission: 'admin:cms',
    sortOrder: 2,
    isActive: true,
    description: 'Content management system with rich text editor'
  },
  {
    id: 'cms-dashboard',
    title: 'CMS Dashboard',
    titleVi: 'Tổng quan CMS',
    path: '/admin/cms',
    icon: 'ChartBarIcon',
    permission: 'read:cms',
    parentId: 'cms',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'cms-editor',
    title: 'Content Editor',
    titleVi: 'Soạn thảo nội dung',
    path: '/admin/cms/editor',
    icon: 'PencilIcon',
    permission: 'write:cms',
    parentId: 'cms',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'cms-media',
    title: 'Media Library',
    titleVi: 'Thư viện media',
    path: '/admin/cms/media',
    icon: 'PhotoIcon',
    permission: 'read:cms:media',
    parentId: 'cms',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'cms-search',
    title: 'Advanced Search',
    titleVi: 'Tìm kiếm nâng cao',
    path: '/admin/cms/search',
    icon: 'MagnifyingGlassIcon',
    permission: 'read:cms:search',
    parentId: 'cms',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'cms-seo',
    title: 'SEO Management',
    titleVi: 'Quản lý SEO',
    path: '/admin/cms/seo',
    icon: 'GlobeAltIcon',
    permission: 'read:cms:seo',
    parentId: 'cms',
    sortOrder: 5,
    isActive: true
  },

  // SEO Module
  {
    id: 'seo',
    title: 'SEO & Marketing',
    titleVi: 'SEO & Marketing',
    path: '/admin/seo',
    icon: 'ChartPieIcon',
    permission: 'admin:seo',
    sortOrder: 3,
    isActive: true,
    description: 'Search engine optimization and marketing tools'
  },
  {
    id: 'seo-dashboard',
    title: 'SEO Dashboard',
    titleVi: 'Tổng quan SEO',
    path: '/admin/seo',
    icon: 'ChartBarIcon',
    permission: 'read:seo',
    parentId: 'seo',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'seo-posts',
    title: 'Posts Management',
    titleVi: 'Quản lý bài viết',
    path: '/admin/seo/posts',
    icon: 'DocumentTextIcon',
    permission: 'read:seo:posts',
    parentId: 'seo',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'seo-categories',
    title: 'Categories',
    titleVi: 'Danh mục',
    path: '/admin/seo/categories',
    icon: 'FolderIcon',
    permission: 'read:seo:categories',
    parentId: 'seo',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'seo-tags',
    title: 'Tags',
    titleVi: 'Thẻ từ khóa',
    path: '/admin/seo/tags',
    icon: 'TagIcon',
    permission: 'read:seo:tags',
    parentId: 'seo',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'seo-analytics',
    title: 'SEO Analytics',
    titleVi: 'Phân tích SEO',
    path: '/admin/seo/analytics',
    icon: 'ChartLineIcon',
    permission: 'read:seo:analytics',
    parentId: 'seo',
    sortOrder: 5,
    isActive: true
  },

  // HRM Module
  {
    id: 'hrm',
    title: 'Human Resources',
    titleVi: 'Quản lý nhân sự',
    path: '/admin/hrm',
    icon: 'UsersIcon',
    permission: 'admin:hrm',
    sortOrder: 4,
    isActive: true,
    description: 'Human resource management system'
  },
  {
    id: 'hrm-dashboard',
    title: 'HR Dashboard',
    titleVi: 'Tổng quan HR',
    path: '/admin/hrm',
    icon: 'ChartBarIcon',
    permission: 'read:hrm',
    parentId: 'hrm',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'hrm-employees',
    title: 'Employees',
    titleVi: 'Nhân viên',
    path: '/admin/hrm/employees',
    icon: 'UserIcon',
    permission: 'read:hrm:employees',
    parentId: 'hrm',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'hrm-departments',
    title: 'Departments',
    titleVi: 'Phòng ban',
    path: '/admin/hrm/departments',
    icon: 'BuildingOfficeIcon',
    permission: 'read:hrm:departments',
    parentId: 'hrm',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'hrm-positions',
    title: 'Positions',
    titleVi: 'Chức vụ',
    path: '/admin/hrm/positions',
    icon: 'BriefcaseIcon',
    permission: 'read:hrm:positions',
    parentId: 'hrm',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'hrm-attendance',
    title: 'Attendance',
    titleVi: 'Chấm công',
    path: '/admin/hrm/attendance',
    icon: 'ClockIcon',
    permission: 'read:hrm:attendance',
    parentId: 'hrm',
    sortOrder: 5,
    isActive: true
  },
  {
    id: 'hrm-payroll',
    title: 'Payroll',
    titleVi: 'Tính lương',
    path: '/admin/hrm/payroll',
    icon: 'CurrencyDollarIcon',
    permission: 'read:hrm:payroll',
    parentId: 'hrm',
    sortOrder: 6,
    isActive: true
  },
  {
    id: 'hrm-leave',
    title: 'Leave Management',
    titleVi: 'Quản lý nghỉ phép',
    path: '/admin/hrm/leave',
    icon: 'CalendarIcon',
    permission: 'read:hrm:leave',
    parentId: 'hrm',
    sortOrder: 7,
    isActive: true
  },
  {
    id: 'hrm-performance',
    title: 'Performance',
    titleVi: 'Đánh giá hiệu suất',
    path: '/admin/hrm/performance',
    icon: 'TrophyIcon',
    permission: 'read:hrm:performance',
    parentId: 'hrm',
    sortOrder: 8,
    isActive: true
  },

  // CRM Module
  {
    id: 'crm',
    title: 'Customer Relations',
    titleVi: 'Quản lý khách hàng',
    path: '/admin/crm',
    icon: 'UserGroupIcon',
    permission: 'admin:crm',
    sortOrder: 5,
    isActive: true,
    description: 'Customer relationship management'
  },
  {
    id: 'crm-dashboard',
    title: 'CRM Dashboard',
    titleVi: 'Tổng quan CRM',
    path: '/admin/crm',
    icon: 'ChartBarIcon',
    permission: 'read:crm',
    parentId: 'crm',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'crm-customers',
    title: 'Customers',
    titleVi: 'Khách hàng',
    path: '/admin/crm/customers',
    icon: 'UserIcon',
    permission: 'read:crm:customers',
    parentId: 'crm',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'crm-leads',
    title: 'Leads',
    titleVi: 'Khách hàng tiềm năng',
    path: '/admin/crm/leads',
    icon: 'SparklesIcon',
    permission: 'read:crm:leads',
    parentId: 'crm',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'crm-callcenter',
    title: 'Call Center',
    titleVi: 'Tổng đài',
    path: '/admin/crm/callcenter',
    icon: 'PhoneIcon',
    permission: 'read:crm:callcenter',
    parentId: 'crm',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'crm-tickets',
    title: 'Support Tickets',
    titleVi: 'Hỗ trợ khách hàng',
    path: '/admin/crm/tickets',
    icon: 'TicketIcon',
    permission: 'read:crm:tickets',
    parentId: 'crm',
    sortOrder: 5,
    isActive: true
  },
  {
    id: 'crm-campaigns',
    title: 'Marketing Campaigns',
    titleVi: 'Chiến dịch marketing',
    path: '/admin/crm/campaigns',
    icon: 'MegaphoneIcon',
    permission: 'read:crm:campaigns',
    parentId: 'crm',
    sortOrder: 6,
    isActive: true
  },

  // Social Media Module
  {
    id: 'social',
    title: 'Social Media',
    titleVi: 'Mạng xã hội',
    path: '/admin/social',
    icon: 'ShareIcon',
    permission: 'admin:social',
    sortOrder: 6,
    isActive: true,
    description: 'Social media management and integration'
  },
  {
    id: 'social-dashboard',
    title: 'Social Dashboard',
    titleVi: 'Tổng quan Social',
    path: '/admin/social',
    icon: 'ChartBarIcon',
    permission: 'read:social',
    parentId: 'social',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'social-facebook',
    title: 'Facebook Management',
    titleVi: 'Quản lý Facebook',
    path: '/admin/social/facebook',
    icon: 'GlobeAltIcon',
    permission: 'read:social:facebook',
    parentId: 'social',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'social-instagram',
    title: 'Instagram',
    titleVi: 'Instagram',
    path: '/admin/social/instagram',
    icon: 'CameraIcon',
    permission: 'read:social:instagram',
    parentId: 'social',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'social-linkedin',
    title: 'LinkedIn',
    titleVi: 'LinkedIn',
    path: '/admin/social/linkedin',
    icon: 'BuildingOffice2Icon',
    permission: 'read:social:linkedin',
    parentId: 'social',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'social-analytics',
    title: 'Social Analytics',
    titleVi: 'Phân tích Social',
    path: '/admin/social/analytics',
    icon: 'ChartLineIcon',
    permission: 'read:social:analytics',
    parentId: 'social',
    sortOrder: 5,
    isActive: true
  },

  // Information Hub
  {
    id: 'information-hub',
    title: 'Information Hub',
    titleVi: 'Trung tâm thông tin',
    path: '/admin/information-hub',
    icon: 'InformationCircleIcon',
    permission: 'admin:information-hub',
    sortOrder: 7,
    isActive: true,
    description: 'Centralized information and knowledge management'
  },
  {
    id: 'info-dashboard',
    title: 'Info Dashboard',
    titleVi: 'Tổng quan thông tin',
    path: '/admin/information-hub',
    icon: 'ChartBarIcon',
    permission: 'read:information-hub',
    parentId: 'information-hub',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'info-articles',
    title: 'Articles',
    titleVi: 'Bài viết',
    path: '/admin/information-hub/articles',
    icon: 'DocumentTextIcon',
    permission: 'read:information-hub:articles',
    parentId: 'information-hub',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'info-knowledge-base',
    title: 'Knowledge Base',
    titleVi: 'Cơ sở tri thức',
    path: '/admin/information-hub/knowledge-base',
    icon: 'BookOpenIcon',
    permission: 'read:information-hub:knowledge',
    parentId: 'information-hub',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'info-documents',
    title: 'Documents',
    titleVi: 'Tài liệu',
    path: '/admin/information-hub/documents',
    icon: 'FolderIcon',
    permission: 'read:information-hub:documents',
    parentId: 'information-hub',
    sortOrder: 4,
    isActive: true
  },

  // Website Management
  {
    id: 'website',
    title: 'Website Management',
    titleVi: 'Quản lý website',
    path: '/admin/website',
    icon: 'ComputerDesktopIcon',
    permission: 'admin:website',
    sortOrder: 8,
    isActive: true,
    description: 'Website configuration and management'
  },
  {
    id: 'website-dashboard',
    title: 'Website Dashboard',
    titleVi: 'Tổng quan Website',
    path: '/admin/website',
    icon: 'ChartBarIcon',
    permission: 'read:website',
    parentId: 'website',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'website-pages',
    title: 'Pages',
    titleVi: 'Trang web',
    path: '/admin/website/pages',
    icon: 'DocumentIcon',
    permission: 'read:website:pages',
    parentId: 'website',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'website-menus',
    title: 'Navigation Menus',
    titleVi: 'Menu điều hướng',
    path: '/admin/website/menus',
    icon: 'Bars3Icon',
    permission: 'read:website:menus',
    parentId: 'website',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'website-themes',
    title: 'Themes',
    titleVi: 'Giao diện',
    path: '/admin/website/themes',
    icon: 'SwatchIcon',
    permission: 'read:website:themes',
    parentId: 'website',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'website-settings',
    title: 'Site Settings',
    titleVi: 'Cài đặt site',
    path: '/admin/website/settings',
    icon: 'CogIcon',
    permission: 'read:website:settings',
    parentId: 'website',
    sortOrder: 5,
    isActive: true
  },

  // User Management
  {
    id: 'users',
    title: 'User Management',
    titleVi: 'Quản lý người dùng',
    path: '/admin/users',
    icon: 'UsersIcon',
    permission: 'admin:users',
    sortOrder: 9,
    isActive: true,
    description: 'User accounts and profile management'
  },
  {
    id: 'users-list',
    title: 'All Users',
    titleVi: 'Danh sách người dùng',
    path: '/admin/users',
    icon: 'UserGroupIcon',
    permission: 'read:users',
    parentId: 'users',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'users-create',
    title: 'Create User',
    titleVi: 'Tạo người dùng',
    path: '/admin/users/create',
    icon: 'UserPlusIcon',
    permission: 'write:users',
    parentId: 'users',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'users-roles',
    title: 'User Roles',
    titleVi: 'Vai trò người dùng',
    path: '/admin/users/roles',
    icon: 'ShieldCheckIcon',
    permission: 'read:users:roles',
    parentId: 'users',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'users-activity',
    title: 'User Activity',
    titleVi: 'Hoạt động người dùng',
    path: '/admin/users/activity',
    icon: 'ClockIcon',
    permission: 'read:users:activity',
    parentId: 'users',
    sortOrder: 4,
    isActive: true
  },

  // Permissions & Security
  {
    id: 'permissions',
    title: 'Permissions & Security',
    titleVi: 'Phân quyền & Bảo mật',
    path: '/admin/permissions',
    icon: 'ShieldCheckIcon',
    permission: 'admin:permissions',
    sortOrder: 10,
    isActive: true,
    description: 'System permissions and security management'
  },
  {
    id: 'permissions-dashboard',
    title: 'Permissions Dashboard',
    titleVi: 'Tổng quan phân quyền',
    path: '/admin/permissions',
    icon: 'ChartBarIcon',
    permission: 'read:permissions',
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
    permission: 'read:permissions:roles',
    parentId: 'permissions',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'permissions-users',
    title: 'User Permissions',
    titleVi: 'Phân quyền người dùng',
    path: '/admin/permissions/users',
    icon: 'UserIcon',
    permission: 'read:permissions:users',
    parentId: 'permissions',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'permissions-user-roles',
    title: 'User-Role Assignment',
    titleVi: 'Gán vai trò người dùng',
    path: '/admin/permissions/user-roles',
    icon: 'UserGroupIcon',
    permission: 'read:permissions:user-roles',
    parentId: 'permissions',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'permissions-menus',
    title: 'Menu Permissions',
    titleVi: 'Phân quyền menu',
    path: '/admin/permissions/menus',
    icon: 'Bars3Icon',
    permission: 'read:permissions:menus',
    parentId: 'permissions',
    sortOrder: 5,
    isActive: true
  },
  {
    id: 'permissions-audit',
    title: 'Security Audit',
    titleVi: 'Kiểm toán bảo mật',
    path: '/admin/permissions/audit',
    icon: 'EyeIcon',
    permission: 'read:permissions:audit',
    parentId: 'permissions',
    sortOrder: 6,
    isActive: true
  },

  // Reports & Analytics
  {
    id: 'reports',
    title: 'Reports & Analytics',
    titleVi: 'Báo cáo & Phân tích',
    path: '/admin/reports',
    icon: 'ChartPieIcon',
    permission: 'admin:reports',
    sortOrder: 11,
    isActive: true,
    description: 'System reports and analytics'
  },
  {
    id: 'reports-dashboard',
    title: 'Reports Dashboard',
    titleVi: 'Tổng quan báo cáo',
    path: '/admin/reports',
    icon: 'ChartBarIcon',
    permission: 'read:reports',
    parentId: 'reports',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'reports-system',
    title: 'System Reports',
    titleVi: 'Báo cáo hệ thống',
    path: '/admin/reports/system',
    icon: 'ServerIcon',
    permission: 'read:reports:system',
    parentId: 'reports',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'reports-user-activity',
    title: 'User Activity Reports',
    titleVi: 'Báo cáo hoạt động người dùng',
    path: '/admin/reports/user-activity',
    icon: 'UsersIcon',
    permission: 'read:reports:user-activity',
    parentId: 'reports',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'reports-performance',
    title: 'Performance Reports',
    titleVi: 'Báo cáo hiệu suất',
    path: '/admin/reports/performance',
    icon: 'BoltIcon',
    permission: 'read:reports:performance',
    parentId: 'reports',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'reports-export',
    title: 'Export Data',
    titleVi: 'Xuất dữ liệu',
    path: '/admin/reports/export',
    icon: 'ArrowDownTrayIcon',
    permission: 'read:reports:export',
    parentId: 'reports',
    sortOrder: 5,
    isActive: true
  },

  // System Settings
  {
    id: 'settings',
    title: 'System Settings',
    titleVi: 'Cài đặt hệ thống',
    path: '/admin/settings',
    icon: 'CogIcon',
    permission: 'admin:settings',
    sortOrder: 12,
    isActive: true,
    description: 'System configuration and settings'
  },
  {
    id: 'settings-general',
    title: 'General Settings',
    titleVi: 'Cài đặt chung',
    path: '/admin/settings/general',
    icon: 'AdjustmentsHorizontalIcon',
    permission: 'read:settings:general',
    parentId: 'settings',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'settings-email',
    title: 'Email Configuration',
    titleVi: 'Cấu hình email',
    path: '/admin/settings/email',
    icon: 'EnvelopeIcon',
    permission: 'read:settings:email',
    parentId: 'settings',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'settings-integrations',
    title: 'API Integrations',
    titleVi: 'Tích hợp API',
    path: '/admin/settings/integrations',
    icon: 'LinkIcon',
    permission: 'read:settings:integrations',
    parentId: 'settings',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'settings-backup',
    title: 'Backup & Recovery',
    titleVi: 'Sao lưu & Khôi phục',
    path: '/admin/settings/backup',
    icon: 'ArchiveBoxIcon',
    permission: 'read:settings:backup',
    parentId: 'settings',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'settings-maintenance',
    title: 'System Maintenance',
    titleVi: 'Bảo trì hệ thống',
    path: '/admin/settings/maintenance',
    icon: 'WrenchScrewdriverIcon',
    permission: 'read:settings:maintenance',
    parentId: 'settings',
    sortOrder: 5,
    isActive: true
  },

  // Super Admin (restricted)
  {
    id: 'super-admin',
    title: 'Super Admin',
    titleVi: 'Quản trị viên cấp cao',
    path: '/admin/super-admin',
    icon: 'StarIcon',
    permission: 'admin:super',
    sortOrder: 13,
    isActive: true,
    description: 'Super administrator functions and system control'
  },
  {
    id: 'super-admin-dashboard',
    title: 'Super Admin Dashboard',
    titleVi: 'Tổng quan quản trị cấp cao',
    path: '/admin/super-admin',
    icon: 'CommandLineIcon',
    permission: 'read:super-admin',
    parentId: 'super-admin',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'super-admin-system-control',
    title: 'System Control',
    titleVi: 'Điều khiển hệ thống',
    path: '/admin/super-admin/system-control',
    icon: 'CpuChipIcon',
    permission: 'admin:super:system',
    parentId: 'super-admin',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'super-admin-database',
    title: 'Database Management',
    titleVi: 'Quản lý cơ sở dữ liệu',
    path: '/admin/super-admin/database',
    icon: 'CircleStackIcon',
    permission: 'admin:super:database',
    parentId: 'super-admin',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'super-admin-logs',
    title: 'System Logs',
    titleVi: 'Nhật ký hệ thống',
    path: '/admin/super-admin/logs',
    icon: 'DocumentTextIcon',
    permission: 'admin:super:logs',
    parentId: 'super-admin',
    sortOrder: 4,
    isActive: true
  },

  // Dev Tools (development only)
  {
    id: 'dev-tools',
    title: 'Developer Tools',
    titleVi: 'Công cụ phát triển',
    path: '/admin/dev-tools',
    icon: 'CodeBracketIcon',
    permission: 'admin:dev',
    sortOrder: 14,
    isActive: true,
    description: 'Development and debugging tools'
  },
  {
    id: 'test-menu',
    title: 'Test Menu',
    titleVi: 'Menu thử nghiệm',
    path: '/admin/test-menu',
    icon: 'BeakerIcon',
    permission: 'admin:dev:test',
    parentId: 'dev-tools',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'dev-api-testing',
    title: 'API Testing',
    titleVi: 'Kiểm thử API',
    path: '/admin/dev-tools/api-testing',
    icon: 'BugAntIcon',
    permission: 'admin:dev:api',
    parentId: 'dev-tools',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'dev-component-showcase',
    title: 'Component Showcase',
    titleVi: 'Trưng bày component',
    path: '/admin/dev-tools/components',
    icon: 'PuzzlePieceIcon',
    permission: 'admin:dev:components',
    parentId: 'dev-tools',
    sortOrder: 3,
    isActive: true
  }
];

// Admin role permissions for ALL modules
export const ADMIN_FULL_PERMISSIONS = [
  // Dashboard
  'read:dashboard',
  
  // CMS permissions
  'admin:cms',
  'read:cms',
  'write:cms',
  'delete:cms',
  'read:cms:media',
  'write:cms:media',
  'delete:cms:media',
  'read:cms:search',
  'read:cms:seo',
  'write:cms:seo',
  
  // SEO permissions
  'admin:seo',
  'read:seo',
  'write:seo',
  'delete:seo',
  'read:seo:posts',
  'write:seo:posts',
  'delete:seo:posts',
  'read:seo:categories',
  'write:seo:categories',
  'delete:seo:categories',
  'read:seo:tags',
  'write:seo:tags',
  'delete:seo:tags',
  'read:seo:analytics',
  
  // HRM permissions
  'admin:hrm',
  'read:hrm',
  'write:hrm',
  'delete:hrm',
  'read:hrm:employees',
  'write:hrm:employees',
  'delete:hrm:employees',
  'read:hrm:departments',
  'write:hrm:departments',
  'delete:hrm:departments',
  'read:hrm:positions',
  'write:hrm:positions',
  'delete:hrm:positions',
  'read:hrm:attendance',
  'write:hrm:attendance',
  'read:hrm:payroll',
  'write:hrm:payroll',
  'read:hrm:leave',
  'write:hrm:leave',
  'read:hrm:performance',
  'write:hrm:performance',
  
  // CRM permissions
  'admin:crm',
  'read:crm',
  'write:crm',
  'delete:crm',
  'read:crm:customers',
  'write:crm:customers',
  'delete:crm:customers',
  'read:crm:leads',
  'write:crm:leads',
  'delete:crm:leads',
  'read:crm:callcenter',
  'write:crm:callcenter',
  'read:crm:tickets',
  'write:crm:tickets',
  'read:crm:campaigns',
  'write:crm:campaigns',
  
  // Social media permissions
  'admin:social',
  'read:social',
  'write:social',
  'delete:social',
  'read:social:facebook',
  'write:social:facebook',
  'read:social:instagram',
  'write:social:instagram',
  'read:social:linkedin',
  'write:social:linkedin',
  'read:social:analytics',
  
  // Information Hub permissions
  'admin:information-hub',
  'read:information-hub',
  'write:information-hub',
  'delete:information-hub',
  'read:information-hub:articles',
  'write:information-hub:articles',
  'delete:information-hub:articles',
  'read:information-hub:knowledge',
  'write:information-hub:knowledge',
  'delete:information-hub:knowledge',
  'read:information-hub:documents',
  'write:information-hub:documents',
  'delete:information-hub:documents',
  
  // Website management permissions
  'admin:website',
  'read:website',
  'write:website',
  'delete:website',
  'read:website:pages',
  'write:website:pages',
  'delete:website:pages',
  'read:website:menus',
  'write:website:menus',
  'read:website:themes',
  'write:website:themes',
  'read:website:settings',
  'write:website:settings',
  
  // User management permissions
  'admin:users',
  'read:users',
  'write:users',
  'delete:users',
  'read:users:roles',
  'write:users:roles',
  'read:users:activity',
  
  // Permissions & Security
  'admin:permissions',
  'read:permissions',
  'write:permissions',
  'delete:permissions',
  'read:permissions:roles',
  'write:permissions:roles',
  'delete:permissions:roles',
  'read:permissions:users',
  'write:permissions:users',
  'read:permissions:user-roles',
  'write:permissions:user-roles',
  'read:permissions:menus',
  'write:permissions:menus',
  'read:permissions:audit',
  
  // Reports & Analytics
  'admin:reports',
  'read:reports',
  'write:reports',
  'read:reports:system',
  'read:reports:user-activity',
  'read:reports:performance',
  'read:reports:export',
  
  // System Settings
  'admin:settings',
  'read:settings',
  'write:settings',
  'read:settings:general',
  'write:settings:general',
  'read:settings:email',
  'write:settings:email',
  'read:settings:integrations',
  'write:settings:integrations',
  'read:settings:backup',
  'write:settings:backup',
  'read:settings:maintenance',
  'write:settings:maintenance',
  
  // Super Admin (only for level >= 10)
  'admin:super',
  'read:super-admin',
  'admin:super:system',
  'admin:super:database',
  'admin:super:logs',
  
  // Dev Tools (development environments)
  'admin:dev',
  'admin:dev:test',
  'admin:dev:api',
  'admin:dev:components'
];

export default COMPREHENSIVE_ADMIN_MENU;
