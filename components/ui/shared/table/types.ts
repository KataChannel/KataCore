// Define the structure for a single row of table data
export interface TableData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
}

// Define the type for column widths, mapping column keys to their pixel widths
export interface ColumnWidth {
  [key: string]: number;
}

// Define sort order types
export type SortOrder = 'asc' | 'desc' | null;

// Define the structure for sort configuration
export interface SortConfig {
  key: string | null;
  order: SortOrder;
}

// Define the structure for tracking which cell is being edited
export interface EditingCell {
  rowId: number;
  column: string;
}

// Define the structure for pagination information
export interface PaginationInfo {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

// Define the structure for a single filter criterion
export interface FilterCriterion {
  id: string; // Unique ID for each filter
  columnKey: string;
  operator: string;
  value: string;
}

// Define column definition with data types and filterable flag
export interface ColumnDefinition {
  key: string;
  label: string;
  width: number;
  filterable: boolean;
  dataType: 'string' | 'select' | 'number';
  options?: string[];
}

// Define the structure for filter operators
export interface OperatorDefinition {
  label: string;
  value: string;
  apply: (itemVal: any, filterVal: any) => boolean;
}

// Component Props Interfaces
export interface TableSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterCriteria: FilterCriterion[];
  onClearFilters: () => void;
}

export interface TableFiltersProps {
  columns: ColumnDefinition[];
  newFilterColumn: string;
  newFilterOperator: string;
  newFilterValue: string;
  availableOperators: OperatorDefinition[];
  onColumnChange: (column: string) => void;
  onOperatorChange: (operator: string) => void;
  onValueChange: (value: string) => void;
  onAddFilter: () => void;
  filterCriteria: FilterCriterion[];
  onRemoveFilter: (id: string) => void;
}

export interface BulkActionsProps {
  selectedCount: number;
  onBulkStatusUpdate: (status: 'Active' | 'Inactive') => void;
  onBulkDelete: () => void;
}

export interface TableHeaderProps {
  columns: ColumnDefinition[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  selectAll: boolean;
  onSelectAll: () => void;
  onMouseDown: (e: React.MouseEvent, column: string) => void;
}

export interface TableRowProps {
  row: TableData;
  columns: ColumnDefinition[];
  columnWidths: ColumnWidth;
  isSelected: boolean;
  onSelectRow: (id: number) => void;
  editingCell: EditingCell | null;
  editValue: string;
  onCellClick: (rowId: number, column: string, value: string) => void;
  onEditValueChange: (value: string) => void;
  onEditSubmit: () => void;
  onEditCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onStatusChange: (rowId: number, status: 'Active' | 'Inactive') => void;
  uniqueRoles: string[];
}

export interface PaginationProps {
  paginationInfo: PaginationInfo;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  totalItems: number;
  originalDataLength: number;
  hasFilters: boolean;
}
