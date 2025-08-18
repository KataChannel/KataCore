'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

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
}

// Default filters to avoid creating new objects on every render
const DEFAULT_FILTERS: EmployeeFilters = {};

export function useEmployees(filters: EmployeeFilters = DEFAULT_FILTERS): UseEmployeesResult {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(filters.page || 1);
  const [pageSize, setPageSize] = useState(filters.pageSize || 25);

  // Track if this is the initial mount to prevent unnecessary fetches
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.department) params.append('department', filters.department);
      if (filters.position) params.append('position', filters.position);
      if (filters.status) params.append('status', filters.status);
      params.append('page', (filters.page || page).toString());
      params.append('pageSize', (filters.pageSize || pageSize).toString());

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
    filters.search,
    filters.department, 
    filters.position,
    filters.status,
    filters.page,
    filters.pageSize,
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
    filters.search,
    filters.department, 
    filters.position,
    filters.status,
    filters.page,
    filters.pageSize,
    page,
    pageSize,
    hasInitialized
  ]);

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
  };
}
