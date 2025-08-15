export interface UserPermissions {
  canViewDashboard: boolean;
  canViewSync: boolean;
  canPerformSync: boolean;
  canViewAnalysis: boolean;
  canViewConfig: boolean;
  canEditConfig: boolean;
  canExportData: boolean;
  canManagePages: boolean;
  canViewAllPages: boolean;
  canDeleteData: boolean;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: UserPermissions;
  description: string;
}

export class PermissionService {
  private static readonly ROLES: UserRole[] = [
    {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'Full access to all features',
      permissions: {
        canViewDashboard: true,
        canViewSync: true,
        canPerformSync: true,
        canViewAnalysis: true,
        canViewConfig: true,
        canEditConfig: true,
        canExportData: true,
        canManagePages: true,
        canViewAllPages: true,
        canDeleteData: true
      }
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Admin access with sync and configuration permissions',
      permissions: {
        canViewDashboard: true,
        canViewSync: true,
        canPerformSync: true,
        canViewAnalysis: true,
        canViewConfig: true,
        canEditConfig: true,
        canExportData: true,
        canManagePages: true,
        canViewAllPages: true,
        canDeleteData: false
      }
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Management access with limited sync permissions',
      permissions: {
        canViewDashboard: true,
        canViewSync: true,
        canPerformSync: false,
        canViewAnalysis: true,
        canViewConfig: false,
        canEditConfig: false,
        canExportData: true,
        canManagePages: false,
        canViewAllPages: true,
        canDeleteData: false
      }
    },
    {
      id: 'analyst',
      name: 'Analyst',
      description: 'Read-only access for data analysis',
      permissions: {
        canViewDashboard: true,
        canViewSync: false,
        canPerformSync: false,
        canViewAnalysis: true,
        canViewConfig: false,
        canEditConfig: false,
        canExportData: true,
        canManagePages: false,
        canViewAllPages: false,
        canDeleteData: false
      }
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Basic view-only access',
      permissions: {
        canViewDashboard: true,
        canViewSync: false,
        canPerformSync: false,
        canViewAnalysis: true,
        canViewConfig: false,
        canEditConfig: false,
        canExportData: false,
        canManagePages: false,
        canViewAllPages: false,
        canDeleteData: false
      }
    }
  ];

  static getUserRole(): string {
    // Priority: Environment -> localStorage -> default
    const envRole = process.env.NEXT_PUBLIC_USER_ROLE;
    if (envRole) return envRole;

    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('user_role');
      if (storedRole) return storedRole;
    }

    return 'viewer'; // Default role
  }

  static setUserRole(roleId: string): void {
    if (typeof window === 'undefined') return;
    
    if (this.ROLES.find(role => role.id === roleId)) {
      localStorage.setItem('user_role', roleId);
    }
  }

  static getUserPermissions(): UserPermissions {
    const roleId = this.getUserRole();
    const role = this.ROLES.find(r => r.id === roleId);
    
    if (role) return role.permissions;
    
    // Default to viewer permissions
    const defaultRole = this.ROLES.find(r => r.id === 'viewer');
    return defaultRole!.permissions;
  }

  static getAllRoles(): UserRole[] {
    return this.ROLES;
  }

  static getRoleById(roleId: string): UserRole | undefined {
    return this.ROLES.find(role => role.id === roleId);
  }

  static hasPermission(permission: keyof UserPermissions): boolean {
    const permissions = this.getUserPermissions();
    return permissions[permission];
  }

  static canAccessTab(tab: string): boolean {
    const permissions = this.getUserPermissions();
    
    switch (tab) {
      case 'dashboard':
        return permissions.canViewDashboard;
      case 'sync':
        return permissions.canViewSync;
      case 'analysis':
        return permissions.canViewAnalysis;
      case 'settings':
        return permissions.canViewConfig;
      default:
        return false;
    }
  }

  static getAccessibleTabs(): string[] {
    const permissions = this.getUserPermissions();
    const tabs: string[] = [];

    if (permissions.canViewDashboard) tabs.push('dashboard');
    if (permissions.canViewSync) tabs.push('sync');
    if (permissions.canViewAnalysis) tabs.push('analysis');
    if (permissions.canViewConfig) tabs.push('settings');

    return tabs;
  }

  static getCurrentUserInfo(): {
    roleId: string;
    role: UserRole | undefined;
    permissions: UserPermissions;
    accessibleTabs: string[];
  } {
    const roleId = this.getUserRole();
    const role = this.getRoleById(roleId);
    const permissions = this.getUserPermissions();
    const accessibleTabs = this.getAccessibleTabs();

    return {
      roleId,
      role,
      permissions,
      accessibleTabs
    };
  }
}
