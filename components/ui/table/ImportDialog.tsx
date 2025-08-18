'use client';

import React, { useState, useCallback } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle, 
  Download,
  Info
} from 'lucide-react';
import { importFromExcel, generateTemplate, ExcelColumn } from '@/utils/excel';

interface ImportResult {
  success: boolean;
  data: any[];
  errors: any[];
  imported: number;
  total: number;
}

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<ImportResult>;
  title?: string;
  description?: string;
}

export default function ImportDialog({
  isOpen,
  onClose,
  onImport,
  title = "Nhập dữ liệu nhân viên",
  description = "Chọn file Excel hoặc CSV để nhập dữ liệu nhân viên vào hệ thống"
}: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const employeeColumns: ExcelColumn[] = [
    { key: 'employeeCode', label: 'Mã nhân viên', type: 'string', required: true },
    { key: 'name', label: 'Họ và tên', type: 'string', required: true },
    { key: 'email', label: 'Email', type: 'string', required: true },
    { key: 'phone', label: 'Số điện thoại', type: 'string', required: true },
    { key: 'department', label: 'Phòng ban', type: 'string', required: true, options: [
      'Công nghệ thông tin', 'Nhân sự', 'Tài chính', 'Kinh doanh', 'Marketing', 'Vận hành'
    ]},
    { key: 'position', label: 'Chức vụ', type: 'string', required: true },
    { key: 'status', label: 'Trạng thái', type: 'string', required: true, options: [
      'active', 'inactive', 'terminated'
    ]},
    { key: 'startDate', label: 'Ngày bắt đầu', type: 'date' },
    { key: 'company', label: 'Công ty', type: 'string' }
  ];

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const importResult = await onImport(file);
      setResult(importResult);
    } catch (error) {
      setResult({
        success: false,
        data: [],
        errors: [{ message: 'Có lỗi xảy ra khi nhập dữ liệu' }],
        imported: 0,
        total: 0
      });
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    generateTemplate(employeeColumns, 'employee_import_template.xlsx');
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setImporting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Template Download */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  Tải file mẫu
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Để đảm bảo dữ liệu nhập đúng định dạng, vui lòng tải file mẫu và điền thông tin theo cấu trúc có sẵn.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                           flex items-center gap-2 text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Tải file mẫu Excel
                </button>
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) handleFileSelect(selectedFile);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              
              {file ? (
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Kéo thả file hoặc nhấn để chọn
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Hỗ trợ file Excel (.xlsx, .xls) và CSV (.csv)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Required Columns Info */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Cột bắt buộc trong file:
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {employeeColumns.filter(col => col.required).map(col => (
                <div key={col.key} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">{col.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Import Result */}
          {result && (
            <div className={`border rounded-lg p-4 ${
              result.success 
                ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                : 'border-red-200 bg-red-50 dark:bg-red-900/20'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    result.success 
                      ? 'text-green-900 dark:text-green-100' 
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {result.success ? 'Nhập dữ liệu thành công!' : 'Có lỗi khi nhập dữ liệu'}
                  </h3>
                  
                  <div className="mt-2 text-sm">
                    <p className={result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                      Đã nhập: {result.imported}/{result.total} bản ghi
                    </p>
                    
                    {result.errors.length > 0 && (
                      <div className="mt-3">
                        <p className="font-medium text-red-700 dark:text-red-300 mb-2">
                          Lỗi chi tiết:
                        </p>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {result.errors.slice(0, 10).map((error, index) => (
                            <p key={index} className="text-xs text-red-600 dark:text-red-400">
                              {error.row ? `Dòng ${error.row}: ` : ''}{error.message}
                            </p>
                          ))}
                          {result.errors.length > 10 && (
                            <p className="text-xs text-red-500 dark:text-red-400">
                              ... và {result.errors.length - 10} lỗi khác
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 
                     rounded-lg transition-colors"
          >
            {result ? 'Đóng' : 'Hủy'}
          </button>
          
          {file && !result && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 
                       text-white rounded-lg flex items-center gap-2 transition-colors
                       disabled:cursor-not-allowed"
            >
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang nhập...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Nhập dữ liệu
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
