"use client";

import React from 'react';
import { TableColumn } from '../table/types';
import { 
  Dialog, 
  ConfirmDialog, 
  FormDialog, 
  useDialog, 
  useConfirm,
  FormField,
  createTextField,
  createEmailField,
  createSelectField,
  createTextareaField,
  createDateField
} from '../dialog';

export interface TableDialogActions<T = any> {
  onAdd?: (data: T) => Promise<void> | void;
  onEdit?: (data: T, originalData: T) => Promise<void> | void;
  onDelete?: (data: T) => Promise<void> | void;
  onView?: (data: T) => void;
  onDuplicate?: (data: T) => Promise<void> | void;
}

export interface TableDialogConfig<T = any> {
  addDialog?: {
    title?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
    fields: FormField[];
    defaultValues?: Partial<T>;
  };
  editDialog?: {
    title?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
    fields: FormField[];
  };
  deleteDialog?: {
    title?: string;
    message?: string;
  };
  viewDialog?: {
    title?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
    render: (data: T) => React.ReactNode;
  };
}

interface TableActionsProps<T = any> {
  data: T;
  actions: TableDialogActions<T>;
  config: TableDialogConfig<T>;
  loading?: boolean;
}

export const TableActions = <T extends Record<string, any>>({
  data,
  actions,
  config,
  loading = false,
}: TableActionsProps<T>) => {
  const addDialog = useDialog();
  const editDialog = useDialog();
  const viewDialog = useDialog();
  const confirm = useConfirm();

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleAdd = () => {
    addDialog.open();
  };

  const handleEdit = () => {
    editDialog.open();
  };

  const handleDelete = async () => {
    if (!actions.onDelete) return;

    const confirmed = await confirm({
      title: config.deleteDialog?.title || 'Xác nhận xóa',
      message: config.deleteDialog?.message || 'Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      destructive: true,
    });

    if (confirmed) {
      setIsSubmitting(true);
      try {
        await actions.onDelete(data);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleView = () => {
    viewDialog.open();
  };

  const handleDuplicate = async () => {
    if (!actions.onDuplicate) return;

    setIsSubmitting(true);
    try {
      await actions.onDuplicate(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubmit = async (formData: T) => {
    if (!actions.onAdd) return;

    setIsSubmitting(true);
    try {
      await actions.onAdd(formData);
      addDialog.close();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (formData: T) => {
    if (!actions.onEdit) return;

    setIsSubmitting(true);
    try {
      await actions.onEdit(formData, data);
      editDialog.close();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {actions.onView && (
          <button
            onClick={handleView}
            disabled={loading || isSubmitting}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors duration-200 disabled:opacity-50"
            title="Xem chi tiết"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        )}
        
        {actions.onEdit && (
          <button
            onClick={handleEdit}
            disabled={loading || isSubmitting}
            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors duration-200 disabled:opacity-50"
            title="Chỉnh sửa"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}

        {actions.onDuplicate && (
          <button
            onClick={handleDuplicate}
            disabled={loading || isSubmitting}
            className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors duration-200 disabled:opacity-50"
            title="Nhân bản"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        )}

        {actions.onDelete && (
          <button
            onClick={handleDelete}
            disabled={loading || isSubmitting}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors duration-200 disabled:opacity-50"
            title="Xóa"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Add Dialog */}
      {config.addDialog && (
        <FormDialog
          isOpen={addDialog.isOpen}
          onClose={addDialog.close}
          onSubmit={handleAddSubmit}
          title={config.addDialog.title || 'Thêm mới'}
          size={config.addDialog.size || 'md'}
          formFields={config.addDialog.fields}
          defaultValues={config.addDialog.defaultValues}
          isLoading={isSubmitting}
          submitText="Thêm mới"
        />
      )}

      {/* Edit Dialog */}
      {config.editDialog && (
        <FormDialog
          isOpen={editDialog.isOpen}
          onClose={editDialog.close}
          onSubmit={handleEditSubmit}
          title={config.editDialog.title || 'Chỉnh sửa'}
          size={config.editDialog.size || 'md'}
          formFields={config.editDialog.fields}
          defaultValues={data}
          isLoading={isSubmitting}
          submitText="Cập nhật"
        />
      )}

      {/* View Dialog */}
      {config.viewDialog && (
        <Dialog
          isOpen={viewDialog.isOpen}
          onClose={viewDialog.close}
          title={config.viewDialog.title || 'Chi tiết'}
          size={config.viewDialog.size || 'lg'}
          showFooter={false}
        >
          {config.viewDialog.render(data)}
        </Dialog>
      )}
    </>
  );
};

// Toolbar component for bulk actions
interface TableToolbarActionsProps<T = any> {
  selectedRows: T[];
  actions: {
    onBulkDelete?: (rows: T[]) => Promise<void> | void;
    onBulkEdit?: (rows: T[]) => Promise<void> | void;
    onExport?: (rows: T[]) => Promise<void> | void;
    onAdd?: () => void;
  };
  loading?: boolean;
}

export const TableToolbarActions = <T extends Record<string, any>>({
  selectedRows,
  actions,
  loading = false,
}: TableToolbarActionsProps<T>) => {
  const confirm = useConfirm();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleBulkDelete = async () => {
    if (!actions.onBulkDelete || selectedRows.length === 0) return;

    const confirmed = await confirm({
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa ${selectedRows.length} mục đã chọn? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa tất cả',
      cancelText: 'Hủy',
      destructive: true,
    });

    if (confirmed) {
      setIsSubmitting(true);
      try {
        await actions.onBulkDelete(selectedRows);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBulkEdit = async () => {
    if (!actions.onBulkEdit || selectedRows.length === 0) return;

    setIsSubmitting(true);
    try {
      await actions.onBulkEdit(selectedRows);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async () => {
    if (!actions.onExport) return;

    setIsSubmitting(true);
    try {
      await actions.onExport(selectedRows.length > 0 ? selectedRows : []);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {actions.onAdd && (
        <button
          onClick={actions.onAdd}
          disabled={loading || isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm mới
        </button>
      )}

      {selectedRows.length > 0 && (
        <>
          {actions.onBulkEdit && (
            <button
              onClick={handleBulkEdit}
              disabled={loading || isSubmitting}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Sửa ({selectedRows.length})
            </button>
          )}

          {actions.onBulkDelete && (
            <button
              onClick={handleBulkDelete}
              disabled={loading || isSubmitting}
              className="px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Xóa ({selectedRows.length})
            </button>
          )}
        </>
      )}

      {actions.onExport && (
        <button
          onClick={handleExport}
          disabled={loading || isSubmitting}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Xuất Excel {selectedRows.length > 0 && `(${selectedRows.length})`}
        </button>
      )}
    </div>
  );
};

// Helper function to create action column
export const createActionsColumn = <T extends Record<string, any>>(
  actions: TableDialogActions<T>,
  config: TableDialogConfig<T>,
  options?: { 
    loading?: boolean;
    width?: number;
    sticky?: 'left' | 'right' | false;
  }
): TableColumn<T> => ({
  id: 'actions',
  header: 'Thao tác',
  accessorKey: undefined,
  sortable: false,
  filterable: false,
  resizable: false,
  sticky: options?.sticky || false,
  width: options?.width || 120,
  minWidth: options?.width || 120,
  maxWidth: options?.width || 120,
  cell: (value: any, row: T, index: number) => (
    <TableActions
      data={row}
      actions={actions}
      config={config}
      loading={options?.loading}
    />
  ),
});
