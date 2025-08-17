import React from 'react';
import { TablePagination } from './types';

interface TablePaginationProps {
  pagination: TablePagination;
  totalPages: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
}

export function TablePaginationComponent({
  pagination,
  totalPages,
  canPreviousPage,
  canNextPage,
  onPageChange,
  onPageSizeChange,
  className = '',
}: TablePaginationProps) {
  const { pageIndex, pageSize, total } = pagination;
  
  const startIndex = pageIndex * pageSize + 1;
  const endIndex = Math.min((pageIndex + 1) * pageSize, total);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, pageIndex - delta); i <= Math.min(totalPages - 1, pageIndex + delta + 1); i++) {
      range.push(i);
    }

    if (pageIndex - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (pageIndex + delta + 1 < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((item, index, array) => array.indexOf(item) === index);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Page info */}
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Hiển thị {startIndex.toLocaleString()} đến {endIndex.toLocaleString()} của {total.toLocaleString()} kết quả
        </span>
        
        {/* Page size selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">Hiển thị:</label>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* First page */}
        <button
          onClick={() => onPageChange(0)}
          disabled={!canPreviousPage}
          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!canPreviousPage}
          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">...</span>
            ) : (
              <button
                onClick={() => onPageChange((page as number) - 1)}
                className={`px-3 py-1 text-sm border rounded transition-colors ${
                  pageIndex === (page as number) - 1
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Next page */}
        <button
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!canNextPage}
          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={!canNextPage}
          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
