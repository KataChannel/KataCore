'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/app/hooks/useAuth';

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  type: string;
  reason: string;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  notes?: string;
  createdAt: string;
  employee: {
    id: string;
    fullName: string;
    employeeId: string;
    position: {
      title: string;
      department: {
        name: string;
      };
    };
    user?: {
      avatar?: string;
    };
  };
}

interface Employee {
  id: string;
  fullName: string;
  employeeId: string;
}

const LeaveRequestManagement: React.FC = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    type: 'ANNUAL',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchLeaveRequests();
    fetchEmployees();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch('/api/hr/leave-requests');
      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(data.data || []);
      } else {
        setError('Không thể tải danh sách đơn nghỉ phép');
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setError('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/hr/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleOpenModal = (request?: LeaveRequest) => {
    if (request) {
      setSelectedRequest(request);
      setFormData({
        employeeId: request.employee.id,
        startDate: request.startDate.split('T')[0],
        endDate: request.endDate.split('T')[0],
        type: request.type,
        reason: request.reason,
        notes: request.notes || ''
      });
    } else {
      setSelectedRequest(null);
      setFormData({
        employeeId: '',
        startDate: '',
        endDate: '',
        type: 'ANNUAL',
        reason: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setError('');
  };

  const handleSave = async () => {
    try {
      if (!formData.employeeId || !formData.startDate || !formData.endDate || !formData.reason) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      // Calculate days
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const timeDiff = endDate.getTime() - startDate.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

      const method = selectedRequest ? 'PUT' : 'POST';
      const url = selectedRequest 
        ? `/api/hr/leave-requests/${selectedRequest.id}`
        : '/api/hr/leave-requests';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          days
        }),
      });

      if (response.ok) {
        await fetchLeaveRequests();
        handleCloseModal();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Có lỗi xảy ra khi lưu');
      }
    } catch (error) {
      console.error('Error saving leave request:', error);
      setError('Lỗi kết nối đến server');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ phê duyệt';
      case 'APPROVED':
        return 'Đã phê duyệt';
      case 'REJECTED':
        return 'Đã từ chối';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getLeaveTypeText = (type: string) => {
    switch (type) {
      case 'ANNUAL':
        return 'Nghỉ phép năm';
      case 'SICK':
        return 'Nghỉ ốm';
      case 'PERSONAL':
        return 'Nghỉ cá nhân';
      case 'MATERNITY':
        return 'Nghỉ thai sản';
      case 'PATERNITY':
        return 'Nghỉ chăm con';
      case 'EMERGENCY':
        return 'Nghỉ khẩn cấp';
      default:
        return type;
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = request.employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-600">Bạn cần đăng nhập để truy cập trang này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn nghỉ phép</h1>
          <p className="text-gray-600">Quản lý và phê duyệt đơn nghỉ phép của nhân viên</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Tạo đơn nghỉ phép
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đơn nghỉ phép..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="PENDING">Chờ phê duyệt</option>
            <option value="APPROVED">Đã phê duyệt</option>
            <option value="REJECTED">Đã từ chối</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả loại nghỉ phép</option>
            <option value="ANNUAL">Nghỉ phép năm</option>
            <option value="SICK">Nghỉ ốm</option>
            <option value="PERSONAL">Nghỉ cá nhân</option>
            <option value="MATERNITY">Nghỉ thai sản</option>
            <option value="PATERNITY">Nghỉ chăm con</option>
            <option value="EMERGENCY">Nghỉ khẩn cấp</option>
          </select>
          
          <div className="text-sm text-gray-500 flex items-center">
            Tổng: {filteredRequests.length} đơn
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng đơn</p>
              <p className="text-2xl font-bold text-gray-900">{leaveRequests.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Chờ phê duyệt</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaveRequests.filter(r => r.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đã phê duyệt</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaveRequests.filter(r => r.status === 'APPROVED').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đã từ chối</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaveRequests.filter(r => r.status === 'REJECTED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="ml-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : filteredRequests.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Chưa có đơn nghỉ phép nào</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={request.employee.user?.avatar || `https://ui-avatars.com/api/?name=${request.employee.fullName}&background=3b82f6&color=fff`}
                    alt={request.employee.fullName}
                  />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">{request.employee.fullName}</h3>
                    <p className="text-xs text-gray-500">#{request.employee.employeeId}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                  {getStatusText(request.status)}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">{getLeaveTypeText(request.type)}</span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Thời gian: </span>
                  {new Date(request.startDate).toLocaleDateString('vi-VN')} - {new Date(request.endDate).toLocaleDateString('vi-VN')}
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Số ngày: </span>
                  {request.days} ngày
                </div>
                
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Lý do: </span>
                  <p className="mt-1 line-clamp-2">{request.reason}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleOpenModal(request)}
                  className="text-indigo-600 hover:text-indigo-900"
                  title="Chỉnh sửa"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Leave Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedRequest ? 'Cập nhật đơn nghỉ phép' : 'Tạo đơn nghỉ phép mới'}
              </h3>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhân viên *
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!!selectedRequest}
                  >
                    <option value="">Chọn nhân viên</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.fullName} (#{employee.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại nghỉ phép *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ANNUAL">Nghỉ phép năm</option>
                    <option value="SICK">Nghỉ ốm</option>
                    <option value="PERSONAL">Nghỉ cá nhân</option>
                    <option value="MATERNITY">Nghỉ thai sản</option>
                    <option value="PATERNITY">Nghỉ chăm con</option>
                    <option value="EMERGENCY">Nghỉ khẩn cấp</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lý do nghỉ phép *
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập lý do nghỉ phép..."
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ghi chú thêm (không bắt buộc)..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  {selectedRequest ? 'Cập nhật' : 'Tạo đơn'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestManagement;
