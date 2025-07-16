'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PhoneIcon,
  UserIcon,
  KeyIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Extension, ExtensionFormData, User } from '../types/callcenter.types';
import { useExtensions } from '../hooks/useExtensions';
import { CallCenterAPIService } from '../services/api.service';

interface ExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  extension?: Extension | null;
  onSave: (data: ExtensionFormData) => Promise<void>;
  users: User[];
}

function ExtensionModal({ isOpen, onClose, extension, onSave, users }: ExtensionModalProps) {
  const [formData, setFormData] = useState<ExtensionFormData>({
    extCode: '',
    password: '',
    userId: '',
    description: '',
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (extension) {
      setFormData({
        extCode: extension.extCode,
        password: extension.password,
        userId: extension.userId || '',
        description: extension.description || '',
        status: extension.status
      });
    } else {
      setFormData({
        extCode: '',
        password: '',
        userId: '',
        description: '',
        status: 'active'
      });
    }
    setErrors({});
  }, [extension, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.extCode.trim()) {
      newErrors.extCode = 'Mã extension là bắt buộc';
    } else if (!/^\d{3,6}$/.test(formData.extCode)) {
      newErrors.extCode = 'Mã extension phải từ 3-6 chữ số';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu extension:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {extension ? 'Chỉnh sửa Extension' : 'Tạo Extension mới'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mã Extension *
            </label>
            <input
              type="text"
              value={formData.extCode}
              onChange={(e) => setFormData({ ...formData, extCode: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.extCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } dark:bg-gray-700 dark:text-white`}
              placeholder="vd: 1001"
            />
            {errors.extCode && (
              <p className="text-red-500 text-sm mt-1">{errors.extCode}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mật khẩu *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-3 py-2 pr-24 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                onClick={generatePassword}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Tạo tự động
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gán cho người dùng
            </label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Chọn người dùng</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.displayName} ({user.email || user.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Mô tả tùy chọn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trạng thái
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang lưu...' : (extension ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ExtensionManagement() {
  const { extensions, loading, error, createExtension, updateExtension, deleteExtension } = useExtensions();
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedExtension, setSelectedExtension] = useState<Extension | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const userData = await CallCenterAPIService.getUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error);
    }
  };

  const handleCreateExtension = () => {
    setSelectedExtension(undefined);
    setShowModal(true);
  };

  const handleEditExtension = (extension: Extension) => {
    setSelectedExtension(extension);
    setShowModal(true);
  };

  const handleDeleteExtension = async (extension: Extension) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa extension ${extension.extCode}?`)) {
      try {
        await deleteExtension(extension.id);
      } catch (error) {
        console.error('Lỗi khi xóa extension:', error);
      }
    }
  };

  const handleSaveExtension = async (data: ExtensionFormData) => {
    if (selectedExtension) {
      await updateExtension(selectedExtension.id, data);
    } else {
      await createExtension(data);
    }
  };

  const filteredExtensions:any = extensions
  // const filteredExtensions:any = extensions.filter((extension:any) => {
  // const matchesSearch = extension.extCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //                        extension.user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //                        extension.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
  //   const matchesStatus = statusFilter === 'all' || extension.status === statusFilter;
    
  //   return matchesSearch && matchesStatus;
  // });

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    return status === 'active' 
      ? `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`
      : `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? 'Hoạt động' : 'Không hoạt động';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Extension</h1>
          <p className="text-gray-600 dark:text-gray-400">Quản lý extension SIP và phân công người dùng</p>
        </div>
        <button
          onClick={handleCreateExtension}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Thêm Extension</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm extension..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            Tổng cộng: {filteredExtensions.length} extension
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Extensions Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Đang tải extension...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Extension
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Người dùng được gán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredExtensions.map((extension:any) => (
                  <tr key={extension.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {extension.extCode}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {extension.user ? (
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {extension.user.displayName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {extension.user.email || extension.user.phone}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Chưa được gán</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(extension.status)}>
                        {getStatusText(extension.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {extension.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(extension.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditExtension(extension)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExtension(extension)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Xóa"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredExtensions.length === 0 && !loading && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Không tìm thấy extension nào. Tạo extension đầu tiên để bắt đầu.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <ExtensionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        extension={selectedExtension || null}
        onSave={handleSaveExtension}
        users={users}
      />
    </div>
  );
}
