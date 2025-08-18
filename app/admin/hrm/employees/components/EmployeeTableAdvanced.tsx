'use client';

import React, { useState, useEffect } from 'react';
import { AdvancedTable } from '@/components/ui/table/AdvancedTable';
import { TablePaginationComponent as TablePagination } from '@/components/ui/table/TablePagination';
import { createColumn, createActionsColumn, defaultTableProps } from '@/components/ui/table/index';
import { TableDialogActions, TableActions } from '@/components/ui/table/TableDialogActions';
import { useDialog, useConfirm, FormDialog } from '@/components/ui/dialog';
import { useEmployees, Employee as EmployeeType } from '@/hooks';
import { useToastActions } from '@/components/ui/toast/ToastProvider';
import { BatchOperations } from '@/components/ui/table/BatchOperations';
import { EmployeeDetailView } from '@/components/ui/dialogs/EmployeeDetailView';
import type { TableColumn } from '@/components/ui/table/types';
import type { FormField } from '@/components/ui/dialog/types';
import EmployeeToolbar from '@/components/ui/table/EmployeeToolbar';
import ImportDialog from '@/components/ui/table/ImportDialog';

interface EmployeeTableAdvancedProps {
  className?: string;
}

export default function EmployeeTableAdvanced({ className }: EmployeeTableAdvancedProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeType | null>(null);
  const { success, error: showError, warning } = useToastActions();
  
  // Dialog hooks
  const addDialog = useDialog();
  const editDialog = useDialog();
  const [editingEmployee, setEditingEmployee] = useState<EmployeeType | null>(null);
  const confirm = useConfirm();

  // Use the enhanced database hook
  const {
    employees,
    loading,
    error,
    total,
    page,
    pageSize,
    refresh,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    bulkDeleteEmployees,
    // Enhanced functionality
    exportEmployees,
    importEmployees,
    setFilters,
    clearFilters,
    currentFilters,
  } = useEmployees();

  // Form field definitions for employee dialog
  const employeeFormFields: FormField[] = [
    {
      name: 'employeeCode',
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
      name: 'name',
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

  // Define columns using the table library
  const columns: TableColumn<EmployeeType>[] = [
    createColumn<EmployeeType>({
      id: 'avatar',
      header: '',
      sortable: false,
      filterable: false,
      resizable: false,
      width: 60,
      cell: (value: string | undefined, row: EmployeeType) => (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {row.name.charAt(0)}
          </div>
        </div>
      ),
    }),
    createColumn<EmployeeType>({
      id: 'employeeCode',
      header: 'Mã NV',
      accessorKey: 'employeeCode',
      sortable: true,
      filterable: true,
      width: 100,
      sticky: 'left',
    }),
    createColumn<EmployeeType>({
      id: 'name',
      header: 'Họ và tên',
      accessorKey: 'name',
      sortable: true,
      filterable: true,
      minWidth: 200,
      sticky: 'left',
      cell: (value: string, row: EmployeeType) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{row.email}</div>
          </div>
        </div>
      ),
    }),
    createColumn<EmployeeType>({
      id: 'phone',
      header: 'Số điện thoại',
      accessorKey: 'phone',
      sortable: true,
      filterable: true,
      width: 150,
    }),
    createColumn<EmployeeType>({
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
    createColumn<EmployeeType>({
      id: 'position',
      header: 'Chức vụ',
      accessorKey: 'position',
      sortable: true,
      filterable: true,
      width: 200,
    }),
    createColumn<EmployeeType>({
      id: 'startDate',
      header: 'Ngày bắt đầu',
      accessorKey: 'startDate',
      sortable: true,
      filterable: true,
      width: 130,
      cell: (value: string) => (
        <span className="text-gray-600 dark:text-gray-400">
          {value ? new Date(value).toLocaleDateString('vi-VN') : ''}
        </span>
      ),
    }),
    createColumn<EmployeeType>({
      id: 'status',
      header: 'Trạng thái',
      accessorKey: 'status',
      sortable: true,
      filterable: true,
      width: 120,
      cell: (value: string) => {
        const statusConfig: Record<string, { label: string; color: string }> = {
          active: { label: 'Hoạt động', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
          inactive: { label: 'Tạm nghỉ', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
          terminated: { label: 'Đã nghỉ', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
        };
        const config = statusConfig[value] || statusConfig.active;
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${config?.color || ''}`}>
            {config?.label || value}
          </span>
        );
      },
    }),
    createActionsColumn<EmployeeType>({
      id: 'actions',
      header: 'Thao tác',
      sticky: 'right',
      width: 120,
      cell: (_: any, row: EmployeeType) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleView(row)}
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 transition-colors"
            title="Xem chi tiết"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => handleEdit(row.id)}
            className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 transition-colors"
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

  const handleView = (employee: EmployeeType) => {
    setSelectedEmployee(employee);
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
      message: `Bạn có chắc chắn muốn xóa nhân viên "${employee.name}"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      destructive: true
    });

    if (confirmed) {
      try {
        await deleteEmployee(id);
        success('Xóa thành công', `Đã xóa nhân viên "${employee.name}"`);
      } catch (err) {
        showError('Lỗi xóa nhân viên', 'Không thể xóa nhân viên. Vui lòng thử lại.');
      }
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
      try {
        await bulkDeleteEmployees(selectedIds);
        setSelectedRows([]); // Clear selection after deletion
        success('Xóa hàng loạt thành công', `Đã xóa ${selectedIds.length} nhân viên`);
      } catch (err) {
        showError('Lỗi xóa hàng loạt', 'Không thể xóa một số nhân viên. Vui lòng thử lại.');
      }
    }
  };

  const handleAddSubmit = async (data: Partial<EmployeeType>) => {
    try {
      await createEmployee(data);
      addDialog.close();
      success('Thêm thành công', `Đã thêm nhân viên "${data.name}"`);
    } catch (err) {
      showError('Lỗi thêm nhân viên', 'Không thể thêm nhân viên. Vui lòng kiểm tra thông tin.');
    }
  };

  const handleEditSubmit = async (data: Partial<EmployeeType>) => {
    if (!editingEmployee) return;

    try {
      await updateEmployee(editingEmployee.id, data);
      editDialog.close();
      setEditingEmployee(null);
      success('Cập nhật thành công', `Đã cập nhật thông tin nhân viên "${data.name}"`);
    } catch (err) {
      showError('Lỗi cập nhật nhân viên', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  // Enhanced handlers for import and filtering
  const handleImport = async (file: File) => {
    try {
      const result = await importEmployees(file);
      setShowImportDialog(false);
      
      if (result.success) {
        success(
          'Import thành công', 
          `Đã import dữ liệu thành công`,
          {
            action: {
              label: 'Làm mới',
              onClick: () => refresh()
            }
          }
        );
      } else if (result.errors.length > 0) {
        warning('Import hoàn tất với lỗi', `Có ${result.errors.length} lỗi trong quá trình import`);
      }
      
      return {
        success: result.success,
        data: [],
        errors: result.errors,
        imported: 0,
        total: 0
      };
    } catch (err) {
      showError('Lỗi import', 'Không thể import dữ liệu. Vui lòng kiểm tra định dạng file.');
      return {
        success: false,
        data: [],
        errors: [{ message: 'Có lỗi xảy ra khi nhập dữ liệu' }],
        imported: 0,
        total: 0
      };
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    refresh();
  };

  const handleExport = async (format: 'xlsx' | 'csv') => {
    try {
      await exportEmployees(format);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleRowClick = (row: EmployeeType) => {
    console.log('Row clicked:', row);
    // Navigate to employee detail or open modal
  };

  const handleSelectionChange = (selectedRowIds: string[]) => {
    setSelectedRows(selectedRowIds);
    console.log('Selected rows:', selectedRowIds);
  };

  // Batch operation handlers
  const handleBulkUpdate = async (employeeIds: string[], updates: Partial<EmployeeType>) => {
    // Since there's no bulkUpdateEmployees, we'll update each individually
    for (const employeeId of employeeIds) {
      await updateEmployee(employeeId, updates);
    }
  };

  const handleBulkDeleteFromBatch = async (employeeIds: string[]) => {
    await bulkDeleteEmployees(employeeIds);
  };

  const handleExportSelected = async (employeeIds: string[]) => {
    await exportEmployees('xlsx');
  };

  const handleClearSelection = () => {
    setSelectedRows([]);
  };

  // Employee detail handlers
  const handleEmployeeUpdate = async (updates: Partial<EmployeeType>) => {
    if (!selectedEmployee) return;
    await updateEmployee(selectedEmployee.id, updates);
    setSelectedEmployee(null);
  };

  const handleEmployeeDelete = async () => {
    if (!selectedEmployee) return;
    
    const confirmed = await confirm({
      title: 'Xác nhận xóa nhân viên',
      message: `Bạn có chắc chắn muốn xóa nhân viên "${selectedEmployee.name}"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      destructive: true
    });

    if (confirmed) {
      await deleteEmployee(selectedEmployee.id);
      setSelectedEmployee(null);
      success('Xóa thành công', `Đã xóa nhân viên "${selectedEmployee.name}"`);
    }
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
      {/* Enhanced Toolbar */}
      <EmployeeToolbar
        filters={currentFilters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearFilters}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onImport={() => setShowImportDialog(true)}
        onAddEmployee={handleAdd}
        loading={loading}
        totalCount={total}
      />

      {/* Batch Operations */}
      <BatchOperations
        selectedEmployees={selectedRows}
        employees={employees}
        onBulkUpdate={handleBulkUpdate}
        onBulkDelete={handleBulkDeleteFromBatch}
        onExport={handleExportSelected}
        onClearSelection={handleClearSelection}
      />

      {/* Advanced Table with all features */}
      <AdvancedTable
        data={employees}
        columns={columns}
        loading={loading}
        {...defaultTableProps}
        getRowId={(row: EmployeeType) => row.id}
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
        defaultValues={editingEmployee ? {
          employeeCode: editingEmployee.employeeCode || '',
          name: editingEmployee.name,
          email: editingEmployee.email || '',
          phone: editingEmployee.phone || '',
          department: editingEmployee.department || '',
          position: editingEmployee.position || '',
          startDate: editingEmployee.startDate ? editingEmployee.startDate.split('T')[0] : '',
          status: editingEmployee.status
        } : undefined}
      />

      {/* Import Dialog */}
      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImport}
        title="Nhập dữ liệu nhân viên"
        description="Chọn file Excel hoặc CSV để nhập dữ liệu nhân viên vào hệ thống"
      />

      {/* Employee Detail View */}
      {selectedEmployee && (
        <EmployeeDetailView
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onUpdate={handleEmployeeUpdate}
          onDelete={handleEmployeeDelete}
        />
      )}
    </div>
  );
}
