import React, { useState, useRef, useCallback, useMemo } from 'react';
import TableSearch from './TableSearch';
import TableFilters from './TableFilters';
import BulkActions from './BulkActions';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import Pagination from './Pagination';
import { initialData, operators } from './utils';
import {
  TableData,
  ColumnWidth,
  SortConfig,
  SortOrder,
  EditingCell,
  FilterCriterion,
  ColumnDefinition,
} from './types';

const ResizableTable: React.FC = () => {
  // States
  const [data, setData] = useState<TableData[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState<FilterCriterion[]>([]);
  const [newFilterColumn, setNewFilterColumn] = useState<string>('name');
  const [newFilterOperator, setNewFilterOperator] = useState<string>('contains');
  const [newFilterValue, setNewFilterValue] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, order: null });
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [columnWidths, setColumnWidths] = useState<ColumnWidth>({
    select: 50,
    name: 200,
    email: 250,
    role: 150,
    status: 120,
  });
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const tableRef = useRef<HTMLTableElement>(null);

  // Column definitions
  const columns = useMemo(
    (): ColumnDefinition[] => [
      {
        key: 'select',
        label: '',
        width: columnWidths.select || 50,
        filterable: false,
        dataType: 'string',
      },
      {
        key: 'name',
        label: 'Tên',
        width: columnWidths.name || 200,
        filterable: true,
        dataType: 'string',
      },
      {
        key: 'email',
        label: 'Email',
        width: columnWidths.email || 250,
        filterable: true,
        dataType: 'string',
      },
      {
        key: 'role',
        label: 'Vai trò',
        width: columnWidths.role || 150,
        filterable: true,
        dataType: 'select',
        options: Array.from(new Set(data.map((item) => item.role))),
      },
      {
        key: 'status',
        label: 'Trạng thái',
        width: columnWidths.status || 120,
        filterable: true,
        dataType: 'select',
        options: ['Active', 'Inactive'],
      },
    ],
    [columnWidths, data]
  );

  const uniqueRoles = useMemo(() => {
    return Array.from(new Set(initialData.map((item) => item.role)));
  }, []);

  // Resize handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, column: string) => {
      e.preventDefault();
      setIsResizing(column);
      setStartX(e.clientX);
      setStartWidth(columnWidths[column] || 100);
    },
    [columnWidths]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const diff = e.clientX - startX;
      const newWidth = Math.max(80, startWidth + diff);
      setColumnWidths((prev) => ({ ...prev, [isResizing]: newWidth }));
    },
    [isResizing, startX, startWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(null);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Event handlers
  const handleSort = (key: string) => {
    let order: SortOrder = 'asc';
    if (sortConfig.key === key && sortConfig.order === 'asc') {
      order = 'desc';
    } else if (sortConfig.key === key && sortConfig.order === 'desc') {
      order = null;
    }
    setSortConfig({ key: order ? key : null, order });
  };

  const handleCellClick = (rowId: number, column: string, value: string) => {
    if (column === 'status' || column === 'select') return;
    setEditingCell({ rowId, column });
    setEditValue(value);
  };

  const handleEditSubmit = () => {
    if (editingCell) {
      setData((prev) =>
        prev.map((row) =>
          row.id === editingCell.rowId ? { ...row, [editingCell.column]: editValue } : row
        )
      );
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const handleStatusChange = (rowId: number, newStatus: 'Active' | 'Inactive') => {
    setData((prev) => prev.map((row) => (row.id === rowId ? { ...row, status: newStatus } : row)));
  };

  const handleSelectRow = (rowId: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
    setSelectAll(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
      setSelectAll(false);
    } else {
      const currentPageIds = paginatedData.map((row) => row.id);
      setSelectedRows(new Set(currentPageIds));
      setSelectAll(true);
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Bạn có chắc muốn xóa ${selectedRows.size} mục đã chọn?`)) {
      setData((prev) => prev.filter((row) => !selectedRows.has(row.id)));
      setSelectedRows(new Set());
      setSelectAll(false);
      const newTotalPages = Math.ceil((data.length - selectedRows.size) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(1);
      }
    }
  };

  const handleBulkStatusUpdate = (newStatus: 'Active' | 'Inactive') => {
    setData((prev) =>
      prev.map((row) => (selectedRows.has(row.id) ? { ...row, status: newStatus } : row))
    );
    setSelectedRows(new Set());
    setSelectAll(false);
  };

  // Filter handlers
  const availableOperators = useMemo(() => {
    const selectedCol = columns.find((col) => col.key === newFilterColumn);
    return selectedCol ? operators[selectedCol.dataType] : [];
  }, [newFilterColumn, columns]);

  React.useEffect(() => {
    const selectedCol = columns.find((col) => col.key === newFilterColumn);
    if (selectedCol) {
      if (selectedCol.dataType === 'string') {
        setNewFilterOperator('contains');
      } else if (selectedCol.dataType === 'select') {
        setNewFilterOperator('equals');
      } else if (selectedCol.dataType === 'number') {
        setNewFilterOperator('equals');
      }
    }
  }, [newFilterColumn, columns]);

  const handleAddFilter = () => {
    if (newFilterColumn && newFilterOperator && newFilterValue) {
      setFilterCriteria((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          columnKey: newFilterColumn,
          operator: newFilterOperator,
          value: newFilterValue,
        },
      ]);
      setNewFilterValue('');
      setCurrentPage(1);
    }
  };

  const handleRemoveFilter = (id: string) => {
    setFilterCriteria((prev) => prev.filter((criteria) => criteria.id !== id));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCriteria([]);
    setCurrentPage(1);
  };

  // Data processing
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.role.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilterCriteria = filterCriteria.every((criterion) => {
        const columnDefinition = columns.find((col) => col.key === criterion.columnKey);
        if (!columnDefinition) return false;

        const itemValue = (item as any)[criterion.columnKey];
        const operatorDefinition = operators[columnDefinition.dataType]?.find(
          (op) => op.value === criterion.operator
        );

        if (!operatorDefinition) return false;

        return operatorDefinition.apply(itemValue, criterion.value);
      });

      return matchesSearch && matchesFilterCriteria;
    });

    if (sortConfig.key && sortConfig.order) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof TableData];
        const bValue = b[sortConfig.key as keyof TableData];

        if (aValue < bValue) {
          return sortConfig.order === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, filterCriteria, sortConfig, columns]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);

  const paginationInfo = {
    currentPage,
    itemsPerPage,
    totalItems: filteredAndSortedData.length,
    totalPages,
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRows(new Set());
    setSelectAll(false);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setSelectedRows(new Set());
    setSelectAll(false);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen font-inter transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Bảng Dữ liệu Nâng cao</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Quản lý dữ liệu với đầy đủ tính năng</p>
        </div>

        {/* Controls */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex flex-col gap-4">
            <TableSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterCriteria={filterCriteria}
              onClearFilters={handleClearFilters}
            />
            <TableFilters
              columns={columns}
              newFilterColumn={newFilterColumn}
              newFilterOperator={newFilterOperator}
              newFilterValue={newFilterValue}
              availableOperators={availableOperators || []}
              onColumnChange={setNewFilterColumn}
              onOperatorChange={setNewFilterOperator}
              onValueChange={setNewFilterValue}
              onAddFilter={handleAddFilter}
              filterCriteria={filterCriteria}
              onRemoveFilter={handleRemoveFilter}
            />
          </div>
        </div>

        {/* Bulk Actions */}
        <BulkActions
          selectedCount={selectedRows.size}
          onBulkStatusUpdate={handleBulkStatusUpdate}
          onBulkDelete={handleBulkDelete}
        />

        {/* Table */}
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full">
            <TableHeader
              columns={columns}
              sortConfig={sortConfig}
              onSort={handleSort}
              selectAll={selectAll}
              onSelectAll={handleSelectAll}
              onMouseDown={handleMouseDown}
            />
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
              {paginatedData.map((row) => (
                <TableRow
                  key={row.id}
                  row={row}
                  columns={columns}
                  columnWidths={columnWidths}
                  isSelected={selectedRows.has(row.id)}
                  onSelectRow={handleSelectRow}
                  editingCell={editingCell}
                  editValue={editValue}
                  onCellClick={handleCellClick}
                  onEditValueChange={setEditValue}
                  onEditSubmit={handleEditSubmit}
                  onEditCancel={handleEditCancel}
                  onKeyDown={handleKeyDown}
                  onStatusChange={handleStatusChange}
                  uniqueRoles={uniqueRoles}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          paginationInfo={paginationInfo}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          totalItems={filteredAndSortedData.length}
          originalDataLength={data.length}
          hasFilters={searchTerm !== '' || filterCriteria.length > 0}
        />
      </div>
    </div>
  );
};

export default ResizableTable;
