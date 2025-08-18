'use client';

import React, { useState, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  RefreshCw, 
  X, 
  Plus,
  SlidersHorizontal,
  FileSpreadsheet,
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';

interface AdvancedFilters {
  search?: string;
  department?: string;
  position?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDateFrom?: string;
  startDateTo?: string;
  salaryFrom?: number;
  salaryTo?: number;
  company?: string;
}

interface EmployeeToolbarProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: Partial<AdvancedFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onExport: (format: 'xlsx' | 'csv') => void;
  onImport: (file: File) => void;
  onAddEmployee: () => void;
  loading?: boolean;
  totalCount?: number;
}

export default function EmployeeToolbar({
  filters,
  onFiltersChange,
  onClearFilters,
  onRefresh,
  onExport,
  onImport,
  onAddEmployee,
  loading = false,
  totalCount = 0
}: EmployeeToolbarProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const departments = [
    'Công nghệ thông tin',
    'Nhân sự', 
    'Tài chính',
    'Kinh doanh',
    'Marketing',
    'Vận hành'
  ];

  const statusOptions = [
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Tạm nghỉ' },
    { value: 'terminated', label: 'Đã nghỉ việc' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Họ tên' },
    { value: 'employeeCode', label: 'Mã nhân viên' },
    { value: 'department', label: 'Phòng ban' },
    { value: 'position', label: 'Chức vụ' },
    { value: 'startDate', label: 'Ngày bắt đầu' },
    { value: 'createdAt', label: 'Ngày tạo' }
  ];

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'page' && key !== 'pageSize' && value !== undefined && value !== ''
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 space-y-4">
      {/* Main Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Left Section - Search & Filters */}
        <div className="flex flex-1 gap-2 items-center min-w-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3 py-2 rounded-lg border transition-colors ${
              showAdvancedFilters || hasActiveFilters
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              title="Xóa bộ lọc"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex gap-2">
          {/* Add Employee */}
          <button
            onClick={onAddEmployee}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                     flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm nhân viên
          </button>

          {/* Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600
                     flex items-center gap-2"
            title="Nhập từ Excel/CSV"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Nhập</span>
          </button>

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600
                       flex items-center gap-2"
              title="Xuất dữ liệu"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Xuất</span>
            </button>

            {/* Export Menu */}
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 
                           border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[160px]">
                <button
                  onClick={() => {
                    onExport('xlsx');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700
                           flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Xuất Excel (.xlsx)
                </button>
                <button
                  onClick={() => {
                    onExport('csv');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700
                           flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  <FileText className="w-4 h-4" />
                  Xuất CSV (.csv)
                </button>
              </div>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600
                     disabled:opacity-50 disabled:cursor-not-allowed"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Results Count */}
      {totalCount > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Tìm thấy {totalCount} nhân viên
          {hasActiveFilters && ' (đã lọc)'}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phòng ban
              </label>
              <select
                value={filters.department || ''}
                onChange={(e) => onFiltersChange({ department: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Tất cả</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trạng thái
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => onFiltersChange({ status: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Tất cả</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sắp xếp theo
              </label>
              <select
                value={filters.sortBy || ''}
                onChange={(e) => onFiltersChange({ sortBy: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Mặc định</option>
                {sortOptions.map(sort => (
                  <option key={sort.value} value={sort.value}>{sort.label}</option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            {filters.sortBy && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Thứ tự
                </label>
                <select
                  value={filters.sortOrder || 'asc'}
                  onChange={(e) => onFiltersChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="asc">Tăng dần</option>
                  <option value="desc">Giảm dần</option>
                </select>
              </div>
            )}

            {/* Position Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Chức vụ
              </label>
              <input
                type="text"
                placeholder="Nhập chức vụ..."
                value={filters.position || ''}
                onChange={(e) => onFiltersChange({ position: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Company Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Công ty
              </label>
              <input
                type="text"
                placeholder="Nhập tên công ty..."
                value={filters.company || ''}
                onChange={(e) => onFiltersChange({ company: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Start Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="inline w-4 h-4 mr-1" />
                Bắt đầu từ
              </label>
              <input
                type="date"
                value={filters.startDateFrom || ''}
                onChange={(e) => onFiltersChange({ startDateFrom: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Start Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="inline w-4 h-4 mr-1" />
                Bắt đầu đến
              </label>
              <input
                type="date"
                value={filters.startDateTo || ''}
                onChange={(e) => onFiltersChange({ startDateTo: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Click outside to close menus */}
      {(showExportMenu || showAdvancedFilters) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowExportMenu(false);
            // Don't auto-close advanced filters on outside click
          }}
        />
      )}
    </div>
  );
}
