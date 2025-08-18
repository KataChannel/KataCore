'use client';

import React, { useState } from 'react';
import { 
  AdvancedTable, 
  useTable, 
  createColumn, 
  TableActions,
  TableToolbarActions,
  createDialogActionsColumn,
  type TableDialogActions,
  type TableDialogConfig
} from '../../components/ui/table/index';
import { 
  DialogProvider,
  createTextField,
  createEmailField,
  createSelectField,
  createDateField,
  type FormField
} from '../../components/ui/dialog';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  startDate?: string;
  status: 'active' | 'inactive';
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@example.com',
    phone: '0123456789',
    position: 'Frontend Developer',
    department: 'IT',
    startDate: '2023-01-15',
    status: 'active'
  },
  {
    id: '2', 
    name: 'Trần Thị Bình',
    email: 'binh.tran@example.com',
    phone: '0987654321',
    position: 'Backend Developer', 
    department: 'IT',
    startDate: '2023-02-20',
    status: 'active'
  },
  {
    id: '3',
    name: 'Lê Văn Cường',
    email: 'cuong.le@example.com',
    phone: '0369258147',
    position: 'Designer',
    department: 'Design',
    startDate: '2023-03-10',
    status: 'inactive'
  }
];

export default function TableWithDialogDemo() {
  const [data, setData] = useState<Employee[]>(mockEmployees);
  const [loading, setLoading] = useState(false);

  // Define form fields for add/edit dialogs
  const formFields: FormField[] = [
    createTextField('name', 'Họ và tên', { 
      required: true,
      placeholder: 'Nhập họ và tên',
      validation: {
        minLength: 2,
        maxLength: 50
      }
    }),
    createEmailField('email', 'Email', { 
      required: true,
      placeholder: 'example@company.com' 
    }),
    createTextField('phone', 'Số điện thoại', { 
      placeholder: '0123456789',
      validation: {
        pattern: /^[0-9]{10,11}$/
      }
    }),
    createTextField('position', 'Chức vụ', { 
      placeholder: 'Frontend Developer' 
    }),
    createSelectField('department', 'Phòng ban', [
      { label: 'IT', value: 'IT' },
      { label: 'Design', value: 'Design' },
      { label: 'Marketing', value: 'Marketing' },
      { label: 'HR', value: 'HR' },
      { label: 'Sales', value: 'Sales' }
    ], { required: true }),
    createDateField('startDate', 'Ngày bắt đầu', { 
      required: true 
    }),
    createSelectField('status', 'Trạng thái', [
      { label: 'Đang làm việc', value: 'active' },
      { label: 'Đã nghỉ việc', value: 'inactive' }
    ], { required: true })
  ];

  // Define table actions
  const tableActions: TableDialogActions<Employee> = {
    onAdd: async (newEmployee: Employee) => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const employee: Employee = {
          ...newEmployee,
          id: Date.now().toString()
        };
        
        setData(prev => [...prev, employee]);
        console.log('Added employee:', employee);
      } finally {
        setLoading(false);
      }
    },
    
    onEdit: async (updatedEmployee: Employee, originalEmployee: Employee) => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setData(prev => prev.map(emp => 
          emp.id === originalEmployee.id ? { ...updatedEmployee, id: originalEmployee.id } : emp
        ));
        console.log('Updated employee:', updatedEmployee);
      } finally {
        setLoading(false);
      }
    },
    
    onDelete: async (employee: Employee) => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setData(prev => prev.filter(emp => emp.id !== employee.id));
        console.log('Deleted employee:', employee);
      } finally {
        setLoading(false);
      }
    },
    
    onView: (employee: Employee) => {
      console.log('View employee:', employee);
    },
    
    onDuplicate: async (employee: Employee) => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const duplicatedEmployee: Employee = {
          ...employee,
          id: Date.now().toString(),
          name: `${employee.name} (Copy)`,
          email: `copy.${employee.email}`
        };
        
        setData(prev => [...prev, duplicatedEmployee]);
        console.log('Duplicated employee:', duplicatedEmployee);
      } finally {
        setLoading(false);
      }
    }
  };

  // Define dialog configurations
  const dialogConfig: TableDialogConfig<Employee> = {
    addDialog: {
      title: 'Thêm nhân viên mới',
      size: 'lg',
      fields: formFields,
      defaultValues: {
        status: 'active',
        department: 'IT'
      }
    },
    editDialog: {
      title: 'Chỉnh sửa thông tin nhân viên',
      size: 'lg',
      fields: formFields
    },
    deleteDialog: {
      title: 'Xác nhận xóa nhân viên',
      message: 'Bạn có chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác.'
    },
    viewDialog: {
      title: 'Thông tin chi tiết nhân viên',
      size: 'md',
      render: (employee: Employee) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <p className="text-sm text-gray-900">{employee.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-sm text-gray-900">{employee.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <p className="text-sm text-gray-900">{employee.phone || 'Không có'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
              <p className="text-sm text-gray-900">{employee.position || 'Không có'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
              <p className="text-sm text-gray-900">{employee.department || 'Không có'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
              <p className="text-sm text-gray-900">
                {employee.startDate ? new Date(employee.startDate).toLocaleDateString('vi-VN') : 'Không có'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                employee.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {employee.status === 'active' ? 'Đang làm việc' : 'Đã nghỉ việc'}
              </span>
            </div>
          </div>
        </div>
      )
    }
  };

  // Define table columns  
  const columns = [
    createColumn<Employee>({
      id: 'name',
      header: 'Họ và tên',
      accessorKey: 'name',
      sortable: true,
      filterable: true,
      resizable: true,
      sticky: false,
      width: 200,
      cell: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    }),
    
    createColumn<Employee>({
      id: 'email', 
      header: 'Email',
      accessorKey: 'email',
      sortable: true,
      filterable: true,
      resizable: true,
      width: 250,
      cell: (value: string) => (
        <div className="text-blue-600 hover:text-blue-800">
          <a href={`mailto:${value}`}>{value}</a>
        </div>
      )
    }),
    
    createColumn<Employee>({
      id: 'phone',
      header: 'Số điện thoại', 
      accessorKey: 'phone',
      sortable: false,
      filterable: true,
      resizable: true,
      width: 130,
      cell: (value: string) => value || '-'
    }),
    
    createColumn<Employee>({
      id: 'position',
      header: 'Chức vụ',
      accessorKey: 'position', 
      sortable: true,
      filterable: true,
      resizable: true,
      width: 180,
      cell: (value: string) => value || '-'
    }),
    
    createColumn<Employee>({
      id: 'department',
      header: 'Phòng ban',
      accessorKey: 'department',
      sortable: true, 
      filterable: true,
      resizable: true,
      width: 120,
      cell: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value || '-'}
        </span>
      )
    }),
    
    createColumn<Employee>({
      id: 'startDate',
      header: 'Ngày bắt đầu',
      accessorKey: 'startDate',
      sortable: true,
      filterable: false,
      resizable: true, 
      width: 130,
      cell: (value: string) => value ? new Date(value).toLocaleDateString('vi-VN') : '-'
    }),
    
    createColumn<Employee>({
      id: 'status',
      header: 'Trạng thái',
      accessorKey: 'status',
      sortable: true,
      filterable: true,
      resizable: true,
      width: 120,
      cell: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value === 'active' ? 'Đang làm việc' : 'Đã nghỉ việc'}
        </span>
      )
    }),
    
    // Actions column with dialog integration
    createDialogActionsColumn<Employee>(tableActions, dialogConfig, {
      loading,
      width: 120,
      sticky: 'right'
    })
  ];

  // Toolbar actions for bulk operations
  const toolbarActions = {
    onAdd: () => {
      // This will be handled by the TableActions component in the actions column
      console.log('Add button clicked');
    },
    
    onBulkDelete: async (selectedRows: Employee[]) => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const selectedIds = selectedRows.map(row => row.id);
        setData(prev => prev.filter(emp => !selectedIds.includes(emp.id)));
        console.log('Bulk deleted employees:', selectedRows);
      } finally {
        setLoading(false);
      }
    },
    
    onExport: async (selectedRows: Employee[]) => {
      setLoading(true);
      try {
        // Simulate export
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const dataToExport = selectedRows.length > 0 ? selectedRows : data;
        console.log('Exported employees:', dataToExport);
        
        // Create CSV content
        const csv = [
          ['Tên', 'Email', 'SĐT', 'Chức vụ', 'Phòng ban', 'Ngày bắt đầu', 'Trạng thái'],
          ...dataToExport.map(emp => [
            emp.name,
            emp.email,
            emp.phone || '',
            emp.position || '',
            emp.department || '',
            emp.startDate || '',
            emp.status === 'active' ? 'Đang làm việc' : 'Đã nghỉ việc'
          ])
        ].map(row => row.join(',')).join('\n');
        
        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'employees.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } finally {
        setLoading(false);
      }
    }
  };

  const tableInstance = useTable(data, columns, {
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
        total: data.length
      }
    }
  });

  return (
    <DialogProvider>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Demo Table với Dialog Library
            </h1>
            <p className="text-gray-600 mt-1">
              Thư viện table tích hợp dialog responsive với đầy đủ tính năng CRUD
            </p>
          </div>
          
          {/* Toolbar Actions */}
          <TableToolbarActions
            selectedRows={tableInstance.selectedRows}
            actions={toolbarActions}
            loading={loading}
          />
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Dialog Features</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Responsive full-screen</li>
              <li>• Multiple sizes (xs → 5xl)</li>
              <li>• Draggable dialogs</li>
              <li>• Scrollable content</li>
              <li>• Confirmation dialogs</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Table Integration</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Add/Edit/Delete/View</li>
              <li>• Form validation</li>
              <li>• Bulk operations</li>
              <li>• Export functionality</li>
              <li>• Loading states</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">Advanced Features</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Form field helpers</li>
              <li>• Type-safe interfaces</li>
              <li>• Custom renderers</li>
              <li>• Event handling</li>
              <li>• Error handling</li>
            </ul>
          </div>
        </div>

        {/* Advanced Table */}
        <div className="bg-white rounded-lg shadow border">
          <AdvancedTable
            data={data}
            columns={columns}
            loading={loading}
            className="min-h-[400px]"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Tổng cộng: <span className="font-medium">{data.length}</span> nhân viên
          </div>
          <div>
            Đã chọn: <span className="font-medium">{tableInstance.selectedRows.length}</span> mục
          </div>
        </div>
      </div>
    </DialogProvider>
  );
}
