// Unified i18n Configuration System for TazaCore
// Tích hợp với unified theme system

export type Language = 'vi' | 'en';

export const i18nConfig = {
  defaultLocale: 'vi' as Language,
  locales: ['vi', 'en'] as Language[],

  // Storage key (sync with unified theme)
  storageKey: 'taza-language',

  // Common translations
  common: {
    vi: {
      // Navigation & Basic Actions
      welcome: 'Chào mừng',
      home: 'Trang chủ',
      about: 'Giới thiệu',
      contact: 'Liên hệ',
      login: 'Đăng nhập',
      logout: 'Đăng xuất',
      register: 'Đăng ký',
      dashboard: 'Bảng điều khiển',
      settings: 'Cài đặt',
      profile: 'Hồ sơ',

      // CRUD Operations
      save: 'Lưu',
      cancel: 'Hủy',
      delete: 'Xóa',
      edit: 'Sửa',
      add: 'Thêm',
      create: 'Tạo',
      update: 'Cập nhật',
      remove: 'Gỡ bỏ',
      copy: 'Sao chép',
      duplicate: 'Nhân bản',

      // Data Operations
      search: 'Tìm kiếm',
      filter: 'Lọc',
      sort: 'Sắp xếp',
      export: 'Xuất',
      import: 'Nhập',
      download: 'Tải xuống',
      upload: 'Tải lên',
      print: 'In',
      refresh: 'Làm mới',
      reset: 'Đặt lại',
      clear: 'Xóa',

      // Status & States
      loading: 'Đang tải...',
      saving: 'Đang lưu...',
      processing: 'Đang xử lý...',
      error: 'Lỗi',
      success: 'Thành công',
      warning: 'Cảnh báo',
      info: 'Thông tin',
      completed: 'Hoàn thành',
      pending: 'Đang chờ',
      draft: 'Bản nháp',
      published: 'Đã xuất bản',
      archived: 'Đã lưu trữ',

      // Theme & Appearance
      darkMode: 'Chế độ tối',
      lightMode: 'Chế độ sáng',
      theme: 'Giao diện',
      appearance: 'Hiển thị',
      language: 'Ngôn ngữ',
      toggleDarkMode: 'Chuyển chế độ tối',
      toggleLanguage: 'Chuyển ngôn ngữ',

      // Navigation & Actions
      close: 'Đóng',
      open: 'Mở',
      expand: 'Mở rộng',
      collapse: 'Thu gọn',
      confirm: 'Xác nhận',
      back: 'Quay lại',
      next: 'Tiếp theo',
      previous: 'Trước đó',
      continue: 'Tiếp tục',
      finish: 'Hoàn thành',
      submit: 'Gửi',
      apply: 'Áp dụng',

      // Data Display
      view: 'Xem',
      details: 'Chi tiết',
      preview: 'Xem trước',
      list: 'Danh sách',
      grid: 'Lưới',
      table: 'Bảng',
      card: 'Thẻ',

      // Time & Date
      today: 'Hôm nay',
      yesterday: 'Hôm qua',
      tomorrow: 'Ngày mai',
      thisWeek: 'Tuần này',
      thisMonth: 'Tháng này',
      thisYear: 'Năm này',
      date: 'Ngày',
      time: 'Thời gian',

      // Form Fields
      name: 'Tên',
      title: 'Tiêu đề',
      description: 'Mô tả',
      content: 'Nội dung',
      category: 'Danh mục',
      type: 'Loại',
      status: 'Trạng thái',
      priority: 'Mức độ ưu tiên',

      // Common Messages
      noData: 'Không có dữ liệu',
      noResults: 'Không có kết quả',
      notFound: 'Không tìm thấy',
      accessDenied: 'Không có quyền truy cập',
      sessionExpired: 'Phiên làm việc đã hết hạn',
      connectionError: 'Lỗi kết nối',

      // Validation Messages
      required: 'Trường này là bắt buộc',
      invalid: 'Dữ liệu không hợp lệ',
      tooShort: 'Quá ngắn',
      tooLong: 'Quá dài',
      invalidEmail: 'Email không hợp lệ',
      invalidPhone: 'Số điện thoại không hợp lệ',
      passwordMismatch: 'Mật khẩu không khớp',

      // Confirmation Messages
      confirmDelete: 'Bạn có chắc chắn muốn xóa?',
      confirmSave: 'Bạn có muốn lưu thay đổi?',
      unsavedChanges: 'Có thay đổi chưa được lưu',
      operationSuccess: 'Thao tác thành công',
      operationFailed: 'Thao tác thất bại',
    },
    en: {
      // Navigation & Basic Actions
      welcome: 'Welcome',
      home: 'Home',
      about: 'About',
      contact: 'Contact',
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      dashboard: 'Dashboard',
      settings: 'Settings',
      profile: 'Profile',

      // CRUD Operations
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      create: 'Create',
      update: 'Update',
      remove: 'Remove',
      copy: 'Copy',
      duplicate: 'Duplicate',

      // Data Operations
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      export: 'Export',
      import: 'Import',
      download: 'Download',
      upload: 'Upload',
      print: 'Print',
      refresh: 'Refresh',
      reset: 'Reset',
      clear: 'Clear',

      // Status & States
      loading: 'Loading...',
      saving: 'Saving...',
      processing: 'Processing...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      completed: 'Completed',
      pending: 'Pending',
      draft: 'Draft',
      published: 'Published',
      archived: 'Archived',

      // Theme & Appearance
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      theme: 'Theme',
      appearance: 'Appearance',
      language: 'Language',
      toggleDarkMode: 'Toggle Dark Mode',
      toggleLanguage: 'Toggle Language',

      // Navigation & Actions
      close: 'Close',
      open: 'Open',
      expand: 'Expand',
      collapse: 'Collapse',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      continue: 'Continue',
      finish: 'Finish',
      submit: 'Submit',
      apply: 'Apply',

      // Data Display
      view: 'View',
      details: 'Details',
      preview: 'Preview',
      list: 'List',
      grid: 'Grid',
      table: 'Table',
      card: 'Card',

      // Time & Date
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      thisYear: 'This Year',
      date: 'Date',
      time: 'Time',

      // Form Fields
      name: 'Name',
      title: 'Title',
      description: 'Description',
      content: 'Content',
      category: 'Category',
      type: 'Type',
      status: 'Status',
      priority: 'Priority',

      // Common Messages
      noData: 'No data available',
      noResults: 'No results found',
      notFound: 'Not found',
      accessDenied: 'Access denied',
      sessionExpired: 'Session expired',
      connectionError: 'Connection error',

      // Validation Messages
      required: 'This field is required',
      invalid: 'Invalid data',
      tooShort: 'Too short',
      tooLong: 'Too long',
      invalidEmail: 'Invalid email address',
      invalidPhone: 'Invalid phone number',
      passwordMismatch: 'Passwords do not match',

      // Confirmation Messages
      confirmDelete: 'Are you sure you want to delete?',
      confirmSave: 'Do you want to save changes?',
      unsavedChanges: 'You have unsaved changes',
      operationSuccess: 'Operation successful',
      operationFailed: 'Operation failed',
    },
  },

  // HR module translations
  hr: {
    vi: {
      title: 'Quản lý Nhân sự',
      dashboard: 'Tổng quan',
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

      // Employee management
      employeeId: 'Mã nhân viên',
      fullName: 'Họ và tên',
      firstName: 'Tên',
      lastName: 'Họ',
      email: 'Email',
      phone: 'Số điện thoại',
      address: 'Địa chỉ',
      dateOfBirth: 'Ngày sinh',
      gender: 'Giới tính',
      male: 'Nam',
      female: 'Nữ',
      other: 'Khác',
      maritalStatus: 'Tình trạng hôn nhân',
      single: 'Độc thân',
      married: 'Đã kết hôn',
      divorced: 'Đã ly hôn',
      nationality: 'Quốc tịch',
      idNumber: 'Số CMND/CCCD',
      emergencyContact: 'Liên hệ khẩn cấp',

      // Employment details
      hireDate: 'Ngày bắt đầu làm việc',
      endDate: 'Ngày kết thúc',
      workLocation: 'Nơi làm việc',
      employmentType: 'Loại hợp đồng',
      fullTime: 'Toàn thời gian',
      partTime: 'Bán thời gian',
      contract: 'Hợp đồng',
      intern: 'Thực tập',
      status: 'Trạng thái',
      active: 'Hoạt động',
      inactive: 'Không hoạt động',
      terminated: 'Đã nghỉ việc',
      salary: 'Lương',
      baseSalary: 'Lương cơ bản',
      bonus: 'Thưởng',
      allowance: 'Phụ cấp',

      // Department management
      departmentName: 'Tên phòng ban',
      departmentCode: 'Mã phòng ban',
      manager: 'Trưởng phòng',
      description: 'Mô tả',
      budget: 'Ngân sách',
      employeeCount: 'Số lượng nhân viên',
      addDepartment: 'Thêm phòng ban',
      editDepartment: 'Sửa phòng ban',
      deleteDepartment: 'Xóa phòng ban',

      // Position management
      positionTitle: 'Chức danh',
      positionCode: 'Mã vị trí',
      level: 'Cấp bậc',
      requirements: 'Yêu cầu',
      responsibilities: 'Trách nhiệm',
      minSalary: 'Lương tối thiểu',
      maxSalary: 'Lương tối đa',
      addPosition: 'Thêm vị trí',
      editPosition: 'Sửa vị trí',
      deletePosition: 'Xóa vị trí',

      // Attendance
      checkIn: 'Giờ vào',
      checkOut: 'Giờ ra',
      totalHours: 'Tổng giờ làm',
      overtime: 'Giờ làm thêm',
      lateArrival: 'Đi muộn',
      earlyLeave: 'Về sớm',
      absent: 'Vắng mặt',
      present: 'Có mặt',
      attendanceReport: 'Báo cáo chấm công',
      workingDays: 'Ngày làm việc',

      // Leave management
      leaveType: 'Loại nghỉ phép',
      annualLeave: 'Nghỉ phép năm',
      sickLeave: 'Nghỉ ốm',
      maternityLeave: 'Nghỉ thai sản',
      personalLeave: 'Nghỉ cá nhân',
      startDate: 'Ngày bắt đầu',
      returnDate: 'Ngày trở lại',
      days: 'Số ngày',
      reason: 'Lý do',
      approver: 'Người phê duyệt',
      approved: 'Đã phê duyệt',
      pending: 'Chờ duyệt',
      rejected: 'Từ chối',
      remainingLeave: 'Phép còn lại',

      // Payroll
      payrollPeriod: 'Kỳ lương',
      grossSalary: 'Lương gốp',
      netSalary: 'Lương thực nhận',
      deductions: 'Các khoản trừ',
      tax: 'Thuế',
      insurance: 'Bảo hiểm',
      socialInsurance: 'Bảo hiểm xã hội',
      healthInsurance: 'Bảo hiểm y tế',
      unemploymentInsurance: 'Bảo hiểm thất nghiệp',
      payslip: 'Phiếu lương',
      generatePayroll: 'Tạo bảng lương',

      // Performance
      evaluation: 'Đánh giá',
      reviewPeriod: 'Kỳ đánh giá',
      goals: 'Mục tiêu',
      achievements: 'Thành tích',
      rating: 'Xếp hạng',
      excellent: 'Xuất sắc',
      good: 'Tốt',
      satisfactory: 'Đạt yêu cầu',
      needsImprovement: 'Cần cải thiện',
      poor: 'Kém',
      feedback: 'Phản hồi',
      developmentPlan: 'Kế hoạch phát triển',

      // Reports
      employeeReport: 'Báo cáo nhân viên',
      payrollReport: 'Báo cáo lương',
      leaveReport: 'Báo cáo nghỉ phép',
      turnoverReport: 'Báo cáo luân chuyển',
      recruitmentReport: 'Báo cáo tuyển dụng',
      exportReport: 'Xuất báo cáo',
      printReport: 'In báo cáo',

      // Common actions
      viewProfile: 'Xem hồ sơ',
      editProfile: 'Sửa hồ sơ',
      employeeDetails: 'Chi tiết nhân viên',
      personalInfo: 'Thông tin cá nhân',
      jobInfo: 'Thông tin công việc',
      documents: 'Tài liệu',
      uploadDocument: 'Tải lên tài liệu',
      downloadDocument: 'Tải xuống tài liệu',
    },
    en: {
      title: 'HR Management',
      dashboard: 'Dashboard',
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

      // Employee management
      employeeId: 'Employee ID',
      fullName: 'Full Name',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone Number',
      address: 'Address',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      maritalStatus: 'Marital Status',
      single: 'Single',
      married: 'Married',
      divorced: 'Divorced',
      nationality: 'Nationality',
      idNumber: 'ID Number',
      emergencyContact: 'Emergency Contact',

      // Employment details
      hireDate: 'Hire Date',
      endDate: 'End Date',
      workLocation: 'Work Location',
      employmentType: 'Employment Type',
      fullTime: 'Full Time',
      partTime: 'Part Time',
      contract: 'Contract',
      intern: 'Intern',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      terminated: 'Terminated',
      salary: 'Salary',
      baseSalary: 'Base Salary',
      bonus: 'Bonus',
      allowance: 'Allowance',

      // Department management
      departmentName: 'Department Name',
      departmentCode: 'Department Code',
      manager: 'Manager',
      description: 'Description',
      budget: 'Budget',
      employeeCount: 'Employee Count',
      addDepartment: 'Add Department',
      editDepartment: 'Edit Department',
      deleteDepartment: 'Delete Department',

      // Position management
      positionTitle: 'Position Title',
      positionCode: 'Position Code',
      level: 'Level',
      requirements: 'Requirements',
      responsibilities: 'Responsibilities',
      minSalary: 'Minimum Salary',
      maxSalary: 'Maximum Salary',
      addPosition: 'Add Position',
      editPosition: 'Edit Position',
      deletePosition: 'Delete Position',

      // Attendance
      checkIn: 'Check In',
      checkOut: 'Check Out',
      totalHours: 'Total Hours',
      overtime: 'Overtime',
      lateArrival: 'Late Arrival',
      earlyLeave: 'Early Leave',
      absent: 'Absent',
      present: 'Present',
      attendanceReport: 'Attendance Report',
      workingDays: 'Working Days',

      // Leave management
      leaveType: 'Leave Type',
      annualLeave: 'Annual Leave',
      sickLeave: 'Sick Leave',
      maternityLeave: 'Maternity Leave',
      personalLeave: 'Personal Leave',
      startDate: 'Start Date',
      returnDate: 'Return Date',
      days: 'Days',
      reason: 'Reason',
      approver: 'Approver',
      approved: 'Approved',
      pending: 'Pending',
      rejected: 'Rejected',
      remainingLeave: 'Remaining Leave',

      // Payroll
      payrollPeriod: 'Payroll Period',
      grossSalary: 'Gross Salary',
      netSalary: 'Net Salary',
      deductions: 'Deductions',
      tax: 'Tax',
      insurance: 'Insurance',
      socialInsurance: 'Social Insurance',
      healthInsurance: 'Health Insurance',
      unemploymentInsurance: 'Unemployment Insurance',
      payslip: 'Payslip',
      generatePayroll: 'Generate Payroll',

      // Performance
      evaluation: 'Evaluation',
      reviewPeriod: 'Review Period',
      goals: 'Goals',
      achievements: 'Achievements',
      rating: 'Rating',
      excellent: 'Excellent',
      good: 'Good',
      satisfactory: 'Satisfactory',
      needsImprovement: 'Needs Improvement',
      poor: 'Poor',
      feedback: 'Feedback',
      developmentPlan: 'Development Plan',

      // Reports
      employeeReport: 'Employee Report',
      payrollReport: 'Payroll Report',
      leaveReport: 'Leave Report',
      turnoverReport: 'Turnover Report',
      recruitmentReport: 'Recruitment Report',
      exportReport: 'Export Report',
      printReport: 'Print Report',

      // Common actions
      viewProfile: 'View Profile',
      editProfile: 'Edit Profile',
      employeeDetails: 'Employee Details',
      personalInfo: 'Personal Information',
      jobInfo: 'Job Information',
      documents: 'Documents',
      uploadDocument: 'Upload Document',
      downloadDocument: 'Download Document',
    },
  },

  // Call Center module translations
  callcenter: {
    vi: {
      title: 'Trung tâm Cuộc gọi',
      dashboard: 'Tổng quan cuộc gọi',
      callRecords: 'Lịch sử cuộc gọi',
      makeCall: 'Thực hiện cuộc gọi',
      hangUp: 'Kết thúc',
      calling: 'Đang gọi...',
      connected: 'Đã kết nối',
      ended: 'Đã kết thúc',
      failed: 'Cuộc gọi thất bại',
      sipConnected: 'SIP đã kết nối',
      sipDisconnected: 'SIP ngắt kết nối',
      customer: 'Khách hàng',
      phoneNumber: 'Số điện thoại',
      direction: 'Hướng',
      status: 'Trạng thái',
      duration: 'Thời lượng',
      time: 'Thời gian',
      actions: 'Hành động',
      viewDetails: 'Xem chi tiết',
      callDetails: 'Chi tiết cuộc gọi',
      notes: 'Ghi chú',
      saveNotes: 'Lưu ghi chú',
      refreshData: 'Làm mới dữ liệu',
      fromDate: 'Từ ngày',
      toDate: 'Đến ngày',
      searchPlaceholder: 'Tìm kiếm theo tên hoặc số điện thoại...',
      incomingCall: 'Cuộc gọi đến',
      outgoingCall: 'Cuộc gọi đi',
      activeCall: 'Cuộc gọi đang diễn ra',
      callHistory: 'Lịch sử cuộc gọi',
      pending: 'Chờ xử lý',
      inProgress: 'Đang xử lý',
      completed: 'Hoàn thành',
      missed: 'Nhỡ cuộc gọi',
      noRecords: 'Không có bản ghi nào',
      selectCall: 'Chọn cuộc gọi để xem chi tiết',
      addNotes: 'Thêm ghi chú cuộc gọi...',
      notesSaved: 'Ghi chú đã được lưu thành công!',
    },
    en: {
      title: 'Call Center',
      dashboard: 'Call Overview',
      callRecords: 'Call Records',
      makeCall: 'Make Call',
      hangUp: 'Hang Up',
      calling: 'Calling...',
      connected: 'Connected',
      ended: 'Ended',
      failed: 'Call Failed',
      sipConnected: 'SIP Connected',
      sipDisconnected: 'SIP Disconnected',
      customer: 'Customer',
      phoneNumber: 'Phone Number',
      direction: 'Direction',
      status: 'Status',
      duration: 'Duration',
      time: 'Time',
      actions: 'Actions',
      viewDetails: 'View Details',
      callDetails: 'Call Details',
      notes: 'Notes',
      saveNotes: 'Save Notes',
      refreshData: 'Refresh Data',
      fromDate: 'From Date',
      toDate: 'To Date',
      searchPlaceholder: 'Search by name or phone number...',
      incomingCall: 'Incoming Call',
      outgoingCall: 'Outgoing Call',
      activeCall: 'Active Call',
      callHistory: 'Call History',
      pending: 'Pending',
      inProgress: 'In Progress',
      completed: 'Completed',
      missed: 'Missed',
      noRecords: 'No records found',
      selectCall: 'Select a call to view details',
      addNotes: 'Add call notes...',
      notesSaved: 'Notes saved successfully!',
    },
  },

  // CRM module translations
  crm: {
    vi: {
      title: 'Quản lý Khách hàng',
      customers: 'Khách hàng',
      leads: 'Khách hàng tiềm năng',
      opportunities: 'Cơ hội',
      campaigns: 'Chiến dịch',
      analytics: 'Phân tích',
      facebook: 'Facebook',
      callCenter: 'Trung tâm cuộc gọi',
    },
    en: {
      title: 'Customer Relationship Management',
      customers: 'Customers',
      leads: 'Leads',
      opportunities: 'Opportunities',
      campaigns: 'Campaigns',
      analytics: 'Analytics',
      facebook: 'Facebook',
      callCenter: 'Call Center',
    },
  },

  // Website Management module translations
  website: {
    vi: {
      title: 'Quản lý Website',
      content: 'Nội dung',
      pages: 'Trang',
      media: 'Phương tiện',
      seo: 'SEO',
      analytics: 'Phân tích',
      settings: 'Cài đặt',
    },
    en: {
      title: 'Website Management',
      content: 'Content',
      pages: 'Pages',
      media: 'Media',
      seo: 'SEO',
      analytics: 'Analytics',
      settings: 'Settings',
    },
  },
};

// Translation namespaces type
export type TranslationNamespace = keyof typeof i18nConfig;
export type TranslationModule = Exclude<
  TranslationNamespace,
  'defaultLocale' | 'locales' | 'storageKey'
>;

// Helper function để lấy nested translation
function getNestedTranslation(obj: any, keys: string[]): string {
  return keys.reduce((current, key) => current?.[key], obj) || keys.join('.');
}

// Hook để sử dụng translations (sẽ được implement trong component)
export function createTranslationFunction(
  language: Language,
  module: TranslationModule = 'common'
) {
  const t = (key: string): string => {
    const keys = key.split('.');
    const moduleTranslations = i18nConfig[module] as any;
    const languageTranslations = moduleTranslations[language];

    if (!languageTranslations) {
      console.warn(`Translation module '${module}' not found for language '${language}'`);
      return key;
    }

    const translation = getNestedTranslation(languageTranslations, keys);

    if (!translation || translation === key) {
      // Fallback to default language (vi)
      const fallbackTranslations = moduleTranslations[i18nConfig.defaultLocale];
      const fallbackTranslation = getNestedTranslation(fallbackTranslations, keys);

      if (fallbackTranslation && fallbackTranslation !== key) {
        console.warn(
          `Translation key '${key}' not found for language '${language}', using fallback`
        );
        return fallbackTranslation;
      }

      console.warn(`Translation key '${key}' not found in module '${module}' for any language`);
      return key;
    }

    return translation;
  };

  return t;
}

// Hook wrapper để sử dụng với unified theme (sẽ được implement trong hooks folder)
export function useTranslation(module: TranslationModule = 'common') {
  // Placeholder - sẽ được override bởi hook thực tế
  return {
    t: (key: string) => key,
    language: 'vi' as Language,
  };
}

// Utility function để lấy translation mà không cần hook (server-side)
export function getTranslation(
  module: TranslationModule,
  key: string,
  language: Language = 'vi'
): string {
  const keys = key.split('.');
  const moduleTranslations = i18nConfig[module] as any;
  const languageTranslations = moduleTranslations[language];

  if (!languageTranslations) {
    return key;
  }

  const translation = getNestedTranslation(languageTranslations, keys);
  return translation || key;
}

// Export types for better TypeScript support
export type Translations = typeof i18nConfig;
export type CommonKeys = keyof typeof i18nConfig.common.vi;
export type HRKeys = keyof typeof i18nConfig.hr.vi;
export type CallCenterKeys = keyof typeof i18nConfig.callcenter.vi;
export type CRMKeys = keyof typeof i18nConfig.crm.vi;
export type WebsiteKeys = keyof typeof i18nConfig.website.vi;
