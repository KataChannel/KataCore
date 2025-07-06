export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  children?: SidebarItem[];
  active?: boolean;
}

export interface SidebarConfig {
  width?: number;
  collapsible?: boolean;
  items: SidebarItem[];
}

export interface UserMenuItem {
  label?: string;
  href?: string;
  onClick?: () => void;
  divider?: boolean;
}

export interface HeaderConfig {
  showSearch?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  userMenu?: UserMenuItem[];
}

export interface DashboardConfig {
  title: string;
  logo?: string;
  theme?: 'light' | 'dark';
  sidebar?: SidebarConfig;
  header?: HeaderConfig;
}

export interface DashboardStats {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}