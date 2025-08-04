import React from 'react';
import { TableFiltersProps } from './types';

const TableFilters: React.FC<TableFiltersProps> = ({
  columns,
  newFilterColumn,
  newFilterOperator,
  newFilterValue,
  availableOperators,
  onColumnChange,
  onOperatorChange,
  onValueChange,
  onAddFilter,
  filterCriteria,
  onRemoveFilter,
}) => {
  return (
    <div className="space-y-3">
      {/* Thêm bộ lọc mới */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Thêm Bộ Lọc:</span>
        <select
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
          value={newFilterColumn}
          onChange={(e) => onColumnChange(e.target.value)}
        >
          {columns
            .filter((col) => col.filterable)
            .map((col) => (
              <option key={col.key} value={col.key}>
                {col.label}
              </option>
            ))}
        </select>

        <select
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
          value={newFilterOperator}
          onChange={(e) => onOperatorChange(e.target.value)}
        >
          {availableOperators.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Giá trị lọc"
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 min-w-[120px] transition-colors duration-300"
          value={newFilterValue}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onAddFilter();
          }}
        />
        <button
          onClick={onAddFilter}
          className="px-4 py-2 text-sm bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-300"
        >
          Thêm
        </button>
      </div>

      {/* Hiển thị các bộ lọc đang hoạt động */}
      {filterCriteria.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterCriteria.map((criterion) => {
            const columnLabel =
              columns.find((col) => col.key === criterion.columnKey)?.label ||
              criterion.columnKey;
            const operatorLabel =
              availableOperators.find((op) => op.value === criterion.operator)?.label ||
              criterion.operator;
            return (
              <span
                key={criterion.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              >
                {columnLabel} {operatorLabel} "{criterion.value}"
                <button
                  onClick={() => onRemoveFilter(criterion.id)}
                  className="ml-2 -mr-0.5 h-4 w-4 inline-flex items-center justify-center rounded-full bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-300 hover:bg-blue-300 dark:hover:bg-blue-700 transition-colors duration-300"
                >
                  <svg
                    className="h-2.5 w-2.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TableFilters;
