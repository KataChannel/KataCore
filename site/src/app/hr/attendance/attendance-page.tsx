'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/app/hooks/useAuth';

interface Attendance {
  id: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalHours?: number;
  overtime?: number;
  status: string;
  notes?: string;
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

const AttendanceManagement: React.FC = () => {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    timeIn: '',
    timeOut: '',
    breakStart: '',
    breakEnd: '',
    status: 'PRESENT',
    notes: ''
  });

  useEffect(() => {
    fetchAttendances();
    fetchEmployees();
  }, []);

  const fetchAttendances = async () => {
    try {
      const response = await fetch('/api/hr/attendances');
      if (response.ok) {
        const data = await response.json();
        setAttendances(data.data || []);
      } else {
        setError('Không thể tải danh sách chấm công');
      }
    } catch (error) {
      console.error('Error fetching attendances:', error);
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

  const handleOpenModal = (attendance?: Attendance) => {
    if (attendance) {
      setSelectedAttendance(attendance);
      setFormData({
        employeeId: attendance.employee.id,
        date: attendance.date.split('T')[0],
        timeIn: attendance.timeIn ? attendance.timeIn.substring(11, 16) : '',
        timeOut: attendance.timeOut ? attendance.timeOut.substring(11, 16) : '',
        breakStart: attendance.breakStart ? attendance.breakStart.substring(11, 16) : '',
        breakEnd: attendance.breakEnd ? attendance.breakEnd.substring(11, 16) : '',
        status: attendance.status,
        notes: attendance.notes || ''
      });
    } else {
      setSelectedAttendance(null);
      setFormData({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        timeIn: '',
        timeOut: '',
        breakStart: '',
        breakEnd: '',
        status: 'PRESENT',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAttendance(null);
    setError('');
  };

  const handleSave = async () => {
    try {
      if (!formData.employeeId || !formData.date) {
        setError('Vui lòng chọn nhân viên và ngày');
        return;
      }

      const method = selectedAttendance ? 'PUT' : 'POST';
      const url = selectedAttendance 
        ? `/api/hr/attendances/${selectedAttendance.id}`
        : '/api/hr/attendances';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchAttendances();
        handleCloseModal();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Có lỗi xảy ra khi lưu');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      setError('Lỗi kết nối đến server');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi chấm công này?')) {
      try {
        const response = await fetch(`/api/hr/attendances/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchAttendances();
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Có lỗi xảy ra khi xóa');
        }
      } catch (error) {
        console.error('Error deleting attendance:', error);
        setError('Lỗi kết nối đến server');
      }
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800';
      case 'ABSENT':
        return 'bg-red-100 text-red-800';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'HALF_DAY':
        return 'bg-blue-100 text-blue-800';
      case 'WORK_FROM_HOME':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'Có mặt';
      case 'ABSENT':
        return 'Vắng mặt';
      case 'LATE':
        return 'Đi muộn';
      case 'HALF_DAY':
        return 'Nửa ngày';
      case 'WORK_FROM_HOME':
        return 'Làm từ xa';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'ABSENT':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'LATE':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-600" />;
      case 'HALF_DAY':
        return <ClockIcon className="h-5 w-5 text-blue-600" />;
      case 'WORK_FROM_HOME':
        return <HomeIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const filteredAttendances = attendances.filter(attendance => {
    const matchesSearch = attendance.employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         attendance.employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || attendance.status === statusFilter;
    const matchesDate = !dateFilter || attendance.date.split('T')[0] === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý chấm công</h1>
          <p className="text-gray-600">Theo dõi và quản lý chấm công của nhân viên</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Thêm chấm công
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
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
            <option value="PRESENT">Có mặt</option>
            <option value="ABSENT">Vắng mặt</option>
            <option value="LATE">Đi muộn</option>
            <option value="HALF_DAY">Nửa ngày</option>
            <option value="WORK_FROM_HOME">Làm từ xa</option>
          </select>
          
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <div className="text-sm text-gray-500 flex items-center">
            Tổng: {filteredAttendances.length} bản ghi
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Có mặt</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendances.filter(a => a.status === 'PRESENT').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Vắng mặt</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendances.filter(a => a.status === 'ABSENT').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đi muộn</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendances.filter(a => a.status === 'LATE').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Nửa ngày</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendances.filter(a => a.status === 'HALF_DAY').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <HomeIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Làm từ xa</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendances.filter(a => a.status === 'WORK_FROM_HOME').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Grid */}
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
        ) : filteredAttendances.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Chưa có bản ghi chấm công nào</p>
          </div>
        ) : (
          filteredAttendances.map((attendance) => (
            <div key={attendance.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={attendance.employee.user?.avatar || `https://ui-avatars.com/api/?name=${attendance.employee.fullName}&background=3b82f6&color=fff`}
                    alt={attendance.employee.fullName}
                  />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">{attendance.employee.fullName}</h3>
                    <p className="text-xs text-gray-500">#{attendance.employee.employeeId}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(attendance.status)}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">
                    {new Date(attendance.date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">Vào: </span>
                    {attendance.timeIn ? new Date(attendance.timeIn).toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Ra: </span>
                    {attendance.timeOut ? new Date(attendance.timeOut).toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 'N/A'}
                  </div>
                </div>
                
                {attendance.totalHours && (
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Tổng giờ: </span>
                    {attendance.totalHours.toFixed(1)} giờ
                  </div>
                )}
                
                {attendance.overtime && attendance.overtime > 0 && (
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Tăng ca: </span>
                    {attendance.overtime.toFixed(1)} giờ
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(attendance.status)}`}>
                  {getStatusText(attendance.status)}
                </span>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(attendance)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Chỉnh sửa"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(attendance.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Xóa"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Attendance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedAttendance ? 'Cập nhật chấm công' : 'Thêm chấm công mới'}
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
                    disabled={!!selectedAttendance}
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
                    Ngày *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ vào
                  </label>
                  <input
                    type="time"
                    value={formData.timeIn}
                    onChange={(e) => setFormData({ ...formData, timeIn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ ra
                  </label>
                  <input
                    type="time"
                    value={formData.timeOut}
                    onChange={(e) => setFormData({ ...formData, timeOut: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bắt đầu nghỉ
                  </label>
                  <input
                    type="time"
                    value={formData.breakStart}
                    onChange={(e) => setFormData({ ...formData, breakStart: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kết thúc nghỉ
                  </label>
                  <input
                    type="time"
                    value={formData.breakEnd}
                    onChange={(e) => setFormData({ ...formData, breakEnd: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PRESENT">Có mặt</option>
                    <option value="ABSENT">Vắng mặt</option>
                    <option value="LATE">Đi muộn</option>
                    <option value="HALF_DAY">Nửa ngày</option>
                    <option value="WORK_FROM_HOME">Làm từ xa</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ghi chú về chấm công..."
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
                  {selectedAttendance ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
