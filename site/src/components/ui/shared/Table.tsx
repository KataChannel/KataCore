import React, { useState, useRef, useCallback, useMemo } from 'react';

// Define the structure for a single row of table data
interface TableData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
}

// Define the type for column widths, mapping column keys to their pixel widths
interface ColumnWidth {
  [key: string]: number;
}

// Define sort order types
type SortOrder = 'asc' | 'desc' | null;

// Define the structure for sort configuration
interface SortConfig {
  key: string | null;
  order: SortOrder;
}

// Define the structure for tracking which cell is being edited
interface EditingCell {
  rowId: number;
  column: string;
}

// Define the structure for pagination information
interface PaginationInfo {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

// Define the structure for a single filter criterion
interface FilterCriterion {
  id: string; // Unique ID for each filter
  columnKey: string;
  operator: string;
  value: string;
}

const ResizableTable: React.FC = () => {
  // Initial static data for the table
  const initialData: TableData[] = [
    { id: 1, name: 'Nguyễn Văn An', email: 'an.nguyen@email.com', role: 'Developer', status: 'Active' },
    { id: 2, name: 'Trần Thị Bình', email: 'binh.tran@email.com', role: 'Designer', status: 'Active' },
    { id: 3, name: 'Lê Hoàng Cường', email: 'cuong.le@email.com', role: 'Manager', status: 'Inactive' },
    { id: 4, name: 'Phạm Thị Dung', email: 'dung.pham@email.com', role: 'Tester', status: 'Active' },
    { id: 5, name: 'Hoàng Minh Đức', email: 'duc.hoang@email.com', role: 'Developer', status: 'Active' },
    { id: 6, name: 'Võ Thị Em', email: 'em.vo@email.com', role: 'Designer', status: 'Inactive' },
    { id: 7, name: 'Đỗ Văn Phúc', email: 'phuc.do@email.com', role: 'Manager', status: 'Active' },
    { id: 8, name: 'Bùi Thị Giang', email: 'giang.bui@email.com', role: 'Tester', status: 'Active' },
    { id: 9, name: 'Lý Văn Hải', email: 'hai.ly@email.com', role: 'Developer', status: 'Inactive' },
    { id: 10, name: 'Phan Thị Inh', email: 'inh.phan@email.com', role: 'Designer', status: 'Active' },
    { id: 11, name: 'Ngô Văn Khang', email: 'khang.ngo@email.com', role: 'Manager', status: 'Active' },
    { id: 12, name: 'Đinh Thị Lan', email: 'lan.dinh@email.com', role: 'Tester', status: 'Inactive' },
    { id: 13, name: 'Vũ Văn Minh', email: 'minh.vu@email.com', role: 'Developer', status: 'Active' },
    { id: 14, name: 'Tô Thị Nga', email: 'nga.to@email.com', role: 'Designer', status: 'Active' },
    { id: 15, name: 'Lưu Văn Oanh', email: 'oanh.luu@email.com', role: 'Manager', status: 'Inactive' },
  ];

  // State for the table data
  const [data, setData] = useState<TableData[]>(initialData);
  // State for the general search term
  const [searchTerm, setSearchTerm] = useState('');
  // State for current dynamic filter criteria
  const [filterCriteria, setFilterCriteria] = useState<FilterCriterion[]>([]);
  // State for the new filter being added
  const [newFilterColumn, setNewFilterColumn] = useState<string>('name');
  const [newFilterOperator, setNewFilterOperator] = useState<string>('contains');
  const [newFilterValue, setNewFilterValue] = useState<string>('');

  // State for sorting configuration
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, order: null });
  // State for tracking the cell currently being edited
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  // State for the value of the cell being edited
  const [editValue, setEditValue] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Bulk operations states
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // State for column widths, allowing resizing
  const [columnWidths, setColumnWidths] = useState<ColumnWidth>({
    select: 50,
    name: 200,
    email: 250,
    role: 150,
    status: 120,
  });

  // State for resize functionality
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  // Ref for the table element to manage event listeners
  const tableRef = useRef<HTMLTableElement>(null);

  // Callback for handling mouse down event on resize handles
  const handleMouseDown = useCallback((e: React.MouseEvent, column: string) => {
    e.preventDefault();
    setIsResizing(column);
    setStartX(e.clientX);
    setStartWidth(columnWidths[column]);
  }, [columnWidths]);

  // Callback for handling mouse move event during resizing
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const diff = e.clientX - startX;
    const newWidth = Math.max(80, startWidth + diff); // Minimum column width of 80px
    
    setColumnWidths(prev => ({
      ...prev,
      [isResizing]: newWidth
    }));
  }, [isResizing, startX, startWidth]);

  // Callback for handling mouse up event to stop resizing
  const handleMouseUp = useCallback(() => {
    setIsResizing(null);
  }, []);

  // Effect to add/remove mouse event listeners for resizing
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize'; // Change cursor during resize
      document.body.style.userSelect = 'none'; // Prevent text selection during resize
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = ''; // Reset cursor
        document.body.style.userSelect = ''; // Re-enable text selection
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Function to handle column sorting
  const handleSort = (key: string) => {
    let order: SortOrder = 'asc';
    if (sortConfig.key === key && sortConfig.order === 'asc') {
      order = 'desc';
    } else if (sortConfig.key === key && sortConfig.order === 'desc') {
      order = null; // Reset sort if already desc
    }
    setSortConfig({ key: order ? key : null, order });
  };

  // Function to handle cell click for editing
  const handleCellClick = (rowId: number, column: string, value: string) => {
    // Prevent editing for 'status' and 'select' columns
    if (column === 'status' || column === 'select') return;
    setEditingCell({ rowId, column });
    setEditValue(value);
  };

  // Function to submit edited cell value
  const handleEditSubmit = () => {
    if (editingCell) {
      setData(prev => prev.map(row => 
        row.id === editingCell.rowId 
          ? { ...row, [editingCell.column]: editValue } // Update the specific cell
          : row
      ));
      setEditingCell(null); // Exit edit mode
      setEditValue(''); // Clear edit value
    }
  };

  // Function to cancel cell editing
  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Function to handle key presses during cell editing (Enter to submit, Escape to cancel)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  // Function to handle status change for a specific row
  const handleStatusChange = (rowId: number, newStatus: 'Active' | 'Inactive') => {
    setData(prev => prev.map(row => 
      row.id === rowId ? { ...row, status: newStatus } : row
    ));
  };

  // Function to handle single row selection
  const handleSelectRow = (rowId: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
    setSelectAll(false); // Deselect "select all" checkbox if a single row is unselected
    setShowBulkActions(newSelected.size > 0); // Show bulk actions if any row is selected
  };

  // Function to handle select/deselect all rows on the current page
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
      setSelectAll(false);
      setShowBulkActions(false);
    } else {
      const currentPageIds = paginatedData.map(row => row.id);
      setSelectedRows(new Set(currentPageIds));
      setSelectAll(true);
      setShowBulkActions(true);
    }
  };

  // Function to handle bulk delete action
  const handleBulkDelete = () => {
    // Using window.confirm as a placeholder for a custom modal
    if (window.confirm(`Bạn có chắc muốn xóa ${selectedRows.size} mục đã chọn?`)) {
      setData(prev => prev.filter(row => !selectedRows.has(row.id)));
      setSelectedRows(new Set());
      setSelectAll(false);
      setShowBulkActions(false);
      // Reset to first page if current page becomes empty after deletion
      const newTotalPages = Math.ceil((data.length - selectedRows.size) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(1);
      }
    }
  };

  // Function to handle bulk status update
  const handleBulkStatusUpdate = (newStatus: 'Active' | 'Inactive') => {
    setData(prev => prev.map(row => 
      selectedRows.has(row.id) ? { ...row, status: newStatus } : row
    ));
    setSelectedRows(new Set());
    setSelectAll(false);
    setShowBulkActions(false);
  };

  // Operators definition based on data type
  const operators = {
    string: [
      { label: 'chứa', value: 'contains', apply: (itemVal: string, filterVal: string) => itemVal.toLowerCase().includes(filterVal.toLowerCase()) },
      { label: 'bằng', value: 'equals', apply: (itemVal: string, filterVal: string) => itemVal.toLowerCase() === filterVal.toLowerCase() },
      { label: 'bắt đầu bằng', value: 'startsWith', apply: (itemVal: string, filterVal: string) => itemVal.toLowerCase().startsWith(filterVal.toLowerCase()) },
      { label: 'kết thúc bằng', value: 'endsWith', apply: (itemVal: string, filterVal: string) => itemVal.toLowerCase().endsWith(filterVal.toLowerCase()) },
    ],
    select: [
      { label: 'bằng', value: 'equals', apply: (itemVal: string, filterVal: string) => itemVal.toLowerCase() === filterVal.toLowerCase() },
    ],
    // Example for number, though current data doesn't use it
    number: [
      { label: 'bằng', value: 'equals', apply: (itemVal: number, filterVal: number) => itemVal === filterVal },
      { label: 'lớn hơn', value: 'greaterThan', apply: (itemVal: number, filterVal: number) => itemVal > filterVal },
      { label: 'nhỏ hơn', value: 'lessThan', apply: (itemVal: number, filterVal: number) => itemVal < filterVal },
    ]
  };

  // Column definitions with data types and filterable flag
  const columns = useMemo(() => [
    { key: 'select', label: '', width: columnWidths.select, filterable: false, dataType: 'string' as const },
    { key: 'name', label: 'Tên', width: columnWidths.name, filterable: true, dataType: 'string' as const },
    { key: 'email', label: 'Email', width: columnWidths.email, filterable: true, dataType: 'string' as const },
    { key: 'role', label: 'Vai trò', width: columnWidths.role, filterable: true, dataType: 'select' as const, options: Array.from(new Set(data.map(item => item.role))) },
    { key: 'status', label: 'Trạng thái', width: columnWidths.status, filterable: true, dataType: 'select' as const, options: ['Active', 'Inactive'] },
  ], [columnWidths, data]);

  // Memoized list of unique roles for role filter dropdown (kept for initial data mapping)
  const uniqueRoles = useMemo(() => {
    return Array.from(new Set(initialData.map(item => item.role)));
  }, []);

  // Handler for adding a new filter criterion
  const handleAddFilter = () => {
    if (newFilterColumn && newFilterOperator && newFilterValue) {
      setFilterCriteria(prev => [
        ...prev,
        { id: crypto.randomUUID(), columnKey: newFilterColumn, operator: newFilterOperator, value: newFilterValue }
      ]);
      setNewFilterValue(''); // Clear input after adding
      setCurrentPage(1); // Reset to first page
    }
  };

  // Handler for removing a filter criterion
  const handleRemoveFilter = (id: string) => {
    setFilterCriteria(prev => prev.filter(criteria => criteria.id !== id));
    setCurrentPage(1); // Reset to first page
  };

  // Get available operators for the currently selected new filter column
  const availableOperators = useMemo(() => {
    const selectedCol = columns.find(col => col.key === newFilterColumn);
    return selectedCol ? operators[selectedCol.dataType] : [];
  }, [newFilterColumn, columns]);

  // Update operator when column changes, reset to default 'contains' or 'equals'
  React.useEffect(() => {
    const selectedCol:any = columns.find(col => col.key === newFilterColumn);
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

  // Memoized filtered and sorted data to optimize performance
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      // General search across name, email, role
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.role.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply dynamic filter criteria
      const matchesFilterCriteria = filterCriteria.every(criterion => {
        const columnDefinition = columns.find(col => col.key === criterion.columnKey);
        if (!columnDefinition) return false;

        const itemValue = (item as any)[criterion.columnKey];
        const operatorDefinition = operators[columnDefinition.dataType].find(op => op.value === criterion.operator);

        if (!operatorDefinition) return false;

        return operatorDefinition.apply(itemValue, criterion.value);
      });
      
      return matchesSearch && matchesFilterCriteria;
    });

    // Apply sorting if sort config is set
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

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);

  // Pagination info object
  const paginationInfo: PaginationInfo = {
    currentPage,
    itemsPerPage,
    totalItems: filteredAndSortedData.length,
    totalPages
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRows(new Set()); // Clear selection on page change
    setSelectAll(false);
    setShowBulkActions(false);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
    setSelectedRows(new Set());
    setSelectAll(false);
    setShowBulkActions(false);
  };

  // Function to get sort icon based on sort order
  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      // Default unsorted icon
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (sortConfig.order === 'asc') {
      // Ascending sort icon
      return (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    
    // Descending sort icon
    return (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // Function to generate pagination numbers with ellipsis
  const getPaginationNumbers = () => {
    const delta = 2; // Number of pages to show around the current page
    const range = [];
    const rangeWithDots = [];

    // Pages around the current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    // Add first page and ellipsis if needed
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    // Add pages in range
    rangeWithDots.push(...range);

    // Add last page and ellipsis if needed
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-inter">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Tiêu đề bảng */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Bảng Dữ liệu Nâng cao</h2>
          <p className="text-sm text-gray-600 mt-1">Quản lý dữ liệu với đầy đủ tính năng</p>
        </div>

        {/* Các điều khiển: Tìm kiếm và Bộ lọc động */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            {/* Tìm kiếm tổng quát */}
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Tìm kiếm tổng quát..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              {(searchTerm || filterCriteria.length > 0) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCriteria([]);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Xóa tất cả bộ lọc
                </button>
              )}
            </div>

            {/* Thêm bộ lọc mới */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Thêm Bộ Lọc:</span>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newFilterColumn}
                onChange={(e) => setNewFilterColumn(e.target.value)}
              >
                {columns.filter(col => col.filterable).map(col => (
                  <option key={col.key} value={col.key}>{col.label}</option>
                ))}
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newFilterOperator}
                onChange={(e) => setNewFilterOperator(e.target.value)}
              >
                {availableOperators.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Giá trị lọc"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 min-w-[120px]"
                value={newFilterValue}
                onChange={(e) => setNewFilterValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddFilter(); }}
              />
              <button
                onClick={handleAddFilter}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Thêm
              </button>
            </div>

            {/* Hiển thị các bộ lọc đang hoạt động */}
            {filterCriteria.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filterCriteria.map(criterion => {
                  const columnLabel = columns.find(col => col.key === criterion.columnKey)?.label || criterion.columnKey;
                  const operatorLabel = availableOperators.find(op => op.value === criterion.operator)?.label || criterion.operator;
                  return (
                    <span key={criterion.id} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {columnLabel} {operatorLabel} "{criterion.value}"
                      <button
                        onClick={() => handleRemoveFilter(criterion.id)}
                        className="ml-2 -mr-0.5 h-4 w-4 inline-flex items-center justify-center rounded-full bg-blue-200 text-blue-600 hover:bg-blue-300"
                      >
                        <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        


               {/* Thanh hành động hàng loạt */}
        {showBulkActions && selectedRows.size>0 && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800 font-medium">
                Đã chọn {selectedRows.size} mục
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkStatusUpdate('Active')}
                  className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                >
                  Kích hoạt
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('Inactive')}
                  className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors"
                >
                  Vô hiệu hóa
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )} 
        {/* Bảng dữ liệu chính */}
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.key}
                    className={`relative px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0 ${
                      column.key !== 'select' ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    style={{ width: `${column.width}px`, minWidth: `${column.width}px` }}
                    onClick={() => column.key !== 'select' && handleSort(column.key)}
                  >
                    <div className="flex items-center justify-between">
                      {column.key === 'select' ? (
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors duration-150 group z-10"
                        onMouseDown={(e) => handleMouseDown(e, column.key)}
                        onClick={(e) => e.stopPropagation()} // Prevent sort when clicking resize handle
                      >
                        <div className="w-full h-full bg-transparent group-hover:bg-blue-500"></div>
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((row) => (
                <tr key={row.id} className={`hover:bg-gray-50 transition-colors duration-150 ${
                  selectedRows.has(row.id) ? 'bg-blue-50' : ''
                }`}>
                  <td 
                    className="px-4 py-3 border-r border-gray-200"
                    style={{ width: `${columnWidths.select}px`, minWidth: `${columnWidths.select}px` }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td 
                    className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200 cursor-pointer"
                    style={{ width: `${columnWidths.name}px`, minWidth: `${columnWidths.name}px` }}
                    onClick={() => handleCellClick(row.id, 'name', row.name)}
                  >
                    {editingCell?.rowId === row.id && editingCell?.column === 'name' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleEditSubmit}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <div className="truncate hover:bg-blue-50 px-2 py-1 rounded">{row.name}</div>
                    )}
                  </td>
                  <td 
                    className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200 cursor-pointer"
                    style={{ width: `${columnWidths.email}px`, minWidth: `${columnWidths.email}px` }}
                    onClick={() => handleCellClick(row.id, 'email', row.email)}
                  >
                    {editingCell?.rowId === row.id && editingCell?.column === 'email' ? (
                      <input
                        type="email"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleEditSubmit}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <div className="truncate hover:bg-blue-50 px-2 py-1 rounded">{row.email}</div>
                    )}
                  </td>
                  <td 
                    className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200 cursor-pointer"
                    style={{ width: `${columnWidths.role}px`, minWidth: `${columnWidths.role}px` }}
                    onClick={() => handleCellClick(row.id, 'role', row.role)}
                  >
                    {editingCell?.rowId === row.id && editingCell?.column === 'role' ? (
                      <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleEditSubmit}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
                        autoFocus
                      >
                        {uniqueRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="truncate hover:bg-blue-50 px-2 py-1 rounded">{row.role}</div>
                    )}
                  </td>
                  <td 
                    className="px-4 py-3 text-sm text-gray-600"
                    style={{ width: `${columnWidths.status}px`, minWidth: `${columnWidths.status}px` }}
                  >
                    <select
                      value={row.status}
                      onChange={(e) => handleStatusChange(row.id, e.target.value as 'Active' | 'Inactive')}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer ${
                        row.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="Active">Hoạt động</option>
                      <option value="Inactive">Không hoạt động</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phân trang và số lượng mục mỗi trang */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-600">
              Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, paginationInfo.totalItems)} trong số {paginationInfo.totalItems} mục
              {(searchTerm || filterCriteria.length > 0) && (
                <span className="ml-1 text-blue-600">(đã lọc từ {data.length} mục)</span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  
                  {getPaginationNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === '...' ? (
                        <span className="px-3 py-1 text-sm text-gray-500">...</span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(page as number)}
                          className={`px-3 py-1 text-sm border rounded-lg ${
                            currentPage === page
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              )}

              {/* Lựa chọn số lượng mục mỗi trang - Đã di chuyển xuống đây */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              >
                <option value={5}>5 / trang</option>
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResizableTable;
