'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PhoneIcon,
  UserIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { Extension, ExtensionFormData, User } from '../types/callcenter.types';
import { useExtensions } from '../hooks/useExtensions';
import { CallCenterAPIService } from '../services/api.service';

// Import utilities
import * as XLSX from 'xlsx';

interface ExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  extension?: Extension | null;
  onSave: (data: ExtensionFormData) => Promise<void>;
  users: User[];
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (extensions: ExtensionFormData[]) => Promise<void>;
  users: User[];
}

type SortField = 'extCode' | 'name' | 'status' | 'createdAt' | 'user';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// ImportModal component remains the same
function ImportModal({ isOpen, onClose, onImport, users }: ImportModalProps) {
  const [importType, setImportType] = useState<'csv' | 'excel' | 'json'>('csv');
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setPreviewData([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');

    try {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      let data: any[] = [];

      if (fileExtension === 'json') {
        const text = await selectedFile.text();
        data = JSON.parse(text);
      } else if (fileExtension === 'csv' || fileExtension === 'xlsx' || fileExtension === 'xls') {
        const buffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('File không chứa sheet nào');
        }
        const firstSheet = workbook.Sheets[firstSheetName];
        if (!firstSheet) {
          throw new Error('Không thể đọc sheet');
        }
        data = XLSX.utils.sheet_to_json(firstSheet);
      } else {
        throw new Error('Định dạng file không được hỗ trợ');
      }

      // Validate and transform data
      const validatedData = data.map((row, index) => {
        const extCode = String(row.extCode || row['Mã Extension'] || row['Extension Code'] || '').trim();
        const password = String(row.password || row['Mật khẩu'] || row['Password'] || '').trim();
        const name = String(row.name || row['Tên'] || row['Name'] || '').trim();
        const description = String(row.description || row['Mô tả'] || row['Description'] || '').trim();
        const status = String(row.status || row['Trạng thái'] || row['Status'] || 'active').toLowerCase();
        const userEmail = String(row.userEmail || row['Email người dùng'] || row['User Email'] || '').trim();

        // Find user by email
        const user = userEmail ? users.find(u => u.email === userEmail) : null;

        return {
          row: index + 1,
          extCode,
          password,
          name: name || `Extension ${extCode}`,
          description,
          status: status === 'inactive' ? 'inactive' : 'active',
          userId: user?.id || '',
          userEmail,
          isValid: extCode !== '' && password !== '' && /^\d{3,6}$/.test(extCode) && password.length >= 6
        };
      });

      setPreviewData(validatedData);
    } catch (err) {
      setError(`Lỗi khi đọc file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;

    const validExtensions = previewData.filter(item => item.isValid);
    if (validExtensions.length === 0) {
      setError('Không có extension hợp lệ để import');
      return;
    }

    setIsProcessing(true);
    try {
      const extensionsToImport: ExtensionFormData[] = validExtensions.map(item => ({
        extCode: item.extCode,
        password: item.password,
        name: item.name,
        description: item.description,
        status: item.status as 'active' | 'inactive',
        userId: item.userId
      }));

      await onImport(extensionsToImport);
      onClose();
    } catch (err) {
      setError(`Lỗi khi import: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'extCode': '1001',
        'password': 'password123',
        'name': 'Extension 1001',
        'description': 'Mô tả extension',
        'status': 'active',
        'userEmail': 'user@example.com'
      }
    ];

    let content = '';
    let filename = '';

    if (importType === 'json') {
      content = JSON.stringify(template, null, 2);
      filename = 'extension_template.json';
    } else if (importType === 'csv') {
      const headers = Object.keys(template[0]!).join(',');
      const rows = template.map(item => Object.values(item).join(','));
      content = [headers, ...rows].join('\n');
      filename = 'extension_template.csv';
    } else {
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Extensions');
      XLSX.writeFile(wb, 'extension_template.xlsx');
      return;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Import Extensions
          </h2>
          <button
            onClick={downloadTemplate}
            className="flex items-center space-x-2 text-sm bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Tải template</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* File Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Định dạng file
            </label>
            <div className="flex space-x-4">
              {(['csv', 'excel', 'json'] as const).map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    name="importType"
                    value={type}
                    checked={importType === type}
                    onChange={(e) => setImportType(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {type === 'excel' ? 'Excel (.xlsx)' : type.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn file
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept={
                importType === 'csv' ? '.csv' :
                importType === 'excel' ? '.xlsx,.xls' :
                '.json'
              }
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Preview Data */}
          {previewData.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Xem trước dữ liệu ({previewData.filter(item => item.isValid).length}/{previewData.length} hợp lệ)
              </h3>
              <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Dòng</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Extension</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tên</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email User</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Trạng thái</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Hợp lệ</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {previewData.map((item, index) => (
                      <tr key={index} className={item.isValid ? '' : 'bg-red-50 dark:bg-red-900/20'}>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.row}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.extCode}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.userEmail || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.status}</td>
                        <td className="px-4 py-2 text-sm">
                          {item.isValid ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-red-600">✗</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Hủy
            </button>
            <button
              onClick={handleImport}
              disabled={isProcessing || previewData.filter(item => item.isValid).length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Đang import...' : `Import ${previewData.filter(item => item.isValid).length} extensions`}
            </button>
          </div>
        </div>

        {/* Format Information */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Định dạng dữ liệu:</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• <strong>extCode:</strong> Mã extension (3-6 chữ số, bắt buộc)</li>
            <li>• <strong>password:</strong> Mật khẩu (ít nhất 6 ký tự, bắt buộc)</li>
            <li>• <strong>name:</strong> Tên extension (tùy chọn)</li>
            <li>• <strong>description:</strong> Mô tả (tùy chọn)</li>
            <li>• <strong>status:</strong> active hoặc inactive (mặc định: active)</li>
            <li>• <strong>userEmail:</strong> Email người dùng để gán extension (tùy chọn)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ExtensionModal component remains the same
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
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedExtension, setSelectedExtension] = useState<Extension | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [userFilter, setUserFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', direction: 'desc' });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Enhanced filtering and sorting logic
  const filteredAndSortedExtensions = useMemo(() => {
    let filtered = extensions.filter((extension: any) => {
      // Search filter
      const matchesSearch = 
        extension.extCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        extension.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        extension.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        extension.users?.some((user: any) => 
          user.user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Status filter
      const matchesStatus = statusFilter === 'all' || extension.status === statusFilter;

      // User assignment filter
      const matchesUserFilter = 
        userFilter === 'all' ||
        (userFilter === 'assigned' && extension.users && extension.users.length > 0) ||
        (userFilter === 'unassigned' && (!extension.users || extension.users.length === 0));

      return matchesSearch && matchesStatus && matchesUserFilter;
    });

    // Sorting
    filtered.sort((a: any, b: any) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.field) {
        case 'extCode':
          aValue = parseInt(a.extCode) || 0;
          bValue = parseInt(b.extCode) || 0;
          break;
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'user':
          aValue = a.users?.[0]?.user?.displayName || '';
          bValue = b.users?.[0]?.user?.displayName || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [extensions, searchTerm, statusFilter, userFilter, sortConfig]);

  // Pagination
  const totalItems = filteredAndSortedExtensions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedExtensions = filteredAndSortedExtensions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const statistics = useMemo(() => {
    const total = extensions.length;
    const active = extensions.filter((ext: any) => ext.status === 'active').length;
    const inactive = extensions.filter((ext: any) => ext.status === 'inactive').length;
    const assigned = extensions.filter((ext: any) => ext.users && ext.users.length > 0).length;
    const unassigned = total - assigned;

    return { total, active, inactive, assigned, unassigned };
  }, [extensions]);

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ChevronDownIcon className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUpIcon className="h-4 w-4 text-blue-600" />
      : <ArrowDownIcon className="h-4 w-4 text-blue-600" />;
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, userFilter, sortConfig]);

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

  const handleImportExtensions = async (extensionsData: ExtensionFormData[]) => {
    const results = await Promise.allSettled(
      extensionsData.map(data => createExtension(data))
    );
    
    const successCount = results.filter(result => result.status === 'fulfilled').length;
    const failCount = results.filter(result => result.status === 'rejected').length;
    
    if (failCount > 0) {
      alert(`Import hoàn tất: ${successCount} thành công, ${failCount} thất bại`);
    } else {
      alert(`Import thành công ${successCount} extensions`);
    }
  };

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
        <div className="flex space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            <ArrowUpTrayIcon className="h-5 w-5" />
            <span>Import Extensions</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Thêm Extension</span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={() => {
                    handleCreateExtension();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Tạo Extension đơn lẻ
                </button>
                <button
                  onClick={() => {
                    setShowImportModal(true);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Import từ file
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <PhoneIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng Extensions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hoạt động</p>
              <p className="text-2xl font-bold text-green-600">{statistics.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Không hoạt động</p>
              <p className="text-2xl font-bold text-red-600">{statistics.inactive}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Đã gán</p>
              <p className="text-2xl font-bold text-purple-600">{statistics.assigned}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-gray-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chưa gán</p>
              <p className="text-2xl font-bold text-gray-600">{statistics.unassigned}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm extension, tên, người dùng..."
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

          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value as 'all' | 'assigned' | 'unassigned')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tất cả assignment</option>
            <option value="assigned">Đã gán người dùng</option>
            <option value="unassigned">Chưa gán người dùng</option>
          </select>

          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value={5}>5 mục/trang</option>
            <option value={10}>10 mục/trang</option>
            <option value={25}>25 mục/trang</option>
            <option value={50}>50 mục/trang</option>
          </select>
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>
            Hiển thị {paginatedExtensions.length} trong số {totalItems} extension
            {searchTerm || statusFilter !== 'all' || userFilter !== 'all' ? ' (đã lọc)' : ''}
          </span>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-4 w-4" />
            <span>
              {(searchTerm || statusFilter !== 'all' || userFilter !== 'all') && 'Bộ lọc đang hoạt động'}
            </span>
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
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('extCode')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Extension</span>
                        {getSortIcon('extCode')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('user')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Người dùng được gán</span>
                        {getSortIcon('user')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Trạng thái</span>
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Ngày tạo</span>
                        {getSortIcon('createdAt')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedExtensions.map((extension: any) => (
                    <tr key={extension.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {extension.extCode}
                            </span>
                            {extension.name && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {extension.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {extension.users && extension.users.length > 0 ? (
                          <div className="flex items-center">
                            <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {extension.users[0].user?.displayName || 'Không có tên'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {extension.users[0].user?.email || extension.users[0].user?.phone || 'Không có thông tin liên hệ'}
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
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
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
              
              {paginatedExtensions.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm || statusFilter !== 'all' || userFilter !== 'all' 
                    ? 'Không tìm thấy extension nào phù hợp với bộ lọc.' 
                    : 'Không tìm thấy extension nào. Tạo extension đầu tiên để bắt đầu.'}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Hiển thị{' '}
                      <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, totalItems)}
                      </span>{' '}
                      trong{' '}
                      <span className="font-medium">{totalItems}</span> kết quả
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Trang trước</span>
                        <ChevronDownIcon className="h-5 w-5 rotate-90" aria-hidden="true" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNumber
                                ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-200'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Trang sau</span>
                        <ChevronDownIcon className="h-5 w-5 -rotate-90" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ExtensionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        extension={selectedExtension || null}
        onSave={handleSaveExtension}
        users={users}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportExtensions}
        users={users}
      />
    </div>
  );
}
