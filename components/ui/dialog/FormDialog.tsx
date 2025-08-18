"use client";

import React, { useState } from 'react';
import { Dialog } from './Dialog';
import { FormDialogProps, FormField } from './types';

export const FormDialog: React.FC<FormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = 'Form',
  defaultValues = {},
  formFields,
  submitText = 'Lưu',
  isLoading = false,
  ...dialogProps
}) => {
  const [formData, setFormData] = useState<any>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    formFields.forEach(field => {
      const value = formData[field.name];

      // Required validation
      if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        newErrors[field.name] = `${field.label} là bắt buộc`;
        return;
      }

      // Skip other validations if field is empty and not required
      if (!value) return;

      // Type validations
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.name] = 'Email không hợp lệ';
        }
      }

      // Custom validations
      if (field.validation) {
        const { pattern, min, max, minLength, maxLength, custom } = field.validation;

        if (pattern && !pattern.test(value)) {
          newErrors[field.name] = `${field.label} không đúng định dạng`;
        }

        if (typeof value === 'string') {
          if (minLength && value.length < minLength) {
            newErrors[field.name] = `${field.label} phải có ít nhất ${minLength} ký tự`;
          }
          if (maxLength && value.length > maxLength) {
            newErrors[field.name] = `${field.label} không được vượt quá ${maxLength} ký tự`;
          }
        }

        if (typeof value === 'number') {
          if (min !== undefined && value < min) {
            newErrors[field.name] = `${field.label} phải lớn hơn hoặc bằng ${min}`;
          }
          if (max !== undefined && value > max) {
            newErrors[field.name] = `${field.label} phải nhỏ hơn hoặc bằng ${max}`;
          }
        }

        if (custom) {
          const customError = custom(value);
          if (customError) {
            newErrors[field.name] = customError;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    const baseInputClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
      error ? 'border-red-500' : 'border-gray-300'
    } ${field.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className={`mb-4 ${field.className || ''}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled}
              className={`${baseInputClasses} min-h-[80px]`}
              rows={3}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className={`mb-4 ${field.className || ''}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              disabled={field.disabled}
              className={baseInputClasses}
            >
              <option value="">Chọn {field.label.toLowerCase()}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className={`mb-4 ${field.className || ''}`}>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                disabled={field.disabled}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'file':
        return (
          <div key={field.name} className={`mb-4 ${field.className || ''}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="file"
              onChange={(e) => handleInputChange(field.name, e.target.files?.[0] || null)}
              disabled={field.disabled}
              className={baseInputClasses}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      default:
        return (
          <div key={field.name} className={`mb-4 ${field.className || ''}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => {
                const val = field.type === 'number' ? Number(e.target.value) : e.target.value;
                handleInputChange(field.name, val);
              }}
              placeholder={field.placeholder}
              disabled={field.disabled}
              className={baseInputClasses}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      customFooter={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="dialog-form"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {submitText}
          </button>
        </div>
      }
      {...dialogProps}
    >
      <form id="dialog-form" onSubmit={handleSubmit} className="space-y-4">
        {formFields.map(renderField)}
      </form>
    </Dialog>
  );
};
