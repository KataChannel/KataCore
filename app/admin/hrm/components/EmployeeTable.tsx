"use client";

import React, { useEffect, useState } from 'react';

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

interface Props {}

interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

interface FilterState {
  field: string;
  value: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greater' | 'less';
}

export const EmployeeTable: React.FC<Props> = () => {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchFields, setSearchFields] = useState<string[]>(['name', 'email', 'phone', 'employeeCode']);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<SortState | null>(null);
  const [filters, setFilters] = useState<FilterState[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['name', 'email', 'phone', 'position', 'department', 'status']);
  const [showFilters, setShowFilters] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<Partial<Employee>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Advanced search
      if (search) {
        params.set('search', search);
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
      // Add error notification here
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, searchFields, page, pageSize, sort, filters]);

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
    if (!confirm('Delete this employee?')) return;
    await fetch(`/api/hrm/employees/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await fetch(`/api/hrm/employees/${editing.id}`, { method: 'PUT', body: JSON.stringify(form), headers: { 'Content-Type': 'application/json' } });
      } else {
        await fetch('/api/hrm/employees', { method: 'POST', body: JSON.stringify(form), headers: { 'Content-Type': 'application/json' } });
      }
      setOpenForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Simple column sorting handler
  const handleSort = (field: string) => {
    if (!sort || sort.field !== field) {
      setSort({ field, direction: 'asc' });
    } else {
      setSort(sort.direction === 'asc' ? { field, direction: 'desc' } : null);
    }
  };

  const columns = [
    { field: 'name', header: 'Name' },
    { field: 'phone', header: 'Phone' },
    { field: 'email', header: 'Email' },
    { field: 'position', header: 'Position' },
    { field: 'department', header: 'Department' },
    { field: 'company', header: 'Company' },
    { field: 'startDate', header: 'Start Date' },
    { field: 'employeeCode', header: 'Code' },
    { field: 'status', header: 'Status' },
  ];

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="w-full min-w-[320px] bg-white rounded-lg shadow">
      <div className="p-6">
        {/* Enhanced Header with Search, Filters & Actions */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Employee Management</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  showFilters
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters {filters.length > 0 && `(${filters.length})`}
                </span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setVisibleColumns(columns.map(col => col.field))}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Columns
                  </span>
                </button>
              </div>
              <button
                onClick={openCreate}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Employee
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employees..."
                  className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => document.getElementById('employee-import-file')?.click()}
                className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Import
              </button>
              <button
                onClick={() => document.getElementById('employee-import-file')?.click()}
                className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Import
              </button>
              <button
                onClick={async () => {
                  const params = new URLSearchParams();
                  if (search) params.set('search', search);
                  const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || localStorage.getItem('auth-token') || '';
                  const res = await fetch(`/api/hrm/employees/export?${params.toString()}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'employees-export.xlsx';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Export
              </button>
              <button
                onClick={async () => {
                  const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || localStorage.getItem('auth-token') || '';
                  const res = await fetch('/api/hrm/employees/export?template=1', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'employees-template.xlsx';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Template
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="p-4 mt-4 bg-gray-50 rounded-lg border">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Advanced Filters</h3>
                  <button
                    onClick={() => setFilters([])}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear all
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filters.map((filter, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={filter.field}
                        onChange={(e) => {
                          const newFilters = [...filters];
                          if (newFilters[index]) {
                            newFilters[index].field = e.target.value;
                            setFilters(newFilters);
                          }
                        }}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {columns.map((col) => (
                          <option key={col.field} value={col.field}>
                            {col.header}
                          </option>
                        ))}
                      </select>
                      <select
                        value={filter.operator}
                        onChange={(e) => {
                          const newFilters = [...filters];
                          newFilters[index].operator = e.target.value as FilterState['operator'];
                          setFilters(newFilters);
                        }}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="equals">Equals</option>
                        <option value="contains">Contains</option>
                        <option value="startsWith">Starts with</option>
                        <option value="endsWith">Ends with</option>
                        <option value="greater">Greater than</option>
                        <option value="less">Less than</option>
                      </select>
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => {
                          const newFilters = [...filters];
                          newFilters[index].value = e.target.value;
                          setFilters(newFilters);
                        }}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Value..."
                      />
                      <button
                        onClick={() => {
                          const newFilters = filters.filter((_, i) => i !== index);
                          setFilters(newFilters);
                        }}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setFilters([
                      ...filters,
                      { field: 'name', operator: 'contains', value: '' }
                    ]);
                  }}
                  className="w-full px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  + Add Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(data.map(emp => emp.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                {columns
                  .filter(col => visibleColumns.includes(col.field))
                  .map((col) => (
                    <th
                      key={col.field}
                      onClick={() => handleSort(col.field)}
                      className="px-6 py-3 text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-1">
                        {col.header}
                        {sort?.field === col.field && (
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${
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
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span className="ml-3 text-sm text-gray-600">Loading employees...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="px-6 py-8 text-center">
                    <div className="text-center">
                      <svg
                        className="mx-auto w-12 h-12 text-gray-400"
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
                      <p className="mt-2 text-sm text-gray-600">No employees found</p>
                      <button
                        onClick={openCreate}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Add your first employee
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((emp) => (
                  <tr
                    key={emp.id}
                    className={`hover:bg-gray-50 ${
                      selectedRows.includes(emp.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(emp.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows([...selectedRows, emp.id]);
                          } else {
                            setSelectedRows(selectedRows.filter(id => id !== emp.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    {columns
                      .filter(col => visibleColumns.includes(col.field))
                      .map((col) => (
                        <td key={col.field} className="px-6 py-4 text-sm text-gray-600">
                          {col.field === 'status' ? (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                (emp as any)[col.field] === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {(emp as any)[col.field] || '-'}
                            </span>
                          ) : col.field === 'startDate' && (emp as any)[col.field] ? (
                            new Date((emp as any)[col.field]!).toLocaleDateString()
                          ) : (
                            (emp as any)[col.field] || '-'
                          )}
                        </td>
                      ))}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(emp)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors duration-200"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Enhanced Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 mt-4 bg-white border rounded-lg">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0); // Reset to first page when changing page size
              }}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            <div className="text-sm text-gray-600 whitespace-nowrap">
              {selectedRows.length > 0 ? (
                <span className="text-blue-600 font-medium">{selectedRows.length} selected</span>
              ) : (
                <span>
                  Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, total)} of {total} results
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (page < 2) {
                  pageNum = i;
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                      page === pageNum
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-2 text-gray-600 bg-white border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors duration-200"
            >
              <span className="sr-only">Previous</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-2 text-gray-600 bg-white border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors duration-200"
            >
              <span className="sr-only">Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          id="employee-import-file"
          type="file"
          accept=".json,.xlsx,.csv"
          className="hidden"
          onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (ext === 'json') {
              const text = await file.text();
              const json = JSON.parse(text);
              const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || localStorage.getItem('auth-token') || '';
              await fetch('/api/hrm/employees/import', {
                method: 'POST',
                body: JSON.stringify(json),
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
              });
              fetchData();
            } else if (ext === 'xlsx' || ext === 'csv') {
              const XLSX = await import('xlsx');
              const arrayBuffer = await file.arrayBuffer();
              const wb = XLSX.read(arrayBuffer, { type: 'array' });
              const firstSheetName = wb.SheetNames && wb.SheetNames[0];
              const sheet = firstSheetName ? wb.Sheets[firstSheetName] : undefined;
              const raw = sheet ? XLSX.utils.sheet_to_json(sheet) : [];
              
              const json = (raw as any[]).map(r => {
                const copy: any = { ...r };
                if (typeof copy.status === 'string') {
                  const s = copy.status.trim().toLowerCase();
                  if (['chính thức', 'chinh thuc', 'chinhthuc', 'chínhthức', 'chính thức '].includes(s)) {
                    copy.status = 'active';
                  } else if (['thử việc', 'thu viec', 'thuviec', 'thửvịec'].includes(s)) {
                    copy.status = 'inactive';
                  }
                }
                if (copy.startdate && typeof copy.startdate === 'string') {
                  const v = copy.startdate.trim();
                  const parts = v.split('/');
                  if (parts.length === 3) {
                    const [d, m, y] = parts.map((p: string) => parseInt(p, 10));
                    if (!Number.isNaN(d) && !Number.isNaN(m) && !Number.isNaN(y)) {
                      const dt = new Date(Date.UTC(y, m - 1, d));
                      copy.startDate = dt.toISOString();
                    }
                  }
                }
                return copy;
              });
              
              const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || localStorage.getItem('auth-token') || '';
              await fetch('/api/hrm/employees/import', {
                method: 'POST',
                body: JSON.stringify(json),
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
              });
              fetchData();
            }
          }}
        />

        {/* Modal */}
        {openForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setOpenForm(false)} />
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="relative w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {editing ? 'Edit Employee' : 'Create Employee'}
                  </h3>
                  <button
                    onClick={() => setOpenForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={form.name || ''}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={form.phone || ''}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={form.email || ''}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Position"
                    value={form.position || ''}
                    onChange={(e) => setForm(f => ({ ...f, position: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Department"
                    value={form.department || ''}
                    onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={form.company || ''}
                    onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    placeholder="Start Date"
                    value={form.startDate ? form.startDate.split('T')[0] : ''}
                    onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Employee Code"
                    value={form.employeeCode || ''}
                    onChange={(e) => setForm(f => ({ ...f, employeeCode: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={form.status || 'active'}
                    onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setOpenForm(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                  >
                    {editing ? 'Save' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTable;
