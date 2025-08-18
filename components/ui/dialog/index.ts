// Core dialog components
export { Dialog } from './Dialog';
export { ConfirmDialog } from './ConfirmDialog';
export { FormDialog } from './FormDialog';
export { DialogProvider, useDialogContext, useConfirm, useAlert } from './DialogProvider';

// Hooks
export { useDialog, useDialogPosition } from './hooks';

// Types
export type {
  DialogProps,
  DialogSize,
  DialogPosition,
  ConfirmDialogProps,
  ConfirmOptions,
  FormDialogProps,
  FormField,
  UseDialogReturn,
  DialogContextType,
} from './types';

// Import types for utility functions
import type { FormField } from './types';

// Utility functions
export const createFormField = (config: Partial<FormField> & Pick<FormField, 'name' | 'label' | 'type'>): FormField => ({
  placeholder: '',
  required: false,
  disabled: false,
  className: '',
  ...config,
});

export const createSelectField = (
  name: string,
  label: string,
  options: { label: string; value: any }[],
  config?: Partial<Omit<FormField, 'name' | 'label' | 'type' | 'options'>>
): FormField => ({
  name,
  label,
  type: 'select',
  options,
  placeholder: '',
  required: false,
  disabled: false,
  className: '',
  ...config,
});

export const createTextField = (
  name: string,
  label: string,
  config?: Partial<Omit<FormField, 'name' | 'label' | 'type'>>
): FormField => ({
  name,
  label,
  type: 'text',
  placeholder: '',
  required: false,
  disabled: false,
  className: '',
  ...config,
});

export const createEmailField = (
  name: string,
  label: string,
  config?: Partial<Omit<FormField, 'name' | 'label' | 'type'>>
): FormField => ({
  name,
  label,
  type: 'email',
  placeholder: '',
  required: false,
  disabled: false,
  className: '',
  ...config,
});

export const createPasswordField = (
  name: string,
  label: string,
  config?: Partial<Omit<FormField, 'name' | 'label' | 'type'>>
): FormField => ({
  name,
  label,
  type: 'password',
  placeholder: '',
  required: false,
  disabled: false,
  className: '',
  ...config,
});

export const createNumberField = (
  name: string,
  label: string,
  config?: Partial<Omit<FormField, 'name' | 'label' | 'type'>>
): FormField => ({
  name,
  label,
  type: 'number',
  placeholder: '',
  required: false,
  disabled: false,
  className: '',
  ...config,
});

export const createTextareaField = (
  name: string,
  label: string,
  config?: Partial<Omit<FormField, 'name' | 'label' | 'type'>>
): FormField => ({
  name,
  label,
  type: 'textarea',
  placeholder: '',
  required: false,
  disabled: false,
  className: '',
  ...config,
});

export const createCheckboxField = (
  name: string,
  label: string,
  config?: Partial<Omit<FormField, 'name' | 'label' | 'type'>>
): FormField => ({
  name,
  label,
  type: 'checkbox',
  placeholder: '',
  required: false,
  disabled: false,
  className: '',
  ...config,
});

export const createDateField = (
  name: string,
  label: string,
  config?: Partial<Omit<FormField, 'name' | 'label' | 'type'>>
): FormField => ({
  name,
  label,
  type: 'date',
  placeholder: '',
  required: false,
  disabled: false,
  className: '',
  ...config,
});

export const createFileField = (
  name: string,
  label: string,
  config?: Partial<Omit<FormField, 'name' | 'label' | 'type'>>
): FormField => ({
  name,
  label,
  type: 'file',
  placeholder: '',
  required: false,
  disabled: false,
  className: '',
  ...config,
});
