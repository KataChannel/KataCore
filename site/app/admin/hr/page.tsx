```tsx
'use client';

import { useTranslation } from '@/src/hooks/useTranslation';
import {
  UserGroupIcon,
  CheckBadgeIcon,
  CalendarDaysIcon,
  SparklesIcon,
  UserIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

export default function HRDashboard() {
  const { t } = useTranslation('hr');
  const { t: tCommon } = useTranslation('common');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-2">{t('dashboard')}</p>
        </div>
        <div className="flex space-x-4">
          <button className="mono-button primary">
            {t('addEmployee')}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="mono-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">{t('totalEmployees')}</p>
              <p className="text-2xl font-bold text-primary">245</p>
            </div>
          </div>
        </div>
        
        <div className="mono-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckBadgeIcon className="h-8 w-8 text-accent" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">{t('activeEmployees')}</p>
              <p className="text-2xl font-bold text-accent">232</p>
            </div>
          </div>
        </div>
        
        <div className="mono-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarDaysIcon className="h-8 w-8 text-warning" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">{t('onLeave')}</p>
              <p className="text-2xl font-bold text-warning">8</p>
            </div>
          </div>
        </div>
        
        <div className="mono-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <SparklesIcon className="h-8 w-8 text-success" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">{t('newHires')}</p>
              <p className="text-2xl font-bold text-success">5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="mono-card">
          <h3 className="text-lg font-semibold text-primary mb-4">{t('employees')}</h3>
          <p className="text-text-secondary mb-4">{tCommon('view')} và {tCommon('edit')} thông tin nhân viên</p>
          <div className="mono-button primary w-full">
            {tCommon('view')} {t('employees')}
          </div>
        </div>

        <div className="mono-card">
          <h3 className="text-lg font-semibold text-primary mb-4">{t('attendance')}</h3>
          <p className="text-text-secondary mb-4">Quản lý chấm công và theo dõi giờ làm việc</p>
          <div className="mono-button primary w-full">
            {tCommon('view')} {t('attendance')}
          </div>
        </div>

        <div className="mono-card">
          <h3 className="text-lg font-semibold text-primary mb-4">{t('departments')}</h3>
          <p className="text-text-secondary mb-4">Tổ chức và quản lý phòng ban</p>
          <div className="mono-button primary w-full">
            {tCommon('view')} {t('departments')}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="mono-card">
          <h3 className="text-lg font-semibold text-primary mb-4">Hoạt động gần đây</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center space-x-3 p-3 bg-mono-50 rounded-lg">
                <div className="flex-shrink-0">
                  <UserIcon className="h-6 w-6 text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    Nguyễn Văn A đã check-in
                  </p>
                  <p className="text-sm text-text-secondary">
                    2 phút trước
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <button className="mono-button ghost w-full">
              {tCommon('view')} tất cả hoạt động
            </button>
          </div>
        </div>

        <div className="mono-card">
          <h3 className="text-lg font-semibold text-primary mb-4">Thống kê phòng ban</h3>
          <div className="h-64 rounded-lg bg-mono-50 flex items-center justify-center">
            <div className="text-center">
              <BuildingOfficeIcon className="h-12 w-12 text-text-secondary mx-auto mb-2" />
              <p className="text-text-secondary">Biểu đồ phân bố nhân viên theo phòng ban</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <button className="mono-button ghost w-full">
              {tCommon('view')} tất cả {t('departments')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```