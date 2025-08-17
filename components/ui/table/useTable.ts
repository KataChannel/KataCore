import { useState, useMemo, useCallback } from 'react';
import { TableColumn, TableState, TableFilter, TableSort, TablePagination, TableSelection, UseTableOptions, TableInstance } from './types';

const defaultState: TableState = {
  columns: [],
  filters: [],
  sorts: [],
  pagination: {
    pageIndex: 0,
    pageSize: 10,
    total: 0,
  },
  selection: {
    selectedRows: [],
    isAllSelected: false,
    isIndeterminate: false,
  },
  search: '',
  columnVisibility: {},
  columnOrder: [],
  columnSizing: {},
};

export function useTable<T = any>(
  data: T[],
  columns: TableColumn<T>[],
  options: UseTableOptions<T> = {}
): TableInstance<T> {
  const {
    initialState = {},
    getRowId = (_: T, index: number) => index.toString(),
    manualPagination = false,
    manualSorting = false,
    manualFiltering = false,
    onStateChange,
  } = options;

  const [state, setState] = useState<TableState>({
    ...defaultState,
    ...initialState,
    columns,
    columnOrder: initialState.columnOrder || columns.map(col => col.id),
    columnVisibility: initialState.columnVisibility || 
      columns.reduce((acc, col) => ({ ...acc, [col.id]: !col.hidden }), {}),
    pagination: {
      ...defaultState.pagination,
      ...initialState.pagination,
      total: data.length,
    },
  });

  const updateState = useCallback((updates: Partial<TableState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      onStateChange?.(updates);
      return newState;
    });
  }, [onStateChange]);

  // Search functionality
  const searchedData = useMemo(() => {
    if (!state.search || manualFiltering) return data;
    
    const searchLower = state.search.toLowerCase();
    return data.filter(row => {
      return columns.some(column => {
        const value = column.accessorKey 
          ? row[column.accessorKey as keyof T]
          : column.accessor?.(row);
        
        return String(value || '').toLowerCase().includes(searchLower);
      });
    });
  }, [data, state.search, columns, manualFiltering]);

  // Filter functionality
  const filteredData = useMemo(() => {
    if (!state.filters.length || manualFiltering) return searchedData;

    return searchedData.filter(row => {
      return state.filters.every(filter => {
        const column = columns.find(col => col.id === filter.columnId);
        if (!column) return true;

        const value = column.accessorKey 
          ? row[column.accessorKey as keyof T]
          : column.accessor?.(row);

        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return String(value || '').toLowerCase().includes(String(filter.value).toLowerCase());
          case 'startsWith':
            return String(value || '').toLowerCase().startsWith(String(filter.value).toLowerCase());
          case 'endsWith':
            return String(value || '').toLowerCase().endsWith(String(filter.value).toLowerCase());
          case 'greater':
            return Number(value) > Number(filter.value);
          case 'less':
            return Number(value) < Number(filter.value);
          case 'between':
            const [min, max] = filter.value;
            return Number(value) >= Number(min) && Number(value) <= Number(max);
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value);
          default:
            return true;
        }
      });
    });
  }, [searchedData, state.filters, columns, manualFiltering]);

  // Sort functionality
  const sortedData = useMemo(() => {
    if (!state.sorts.length || manualSorting) return filteredData;

    return [...filteredData].sort((a, b) => {
      for (const sort of state.sorts) {
        const column = columns.find(col => col.id === sort.columnId);
        if (!column) continue;

        const aValue = column.accessorKey 
          ? a[column.accessorKey as keyof T]
          : column.accessor?.(a);
        const bValue = column.accessorKey 
          ? b[column.accessorKey as keyof T]
          : column.accessor?.(b);

        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;

        if (comparison !== 0) {
          return sort.direction === 'desc' ? -comparison : comparison;
        }
      }
      return 0;
    });
  }, [filteredData, state.sorts, columns, manualSorting]);

  // Pagination functionality
  const paginatedData = useMemo(() => {
    if (manualPagination) return sortedData;

    const startIndex = state.pagination.pageIndex * state.pagination.pageSize;
    const endIndex = startIndex + state.pagination.pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, state.pagination, manualPagination]);

  const totalPages = Math.ceil(filteredData.length / state.pagination.pageSize);

  // Selection functionality
  const selectedRows = useMemo(() => {
    return data.filter(row => {
      const rowId = getRowId(row, data.indexOf(row));
      return state.selection.selectedRows.includes(rowId);
    });
  }, [data, state.selection.selectedRows, getRowId]);

  // Actions
  const setSearch = useCallback((search: string) => {
    updateState({ 
      search,
      pagination: { ...state.pagination, pageIndex: 0 }
    });
  }, [updateState, state.pagination]);

  const setFilters = useCallback((filters: TableFilter[]) => {
    updateState({ 
      filters,
      pagination: { ...state.pagination, pageIndex: 0 }
    });
  }, [updateState, state.pagination]);

  const setSorts = useCallback((sorts: TableSort[]) => {
    updateState({ sorts });
  }, [updateState]);

  const setPagination = useCallback((pagination: Partial<TablePagination>) => {
    updateState({ 
      pagination: { ...state.pagination, ...pagination }
    });
  }, [updateState, state.pagination]);

  const setSelection = useCallback((selection: Partial<TableSelection>) => {
    updateState({ 
      selection: { ...state.selection, ...selection }
    });
  }, [updateState, state.selection]);

  const setColumnVisibility = useCallback((visibility: Record<string, boolean>) => {
    updateState({ columnVisibility: visibility });
  }, [updateState]);

  const setColumnOrder = useCallback((order: string[]) => {
    updateState({ columnOrder: order });
  }, [updateState]);

  const setColumnSizing = useCallback((sizing: Record<string, number>) => {
    updateState({ columnSizing: sizing });
  }, [updateState]);

  const getIsRowSelected = useCallback((rowId: string) => {
    return state.selection.selectedRows.includes(rowId);
  }, [state.selection.selectedRows]);

  const toggleRowSelection = useCallback((rowId: string) => {
    const isSelected = getIsRowSelected(rowId);
    const selectedRows = isSelected
      ? state.selection.selectedRows.filter(id => id !== rowId)
      : [...state.selection.selectedRows, rowId];

    const isAllSelected = selectedRows.length === data.length;
    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

    setSelection({ selectedRows, isAllSelected, isIndeterminate });
  }, [getIsRowSelected, state.selection.selectedRows, data.length, setSelection]);

  const toggleAllRowsSelection = useCallback(() => {
    if (state.selection.isAllSelected) {
      setSelection({ selectedRows: [], isAllSelected: false, isIndeterminate: false });
    } else {
      const allRowIds = data.map((row, index) => getRowId(row, index));
      setSelection({ selectedRows: allRowIds, isAllSelected: true, isIndeterminate: false });
    }
  }, [state.selection.isAllSelected, data, getRowId, setSelection]);

  const resetState = useCallback(() => {
    setState({
      ...defaultState,
      columns,
      columnOrder: columns.map(col => col.id),
      columnVisibility: columns.reduce((acc, col) => ({ ...acc, [col.id]: !col.hidden }), {}),
      pagination: { ...defaultState.pagination, total: data.length },
    });
  }, [columns, data.length]);

  const exportData = useCallback((format: 'csv' | 'json') => {
    const dataToExport = filteredData;
    
    if (format === 'csv') {
      const headers = columns
        .filter(col => state.columnVisibility[col.id])
        .map(col => col.header);
      
      const rows = dataToExport.map(row => 
        columns
          .filter(col => state.columnVisibility[col.id])
          .map(col => {
            const value = col.accessorKey 
              ? row[col.accessorKey as keyof T]
              : col.accessor?.(row);
            return String(value || '');
          })
      );

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'table-data.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'table-data.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [filteredData, columns, state.columnVisibility]);

  return {
    state,
    data,
    columns,
    filteredData,
    sortedData,
    paginatedData,
    totalPages,
    canPreviousPage: state.pagination.pageIndex > 0,
    canNextPage: state.pagination.pageIndex < totalPages - 1,
    selectedRows,
    setSearch,
    setFilters,
    setSorts,
    setPagination,
    setSelection,
    setColumnVisibility,
    setColumnOrder,
    setColumnSizing,
    getIsRowSelected,
    toggleRowSelection,
    toggleAllRowsSelection,
    resetState,
    exportData,
  };
}
