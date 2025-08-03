import React from 'react';
import { PaginationProps } from './types';
import { getPaginationNumbers } from './utils';

const Pagination: React.FC<PaginationProps> = ({
  paginationInfo,
  onPageChange,
  onItemsPerPageChange,
  totalItems,
  originalDataLength,
  hasFilters,
}) => {
  const { currentPage, itemsPerPage, totalPages } = paginationInfo;
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} trong số{' '}
          {totalItems} mục
          {hasFilters && (
            <span className="ml-1 text-blue-600 dark:text-blue-400">(đã lọc từ {originalDataLength} mục)</span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300"
              >
                Trước
              </button>

              {getPaginationNumbers(currentPage, totalPages).map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">...</span>
                  ) : (
                    <button
                      onClick={() => onPageChange(page as number)}
                      className={`px-3 py-1 text-sm border rounded-lg transition-colors duration-300 ${
                        currentPage === page
                          ? 'bg-blue-500 dark:bg-blue-600 text-white border-blue-500 dark:border-blue-600'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300"
              >
                Sau
              </button>
            </div>
          )}

          <select
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          >
            <option value={5}>5 / trang</option>
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
