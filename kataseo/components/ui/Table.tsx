import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  className?: string;
  rowKey?: keyof T | ((record: T) => string);
  onRowClick?: (record: T, index: number) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  emptyText?: string;
}

type SortOrder = 'asc' | 'desc' | null;

export function Table<T = Record<string, unknown>>({
  columns,
  data,
  loading = false,
  className,
  rowKey,
  onRowClick,
  pagination,
  emptyText = 'No data available',
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    order: SortOrder;
  }>({ key: '', order: null });

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    if (rowKey && typeof record === 'object' && record !== null && rowKey in record) {
      return String((record as Record<string, unknown>)[rowKey as string] || index);
    }
    // Default fallback
    if (typeof record === 'object' && record !== null && 'id' in record) {
      return String((record as Record<string, unknown>).id || index);
    }
    return String(index);
  };

  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable) return;

    const key = column.dataIndex as string || column.key;
    let order: SortOrder = 'asc';

    if (sortConfig.key === key) {
      if (sortConfig.order === 'asc') {
        order = 'desc';
      } else if (sortConfig.order === 'desc') {
        order = null;
      }
    }

    setSortConfig({ key, order });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.order || !sortConfig.key) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      if (aValue === bValue) return 0;

      const result = aValue > bValue ? 1 : -1;
      return sortConfig.order === 'asc' ? result : -result;
    });
  }, [data, sortConfig]);

  const SortIcon: React.FC<{ order: SortOrder }> = ({ order }) => (
    <span className="ml-1 inline-flex flex-col">
      <svg
        className={cn('w-3 h-3', order === 'asc' ? 'text-blue-600' : 'text-gray-400')}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
      <svg
        className={cn('w-3 h-3 -mt-1', order === 'desc' ? 'text-blue-600' : 'text-gray-400')}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </span>
  );

  const renderCell = (column: TableColumn<T>, record: T, index: number): React.ReactNode => {
    if (column.render) {
      return column.render(record[column.dataIndex as keyof T], record, index);
    }
    const value = record[column.dataIndex as keyof T];
    return value != null ? String(value) : '';
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-sm font-medium text-gray-900 dark:text-white',
                    'bg-gray-50 dark:bg-gray-800',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center justify-between">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <SortIcon order={sortConfig.key === (column.dataIndex as string || column.key) ? sortConfig.order : null} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              sortedData.map((record, index) => (
                <tr
                  key={getRowKey(record, index)}
                  className={cn(
                    'border-b border-gray-200 dark:border-gray-700',
                    'hover:bg-gray-50 dark:hover:bg-gray-800',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(record, index)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-4 py-3 text-sm text-gray-900 dark:text-white',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {renderCell(column, record, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((pagination.current - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              disabled={pagination.current <= 1}
              className={cn(
                'px-3 py-1 text-sm rounded border',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            
            <button
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              className={cn(
                'px-3 py-1 text-sm rounded border',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
