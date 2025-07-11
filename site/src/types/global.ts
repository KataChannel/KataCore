// Global Type Definitions for TazaGroup
// This file contains shared types used across the entire application

// ============================================================================
// BASE TYPES
// ============================================================================

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// ============================================================================
// UI COMPONENT TYPES
// ============================================================================

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search';
export type InputSize = 'sm' | 'md' | 'lg';

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

// ============================================================================
// LAYOUT & NAVIGATION TYPES
// ============================================================================

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick?: () => void;
  children?: NavigationItem[];
  active?: boolean;
  disabled?: boolean;
}

export interface SidebarItem extends NavigationItem {
  badge?: string | number;
  tooltip?: string;
}

export interface SidebarConfig {
  width?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  items: SidebarItem[];
  position?: 'left' | 'right';
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export interface User extends BaseEntity {
  email: string;
  name: string;
  displayName?: string;
  avatar?: string;
  role: UserRole;
  permissions?: Permission[];
  status: UserStatus;
  lastLoginAt?: Date;
}

export type UserRole = 'admin' | 'manager' | 'employee' | 'user';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  scope?: 'own' | 'department' | 'all';
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface FormField {
  name: string;
  label: string;
  type: InputType;
  required?: boolean;
  placeholder?: string;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface FormError {
  field: string;
  message: string;
}

// ============================================================================
// TABLE & DATA DISPLAY TYPES
// ============================================================================

export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction<T = any> {
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick: (record: T) => void;
  disabled?: (record: T) => boolean;
  variant?: ButtonVariant;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  key: string;
  value: any;
  operator?:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'contains'
    | 'startsWith'
    | 'endsWith';
}

// ============================================================================
// DASHBOARD & ANALYTICS TYPES
// ============================================================================

export interface DashboardStats {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color?: string;
  description?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  category?: string;
}

// ============================================================================
// THEME & UI CONFIGURATION TYPES
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'auto';
export type Language = 'vi' | 'en';
export type ColorScheme = 'monochrome' | 'colorful';

export interface ThemeConfig {
  mode: ThemeMode;
  language: Language;
  colorScheme: ColorScheme;
  highContrast?: boolean;
  reducedMotion?: boolean;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

// ============================================================================
// NOTIFICATION & MESSAGING TYPES
// ============================================================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
}

// ============================================================================
// SEARCH & FILTER TYPES
// ============================================================================

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category?: string;
  url?: string;
  icon?: React.ReactNode;
  score?: number;
}

export interface SearchConfig {
  placeholder?: string;
  categories?: string[];
  maxResults?: number;
  minQueryLength?: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type KeyValuePair<T = string> = {
  key: string;
  value: T;
};

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface CustomEvent<T = any> {
  type: string;
  data?: T;
  timestamp: Date;
  source?: string;
}

export type EventHandler<T = any> = (event: CustomEvent<T>) => void;

// ============================================================================
// FILE & MEDIA TYPES
// ============================================================================

export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

// Re-export commonly used React types for convenience
import type {
  ReactNode,
  ComponentType,
  FC,
  HTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  FormHTMLAttributes,
} from 'react';

export type {
  ReactNode,
  ComponentType,
  FC,
  HTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  FormHTMLAttributes,
};
