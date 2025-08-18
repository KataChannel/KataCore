'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { exportToExcel, importFromExcel, ExcelColumn } from '@/utils/excel';

export interface Employee {
  id: string;
  employeeCode: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  status: string;
  startDate: string | null;
  company: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeApiResponse {
  data: Employee[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EmployeeFilters {
  search?: string;
  page?: number;
  pageSize?: number;
  department?: string;
  position?: string;
  status?: string;
  // Enhanced filtering
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDateFrom?: string;
  startDateTo?: string;
  salaryFrom?: number;
  salaryTo?: number;
  company?: string;
}

export interface UseEmployeesResult {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
  refresh: () => void;
  createEmployee: (employee: Partial<Employee>) => Promise<Employee>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<Employee>;
  deleteEmployee: (id: string) => Promise<void>;
  bulkDeleteEmployees: (ids: string[]) => Promise<void>;
  // Enhanced functionality
  exportEmployees: (format: 'xlsx' | 'csv') => Promise<void>;
  importEmployees: (file: File) => Promise<{ success: boolean; errors: any[] }>;
  setFilters: (filters: Partial<EmployeeFilters>) => void;
  clearFilters: () => void;
  currentFilters: EmployeeFilters;
}

// Default filters to avoid creating new objects on every render
const DEFAULT_FILTERS: EmployeeFilters = {};

export function useEmployees(initialFilters: EmployeeFilters = DEFAULT_FILTERS): UseEmployeesResult {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialFilters.page || 1);
  const [pageSize, setPageSize] = useState(initialFilters.pageSize || 25);
  const [currentFilters, setCurrentFilters] = useState<EmployeeFilters>(initialFilters);

  // Track if this is the initial mount to prevent unnecessary fetches
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.department) params.append('department', currentFilters.department);
      if (currentFilters.position) params.append('position', currentFilters.position);
      if (currentFilters.status) params.append('status', currentFilters.status);
      if (currentFilters.sortBy) params.append('sortBy', currentFilters.sortBy);
      if (currentFilters.sortOrder) params.append('sortOrder', currentFilters.sortOrder);
      if (currentFilters.startDateFrom) params.append('startDateFrom', currentFilters.startDateFrom);
      if (currentFilters.startDateTo) params.append('startDateTo', currentFilters.startDateTo);
      if (currentFilters.salaryFrom) params.append('salaryFrom', currentFilters.salaryFrom.toString());
      if (currentFilters.salaryTo) params.append('salaryTo', currentFilters.salaryTo.toString());
      if (currentFilters.company) params.append('company', currentFilters.company);
      params.append('page', (currentFilters.page || page).toString());
      params.append('pageSize', (currentFilters.pageSize || pageSize).toString());

      const response = await fetch(`/api/hrm/employees?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: EmployeeApiResponse = await response.json();
      
      setEmployees(result.data);
      setTotal(result.total);
      setPage(result.page);
      setPageSize(result.pageSize);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, [
    currentFilters.search,
    currentFilters.department, 
    currentFilters.position,
    currentFilters.status,
    currentFilters.sortBy,
    currentFilters.sortOrder,
    currentFilters.startDateFrom,
    currentFilters.startDateTo,
    currentFilters.salaryFrom,
    currentFilters.salaryTo,
    currentFilters.company,
    currentFilters.page,
    currentFilters.pageSize,
    page,
    pageSize
  ]);

  const createEmployee = useCallback(async (employeeData: Partial<Employee>): Promise<Employee> => {
    try {
      const response = await fetch('/api/hrm/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const newEmployee = await response.json();
      
      // Refresh the list to get updated data
      await fetchEmployees();
      
      return newEmployee;
    } catch (err) {
      console.error('Error creating employee:', err);
      throw err;
    }
  }, [fetchEmployees]);

  const updateEmployee = useCallback(async (id: string, employeeData: Partial<Employee>): Promise<Employee> => {
    try {
      const response = await fetch(`/api/hrm/employees/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedEmployee = await response.json();
      
      // Update the local state
      setEmployees(prev => prev.map(emp => 
        emp.id === id ? updatedEmployee : emp
      ));
      
      return updatedEmployee;
    } catch (err) {
      console.error('Error updating employee:', err);
      throw err;
    }
  }, []);

  const deleteEmployee = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/hrm/employees/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Remove from local state
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      setTotal(prev => prev - 1);
    } catch (err) {
      console.error('Error deleting employee:', err);
      throw err;
    }
  }, []);

  const bulkDeleteEmployees = useCallback(async (ids: string[]): Promise<void> => {
    try {
      const deletePromises = ids.map(id => deleteEmployee(id));
      await Promise.all(deletePromises);
    } catch (err) {
      console.error('Error bulk deleting employees:', err);
      throw err;
    }
  }, [deleteEmployee]);

  const refresh = useCallback(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Only fetch on mount and when filters actually change
  useEffect(() => {
    if (!hasInitialized) {
      fetchEmployees();
      setHasInitialized(true);
      return;
    }
    
    // For subsequent fetches, only when specific filter values change
    fetchEmployees();
  }, [
    currentFilters.search,
    currentFilters.department, 
    currentFilters.position,
    currentFilters.status,
    currentFilters.sortBy,
    currentFilters.sortOrder,
    currentFilters.startDateFrom,
    currentFilters.startDateTo,
    currentFilters.salaryFrom,
    currentFilters.salaryTo,
    currentFilters.company,
    currentFilters.page,
    currentFilters.pageSize,
    page,
    pageSize,
    hasInitialized
  ]);

  // Enhanced functionality
  const setFilters = useCallback((newFilters: Partial<EmployeeFilters>) => {
    setCurrentFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setCurrentFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  // Excel export columns definition
  const excelColumns: ExcelColumn[] = [
    { key: 'employeeCode', label: 'Mã nhân viên', type: 'string', required: true },
    { key: 'name', label: 'Họ và tên', type: 'string', required: true },
    { key: 'email', label: 'Email', type: 'string', required: true },
    { key: 'phone', label: 'Số điện thoại', type: 'string', required: true },
    { key: 'department', label: 'Phòng ban', type: 'string', required: true, options: [
      'Công nghệ thông tin', 'Nhân sự', 'Tài chính', 'Kinh doanh', 'Marketing', 'Vận hành'
    ]},
    { key: 'position', label: 'Chức vụ', type: 'string', required: true },
    { key: 'status', label: 'Trạng thái', type: 'string', required: true, options: [
      'active', 'inactive', 'terminated'
    ]},
    { key: 'startDate', label: 'Ngày bắt đầu', type: 'date' },
    { key: 'company', label: 'Công ty', type: 'string' }
  ];

  const exportEmployees = useCallback(async (format: 'xlsx' | 'csv') => {
    try {
      const filename = `employees_${new Date().toISOString().split('T')[0]}.${format}`;
      exportToExcel(employees, excelColumns, { format, filename });
    } catch (error) {
      console.error('Export error:', error);
      throw new Error('Không thể xuất dữ liệu nhân viên');
    }
  }, [employees, excelColumns]);

  const importEmployees = useCallback(async (file: File) => {
    try {
      const result = await importFromExcel(file, excelColumns);
      
      if (result.success && result.data.length > 0) {
        // Import successful employees
        const importPromises = result.data.map(employeeData => 
          createEmployee(employeeData)
        );
        
        await Promise.all(importPromises);
        await fetchEmployees(); // Refresh data
      }
      
      return {
        success: result.success,
        errors: result.errors,
        imported: result.validRows,
        total: result.totalRows
      };
    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        errors: [{ message: 'Không thể nhập dữ liệu từ file' }],
        imported: 0,
        total: 0
      };
    }
  }, [createEmployee, fetchEmployees, excelColumns]);

  return {
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
  };
}
