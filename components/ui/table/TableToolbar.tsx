import React, { useState } from 'react';
import { TableColumn, TableFilter } from './types';

interface TableToolbarProps<T = any> {
  columns: TableColumn<T>[];
  filters: TableFilter[];
  search: string;
  columnVisibility: Record<string, boolean>;
  onSearchChange: (search: string) => void;
  onFiltersChange: (filters: TableFilter[]) => void;
  onColumnVisibilityChange: (visibility: Record<string, boolean>) => void;
  onExport?: (format: 'csv' | 'json') => void;
  onRefresh?: () => void;
  className?: string;
}

export function TableToolbar<T = any>({
  columns,
  filters,
  search,
  columnVisibility,
  onSearchChange,
  onFiltersChange,
  onColumnVisibilityChange,
  onExport,
  onRefresh,
  className = '',
}: TableToolbarProps<T>) {
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filterable = columns.filter(col => col.filterable);
  const activeFilters = filters.length;

  const handleAddFilter = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return;

    const newFilter: TableFilter = {
      id: `${columnId}-${Date.now()}`,
      columnId,
      operator: 'contains',
      value: '',
      label: column.header,
    };

    onFiltersChange([...filters, newFilter]);
  };

  const handleUpdateFilter = (filterId: string, updates: Partial<TableFilter>) => {
    const updatedFilters = filters.map(filter =>
      filter.id === filterId ? { ...filter, ...updates } : filter
    );
    onFiltersChange(updatedFilters);
  };

  const handleRemoveFilter = (filterId: string) => {
    const updatedFilters = filters.filter(filter => filter.id !== filterId);
    onFiltersChange(updatedFilters);
  };

  const handleClearAllFilters = () => {
    onFiltersChange([]);
  };

  const toggleColumnVisibility = (columnId: string) => {
    onColumnVisibilityChange({
      ...columnVisibility,
      [columnId]: !columnVisibility[columnId],
    });
  };

  return (
    <div className={`border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${className}`}>
      {/* Main toolbar */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Filter button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  activeFilters > 0 
                    ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-400'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                  <span>Lọc</span>
                  {activeFilters > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-800 dark:text-blue-200">
                      {activeFilters}
                    </span>
                  )}
                </div>
              </button>

              {/* Filter dropdown */}
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Bộ lọc</h3>
                      {activeFilters > 0 && (
                        <button
                          onClick={handleClearAllFilters}
                          className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Xóa tất cả
                        </button>
                      )}
                    </div>

                    {/* Add filter */}
                    <div className="mb-3">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddFilter(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Thêm bộ lọc...</option>
                        {filterable.map(column => (
                          <option key={column.id} value={column.id}>
                            {column.header}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Active filters */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {filters.map(filter => (
                        <div key={filter.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {filter.label}
                            </span>
                            <button
                              onClick={() => handleRemoveFilter(filter.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex space-x-2">
                            <select
                              value={filter.operator}
                              onChange={(e) => handleUpdateFilter(filter.id, { operator: e.target.value as any })}
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
                              <option value="contains">Chứa</option>
                              <option value="equals">Bằng</option>
                              <option value="startsWith">Bắt đầu</option>
                              <option value="endsWith">Kết thúc</option>
                              <option value="greater">Lớn hơn</option>
                              <option value="less">Nhỏ hơn</option>
                            </select>
                            <input
                              type="text"
                              value={filter.value}
                              onChange={(e) => handleUpdateFilter(filter.id, { value: e.target.value })}
                              placeholder="Giá trị..."
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Column visibility */}
            <div className="relative">
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="px-3 py-2 text-sm font-medium rounded-lg border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                  <span>Cột</span>
                </div>
              </button>

              {/* Column menu */}
              {showColumnMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Hiển thị cột</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {columns.map(column => (
                        <label key={column.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={columnVisibility[column.id]}
                            onChange={() => toggleColumnVisibility(column.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{column.header}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Export */}
            {onExport && (
              <div className="flex space-x-1">
                <button
                  onClick={() => onExport('csv')}
                  className="px-3 py-2 text-sm font-medium rounded-lg border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  CSV
                </button>
                <button
                  onClick={() => onExport('json')}
                  className="px-3 py-2 text-sm font-medium rounded-lg border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  JSON
                </button>
              </div>
            )}

            {/* Refresh */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-3 py-2 text-sm font-medium rounded-lg border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showColumnMenu || showFilterMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowColumnMenu(false);
            setShowFilterMenu(false);
          }}
        />
      )}
    </div>
  );
}
