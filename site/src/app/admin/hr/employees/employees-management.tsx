'use client';

import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  IdentificationIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import useUnifiedTheme from '@/hooks/useUnifiedTheme';

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  position: {
    id: string;
    title: string;
    department: {
      id: string;
      name: string;
    };
  };
  status: string;
  contractType: string;
  hireDate: string;
  salary?: number;
  user?: {
    avatar?: string;
    displayName: string;
  };
}

interface Department {
  id: string;
  name: string;
}

interface Position {
  id: string;
  title: string;
  departmentId: string;
}

const EmployeeManagement: React.FC = () => {
  const { user } = useAuth();
  const { config, colors, actualMode } = useUnifiedTheme();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortField, setSortField] = useState('fullName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    positionId: '',
    salary: '',
    hireDate: '',
    status: 'ACTIVE',
    contractType: 'FULL_TIME',
  });

  const statusOptions = [
    {
      value: 'ACTIVE',
      label: 'Đang làm việc',
      color: config.colorScheme === 'colorful' 
        ? 'bg-colorful-success text-colorful-success-foreground' 
        : 'bg-green-100 text-green-800',
    },
    {
      value: 'INACTIVE',
      label: 'Không hoạt động',
      color: config.colorScheme === 'colorful'
        ? 'bg-colorful-muted text-colorful-muted-foreground'
        : 'bg-gray-100 text-gray-800',
    },
    {
      value: 'TERMINATED',
      label: 'Đã nghỉ việc',
      color: config.colorScheme === 'colorful'
        ? 'bg-colorful-error text-colorful-error-foreground'
        : 'bg-red-100 text-red-800',
    },
    {
      value: 'ON_LEAVE',
      label: 'Đang nghỉ phép',
      color: config.colorScheme === 'colorful'
        ? 'bg-colorful-warning text-colorful-warning-foreground'
        : 'bg-yellow-100 text-yellow-800',
    },
    {
      value: 'PROBATION',
      label: 'Thử việc',
      color: config.colorScheme === 'colorful'
        ? 'bg-colorful-primary text-colorful-primary-foreground'
        : 'bg-blue-100 text-blue-800',
    },
  ];

  const contractTypes = [
    { value: 'FULL_TIME', label: 'Toàn thời gian' },
    { value: 'PART_TIME', label: 'Bán thời gian' },
    { value: 'CONTRACT', label: 'Hợp đồng' },
    { value: 'INTERNSHIP', label: 'Thực tập' },
    { value: 'FREELANCE', label: 'Tự do' },
  ];

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchPositions();
  }, []);

  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (departmentFilter !== 'all')
        params.append('departmentId', departmentFilter);

      const response = await fetch(`/api/hr/employees?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || []);
      } else {
        setError('Không thể tải danh sách nhân viên');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/hr/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/hr/positions');
      if (response.ok) {
        const data = await response.json();
        setPositions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = selectedEmployee ? 'PUT' : 'POST';
      const url = '/api/hr/employees';

      const payload: any = {
        ...formData,
        salary: parseFloat(formData.salary) || undefined,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      };

      if (selectedEmployee) {
        payload.id = selectedEmployee.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchEmployees();
        setShowModal(false);
        resetForm();
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Lỗi khi lưu thông tin');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      setError('Lỗi kết nối');
    }
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email || '',
      phone: employee.phone || '',
      positionId: employee.position.id,
      salary: employee.salary?.toString() || '',
      hireDate: employee.hireDate.split('T')[0],
      status: employee.status,
      contractType: employee.contractType,
    });
    setShowModal(true);
  };

  const handleDelete = async (employee: Employee) => {
    if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      try {
        const response = await fetch(`/api/hr/employees?id=${employee.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchEmployees();
          setError('');
        } else {
          const data = await response.json();
          setError(data.error || 'Lỗi khi xóa nhân viên');
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        setError('Lỗi kết nối');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      positionId: '',
      salary: '',
      hireDate: '',
      status: 'ACTIVE',
      contractType: 'FULL_TIME',
    });
    setSelectedEmployee(null);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedEmployees = employees
    .filter(employee => {
      const matchesSearch =
        employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (employee.email &&
          employee.email.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'fullName':
          aValue = a.fullName;
          bValue = b.fullName;
          break;
        case 'department':
          aValue = a.position.department.name;
          bValue = b.position.department.name;
          break;
        case 'position':
          aValue = a.position.title;
          bValue = b.position.title;
          break;
        case 'hireDate':
          aValue = new Date(a.hireDate);
          bValue = new Date(b.hireDate);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const getStatusConfig = (status: string) => {
    return (
      statusOptions.find(option => option.value === status) || statusOptions[0]
    );
  };

  const getContractTypeLabel = (type: string) => {
    return contractTypes.find(ct => ct.value === type)?.label || type;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`animate-spin rounded-full h-32 w-32 border-b-2 ${
          config.colorScheme === 'colorful' 
            ? 'border-colorful-primary' 
            : 'border-accent'
        }`}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-semibold ${
            config.colorScheme === 'colorful' 
              ? 'text-colorful-foreground' 
              : 'text-text'
          }`}>
            Quản lý nhân viên
          </h1>
          <p className={config.colorScheme === 'colorful' 
            ? 'text-colorful-muted-foreground' 
            : 'text-text-secondary'
          }>
            Quản lý thông tin nhân viên trong công ty
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            config.colorScheme === 'colorful'
              ? 'bg-colorful-primary text-colorful-primary-foreground hover:bg-colorful-primary/90'
              : 'bg-accent text-white hover:opacity-90'
          }`}
        >
          <PlusIcon className="h-5 w-5" />
          Thêm nhân viên
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`border rounded-lg p-4 flex items-center gap-2 ${
          config.colorScheme === 'colorful'
            ? 'bg-colorful-error/10 border-colorful-error text-colorful-error-foreground'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`rounded-lg shadow-sm p-6 ${
          config.colorScheme === 'colorful' 
            ? 'bg-colorful-card border border-colorful-border' 
            : 'bg-surface border border-border'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                config.colorScheme === 'colorful' 
                  ? 'text-colorful-muted-foreground' 
                  : 'text-text-secondary'
              }`}>
                Tổng số nhân viên
              </p>
              <p className={`text-2xl font-semibold ${
                config.colorScheme === 'colorful' 
                  ? 'text-colorful-foreground' 
                  : 'text-text'
              }`}>
                {employees.length}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
              config.colorScheme === 'colorful'
                ? 'bg-colorful-primary/10'
                : 'bg-blue-100'
            }`}>
              <UserIcon className={`h-6 w-6 ${
                config.colorScheme === 'colorful'
                  ? 'text-colorful-primary'
                  : 'text-blue-600'
              }`} />
            </div>
          </div>
        </div>

        <div className={`rounded-lg shadow-sm p-6 ${
          config.colorScheme === 'colorful' 
            ? 'bg-colorful-card border border-colorful-border' 
            : 'bg-surface border border-border'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                config.colorScheme === 'colorful' 
                  ? 'text-colorful-muted-foreground' 
                  : 'text-text-secondary'
              }`}>
                Đang làm việc
              </p>
              <p className={`text-2xl font-semibold ${
                config.colorScheme === 'colorful'
                  ? 'text-colorful-success'
                  : 'text-green-600'
              }`}>
                {employees.filter(emp => emp.status === 'ACTIVE').length}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
              config.colorScheme === 'colorful'
                ? 'bg-colorful-success/10'
                : 'bg-green-100'
            }`}>
              <UserIcon className={`h-6 w-6 ${
                config.colorScheme === 'colorful'
                  ? 'text-colorful-success'
                  : 'text-green-600'
              }`} />
            </div>
          </div>
        </div>

        <div className={`rounded-lg shadow-sm p-6 ${
          config.colorScheme === 'colorful' 
            ? 'bg-colorful-card border border-colorful-border' 
            : 'bg-surface border border-border'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                config.colorScheme === 'colorful' 
                  ? 'text-colorful-muted-foreground' 
                  : 'text-text-secondary'
              }`}>
                Đang thử việc
              </p>
              <p className={`text-2xl font-semibold ${
                config.colorScheme === 'colorful'
                  ? 'text-colorful-warning'
                  : 'text-yellow-600'
              }`}>
                {employees.filter(emp => emp.status === 'PROBATION').length}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
              config.colorScheme === 'colorful'
                ? 'bg-colorful-warning/10'
                : 'bg-yellow-100'
            }`}>
              <UserIcon className={`h-6 w-6 ${
                config.colorScheme === 'colorful'
                  ? 'text-colorful-warning'
                  : 'text-yellow-600'
              }`} />
            </div>
          </div>
        </div>

        <div className={`rounded-lg shadow-sm p-6 ${
          config.colorScheme === 'colorful' 
            ? 'bg-colorful-card border border-colorful-border' 
            : 'bg-surface border border-border'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                config.colorScheme === 'colorful' 
                  ? 'text-colorful-muted-foreground' 
                  : 'text-text-secondary'
              }`}>
                Phòng ban
              </p>
              <p className={`text-2xl font-semibold ${
                config.colorScheme === 'colorful' 
                  ? 'text-colorful-foreground' 
                  : 'text-text'
              }`}>
                {departments.length}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
              config.colorScheme === 'colorful'
                ? 'bg-colorful-secondary/10'
                : 'bg-purple-100'
            }`}>
              <BuildingOfficeIcon className={`h-6 w-6 ${
                config.colorScheme === 'colorful'
                  ? 'text-colorful-secondary'
                  : 'text-purple-600'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`rounded-lg shadow-sm p-6 ${
        config.colorScheme === 'colorful' 
          ? 'bg-colorful-card border border-colorful-border' 
          : 'bg-surface border border-border'
      }`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                config.colorScheme === 'colorful' 
                  ? 'text-colorful-muted-foreground' 
                  : 'text-text-secondary'
              }`} />
              <input
                type="text"
                placeholder="Tìm kiếm nhân viên..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                  config.colorScheme === 'colorful'
                    ? 'border-colorful-border bg-colorful-background text-colorful-foreground focus:ring-colorful-primary'
                    : 'border-border bg-background text-text focus:ring-accent'
                }`}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                config.colorScheme === 'colorful'
                  ? 'border-colorful-border bg-colorful-background text-colorful-foreground focus:ring-colorful-primary'
                  : 'border-border bg-background text-text focus:ring-accent'
              }`}
            >
              <option value="all">Tất cả trạng thái</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                config.colorScheme === 'colorful'
                  ? 'border-colorful-border bg-colorful-background text-colorful-foreground focus:ring-colorful-primary'
                  : 'border-border bg-background text-text focus:ring-accent'
              }`}
            >
              <option value="all">Tất cả phòng ban</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className={`rounded-lg shadow-sm overflow-hidden ${
        config.colorScheme === 'colorful' 
          ? 'bg-colorful-card border border-colorful-border' 
          : 'bg-surface border border-border'
      }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className={config.colorScheme === 'colorful' 
              ? 'bg-colorful-muted' 
              : 'bg-gray-50'
            }>
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                    config.colorScheme === 'colorful'
                      ? 'text-colorful-muted-foreground hover:bg-colorful-muted/80'
                      : 'text-text-secondary hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('fullName')}
                >
                  <div className="flex items-center">
                    Nhân viên
                    {sortField === 'fullName' &&
                      (sortOrder === 'asc' ? (
                        <ChevronUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                    config.colorScheme === 'colorful'
                      ? 'text-colorful-muted-foreground hover:bg-colorful-muted/80'
                      : 'text-text-secondary hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('department')}
                >
                  <div className="flex items-center">
                    Phòng ban
                    {sortField === 'department' &&
                      (sortOrder === 'asc' ? (
                        <ChevronUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                    config.colorScheme === 'colorful'
                      ? 'text-colorful-muted-foreground hover:bg-colorful-muted/80'
                      : 'text-text-secondary hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('position')}
                >
                  <div className="flex items-center">
                    Chức vụ
                    {sortField === 'position' &&
                      (sortOrder === 'asc' ? (
                        <ChevronUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                    config.colorScheme === 'colorful'
                      ? 'text-colorful-muted-foreground hover:bg-colorful-muted/80'
                      : 'text-text-secondary hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('hireDate')}
                >
                  <div className="flex items-center">
                    Ngày vào làm
                    {sortField === 'hireDate' &&
                      (sortOrder === 'asc' ? (
                        <ChevronUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  config.colorScheme === 'colorful'
                    ? 'text-colorful-muted-foreground'
                    : 'text-text-secondary'
                }`}>
                  Lương
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                    config.colorScheme === 'colorful'
                      ? 'text-colorful-muted-foreground hover:bg-colorful-muted/80'
                      : 'text-text-secondary hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Trạng thái
                    {sortField === 'status' &&
                      (sortOrder === 'asc' ? (
                        <ChevronUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  config.colorScheme === 'colorful'
                    ? 'text-colorful-muted-foreground'
                    : 'text-text-secondary'
                }`}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              config.colorScheme === 'colorful' 
                ? 'bg-colorful-card divide-colorful-border' 
                : 'bg-surface divide-border'
            }`}>
              {filteredAndSortedEmployees.map(employee => {
                const statusConfig = getStatusConfig(employee.status);
                return (
                  <tr key={employee.id} className={`transition-colors ${
                    config.colorScheme === 'colorful'
                      ? 'hover:bg-colorful-muted/50'
                      : 'hover:bg-gray-50'
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          config.colorScheme === 'colorful'
                            ? 'bg-colorful-muted'
                            : 'bg-gray-100'
                        }`}>
                          {employee.user?.avatar ? (
                            <img
                              src={employee.user.avatar}
                              alt={employee.fullName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className={`text-sm font-medium ${
                              config.colorScheme === 'colorful'
                                ? 'text-colorful-muted-foreground'
                                : 'text-text-secondary'
                            }`}>
                              {employee.fullName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${
                            config.colorScheme === 'colorful'
                              ? 'text-colorful-foreground'
                              : 'text-text'
                          }`}>
                            {employee.fullName}
                          </div>
                          <div className={`text-sm ${
                            config.colorScheme === 'colorful'
                              ? 'text-colorful-muted-foreground'
                              : 'text-text-secondary'
                          }`}>
                            {employee.employeeId}
                          </div>
                          {employee.email && (
                            <div className={`text-sm flex items-center ${
                              config.colorScheme === 'colorful'
                                ? 'text-colorful-muted-foreground'
                                : 'text-text-secondary'
                            }`}>
                              <EnvelopeIcon className="h-3 w-3 mr-1" />
                              {employee.email}
                            </div>
                          )}
                          {employee.phone && (
                            <div className={`text-sm flex items-center ${
                              config.colorScheme === 'colorful'
                                ? 'text-colorful-muted-foreground'
                                : 'text-text-secondary'
                            }`}>
                              <PhoneIcon className="h-3 w-3 mr-1" />
                              {employee.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${
                        config.colorScheme === 'colorful'
                          ? 'text-colorful-foreground'
                          : 'text-text'
                      }`}>
                        {employee.position.department.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${
                        config.colorScheme === 'colorful'
                          ? 'text-colorful-foreground'
                          : 'text-text'
                      }`}>
                        {employee.position.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${
                        config.colorScheme === 'colorful'
                          ? 'text-colorful-foreground'
                          : 'text-text'
                      }`}>
                        {new Date(employee.hireDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${
                        config.colorScheme === 'colorful'
                          ? 'text-colorful-foreground'
                          : 'text-text'
                      }`}>
                        {employee.salary
                          ? formatCurrency(employee.salary)
                          : 'Chưa cập nhật'}
                      </div>
                      <div className={`text-sm ${
                        config.colorScheme === 'colorful'
                          ? 'text-colorful-muted-foreground'
                          : 'text-text-secondary'
                      }`}>
                        {getContractTypeLabel(employee.contractType)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className={`transition-colors ${
                            config.colorScheme === 'colorful'
                              ? 'text-colorful-primary hover:text-colorful-primary/80'
                              : 'text-blue-600 hover:text-blue-900'
                          }`}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee)}
                          className={`transition-colors ${
                            config.colorScheme === 'colorful'
                              ? 'text-colorful-error hover:text-colorful-error/80'
                              : 'text-red-600 hover:text-red-900'
                          }`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
            config.colorScheme === 'colorful'
              ? 'bg-colorful-card border border-colorful-border'
              : 'bg-surface border border-border'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${
                config.colorScheme === 'colorful'
                  ? 'text-colorful-foreground'
                  : 'text-text'
              }`}>
                {selectedEmployee ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className={`transition-colors ${
                  config.colorScheme === 'colorful'
                    ? 'text-colorful-muted-foreground hover:text-colorful-foreground'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    config.colorScheme === 'colorful'
                      ? 'text-colorful-foreground'
                      : 'text-text'
                  }`}>
                    Họ *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={e =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      config.colorScheme === 'colorful'
                        ? 'border-colorful-border bg-colorful-background text-colorful-foreground focus:ring-colorful-primary'
                        : 'border-border bg-background text-text focus:ring-accent'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    config.colorScheme === 'colorful'
                      ? 'text-colorful-foreground'
                      : 'text-text'
                  }`}>
                    Tên *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={e =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      config.colorScheme === 'colorful'
                        ? 'border-colorful-border bg-colorful-background text-colorful-foreground focus:ring-colorful-primary'
                        : 'border-border bg-background text-text focus:ring-accent'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    config.colorScheme === 'colorful'
                      ? 'text-colorful-foreground'
                      : 'text-text'
                  }`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      config.colorScheme === 'colorful'
                        ? 'border-colorful-border bg-colorful-background text-colorful-foreground focus:ring-colorful-primary'
                        : 'border-border bg-background text-text focus:ring-accent'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    config.colorScheme === 'colorful'
                      ? 'text-colorful-foreground'
                      : 'text-text'
                  }`}>
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      config.colorScheme === 'colorful'
                        ? 'border-colorful-border bg-colorful-background text-colorful-foreground focus:ring-colorful-primary'
                        : 'border-border bg-background text-text focus:ring-accent'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  config.colorScheme === 'colorful'
                    ? 'text-colorful-foreground'
                    : 'text-text'
                }`}>
                  Chức vụ *
                </label>
                <select
                  value={formData.positionId}
                  onChange={e =>
                    setFormData({ ...formData, positionId: e.target.value })
                  }
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                    config.colorScheme === 'colorful'
                      ? 'border-colorful-border bg-colorful-background text-colorful-foreground focus:ring-colorful-primary'
                      : 'border-border bg-background text-text focus:ring-accent'
                  }`}
                >
                  <option value="">Chọn chức vụ</option>
                  {positions.map(position => (
                    <option key={position.id} value={position.id}>
                      {position.title} -{' '}
                      {
                        departments.find(d => d.id === position.departmentId)
                          ?.name
                      }
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    config.colorScheme === 'colorful'
                      ? 'text-colorful-foreground'
                      : 'text-text'
                  }`}>
                    Lương (VND)
                  </label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={e =>
                      setFormData({ ...formData, salary: e.target.value })
                    }
                    min="0"
                    step="100000"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      config.colorScheme === 'colorful'
                        ? 'border-colorful-border bg-colorful-background text-colorful-foreground focus:ring-colorful-primary'
                        : 'border-border bg-background text-text focus:ring-accent'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    config.colorScheme === 'colorful'
                      ? 'text-colorful-foreground'
                      : 'text-text'
                  }`}>
                    Ngày vào làm *
                  </label>
                  <input
                    type="date"
                    value={formData.hireDate}
                    onChange={e =>
                      setFormData({ ...formData, hireDate: e.target.value })
                    }
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      config.colorScheme === 'colorful'
                        ? 'border-colorful-border bg-colorful-background text-colorful-foreground focus:ring-colorful-primary'
                        : 'border-border bg-background text-text focus:ring-accent'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    config.colorScheme === 'colorful'
                      ? 'text-colorful-foreground'
                      : 'text-text'
                  }`}>
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={e =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      config.colorScheme === 'colorful'
                        ? 'border-colorful-border bg-colorful-background text-colorful-foreground focus:ring-colorful-primary'
                        : 'border-border bg-background text-text focus:ring-accent'
                    }`}
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    config.colorScheme === 'colorful'
                      ? 'text-colorful-foreground'
                      : 'text-text'
                  }`}>
                    Hình thức hợp đồng
                  </label>
                  <select
                    value={formData.contractType}
                    onChange={e =>
                      setFormData({ ...formData, contractType: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      config.colorScheme === 'colorful'
                        ? 'border-colorful-border bg-colorful-background text-colorful-foreground focus:ring-colorful-primary'
                        : 'border-border bg-background text-text focus:ring-accent'
                    }`}
                  >
                    {contractTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 ${
                    config.colorScheme === 'colorful'
                      ? 'bg-colorful-primary text-colorful-primary-foreground hover:bg-colorful-primary/90 focus:ring-colorful-primary'
                      : 'bg-accent text-white hover:opacity-90 focus:ring-accent'
                  }`}
                >
                  {selectedEmployee ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 ${
                    config.colorScheme === 'colorful'
                      ? 'bg-colorful-muted text-colorful-muted-foreground hover:bg-colorful-muted/80 focus:ring-colorful-muted'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-gray-500'
                  }`}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
