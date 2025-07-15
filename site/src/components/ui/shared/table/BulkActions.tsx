import React from 'react';
import { BulkActionsProps } from './types';

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onBulkStatusUpdate,
  onBulkDelete,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between">
        <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
          Đã chọn {selectedCount} mục
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => onBulkStatusUpdate('Active')}
            className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-300"
          >
            Kích hoạt
          </button>
          <button
            onClick={() => onBulkStatusUpdate('Inactive')}
            className="px-3 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300"
          >
            Vô hiệu hóa
          </button>
          <button
            onClick={onBulkDelete}
            className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-300"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;
