// Application constants
export const APP_NAME = 'TazaCore HR Management';
export const APP_DESCRIPTION = 'Professional HR management system';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  USERS: {
    LIST: '/api/users',
    CREATE: '/api/users',
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
    GET: (id: string) => `/api/users/${id}`,
  },
  DEPARTMENTS: {
    LIST: '/api/departments',
    CREATE: '/api/departments',
    UPDATE: (id: string) => `/api/departments/${id}`,
    DELETE: (id: string) => `/api/departments/${id}`,
  },
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
} as const;

// Status options
export const STATUS_OPTIONS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
