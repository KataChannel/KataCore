import React from 'react';
import { TableHeaderProps } from './types';
import { getSortIconType } from './utils';

const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  sortConfig,
  onSort,
  selectAll,
  onSelectAll,
  onMouseDown,
}) => {
  const getSortIcon = (columnKey: string) => {
    const iconType = getSortIconType(columnKey, sortConfig);
    
    if (iconType === 'none') {
      return (
        <svg
          className="w-4 h-4 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    if (iconType === 'asc') {
      return (
        <svg
          className="w-4 h-4 text-blue-500 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }

    return (
      <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <thead className="bg-gray-50 dark:bg-gray-800">
      <tr>
        {columns.map((column, index) => (
          <th
            key={column.key}
            className={`relative px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 last:border-r-0 transition-colors duration-300 ${
              column.key !== 'select' ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
            }`}
            style={{
              width: `${column.width}px`,
              minWidth: `${column.width}px`,
            }}
            onClick={() => column.key !== 'select' && onSort(column.key)}
          >
            <div className="flex items-center justify-between">
              {column.key === 'select' ? (
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={onSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:bg-gray-800"
                />
              ) : (
                <>
                  <span>{column.label}</span>
                  {getSortIcon(column.key)}
                </>
              )}
            </div>

            {/* Tay cầm thay đổi kích thước cột */}
            {index < columns.length - 1 && (
              <div
                className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors duration-150 group z-10"
                onMouseDown={(e) => onMouseDown(e, column.key)}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-full h-full bg-transparent group-hover:bg-blue-500 dark:group-hover:bg-blue-400"></div>
              </div>
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
