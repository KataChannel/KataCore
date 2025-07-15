import React from 'react';
import { TableRowProps } from './types';

const TableRow: React.FC<TableRowProps> = ({
  row,
  columns,
  columnWidths,
  isSelected,
  onSelectRow,
  editingCell,
  editValue,
  onCellClick,
  onEditValueChange,
  onEditSubmit,
  onEditCancel,
  onKeyDown,
  onStatusChange,
  uniqueRoles,
}) => {
  const renderCell = (columnKey: string, value: any) => {
    if (columnKey === 'select') {
      return (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelectRow(row.id)}
          className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:bg-gray-800"
        />
      );
    }

    if (columnKey === 'status') {
      return (
        <select
          value={row.status}
          onChange={(e) => onStatusChange(row.id, e.target.value as 'Active' | 'Inactive')}
          className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer transition-colors duration-300 ${
            row.status === 'Active'
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}
        >
          <option value="Active">Hoạt động</option>
          <option value="Inactive">Không hoạt động</option>
        </select>
      );
    }

    const isEditing = editingCell?.rowId === row.id && editingCell?.column === columnKey;

    if (isEditing) {
      if (columnKey === 'role') {
        return (
          <select
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            onBlur={onEditSubmit}
            onKeyDown={onKeyDown}
            className="w-full px-2 py-1 border border-blue-500 dark:border-blue-400 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
            autoFocus
          >
            {uniqueRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        );
      }

      return (
        <input
          type={columnKey === 'email' ? 'email' : 'text'}
          value={editValue}
          onChange={(e) => onEditValueChange(e.target.value)}
          onBlur={onEditSubmit}
          onKeyDown={onKeyDown}
          className="w-full px-2 py-1 border border-blue-500 dark:border-blue-400 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
          autoFocus
        />
      );
    }

    return (
      <div
        className="truncate hover:bg-blue-50 dark:hover:bg-blue-900/30 px-2 py-1 rounded cursor-pointer transition-colors duration-300"
        onClick={() => onCellClick(row.id, columnKey, value)}
      >
        {value}
      </div>
    );
  };

  return (
    <tr
      className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''
      }`}
    >
      {columns.map((column) => (
        <td
          key={column.key}
          className={`px-4 py-3 text-sm ${
            column.key === 'name' 
              ? 'font-medium text-gray-900 dark:text-gray-100' 
              : 'text-gray-600 dark:text-gray-300'
          } ${
            column.key !== 'status' 
              ? 'border-r border-gray-200 dark:border-gray-700' 
              : ''
          } transition-colors duration-300`}
          style={{
            width: `${columnWidths[column.key]}px`,
            minWidth: `${columnWidths[column.key]}px`,
          }}
        >
          {renderCell(column.key, (row as any)[column.key])}
        </td>
      ))}
    </tr>
  );
};

export default TableRow;
