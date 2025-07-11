export const i18nConfig = {
  defaultLocale: 'vi',
  locales: ['vi', 'en'],

  // Common translations
  common: {
    vi: {
      welcome: 'Chào mừng',
      login: 'Đăng nhập',
      logout: 'Đăng xuất',
      dashboard: 'Bảng điều khiển',
      settings: 'Cài đặt',
      profile: 'Hồ sơ',
      save: 'Lưu',
      cancel: 'Hủy',
      delete: 'Xóa',
      edit: 'Sửa',
      add: 'Thêm',
      search: 'Tìm kiếm',
      filter: 'Lọc',
      export: 'Xuất',
      import: 'Nhập',
      loading: 'Đang tải...',
      error: 'Lỗi',
      success: 'Thành công',
      warning: 'Cảnh báo',
      info: 'Thông tin',
      darkMode: 'Chế độ tối',
      lightMode: 'Chế độ sáng',
      language: 'Ngôn ngữ',
      toggleDarkMode: 'Chuyển chế độ tối',
      toggleLanguage: 'Chuyển ngôn ngữ',
    },
    en: {
      welcome: 'Welcome',
      login: 'Login',
      logout: 'Logout',
      dashboard: 'Dashboard',
      settings: 'Settings',
      profile: 'Profile',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      language: 'Language',
      toggleDarkMode: 'Toggle Dark Mode',
      toggleLanguage: 'Toggle Language',
    },
  },

  // HR module translations
  hr: {
    vi: {
      title: 'Quản lý Nhân sự',
      employees: 'Nhân viên',
      departments: 'Phòng ban',
      positions: 'Vị trí',
      attendance: 'Chấm công',
      leaveRequests: 'Yêu cầu nghỉ phép',
      payroll: 'Bảng lương',
      performance: 'Hiệu suất',
      reports: 'Báo cáo',
      addEmployee: 'Thêm nhân viên',
      totalEmployees: 'Tổng số nhân viên',
      activeEmployees: 'Nhân viên hoạt động',
      onLeave: 'Đang nghỉ phép',
      newHires: 'Nhân viên mới',
    },
    en: {
      title: 'HR Management',
      employees: 'Employees',
      departments: 'Departments',
      positions: 'Positions',
      attendance: 'Attendance',
      leaveRequests: 'Leave Requests',
      payroll: 'Payroll',
      performance: 'Performance',
      reports: 'Reports',
      addEmployee: 'Add Employee',
      totalEmployees: 'Total Employees',
      activeEmployees: 'Active Employees',
      onLeave: 'On Leave',
      newHires: 'New Hires',
    },
  },
};

// Helper function to get translation
export function useTranslation(locale: 'vi' | 'en' = 'vi') {
  const t = (key: string, module: keyof typeof i18nConfig = 'common') => {
    const keys = key.split('.');
    const translations = i18nConfig[module] as any;
    let value: any = translations[locale];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  return { t };
}
