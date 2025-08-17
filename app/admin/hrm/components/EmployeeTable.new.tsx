"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';

interface Employee {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  position?: string;
  department?: string;
  company?: string;
  startDate?: string;
  employeeCode?: string;
  status?: string;
  userId?: string;
}

interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

interface FilterState {
  field: string;
  value: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greater' | 'less';
}

interface Column {
  field: keyof Employee;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: Employee) => React.ReactNode;
}

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const EmployeeTable: React.FC = () => {
  // State Management
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchFields] = useState<Array<keyof Employee>>(['name', 'email', 'phone', 'employeeCode']);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<SortState | null>(null);
  const [filters, setFilters] = useState<FilterState[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<Array<keyof Employee>>([
    'name', 'email', 'phone', 'position', 'department', 'status'
  ]);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<Partial<Employee>>({});

  // Debounced search
  const debouncedSearch = useDebounce(search, 300);

  // Column Definitions
  const columns: Column[] = useMemo(() => [
    {
      field: 'name',
      header: 'Name',
      sortable: true,
      filterable: true,
      render: (value) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <span className="text-blue-600 font-medium text-sm">
              {value ? value[0]?.toUpperCase() : '?'}
            </span>
          </div>
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      )
    },
    { field: 'email', header: 'Email', sortable: true, filterable: true },
    { field: 'phone', header: 'Phone', sortable: true, filterable: true },
    { field: 'position', header: 'Position', sortable: true, filterable: true },
    { field: 'department', header: 'Department', sortable: true, filterable: true },
    { field: 'company', header: 'Company', sortable: true, filterable: true },
    { 
      field: 'startDate', 
      header: 'Start Date', 
      sortable: true, 
      filterable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    { field: 'employeeCode', header: 'Code', sortable: true, filterable: true },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
          ${value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {value || 'inactive'}
        </span>
      )
    }
  ], []);

  // API Integration
  useEffect(() => {
    fetchData();
  }, [debouncedSearch, page, pageSize, sort, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Advanced search
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
        params.set('searchFields', searchFields.join(','));
      }
      
      // Pagination
      params.set('page', String(page + 1));
      params.set('pageSize', String(pageSize));
      
      // Sorting
      if (sort) {
        params.set('sort', sort.field);
        params.set('order', sort.direction);
      }
      
      // Advanced filtering
      filters.forEach((filter, index) => {
        params.set(`filters[${index}][field]`, filter.field);
        params.set(`filters[${index}][value]`, filter.value);
        params.set(`filters[${index}][operator]`, filter.operator);
      });

      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`/api/hrm/employees?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Failed to fetch data');
      
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (!sort || sort.field !== field) {
      setSort({ field, direction: 'asc' });
    } else {
      setSort(sort.direction === 'asc' ? { field, direction: 'desc' } : null);
    }
  };

  const handleFilterAdd = () => {
    setFilters([...filters, { field: 'name', operator: 'contains', value: '' }]);
  };

  const handleFilterRemove = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleFilterChange = (index: number, field: keyof FilterState, value: string) => {
    const newFilters = [...filters];
    if (newFilters[index]) {
      newFilters[index] = { ...newFilters[index], [field]: value };
      setFilters(newFilters);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({});
    setOpenForm(true);
  };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setForm(emp);
    setOpenForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      const token = localStorage.getItem('accessToken') || '';
      await fetch(`/api/hrm/employees/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting employee:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (editing) {
        await fetch(`/api/hrm/employees/${editing.id}`, { 
          method: 'PUT', 
          body: JSON.stringify(form), 
          headers 
        });
      } else {
        await fetch('/api/hrm/employees', { 
          method: 'POST', 
          body: JSON.stringify(form), 
          headers 
        });
      }
      setOpenForm(false);
      fetchData();
    } catch (err) {
      console.error('Error saving employee:', err);
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const hasData = data.length > 0;
  const hasSelection = selectedRows.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
              Employee Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your organization's employees and their information
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -mt-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employees..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors duration-200 font-medium
                  ${showFilters ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters {filters.length > 0 && `(${filters.length})`}
              </button>
              
              <button
                onClick={() => setShowColumnCustomizer(!showColumnCustomizer)}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Columns
              </button>
              
              <button
                onClick={openCreate}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Employee
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Advanced Filters</h3>
              {filters.length > 0 && (
                <button
                  onClick={() => setFilters([])}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear all filters
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {filters.map((filter, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={filter.field}
                    onChange={(e) => handleFilterChange(index, 'field', e.target.value)}
                    className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {columns.map(col => (
                      <option key={col.field} value={col.field}>{col.header}</option>
                    ))}
                  </select>
                  
                  <select
                    value={filter.operator}
                    onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
                    className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="contains">Contains</option>
                    <option value="equals">Equals</option>
                    <option value="startsWith">Starts with</option>
                    <option value="endsWith">Ends with</option>
                  </select>
                  
                  <input
                    type="text"
                    value={filter.value}
                    onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                    placeholder="Enter value..."
                    className="flex-1 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  <button
                    onClick={() => handleFilterRemove(index)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    title="Remove filter"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              
              <button
                onClick={handleFilterAdd}
                className="inline-flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Filter
              </button>
            </div>
          </div>
        )}

        {/* Column Customizer */}
        {showColumnCustomizer && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Visible Columns</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {columns.map((column) => (
                <label key={column.field} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(column.field)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setVisibleColumns([...visibleColumns, column.field]);
                      } else {
                        setVisibleColumns(visibleColumns.filter(col => col !== column.field));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{column.header}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selection Actions */}
      {hasSelection && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700 font-medium">
              {selectedRows.length} employee{selectedRows.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-blue-700 hover:text-blue-900 transition-colors">
                Export Selected
              </button>
              <button className="px-3 py-1 text-sm text-red-700 hover:text-red-900 transition-colors">
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="w-12 px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={hasData && selectedRows.length === data.length}
                  onChange={(e) => {
                    setSelectedRows(e.target.checked ? data.map(emp => emp.id) : []);
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              {columns
                .filter(col => visibleColumns.includes(col.field))
                .map((column) => (
                  <th
                    key={column.field}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => column.sortable && handleSort(column.field)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {sort?.field === column.field && (
                        <svg
                          className={`h-4 w-4 transition-transform ${
                            sort.direction === 'desc' ? 'transform rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 2}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-3">Loading employees...</span>
                  </div>
                </td>
              </tr>
            ) : !hasData ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 2}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No employees</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first employee.</p>
                    <div className="mt-6">
                      <button
                        onClick={openCreate}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Employee
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((employee) => (
                <tr
                  key={employee.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedRows.includes(employee.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(employee.id)}
                      onChange={(e) => {
                        setSelectedRows(
                          e.target.checked
                            ? [...selectedRows, employee.id]
                            : selectedRows.filter(id => id !== employee.id)
                        );
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  {columns
                    .filter(col => visibleColumns.includes(col.field))
                    .map((column) => (
                      <td
                        key={column.field}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {column.render
                          ? column.render(employee[column.field], employee)
                          : employee[column.field] || '-'}
                      </td>
                    ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEdit(employee)}
                        className="p-1 text-blue-600 hover:text-blue-900 transition-colors"
                        title="Edit"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="p-1 text-red-600 hover:text-red-900 transition-colors"
                        title="Delete"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      {hasData && (
        <div className="px-6 py-4 border-t border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                className="rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{page * pageSize + 1}</span>
                {' '}-{' '}
                <span className="font-medium">
                  {Math.min((page + 1) * pageSize, total)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{total}</span>
                {' '}results
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="ml-1">Previous</span>
              </button>
              
              {/* Page Numbers */}
              <div className="hidden sm:flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNum = page < 2 ? i : page - 2 + i;
                  if (pageNum >= totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                        ${page === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 border'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 border'
                        }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="mr-1">Next</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Form Modal */}
      {openForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setOpenForm(false)} />
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editing ? 'Edit Employee' : 'Add New Employee'}
                  </h3>
                  <button
                    onClick={() => setOpenForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={form.name || ''}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={form.email || ''}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={form.phone || ''}
                      onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <input
                      type="text"
                      value={form.position || ''}
                      onChange={(e) => setForm(f => ({ ...f, position: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input
                      type="text"
                      value={form.department || ''}
                      onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={form.status || 'active'}
                      onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {editing ? 'Save Changes' : 'Add Employee'}
                </button>
                <button
                  onClick={() => setOpenForm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;
