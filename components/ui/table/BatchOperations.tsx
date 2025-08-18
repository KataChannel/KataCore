'use client';

import React, { useState } from 'react';
import { useToastActions } from '@/components/ui/toast/ToastProvider';
import { Employee } from '@/hooks/useEmployees';
import { 
  Edit3, 
  Trash2, 
  UserCheck, 
  UserX, 
  Download,
  Settings,
  ChevronDown
} from 'lucide-react';

interface BatchOperationsProps {
  selectedEmployees: string[];
  employees: Employee[];
  onBulkUpdate: (employeeIds: string[], updates: Partial<Employee>) => Promise<void>;
  onBulkDelete: (employeeIds: string[]) => Promise<void>;
  onExport: (employeeIds: string[]) => Promise<void>;
  onClearSelection: () => void;
}

export function BatchOperations({
  selectedEmployees,
  employees,
  onBulkUpdate,
  onBulkDelete,
  onExport,
  onClearSelection
}: BatchOperationsProps) {
  const { success, error, warning } = useToastActions();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState<Partial<Employee>>({});

  if (selectedEmployees.length === 0) return null;

  const selectedCount = selectedEmployees.length;
  const selectedEmployeeData = employees.filter(emp => selectedEmployees.includes(emp.id));

  const handleBulkStatusUpdate = async (status: Employee['status']) => {
    try {
      await onBulkUpdate(selectedEmployees, { status });
      success(
        'Cập nhật trạng thái thành công',
        `Đã cập nhật trạng thái cho ${selectedCount} nhân viên`
      );
      onClearSelection();
    } catch (err) {
      error('Lỗi cập nhật', 'Không thể cập nhật trạng thái. Vui lòng thử lại.');
    }
  };

  const handleBulkEdit = async () => {
    if (!bulkEditData || Object.keys(bulkEditData).length === 0) {
      warning('Chưa có thay đổi', 'Vui lòng nhập thông tin cần cập nhật');
      return;
    }

    try {
      await onBulkUpdate(selectedEmployees, bulkEditData);
      success(
        'Cập nhật hàng loạt thành công',
        `Đã cập nhật thông tin cho ${selectedCount} nhân viên`
      );
      setBulkEditData({});
      setIsBulkEditOpen(false);
      onClearSelection();
    } catch (err) {
      error('Lỗi cập nhật', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedCount} nhân viên đã chọn? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      await onBulkDelete(selectedEmployees);
      success(
        'Xóa hàng loạt thành công',
        `Đã xóa ${selectedCount} nhân viên`
      );
      onClearSelection();
    } catch (err) {
      error('Lỗi xóa', 'Không thể xóa nhân viên. Vui lòng thử lại.');
    }
  };

  const handleExport = async () => {
    try {
      await onExport(selectedEmployees);
      success(
        'Xuất dữ liệu thành công',
        `Đã xuất thông tin ${selectedCount} nhân viên`
      );
    } catch (err) {
      error('Lỗi xuất dữ liệu', 'Không thể xuất dữ liệu. Vui lòng thử lại.');
    }
  };

  return (
    <>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {selectedCount}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {selectedCount} nhân viên đã chọn
              </span>
            </div>
            
            <button
              onClick={onClearSelection}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Bỏ chọn tất cả
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick Actions */}
            <button
              onClick={() => handleBulkStatusUpdate('active')}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
            >
              <UserCheck className="w-4 h-4 mr-1" />
              Kích hoạt
            </button>

            <button
              onClick={() => handleBulkStatusUpdate('inactive')}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
            >
              <UserX className="w-4 h-4 mr-1" />
              Tạm nghỉ
            </button>

            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
            >
              <Download className="w-4 h-4 mr-1" />
              Xuất
            </button>

            {/* More Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Settings className="w-4 h-4 mr-1" />
                Thêm
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsBulkEditOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Chỉnh sửa hàng loạt
                    </button>
                    
                    <button
                      onClick={() => {
                        handleBulkDelete();
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa hàng loạt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Edit Modal */}
      {isBulkEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Chỉnh sửa hàng loạt
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Cập nhật thông tin cho {selectedCount} nhân viên đã chọn
              </p>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phòng ban
                </label>
                <select
                  value={bulkEditData.department || ''}
                  onChange={(e) => setBulkEditData((prev: Partial<Employee>) => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">-- Không thay đổi --</option>
                  <option value="Nhân sự">Nhân sự</option>
                  <option value="Kế toán">Kế toán</option>
                  <option value="Kinh doanh">Kinh doanh</option>
                  <option value="Kỹ thuật">Kỹ thuật</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chức vụ
                </label>
                <input
                  type="text"
                  value={bulkEditData.position || ''}
                  onChange={(e) => setBulkEditData((prev: Partial<Employee>) => ({ ...prev, position: e.target.value }))}
                  placeholder="Nhập chức vụ mới"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trạng thái
                </label>
                <select
                  value={bulkEditData.status || ''}
                  onChange={(e) => setBulkEditData((prev: Partial<Employee>) => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">-- Không thay đổi --</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm nghỉ</option>
                  <option value="terminated">Đã nghỉ</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsBulkEditOpen(false);
                  setBulkEditData({});
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={handleBulkEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
