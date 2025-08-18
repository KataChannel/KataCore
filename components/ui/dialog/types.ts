export type DialogSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full' | 'auto';

export interface DialogPosition {
  x: number;
  y: number;
}

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  
  // Size options
  size?: DialogSize;
  fullScreen?: boolean;
  responsive?: boolean;
  
  // Draggable options
  draggable?: boolean;
  dragHandle?: string; // CSS selector for drag handle
  
  // Scrolling options
  scrollable?: boolean;
  maxHeight?: string;
  
  // Confirmation dialog options
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  
  // Styling options
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  
  // Behavior options
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  
  // Animation options
  animation?: 'fade' | 'slide' | 'zoom' | 'none';
  
  // Footer customization
  showFooter?: boolean;
  customFooter?: React.ReactNode;
  
  // Header customization
  showHeader?: boolean;
  customHeader?: React.ReactNode;
  showCloseButton?: boolean;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  icon?: React.ReactNode;
}

export interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  icon?: React.ReactNode;
}

export interface FormDialogProps<T = any> extends Omit<DialogProps, 'onConfirm'> {
  onSubmit: (data: T) => void;
  defaultValues?: Partial<T>;
  validationSchema?: any;
  formFields: FormField[];
  submitText?: string;
  isLoading?: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: any }[];
  validation?: {
    pattern?: RegExp;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => string | null;
  };
  disabled?: boolean;
  className?: string;
}

export interface UseDialogReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export interface DialogContextType {
  openDialog: (config: DialogProps) => void;
  closeDialog: () => void;
  confirm: (config: ConfirmOptions) => Promise<boolean>;
}
