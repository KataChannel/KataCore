import React from 'react';
import { TableColumn, TableFilter, TableProps } from './types';

// Core table library exports
export { useTable } from './useTable';
export { AdvancedTable } from './AdvancedTable';
export { TableToolbar } from './TableToolbar';
export { TablePaginationComponent as TablePagination } from './TablePagination';

// Type exports
export type {
  TableColumn,
  TableFilter,
  TableSort,
  TablePagination as TablePaginationType,
  TableSelection,
  TableState,
  TableProps,
  UseTableOptions,
  TableInstance,
} from './types';

// Utility functions for common table operations
export const createColumn = <T = any>(config: TableColumn<T>): TableColumn<T> => config;

export const createSelectColumn = <T = any>(
  options: {
    id?: string;
    header?: string;
    sticky?: 'left' | 'right' | false;
  } = {}
): TableColumn<T> => ({
  id: options.id || 'select',
  header: options.header || '',
  accessorKey: undefined,
  sortable: false,
  filterable: false,
  resizable: false,
  sticky: options.sticky || false,
  width: 48,
  minWidth: 48,
  maxWidth: 48,
});

export const createActionsColumn = <T = any>(
  config: {
    id?: string;
    header?: string;
    cell: (value: any, row: T, index: number) => React.ReactNode;
    sticky?: 'left' | 'right' | false;
    width?: number;
  }
): TableColumn<T> => ({
  id: config.id || 'actions',
  header: config.header || 'Thao tác',
  cell: config.cell,
  sortable: false,
  filterable: false,
  resizable: false,
  sticky: config.sticky || 'right',
  width: config.width || 120,
});

// Common filters
export const textFilter = (columnId: string, value: string): TableFilter => ({
  id: `${columnId}-text-${Date.now()}`,
  columnId,
  operator: 'contains',
  value,
  label: `Chứa "${value}"`,
});

export const exactFilter = (columnId: string, value: any): TableFilter => ({
  id: `${columnId}-exact-${Date.now()}`,
  columnId,
  operator: 'equals',
  value,
  label: `Bằng "${value}"`,
});

export const rangeFilter = (columnId: string, min: number, max: number): TableFilter => ({
  id: `${columnId}-range-${Date.now()}`,
  columnId,
  operator: 'between',
  value: [min, max],
  label: `Từ ${min} đến ${max}`,
});

// Default table configurations
export const defaultTableProps: Partial<TableProps> = {
  enableSorting: true,
  enableFiltering: true,
  enableSelection: true,
  enableSearch: true,
  enableColumnResize: true,
  enableColumnReorder: true,
  stickyHeader: true,
  pageSize: 10,
};

export const compactTableProps: Partial<TableProps> = {
  ...defaultTableProps,
  enableColumnResize: false,
  enableColumnReorder: false,
  pageSize: 20,
  className: 'text-sm',
};

export const basicTableProps: Partial<TableProps> = {
  enableSorting: true,
  enableFiltering: false,
  enableSelection: false,
  enableSearch: true,
  enableColumnResize: false,
  enableColumnReorder: false,
  stickyHeader: false,
  pageSize: 10,
};
