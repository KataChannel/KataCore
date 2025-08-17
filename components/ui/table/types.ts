import React from 'react';

export interface TableColumn<T = any> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessor?: (row: T) => any;
  cell?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  sticky?: 'left' | 'right' | false;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  hidden?: boolean;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
}

export interface TableFilter {
  id: string;
  columnId: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greater' | 'less' | 'between' | 'in';
  value: any;
  label?: string;
}

export interface TableSort {
  columnId: string;
  direction: 'asc' | 'desc';
}

export interface TablePagination {
  pageIndex: number;
  pageSize: number;
  total: number;
}

export interface TableSelection {
  selectedRows: string[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

export interface TableState {
  columns: TableColumn[];
  filters: TableFilter[];
  sorts: TableSort[];
  pagination: TablePagination;
  selection: TableSelection;
  search: string;
  columnVisibility: Record<string, boolean>;
  columnOrder: string[];
  columnSizing: Record<string, number>;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableSelection?: boolean;
  enableSearch?: boolean;
  enableColumnResize?: boolean;
  enableColumnReorder?: boolean;
  enableStickyColumns?: boolean;
  stickyHeader?: boolean;
  pageSize?: number;
  onStateChange?: (state: Partial<TableState>) => void;
  onRowClick?: (row: T, index: number) => void;
  onRowDoubleClick?: (row: T, index: number) => void;
  onSelectionChange?: (selectedRows: string[]) => void;
  getRowId?: (row: T) => string;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
}

export interface UseTableOptions<T = any> extends Omit<TableProps<T>, 'data' | 'columns'> {
  initialState?: Partial<TableState>;
}

export interface TableInstance<T = any> {
  state: TableState;
  data: T[];
  columns: TableColumn<T>[];
  filteredData: T[];
  sortedData: T[];
  paginatedData: T[];
  totalPages: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  selectedRows: T[];
  // Actions
  setSearch: (search: string) => void;
  setFilters: (filters: TableFilter[]) => void;
  setSorts: (sorts: TableSort[]) => void;
  setPagination: (pagination: Partial<TablePagination>) => void;
  setSelection: (selection: Partial<TableSelection>) => void;
  setColumnVisibility: (visibility: Record<string, boolean>) => void;
  setColumnOrder: (order: string[]) => void;
  setColumnSizing: (sizing: Record<string, number>) => void;
  // Utilities
  getIsRowSelected: (rowId: string) => boolean;
  toggleRowSelection: (rowId: string) => void;
  toggleAllRowsSelection: () => void;
  resetState: () => void;
  exportData: (format: 'csv' | 'json') => void;
}
