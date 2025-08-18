"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Dialog } from './Dialog';
import { ConfirmDialog } from './ConfirmDialog';
import { DialogContextType, DialogProps, ConfirmDialogProps, ConfirmOptions } from './types';

const DialogContext = createContext<DialogContextType | null>(null);

export const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialogContext must be used within a DialogProvider');
  }
  return context;
};

interface DialogProviderProps {
  children: React.ReactNode;
}

export const DialogProvider: React.FC<DialogProviderProps> = ({ children }) => {
  const [currentDialog, setCurrentDialog] = useState<DialogProps | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogProps | null>(null);
  const [confirmResolve, setConfirmResolve] = useState<((value: boolean) => void) | null>(null);

  const openDialog = useCallback((config: DialogProps) => {
    setCurrentDialog(config);
  }, []);

  const closeDialog = useCallback(() => {
    setCurrentDialog(null);
  }, []);

  const confirm = useCallback((config: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({
        ...config,
        isOpen: true,
        onConfirm: () => {},
        onCancel: () => {},
      });
      setConfirmResolve(() => resolve);
    });
  }, []);

  const handleConfirmResult = useCallback((result: boolean) => {
    if (confirmResolve) {
      confirmResolve(result);
      setConfirmResolve(null);
    }
    setConfirmDialog(null);
  }, [confirmResolve]);

  const value: DialogContextType = {
    openDialog,
    closeDialog,
    confirm,
  };

  return (
    <DialogContext.Provider value={value}>
      {children}
      
      {/* Global Dialog */}
      {currentDialog && (
        <Dialog
          {...currentDialog}
          onClose={() => {
            currentDialog.onClose?.();
            closeDialog();
          }}
        />
      )}

      {/* Global Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          {...confirmDialog}
          onConfirm={() => handleConfirmResult(true)}
          onCancel={() => handleConfirmResult(false)}
        />
      )}
    </DialogContext.Provider>
  );
};

// Helper hooks for common dialog patterns
export const useConfirm = () => {
  const { confirm } = useDialogContext();
  return confirm;
};

export const useAlert = () => {
  const { openDialog } = useDialogContext();
  
  return useCallback((message: string, title?: string) => {
    openDialog({
      isOpen: true,
      title: title || 'Thông báo',
      children: <p>{message}</p>,
      onClose: () => {},
      showFooter: true,
      customFooter: (
        <button
          onClick={() => {}}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          OK
        </button>
      ),
    });
  }, [openDialog]);
};
