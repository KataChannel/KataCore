'use client';

import React, { useState, useEffect } from 'react';
import { useToastActions } from '@/components/ui/toast/ToastProvider';
import { Employee } from '@/hooks/useEmployees';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Edit,
  Save,
  X,
  ChevronLeft,
  FileText,
  Clock,
  DollarSign,
  Award
} from 'lucide-react';

interface EmployeeDetailViewProps {
  employee: Employee;
  onClose: () => void;
  onUpdate: (updates: Partial<Employee>) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function EmployeeDetailView({ 
  employee, 
  onClose, 
  onUpdate,
  onDelete 
}: EmployeeDetailViewProps) {
  const { success, error } = useToastActions();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Employee>>(employee);
  const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'history'>('info');

  useEffect(() => {
    setEditData(employee);
  }, [employee]);

  const handleSave = async () => {
    try {
      await onUpdate(editData);
      setIsEditing(false);
      success('Cập nhật thành công', 'Thông tin nhân viên đã được cập nhật');
    } catch (err) {
      error('Lỗi cập nhật', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  const handleCancel = () => {
    setEditData(employee);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'terminated':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Tạm nghỉ';
      case 'terminated': return 'Đã nghỉ';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {employee.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {employee.employeeCode} • {employee.position}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                >
                  <X className="w-4 h-4 mr-1" />
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Lưu
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md"
              >
                <Edit className="w-4 h-4 mr-1" />
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'info', label: 'Thông tin cơ bản', icon: User },
              { id: 'documents', label: 'Tài liệu', icon: FileText },
              { id: 'history', label: 'Lịch sử', icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Thông tin cá nhân
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mã nhân viên
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.employeeCode || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, employeeCode: e.target.value }))}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                          {employee.employeeCode || 'Chưa có'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Họ và tên
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          {employee.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editData.email || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {employee.email || 'Chưa có'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Số điện thoại
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editData.phone || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {employee.phone || 'Chưa có'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Thông tin công việc
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phòng ban
                      </label>
                      {isEditing ? (
                        <select
                          value={editData.department || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, department: e.target.value }))}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        >
                          <option value="">Chọn phòng ban</option>
                          <option value="Nhân sự">Nhân sự</option>
                          <option value="Kế toán">Kế toán</option>
                          <option value="Kinh doanh">Kinh doanh</option>
                          <option value="Kỹ thuật">Kỹ thuật</option>
                          <option value="Marketing">Marketing</option>
                        </select>
                      ) : (
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 flex items-center">
                          <Building className="w-4 h-4 mr-2 text-gray-400" />
                          {employee.department || 'Chưa có'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Chức vụ
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.position || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, position: e.target.value }))}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 flex items-center">
                          <Award className="w-4 h-4 mr-2 text-gray-400" />
                          {employee.position || 'Chưa có'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Trạng thái
                      </label>
                      {isEditing ? (
                        <select
                          value={editData.status || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        >
                          <option value="active">Hoạt động</option>
                          <option value="inactive">Tạm nghỉ</option>
                          <option value="terminated">Đã nghỉ</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                          {getStatusText(employee.status)}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ngày bắt đầu
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editData.startDate ? editData.startDate.split('T')[0] : ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, startDate: e.target.value }))}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {employee.startDate ? new Date(employee.startDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Công ty
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.company || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, company: e.target.value }))}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                          {employee.company || 'Chưa có'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Thông tin hệ thống
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Ngày tạo:</span> {new Date(employee.createdAt).toLocaleString('vi-VN')}
                  </div>
                  <div>
                    <span className="font-medium">Cập nhật lần cuối:</span> {new Date(employee.updatedAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Chưa có tài liệu
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Tính năng quản lý tài liệu sẽ được cập nhật trong phiên bản tiếp theo
                </p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Chưa có lịch sử
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Lịch sử thay đổi sẽ được ghi lại từ lần cập nhật tiếp theo
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {onDelete && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              onClick={onDelete}
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              Xóa nhân viên
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
