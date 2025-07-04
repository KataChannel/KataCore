import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  apiUrl: string;
  defaultSort?: { key: keyof T; direction: 'asc' | 'desc' };
  pageSizeOptions?: number[];
  className?: string;
}

interface ApiResponse<T> {
  data: T[];
  total: number;
}

function AdvancedTable<T>({ 
  columns, 
  apiUrl, 
  defaultSort = { key: columns[0].key, direction: 'asc' }, 
  pageSizeOptions = [10, 25, 50, 100],
  className = ''
}: TableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [sort, setSort] = useState(defaultSort);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        pageSize,
        sortKey: sort.key,
        sortDirection: sort.direction,
        search: searchTerm,
        ...filters,
      };

      const response = await axios.get<ApiResponse<T>>(apiUrl, { params });
      setData(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sort, searchTerm, filters, apiUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchTerm(value);
      setPage(1);
    }, 300),
    []
  );

  const handleSort = (key: keyof T) => {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleFilter = (key: keyof T, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className={`advanced-table-container ${className}`}>
      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4 flex-wrap">
        {columns
          .filter(col => col.filterable)
          .map(col => (
            <div key={String(col.key)} className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder={`Filter ${col.header}`}
                className="w-full px-4 py-2 border rounded-lg"
                onChange={(e) => handleFilter(col.key, e.target.value)}
              />
            </div>
          ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  className="p-3 text-left font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <button onClick={() => handleSort(col.key)}>
                        {sort.key === col.key ? (
                          sort.direction === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        )}
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center">
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-gray-50"
                >
                  {columns.map(col => (
                    <td key={String(col.key)} className="p-3">
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            className="border rounded-lg px-3 py-2"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
          <span>
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, total)} of {total} entries
          </span>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(1)}
          >
            First
          </button>
          <button
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage(prev => prev + 1)}
          >
            Next
          </button>
          <button
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage(totalPages)}
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdvancedTable;