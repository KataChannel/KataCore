// Common types - Consolidated and updated
// This file re-exports from global types and adds specific common types

export * from './global';
import type { SidebarItem } from './global';

// Legacy compatibility exports (will be deprecated)
export type {
  SidebarItem,
  SidebarConfig,
  DashboardStats,
} from './global';

// Additional common types specific to this application
export interface MenuItem extends SidebarItem {
  permissions?: string[];
  external?: boolean;
}

export interface AppConfig {
  name: string;
  version: string;
  apiUrl: string;
  theme: {
    defaultMode: 'light' | 'dark';
    supportedLanguages: string[];
  };
}