'use client';

import React, { useState, useEffect } from 'react';
import { AdvancedTable } from '@/components/ui/table/AdvancedTable';
import { TableToolbar } from '@/components/ui/table/TableToolbar';
import { TablePaginationComponent as TablePagination } from '@/components/ui/table/TablePagination';
import { createColumn, createActionsColumn, defaultTableProps } from '@/components/ui/table/index';
import { TableDialogActions, TableActions } from '@/components/ui/table/TableDialogActions';
import { useDialog, useConfirm, FormDialog } from '@/components/ui/dialog';
import type { TableColumn } from '@/components/ui/table/types';
import type { FormField } from '@/components/ui/dialog/types';

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  startDate: string;
  status: 'active' | 'inactive' | 'terminated';
  avatar?: string;
}

interface EmployeeTableAdvancedProps {
  className?: string;
}

export default function EmployeeTableAdvanced({ className }: EmployeeTableAdvancedProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  
  // Dialog hooks
  const addDialog = useDialog();
  const editDialog = useDialog();
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const confirm = useConfirm();

  // Form field definitions for employee dialog
  const employeeFormFields: FormField[] = [
    {
      name: 'employeeId',
      label: 'Mã nhân viên',
      type: 'text',
      placeholder: 'Nhập mã nhân viên (VD: EMP001)',
      required: true,
      validation: {
        pattern: /^EMP\d{3,}$/,
        custom: (value: string) => {
          if (!value) return 'Mã nhân viên là bắt buộc';
          if (!/^EMP\d{3,}$/.test(value)) return 'Mã nhân viên phải có dạng EMP + ít nhất 3 chữ số (VD: EMP001)';
          return null;
        }
      }
    },
    {
      name: 'fullName',
      label: 'Họ và tên',
      type: 'text',
      placeholder: 'Nhập họ và tên đầy đủ',
      required: true,
      validation: {
        minLength: 2,
        custom: (value: string) => {
          if (!value) return 'Họ tên là bắt buộc';
          if (value.length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
          return null;
        }
      }
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'example@company.com',
      required: true,
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        custom: (value: string) => {
          if (!value) return 'Email là bắt buộc';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email không hợp lệ';
          return null;
        }
      }
    },
    {
      name: 'phone',
      label: 'Số điện thoại',
      type: 'text',
      placeholder: '0123456789',
      required: true,
      validation: {
        pattern: /^[0-9]{10,11}$/,
        custom: (value: string) => {
          if (!value) return 'Số điện thoại là bắt buộc';
          if (!/^[0-9]{10,11}$/.test(value)) return 'Số điện thoại phải có 10-11 chữ số';
          return null;
        }
      }
    },
    {
      name: 'department',
      label: 'Phòng ban',
      type: 'select',
      required: true,
      options: [
        { value: 'Công nghệ thông tin', label: 'Công nghệ thông tin' },
        { value: 'Nhân sự', label: 'Nhân sự' },
        { value: 'Tài chính', label: 'Tài chính' },
        { value: 'Kinh doanh', label: 'Kinh doanh' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Vận hành', label: 'Vận hành' }
      ]
    },
    {
      name: 'position',
      label: 'Chức vụ',
      type: 'text',
      placeholder: 'Nhập chức vụ',
      required: true
    },
    {
      name: 'salary',
      label: 'Lương (VNĐ)',
      type: 'number',
      placeholder: '15000000',
      required: true,
      validation: {
        min: 1000000,
        custom: (value: number) => {
          if (!value) return 'Lương là bắt buộc';
          if (value < 1000000) return 'Lương phải từ 1,000,000 VNĐ trở lên';
          return null;
        }
      }
    },
    {
      name: 'startDate',
      label: 'Ngày bắt đầu làm việc',
      type: 'date',
      required: true
    },
    {
      name: 'status',
      label: 'Trạng thái',
      type: 'select',
      required: true,
      options: [
        { value: 'active', label: 'Hoạt động' },
        { value: 'inactive', label: 'Tạm nghỉ' },
        { value: 'terminated', label: 'Đã nghỉ việc' }
      ]
    }
  ];

  // Sample data for demonstration
  useEffect(() => {
    const sampleData: Employee[] = [
      {
        id: '1',
        employeeId: 'EMP001',
        fullName: 'Nguyễn Văn An',
        email: 'an.nguyen@company.com',
        phone: '0123456789',
        department: 'Công nghệ thông tin',
        position: 'Lập trình viên Senior',
        salary: 25000000,
        startDate: '2020-01-15',
        status: 'active',
        avatar: '/images/avatars/1.jpg'
      },
      {
        id: '2',
        employeeId: 'EMP002',
        fullName: 'Trần Thị Bình',
        email: 'binh.tran@company.com',
        phone: '0123456790',
        department: 'Nhân sự',
        position: 'Quản lý nhân sự',
        salary: 20000000,
        startDate: '2019-03-20',
        status: 'active'
      },
      {
        id: '3',
        employeeId: 'EMP003',
        fullName: 'Lê Minh Cường',
        email: 'cuong.le@company.com',
        phone: '0123456791',
        department: 'Kinh doanh',
        position: 'Nhân viên kinh doanh',
        salary: 15000000,
        startDate: '2021-06-10',
        status: 'inactive'
      },
      {
        id: '4',
        employeeId: 'EMP004',
        fullName: 'Phạm Thị Dung',
        email: 'dung.pham@company.com',
        phone: '0123456792',
        department: 'Tài chính',
        position: 'Kế toán trưởng',
        salary: 30000000,
        startDate: '2018-02-01',
        status: 'active'
      },
      {
        id: '5',
        employeeId: 'EMP005',
        fullName: 'Võ Văn Phúc',
        email: 'phuc.vo@company.com',
        phone: '0123456793',
        department: 'Marketing',
        position: 'Marketing Specialist',
        salary: 18000000,
        startDate: '2022-01-15',
        status: 'active'
      },
    ];

    // Simulate API call
    setTimeout(() => {
      setEmployees(sampleData);
      setLoading(false);
    }, 1000);
  }, []);

  // Define columns using the table library
  const columns: TableColumn<Employee>[] = [
    createColumn<Employee>({
      id: 'avatar',
      header: '',
      accessorKey: 'avatar',
      sortable: false,
      filterable: false,
      resizable: false,
      width: 60,
      cell: (value: string | undefined, row: Employee) => (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {row.fullName.charAt(0)}
          </div>
        </div>
      ),
    }),
    createColumn<Employee>({
      id: 'employeeId',
      header: 'Mã NV',
      accessorKey: 'employeeId',
      sortable: true,
      filterable: true,
      width: 100,
      sticky: 'left',
    }),
    createColumn<Employee>({
      id: 'fullName',
      header: 'Họ và tên',
      accessorKey: 'fullName',
      sortable: true,
      filterable: true,
      minWidth: 200,
      sticky: 'left',
      cell: (value: string, row: Employee) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {row.fullName.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{row.email}</div>
          </div>
        </div>
      ),
    }),
    createColumn<Employee>({
      id: 'phone',
      header: 'Số điện thoại',
      accessorKey: 'phone',
      sortable: true,
      filterable: true,
      width: 150,
    }),
    createColumn<Employee>({
      id: 'department',
      header: 'Phòng ban',
      accessorKey: 'department',
      sortable: true,
      filterable: true,
      width: 180,
      cell: (value: string) => (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-200">
          {value}
        </span>
      ),
    }),
    createColumn<Employee>({
      id: 'position',
      header: 'Chức vụ',
      accessorKey: 'position',
      sortable: true,
      filterable: true,
      width: 200,
    }),
    createColumn<Employee>({
      id: 'salary',
      header: 'Lương',
      accessorKey: 'salary',
      sortable: true,
      filterable: true,
      width: 150,
      cell: (value: number) => (
        <span className="font-medium text-green-600 dark:text-green-400">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(value)}
        </span>
      ),
    }),
    createColumn<Employee>({
      id: 'startDate',
      header: 'Ngày bắt đầu',
      accessorKey: 'startDate',
      sortable: true,
      filterable: true,
      width: 130,
      cell: (value: string) => (
        <span className="text-gray-600 dark:text-gray-400">
          {new Date(value).toLocaleDateString('vi-VN')}
        </span>
      ),
    }),
    createColumn<Employee>({
      id: 'status',
      header: 'Trạng thái',
      accessorKey: 'status',
      sortable: true,
      filterable: true,
      width: 120,
      cell: (value: 'active' | 'inactive' | 'terminated') => {
        const statusConfig = {
          active: { label: 'Hoạt động', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
          inactive: { label: 'Tạm nghỉ', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
          terminated: { label: 'Đã nghỉ', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
        };
        const config = statusConfig[value];
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
            {config.label}
          </span>
        );
      },
    }),
    createActionsColumn<Employee>({
      id: 'actions',
      header: 'Thao tác',
      sticky: 'right',
      width: 120,
      cell: (_: any, row: Employee) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(row.id)}
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 transition-colors"
            title="Chỉnh sửa nhân viên"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-colors"
            title="Xóa nhân viên"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    }),
  ];

  // Event handlers
  const handleAdd = () => {
    addDialog.open();
  };

  const handleEdit = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      setEditingEmployee(employee);
      editDialog.open();
    }
  };

  const handleDelete = async (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;

    const confirmed = await confirm({
      title: 'Xác nhận xóa nhân viên',
      message: `Bạn có chắc chắn muốn xóa nhân viên "${employee.fullName}"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      destructive: true
    });

    if (confirmed) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      // Here you would typically call an API to delete the employee
      console.log('Deleted employee:', id);
    }
  };

  const handleBulkDelete = async (selectedIds: string[]) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa nhiều nhân viên',
      message: `Bạn có chắc chắn muốn xóa ${selectedIds.length} nhân viên đã chọn? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa tất cả',
      cancelText: 'Hủy',
      destructive: true
    });

    if (confirmed) {
      setEmployees(prev => prev.filter(emp => !selectedIds.includes(emp.id)));
      setSelectedRows([]); // Clear selection after deletion
      console.log('Bulk deleted employees:', selectedIds);
    }
  };

  const handleAddSubmit = (data: Partial<Employee>) => {
    const newEmployee: Employee = {
      id: `emp_${Date.now()}`,
      employeeId: data.employeeId!,
      fullName: data.fullName!,
      email: data.email!,
      phone: data.phone!,
      department: data.department!,
      position: data.position!,
      salary: Number(data.salary!),
      startDate: data.startDate!,
      status: (data.status as 'active' | 'inactive' | 'terminated') || 'active'
    };

    setEmployees(prev => [...prev, newEmployee]);
    addDialog.close();
    console.log('Added new employee:', newEmployee);
  };

  const handleEditSubmit = (data: Partial<Employee>) => {
    if (!editingEmployee) return;

    const updatedEmployee: Employee = {
      ...editingEmployee,
      employeeId: data.employeeId!,
      fullName: data.fullName!,
      email: data.email!,
      phone: data.phone!,
      department: data.department!,
      position: data.position!,
      salary: Number(data.salary!),
      startDate: data.startDate!,
      status: (data.status as 'active' | 'inactive' | 'terminated') || 'active'
    };

    setEmployees(prev => prev.map(emp => 
      emp.id === editingEmployee.id ? updatedEmployee : emp
    ));
    editDialog.close();
    setEditingEmployee(null);
    console.log('Updated employee:', updatedEmployee);
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => setLoading(false), 1000);
  };

  const handleExport = (format: 'csv' | 'json') => {
    console.log('Export data as:', format);
    // Export functionality will be handled by the table library
  };

  const handleRowClick = (row: Employee) => {
    console.log('Row clicked:', row);
    // Navigate to employee detail or open modal
  };

  const handleSelectionChange = (selectedRowIds: string[]) => {
    setSelectedRows(selectedRowIds);
    console.log('Selected rows:', selectedRowIds);
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">Lỗi tải dữ liệu</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Toolbar with Add button and bulk actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Quản lý nhân viên
            </h2>
            {selectedRows.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Đã chọn {selectedRows.length} nhân viên
                </span>
                <button
                  onClick={() => handleBulkDelete(selectedRows)}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Xóa đã chọn</span>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm nhân viên</span>
          </button>
        </div>
      </div>

      {/* Advanced Table with all features */}
      <AdvancedTable
        data={employees}
        columns={columns}
        loading={loading}
        {...defaultTableProps}
        getRowId={(row: Employee) => row.id}
        onRowClick={handleRowClick}
        onSelectionChange={handleSelectionChange}
        enableColumnResize={true}
        enableColumnReorder={true}
        enableStickyColumns={true}
        stickyHeader={true}
        emptyState={
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Chưa có nhân viên nào
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Bắt đầu bằng cách thêm nhân viên đầu tiên
            </p>
            <button 
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thêm nhân viên
            </button>
          </div>
        }
        loadingState={
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</span>
            </div>
          </div>
        }
        className="min-h-[400px]"
      />

      {/* Add Employee Dialog */}
      <FormDialog
        isOpen={addDialog.isOpen}
        onClose={addDialog.close}
        onSubmit={handleAddSubmit}
        title="Thêm nhân viên mới"
        size="lg"
        formFields={employeeFormFields}
        submitText="Thêm nhân viên"
        defaultValues={{
          startDate: new Date().toISOString().split('T')[0],
          status: 'active'
        }}
      />

      {/* Edit Employee Dialog */}
      <FormDialog
        isOpen={editDialog.isOpen}
        onClose={() => {
          editDialog.close();
          setEditingEmployee(null);
        }}
        onSubmit={handleEditSubmit}
        title="Chỉnh sửa thông tin nhân viên"
        size="lg"
        formFields={employeeFormFields}
        submitText="Cập nhật"
        defaultValues={editingEmployee || undefined}
      />
    </div>
  );
}
