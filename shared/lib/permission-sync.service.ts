// ============================================================================
// PERMISSION SYNC SERVICE
// ============================================================================
// Service to synchronize permissions between modules-permissions.ts and database
// Provides real-time sync capabilities for senior-level implementation

import { prisma } from './prisma';
import { 
  SYSTEM_ROLES,
  ALL_MODULE_PERMISSIONS,
  type UserRole as ModuleUserRole,
  type ModulePermission
} from '../../site/src/lib/auth/modules-permissions';

// ============================================================================
// TYPES
// ============================================================================

interface SyncResult {
  success: boolean;
  message: string;
  changes: {
    rolesAdded: number;
    rolesUpdated: number;
    rolesRemoved: number;
    permissionsUpdated: number;
  };
  errors: string[];
}

interface PermissionDiff {
  added: ModulePermission[];
  removed: ModulePermission[];
  modified: ModulePermission[];
}

// ============================================================================
// PERMISSION SYNC SERVICE
// ============================================================================

export class PermissionSyncService {
  
  /**
   * Sync all roles and permissions from modules-permissions.ts to database
   */
  static async syncAllPermissions(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      message: '',
      changes: {
        rolesAdded: 0,
        rolesUpdated: 0,
        rolesRemoved: 0,
        permissionsUpdated: 0,
      },
      errors: [],
    };

    try {
      console.log('🔄 Starting permission synchronization...');

      // Get current database roles
      const dbRoles = await prisma.role.findMany({
        where: { isSystemRole: true }
      });

      // Sync each system role
      for (const moduleRole of SYSTEM_ROLES) {
        try {
          const dbRole = dbRoles.find(r => r.name === moduleRole.name || r.id === moduleRole.id);

          if (!dbRole) {
            // Create new role
            await this.createRoleFromModule(moduleRole);
            result.changes.rolesAdded++;
          } else {
            // Update existing role
            const hasChanges = await this.updateRoleFromModule(dbRole, moduleRole);
            if (hasChanges) {
              result.changes.rolesUpdated++;
              result.changes.permissionsUpdated++;
            }
          }
        } catch (error) {
          result.errors.push(`Failed to sync role ${moduleRole.name}: ${error}`);
        }
      }

      // Mark obsolete roles (roles in DB but not in modules-permissions.ts)
      const moduleRoleNames = SYSTEM_ROLES.map(r => r.name);
      const obsoleteRoles = dbRoles.filter(r => !moduleRoleNames.includes(r.name));
      
      for (const obsoleteRole of obsoleteRoles) {
        try {
          await prisma.role.update({
            where: { id: obsoleteRole.id },
            data: { 
              isSystemRole: false,
              description: `${obsoleteRole.description || ''} [OBSOLETE - Updated ${new Date().toISOString()}]`
            }
          });
          result.changes.rolesRemoved++;
        } catch (error) {
          result.errors.push(`Failed to mark role as obsolete ${obsoleteRole.name}: ${error}`);
        }
      }

      result.success = result.errors.length === 0;
      result.message = result.success 
        ? 'Permission synchronization completed successfully'
        : `Synchronization completed with ${result.errors.length} errors`;

      console.log('✅ Permission synchronization completed');
      return result;

    } catch (error) {
      result.errors.push(`Synchronization failed: ${error}`);
      result.message = 'Permission synchronization failed';
      console.error('❌ Permission synchronization failed:', error);
      return result;
    }
  }

  /**
   * Create new role from module definition
   */
  private static async createRoleFromModule(moduleRole: ModuleUserRole): Promise<void> {
    const permissionsJson = JSON.stringify({
      permissions: moduleRole.permissions,
      version: '1.0',
      source: 'modules-permissions-sync',
      createdAt: new Date().toISOString()
    });

    const modulesJson = JSON.stringify(moduleRole.modules);

    await prisma.role.create({
      data: {
        id: moduleRole.id,
        name: moduleRole.name,
        description: moduleRole.description,
        permissions: permissionsJson,
        level: moduleRole.level,
        modules: modulesJson,
        isSystemRole: true,
      },
    });

    console.log(`✅ Created role: ${moduleRole.name}`);
  }

  /**
   * Update existing role with module definition
   */
  private static async updateRoleFromModule(dbRole: any, moduleRole: ModuleUserRole): Promise<boolean> {
    let hasChanges = false;
    const updates: any = {};

    // Check description changes
    if (dbRole.description !== moduleRole.description) {
      updates.description = moduleRole.description;
      hasChanges = true;
    }

    // Check level changes
    if (dbRole.level !== moduleRole.level) {
      updates.level = moduleRole.level;
      hasChanges = true;
    }

    // Check modules changes
    const dbModules = dbRole.modules ? JSON.parse(dbRole.modules) : [];
    const moduleModules = moduleRole.modules;
    
    if (JSON.stringify(dbModules.sort()) !== JSON.stringify(moduleModules.sort())) {
      updates.modules = JSON.stringify(moduleModules);
      hasChanges = true;
    }

    // Check permissions changes
    const dbPermissions = dbRole.permissions ? JSON.parse(dbRole.permissions) : { permissions: [] };
    const permissionDiff = PermissionSyncService.comparePermissions(dbPermissions.permissions || [], moduleRole.permissions);
    
    if (permissionDiff.added.length > 0 || permissionDiff.removed.length > 0 || permissionDiff.modified.length > 0) {
      updates.permissions = JSON.stringify({
        permissions: moduleRole.permissions,
        version: '1.0',
        source: 'modules-permissions-sync',
        updatedAt: new Date().toISOString(),
        previousVersion: dbPermissions
      });
      hasChanges = true;
    }

    // Update if there are changes
    if (hasChanges) {
      await prisma.role.update({
        where: { id: dbRole.id },
        data: updates,
      });

      console.log(`🔄 Updated role: ${moduleRole.name}`);
    }

    return hasChanges;
  }

  /**
   * Compare permissions to find differences
   */
  static comparePermissions(dbPermissions: ModulePermission[], modulePermissions: ModulePermission[]): PermissionDiff {
    const added: ModulePermission[] = [];
    const removed: ModulePermission[] = [];
    const modified: ModulePermission[] = [];

    // Find added permissions
    for (const modulePermission of modulePermissions) {
      const dbPermission = dbPermissions.find(p => 
        p.action === modulePermission.action && p.resource === modulePermission.resource
      );
      
      if (!dbPermission) {
        added.push(modulePermission);
      } else if (JSON.stringify(dbPermission) !== JSON.stringify(modulePermission)) {
        modified.push(modulePermission);
      }
    }

    // Find removed permissions
    for (const dbPermission of dbPermissions) {
      const modulePermission = modulePermissions.find(p => 
        p.action === dbPermission.action && p.resource === dbPermission.resource
      );
      
      if (!modulePermission) {
        removed.push(dbPermission);
      }
    }

    return { added, removed, modified };
  }

  /**
   * Get sync status between modules and database
   */
  static async getSyncStatus(): Promise<{
    inSync: boolean;
    differences: {
      roleCount: { module: number; database: number };
      outOfSyncRoles: string[];
      missingRoles: string[];
      extraRoles: string[];
    };
  }> {
    try {
      const dbRoles = await prisma.role.findMany({
        where: { isSystemRole: true }
      });

      const moduleRoleNames = SYSTEM_ROLES.map(r => r.name);
      const dbRoleNames = dbRoles.map(r => r.name);

      const missingRoles = moduleRoleNames.filter(name => !dbRoleNames.includes(name));
      const extraRoles = dbRoleNames.filter(name => !moduleRoleNames.includes(name));
      const outOfSyncRoles: string[] = [];

      // Check for out of sync roles
      for (const moduleRole of SYSTEM_ROLES) {
        const dbRole = dbRoles.find(r => r.name === moduleRole.name);
        if (dbRole) {
          const dbModules = dbRole.modules ? JSON.parse(dbRole.modules) : [];
          const dbPermissions = dbRole.permissions ? JSON.parse(dbRole.permissions) : { permissions: [] };
          
          const modulesMatch = JSON.stringify(dbModules.sort()) === JSON.stringify(moduleRole.modules.sort());
          const levelMatch = dbRole.level === moduleRole.level;
          const permissionDiff = PermissionSyncService.comparePermissions(dbPermissions.permissions || [], moduleRole.permissions);
          const permissionsMatch = permissionDiff.added.length === 0 && 
                                 permissionDiff.removed.length === 0 && 
                                 permissionDiff.modified.length === 0;

          if (!modulesMatch || !levelMatch || !permissionsMatch) {
            outOfSyncRoles.push(moduleRole.name);
          }
        }
      }

      const inSync = missingRoles.length === 0 && 
                    extraRoles.length === 0 && 
                    outOfSyncRoles.length === 0;

      return {
        inSync,
        differences: {
          roleCount: {
            module: SYSTEM_ROLES.length,
            database: dbRoles.length
          },
          outOfSyncRoles,
          missingRoles,
          extraRoles
        }
      };

    } catch (error) {
      console.error('Failed to get sync status:', error);
      throw error;
    }
  }

  /**
   * Validate a specific role against module definition
   */
  static async validateRole(roleId: string): Promise<{
    valid: boolean;
    differences: {
      level?: { module: number; database: number };
      modules?: { module: string[]; database: string[] };
      permissions?: PermissionDiff;
    };
  }> {
    const moduleRole = SYSTEM_ROLES.find(r => r.id === roleId || r.name === roleId);
    if (!moduleRole) {
      throw new Error(`Role ${roleId} not found in modules-permissions.ts`);
    }

    const dbRole = await prisma.role.findFirst({
      where: { 
        OR: [
          { id: roleId },
          { name: moduleRole.name }
        ]
      }
    });

    if (!dbRole) {
      throw new Error(`Role ${roleId} not found in database`);
    }

    const differences: any = {};
    let valid = true;

    // Check level
    if (dbRole.level !== moduleRole.level) {
      differences.level = {
        module: moduleRole.level,
        database: dbRole.level
      };
      valid = false;
    }

    // Check modules
    const dbModules = dbRole.modules ? JSON.parse(dbRole.modules) : [];
    if (JSON.stringify(dbModules.sort()) !== JSON.stringify(moduleRole.modules.sort())) {
      differences.modules = {
        module: moduleRole.modules,
        database: dbModules
      };
      valid = false;
    }

    // Check permissions
    const dbPermissions = dbRole.permissions ? JSON.parse(dbRole.permissions) : { permissions: [] };
    const permissionDiff = PermissionSyncService.comparePermissions(dbPermissions.permissions || [], moduleRole.permissions);
    
    if (permissionDiff.added.length > 0 || permissionDiff.removed.length > 0 || permissionDiff.modified.length > 0) {
      differences.permissions = permissionDiff;
      valid = false;
    }

    return { valid, differences };
  }

  /**
   * Auto-sync permissions on startup (background process)
   */
  static async autoSync(): Promise<void> {
    try {
      console.log('🔄 Auto-syncing permissions...');
      
      const status = await this.getSyncStatus();
      
      if (!status.inSync) {
        console.log('⚠️ Permissions out of sync, attempting auto-sync...');
        const result = await this.syncAllPermissions();
        
        if (result.success) {
          console.log('✅ Auto-sync completed successfully');
        } else {
          console.warn('⚠️ Auto-sync completed with errors:', result.errors);
        }
      } else {
        console.log('✅ Permissions already in sync');
      }
      
    } catch (error) {
      console.error('❌ Auto-sync failed:', error);
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get permission statistics
 */
export async function getPermissionStats() {
  const roles = await prisma.role.findMany({
    where: { isSystemRole: true },
    include: { _count: { select: { users: true } } }
  });

  const totalPermissions = Object.keys(ALL_MODULE_PERMISSIONS).length;
  
  return {
    totalRoles: roles.length,
    totalPermissions,
    totalUsers: roles.reduce((sum, role) => sum + role._count.users, 0),
    roleStats: roles.map(role => {
      const permissions = role.permissions ? JSON.parse(role.permissions) : { permissions: [] };
      const modules = role.modules ? JSON.parse(role.modules) : [];
      
      return {
        name: role.name,
        level: role.level,
        userCount: role._count.users,
        permissionCount: permissions.permissions?.length || 0,
        moduleCount: modules.length,
        modules
      };
    })
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default PermissionSyncService;
