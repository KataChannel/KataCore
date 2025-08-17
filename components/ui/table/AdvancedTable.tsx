import React, { useRef, useState, useMemo } from 'react';
import { TableColumn, TableProps } from './types';
import { useTable } from './useTable';

interface ResizeHandleProps {
  column: TableColumn;
  onResize: (columnId: string, width: number) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ column, onResize }) => {
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = column.width || 150;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.max(column.minWidth || 50, startWidthRef.current + deltaX);
      onResize(column.id, newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500 ${
        isResizing ? 'bg-blue-500' : ''
      }`}
      onMouseDown={handleMouseDown}
    />
  );
};

interface DragDropContextProps {
  onColumnMove?: (dragIndex: number, hoverIndex: number) => void;
  onRowMove?: (dragIndex: number, hoverIndex: number) => void;
  children: React.ReactNode;
}

const DragDropContext: React.FC<DragDropContextProps> = ({ children }) => {
  return <div>{children}</div>;
};

interface DraggableHeaderProps {
  column: TableColumn;
  index: number;
  children: React.ReactNode;
  onMove?: (dragIndex: number, hoverIndex: number) => void;
  enableReorder?: boolean;
}

const DraggableHeader: React.FC<DraggableHeaderProps> = ({ 
  column, 
  index, 
  children, 
  onMove, 
  enableReorder = false 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartIndex = useRef<number>(-1);

  const handleDragStart = (e: React.DragEvent) => {
    if (!enableReorder || !onMove) return;
    setIsDragging(true);
    dragStartIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', column.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!enableReorder || !onMove) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!enableReorder || !onMove) return;
    e.preventDefault();
    const dragIndex = dragStartIndex.current;
    const hoverIndex = index;
    
    if (dragIndex !== hoverIndex && dragIndex >= 0) {
      onMove(dragIndex, hoverIndex);
    }
    setIsDragging(false);
    dragStartIndex.current = -1;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    dragStartIndex.current = -1;
  };

  return (
    <th
      draggable={enableReorder}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      className={`relative ${isDragging ? 'opacity-50' : ''}`}
      style={{ cursor: enableReorder ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
    >
      {children}
    </th>
  );
};

interface DraggableRowProps {
  row: any;
  index: number;
  children: React.ReactNode;
  onMove?: (dragIndex: number, hoverIndex: number) => void;
  enableReorder?: boolean;
  rowId: string;
}

const DraggableRow: React.FC<DraggableRowProps> = ({ 
  row, 
  index, 
  children, 
  onMove, 
  enableReorder = false, 
  rowId 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartIndex = useRef<number>(-1);

  const handleDragStart = (e: React.DragEvent) => {
    if (!enableReorder || !onMove) return;
    setIsDragging(true);
    dragStartIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', rowId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!enableReorder || !onMove) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!enableReorder || !onMove) return;
    e.preventDefault();
    const dragIndex = dragStartIndex.current;
    const hoverIndex = index;
    
    if (dragIndex !== hoverIndex && dragIndex >= 0) {
      onMove(dragIndex, hoverIndex);
    }
    setIsDragging(false);
    dragStartIndex.current = -1;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    dragStartIndex.current = -1;
  };

  return (
    <tr
      draggable={enableReorder}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      className={`${isDragging ? 'opacity-50' : ''}`}
      style={{ cursor: enableReorder ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
    >
      {children}
    </tr>
  );
};

export function AdvancedTable<T = any>(props: TableProps<T>) {
  const {
    data,
    columns: initialColumns,
    loading = false,
    enableColumnResize = true,
    enableColumnReorder = true,
    enableSelection = true,
    stickyHeader = true,
    className = '',
    tableClassName = '',
    headerClassName = '',
    bodyClassName = '',
    rowClassName = '',
    emptyState,
    loadingState,
    onRowClick,
    onRowDoubleClick,
    getRowId = (_: T, index: number) => index.toString(),
    ...tableOptions
  } = props;

  const table = useTable(data, initialColumns, tableOptions);
  const tableRef = useRef<HTMLDivElement>(null);

  const orderedColumns = useMemo(() => {
    return table.state.columnOrder
      .map(id => table.columns.find(col => col.id === id))
      .filter(Boolean) as TableColumn<T>[];
  }, [table.state.columnOrder, table.columns]);

  const visibleColumns = useMemo(() => {
    return orderedColumns.filter(col => table.state.columnVisibility[col.id]);
  }, [orderedColumns, table.state.columnVisibility]);

  const handleColumnMove = (dragIndex: number, hoverIndex: number) => {
    const newOrder = [...table.state.columnOrder];
    const dragColumn = newOrder[dragIndex];
    if (!dragColumn) return;
    
    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, dragColumn);
    table.setColumnOrder(newOrder);
  };

  const handleRowMove = (dragIndex: number, hoverIndex: number) => {
    // This would need to be handled by parent component
    // as it requires modifying the original data array
    console.log('Row moved from', dragIndex, 'to', hoverIndex);
  };

  const handleColumnResize = (columnId: string, width: number) => {
    table.setColumnSizing({
      ...table.state.columnSizing,
      [columnId]: width,
    });
  };

  const getCellValue = (row: T, column: TableColumn<T>) => {
    if (column.accessor) {
      return column.accessor(row);
    }
    if (column.accessorKey) {
      return row[column.accessorKey as keyof T];
    }
    return '';
  };

  const renderCell = (row: T, column: TableColumn<T>, rowIndex: number) => {
    const value = getCellValue(row, column);
    
    if (column.cell) {
      return column.cell(value, row, rowIndex);
    }
    
    return value;
  };

  const getRowClassNames = (row: T, index: number) => {
    if (typeof rowClassName === 'function') {
      return rowClassName(row, index);
    }
    return rowClassName;
  };

  if (loading && loadingState) {
    return <div className="w-full">{loadingState}</div>;
  }

  if (!data.length && emptyState) {
    return <div className="w-full">{emptyState}</div>;
  }

  return (
    <DragDropContext onColumnMove={handleColumnMove} onRowMove={handleRowMove}>
      <div 
        ref={tableRef}
        className={`w-full overflow-auto relative ${className}`}
      >
        <table className={`w-full border-collapse ${tableClassName}`}>
          <thead 
            className={`
              ${stickyHeader ? 'sticky top-0 z-10' : ''}
              bg-gray-50 dark:bg-gray-800
              ${headerClassName}
            `}
          >
            <tr>
              {enableSelection && (
                <th className="w-12 p-4 text-left bg-gray-50 dark:bg-gray-800">
                  <input
                    type="checkbox"
                    checked={table.state.selection.isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = table.state.selection.isIndeterminate;
                    }}
                    onChange={table.toggleAllRowsSelection}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              
              {visibleColumns.map((column, index) => {
                const width = table.state.columnSizing[column.id] || column.width;
                const isSticky = column.sticky;
                
                const headerContent = (
                  <div 
                    className={`
                      relative p-4 text-left font-medium text-gray-900 dark:text-gray-100
                      ${column.headerClassName || ''}
                      ${isSticky ? `sticky ${column.sticky === 'left' ? 'left-0' : 'right-0'} bg-gray-50 dark:bg-gray-800` : ''}
                    `}
                    style={{ 
                      width: width ? `${width}px` : undefined,
                      minWidth: column.minWidth ? `${column.minWidth}px` : undefined,
                      maxWidth: column.maxWidth ? `${column.maxWidth}px` : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{column.header}</span>
                      
                      {column.sortable && (
                        <button
                          onClick={() => {
                            const existingSort = table.state.sorts.find(s => s.columnId === column.id);
                            if (existingSort) {
                              if (existingSort.direction === 'asc') {
                                table.setSorts([{ columnId: column.id, direction: 'desc' }]);
                              } else {
                                table.setSorts([]);
                              }
                            } else {
                              table.setSorts([{ columnId: column.id, direction: 'asc' }]);
                            }
                          }}
                          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {(() => {
                            const sort = table.state.sorts.find(s => s.columnId === column.id);
                            if (sort?.direction === 'asc') return '↑';
                            if (sort?.direction === 'desc') return '↓';
                            return '↕';
                          })()}
                        </button>
                      )}
                    </div>
                    
                    {enableColumnResize && column.resizable !== false && (
                      <ResizeHandle column={column} onResize={handleColumnResize} />
                    )}
                  </div>
                );

                return (
                  <DraggableHeader
                    key={column.id}
                    column={column}
                    index={index}
                    onMove={handleColumnMove}
                    enableReorder={enableColumnReorder}
                  >
                    {headerContent}
                  </DraggableHeader>
                );
              })}
            </tr>
          </thead>
          
          <tbody className={`bg-white dark:bg-gray-900 ${bodyClassName}`}>
            {table.paginatedData.map((row, rowIndex) => {
              const rowId = getRowId(row, rowIndex);
              const isSelected = table.getIsRowSelected(rowId);
              
              const rowContent = (
                <>
                  {enableSelection && (
                    <td className="w-12 p-4 bg-white dark:bg-gray-900">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => table.toggleRowSelection(rowId)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  
                  {visibleColumns.map((column) => {
                    const width = table.state.columnSizing[column.id] || column.width;
                    const isSticky = column.sticky;
                    
                    return (
                      <td
                        key={column.id}
                        className={`
                          p-4 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700
                          ${column.cellClassName || ''}
                          ${isSticky ? `sticky ${column.sticky === 'left' ? 'left-0' : 'right-0'} bg-white dark:bg-gray-900` : ''}
                        `}
                        style={{ 
                          width: width ? `${width}px` : undefined,
                          minWidth: column.minWidth ? `${column.minWidth}px` : undefined,
                          maxWidth: column.maxWidth ? `${column.maxWidth}px` : undefined,
                        }}
                      >
                        {renderCell(row, column, rowIndex)}
                      </td>
                    );
                  })}
                </>
              );

              return (
                <DraggableRow
                  key={rowId}
                  row={row}
                  index={rowIndex}
                  rowId={rowId}
                  onMove={handleRowMove}
                  enableReorder={enableColumnReorder}
                >
                  {rowContent}
                </DraggableRow>
              );
            })}
          </tbody>
        </table>
        
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-20">
            {loadingState || (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600 dark:text-gray-400">Đang tải...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </DragDropContext>
  );
}
