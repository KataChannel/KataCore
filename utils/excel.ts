import * as XLSX from 'xlsx';
import { parse as parseCSV } from 'papaparse';

export interface ExcelColumn {
  key: string;
  label: string;
  type?: 'string' | 'number' | 'date' | 'boolean';
  required?: boolean;
  options?: string[]; // For select fields
}

export interface ImportResult<T> {
  success: boolean;
  data: T[];
  errors: ImportError[];
  totalRows: number;
  validRows: number;
}

export interface ImportError {
  row: number;
  column: string;
  value: any;
  message: string;
}

export interface ExportOptions {
  filename?: string;
  format: 'xlsx' | 'csv';
  includeHeaders?: boolean;
  sheetName?: string;
}

/**
 * Export data to Excel or CSV format
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ExcelColumn[],
  options: ExportOptions = { format: 'xlsx', includeHeaders: true }
): void {
  const { filename, format, includeHeaders = true, sheetName = 'Sheet1' } = options;
  
  if (!data || data.length === 0) {
    throw new Error('Không có dữ liệu để xuất');
  }

  // Prepare data for export
  const exportData: any[][] = [];
  
  // Add headers if required
  if (includeHeaders) {
    const headers = columns.map(col => col.label);
    exportData.push(headers);
  }

  // Add data rows
  data.forEach(row => {
    const rowData = columns.map(col => {
      const value = row[col.key];
      
      // Format value based on type
      switch (col.type) {
        case 'date':
          return value ? new Date(value).toLocaleDateString('vi-VN') : '';
        case 'boolean':
          return value ? 'Có' : 'Không';
        case 'number':
          return typeof value === 'number' ? value : 0;
        default:
          return value || '';
      }
    });
    exportData.push(rowData);
  });

  if (format === 'csv') {
    exportToCSV(exportData, filename);
  } else {
    exportToXLSX(exportData, filename, sheetName);
  }
}

/**
 * Export to XLSX format
 */
function exportToXLSX(data: any[][], filename?: string, sheetName = 'Sheet1'): void {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Auto-size columns
  const colWidths = data[0]?.map((_, colIndex) => {
    const maxLength = Math.max(...data.map(row => 
      String(row[colIndex] || '').length
    ));
    return { wch: Math.min(Math.max(maxLength, 10), 50) };
  });
  
  if (colWidths) {
    worksheet['!cols'] = colWidths;
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  const defaultFilename = `employees_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename || defaultFilename);
}

/**
 * Export to CSV format
 */
function exportToCSV(data: any[][], filename?: string): void {
  const csvContent = data.map(row => 
    row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  
  const blob = new Blob(['\uFEFF' + csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `employees_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import data from Excel or CSV file
 */
export async function importFromExcel<T extends Record<string, any>>(
  file: File,
  columns: ExcelColumn[]
): Promise<ImportResult<T>> {
  return new Promise((resolve) => {
    const result: ImportResult<T> = {
      success: false,
      data: [],
      errors: [],
      totalRows: 0,
      validRows: 0
    };

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      importFromCSV(file, columns, result, resolve);
    } else {
      importFromXLSX(file, columns, result, resolve);
    }
  });
}

/**
 * Import from XLSX file
 */
function importFromXLSX<T extends Record<string, any>>(
  file: File,
  columns: ExcelColumn[],
  result: ImportResult<T>,
  resolve: (value: ImportResult<T>) => void
): void {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Get first worksheet
      const worksheetName = workbook.SheetNames[0];
      if (!worksheetName) {
        throw new Error('File Excel không có sheet nào');
      }
      const worksheet = workbook.Sheets[worksheetName];
      if (!worksheet) {
        throw new Error('Không thể đọc sheet trong file Excel');
      }
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      processImportData(jsonData, columns, result);
      resolve(result);
    } catch (error) {
      result.errors.push({
        row: 0,
        column: 'file',
        value: file.name,
        message: `Lỗi đọc file Excel: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      resolve(result);
    }
  };

  reader.onerror = () => {
    result.errors.push({
      row: 0,
      column: 'file',
      value: file.name,
      message: 'Không thể đọc file'
    });
    resolve(result);
  };

  reader.readAsArrayBuffer(file);
}

/**
 * Import from CSV file
 */
function importFromCSV<T extends Record<string, any>>(
  file: File,
  columns: ExcelColumn[],
  result: ImportResult<T>,
  resolve: (value: ImportResult<T>) => void
): void {
  parseCSV(file, {
    complete: (results) => {
      processImportData(results.data as any[][], columns, result);
      resolve(result);
    },
    error: (error) => {
      result.errors.push({
        row: 0,
        column: 'file',
        value: file.name,
        message: `Lỗi đọc file CSV: ${error.message}`
      });
      resolve(result);
    },
    encoding: 'UTF-8'
  });
}

/**
 * Process imported data and validate
 */
function processImportData<T extends Record<string, any>>(
  rawData: any[][],
  columns: ExcelColumn[],
  result: ImportResult<T>
): void {
  if (!rawData || rawData.length === 0) {
    result.errors.push({
      row: 0,
      column: 'file',
      value: '',
      message: 'File không có dữ liệu'
    });
    return;
  }

  // Assume first row is headers
  const headers = rawData[0] || [];
  const dataRows = rawData.slice(1);
  
  result.totalRows = dataRows.length;

  // Create column mapping
  const columnMap = new Map<string, number>();
  columns.forEach(col => {
    const headerIndex = headers.findIndex(header => 
      String(header).trim().toLowerCase() === col.label.toLowerCase()
    );
    if (headerIndex >= 0) {
      columnMap.set(col.key, headerIndex);
    }
  });

  // Process each data row
  dataRows.forEach((row, rowIndex) => {
    const dataRowIndex = rowIndex + 2; // +1 for 0-based index, +1 for header row
    const processedRow: any = {};
    let hasErrors = false;

    columns.forEach(col => {
      const cellIndex = columnMap.get(col.key);
      const cellValue = cellIndex !== undefined ? row[cellIndex] : undefined;
      
      // Validate required fields
      if (col.required && (!cellValue || String(cellValue).trim() === '')) {
        result.errors.push({
          row: dataRowIndex,
          column: col.label,
          value: cellValue,
          message: `${col.label} là bắt buộc`
        });
        hasErrors = true;
        return;
      }

      // Process and validate value
      const processedValue = processValue(cellValue, col, dataRowIndex, result);
      if (processedValue !== null) {
        processedRow[col.key] = processedValue;
      } else {
        hasErrors = true;
      }
    });

    if (!hasErrors) {
      result.data.push(processedRow as T);
      result.validRows++;
    }
  });

  result.success = result.errors.length === 0;
}

/**
 * Process and validate a single cell value
 */
function processValue(
  value: any,
  column: ExcelColumn,
  rowIndex: number,
  result: ImportResult<any>
): any {
  if (!value && !column.required) {
    return null;
  }

  const stringValue = String(value).trim();

  switch (column.type) {
    case 'number':
      const numValue = Number(stringValue);
      if (isNaN(numValue)) {
        result.errors.push({
          row: rowIndex,
          column: column.label,
          value,
          message: `${column.label} phải là số`
        });
        return null;
      }
      return numValue;

    case 'date':
      const dateValue = new Date(stringValue);
      if (isNaN(dateValue.getTime())) {
        result.errors.push({
          row: rowIndex,
          column: column.label,
          value,
          message: `${column.label} không phải là ngày hợp lệ`
        });
        return null;
      }
      return dateValue.toISOString();

    case 'boolean':
      const lowerValue = stringValue.toLowerCase();
      if (['true', '1', 'có', 'yes', 'y'].includes(lowerValue)) {
        return true;
      } else if (['false', '0', 'không', 'no', 'n'].includes(lowerValue)) {
        return false;
      } else {
        result.errors.push({
          row: rowIndex,
          column: column.label,
          value,
          message: `${column.label} phải là true/false hoặc có/không`
        });
        return null;
      }

    default:
      // Validate options if provided
      if (column.options && column.options.length > 0) {
        if (!column.options.includes(stringValue)) {
          result.errors.push({
            row: rowIndex,
            column: column.label,
            value,
            message: `${column.label} phải là một trong: ${column.options.join(', ')}`
          });
          return null;
        }
      }
      return stringValue;
  }
}

/**
 * Generate a sample Excel template for import
 */
export function generateTemplate(columns: ExcelColumn[], filename?: string): void {
  const headers = columns.map(col => col.label);
  const sampleData = columns.map(col => {
    switch (col.type) {
      case 'number':
        return '123';
      case 'date':
        return '2024-01-01';
      case 'boolean':
        return 'Có';
      default:
        if (col.options && col.options.length > 0) {
          return col.options[0];
        }
        return `Mẫu ${col.label}`;
    }
  });

  const data = [headers, sampleData];
  const defaultFilename = 'employee_import_template.xlsx';
  exportToXLSX(data, filename || defaultFilename, 'Template');
}
