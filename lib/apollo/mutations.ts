import { gql } from '@apollo/client';
import { USER_FRAGMENT, ROLE_FRAGMENT, MENU_ITEM_FRAGMENT, ROLE_MENU_PERMISSION_FRAGMENT } from './queries';

// User Mutations
export const CREATE_USER = gql`
  ${USER_FRAGMENT}
  ${ROLE_FRAGMENT}
  mutation CreateUser($input: UserCreateInput!) {
    createUser(input: $input) {
      ...UserFragment
      role {
        ...RoleFragment
      }
    }
  }
`;

export const UPDATE_USER = gql`
  ${USER_FRAGMENT}
  ${ROLE_FRAGMENT}
  mutation UpdateUser($id: String!, $input: UserUpdateInput!) {
    updateUser(id: $id, input: $input) {
      ...UserFragment
      role {
        ...RoleFragment
      }
    }
  }
`;

export const DELETE_USER = gql`
  ${USER_FRAGMENT}
  mutation DeleteUser($id: String!) {
    deleteUser(id: $id) {
      ...UserFragment
    }
  }
`;

// Role Mutations
export const CREATE_ROLE = gql`
  ${ROLE_FRAGMENT}
  mutation CreateRole($input: RoleCreateInput!) {
    createRole(input: $input) {
      ...RoleFragment
    }
  }
`;

export const UPDATE_ROLE = gql`
  ${ROLE_FRAGMENT}
  mutation UpdateRole($id: String!, $input: RoleUpdateInput!) {
    updateRole(id: $id, input: $input) {
      ...RoleFragment
    }
  }
`;

export const DELETE_ROLE = gql`
  ${ROLE_FRAGMENT}
  mutation DeleteRole($id: String!) {
    deleteRole(id: $id) {
      ...RoleFragment
    }
  }
`;

// Menu Item Mutations
export const CREATE_MENU_ITEM = gql`
  ${MENU_ITEM_FRAGMENT}
  mutation CreateMenuItem($input: MenuItemCreateInput!) {
    createMenuItem(input: $input) {
      ...MenuItemFragment
      parent {
        ...MenuItemFragment
      }
    }
  }
`;

export const UPDATE_MENU_ITEM = gql`
  ${MENU_ITEM_FRAGMENT}
  mutation UpdateMenuItem($id: String!, $input: MenuItemUpdateInput!) {
    updateMenuItem(id: $id, input: $input) {
      ...MenuItemFragment
      parent {
        ...MenuItemFragment
      }
    }
  }
`;

export const DELETE_MENU_ITEM = gql`
  ${MENU_ITEM_FRAGMENT}
  mutation DeleteMenuItem($id: String!) {
    deleteMenuItem(id: $id) {
      ...MenuItemFragment
    }
  }
`;

// Permission Mutations
export const CREATE_ROLE_MENU_PERMISSION = gql`
  ${ROLE_MENU_PERMISSION_FRAGMENT}
  ${ROLE_FRAGMENT}
  ${MENU_ITEM_FRAGMENT}
  mutation CreateRoleMenuPermission($input: RoleMenuPermissionCreateInput!) {
    createRoleMenuPermission(input: $input) {
      ...RoleMenuPermissionFragment
      role {
        ...RoleFragment
      }
      menuItem {
        ...MenuItemFragment
      }
    }
  }
`;

export const UPDATE_ROLE_MENU_PERMISSION = gql`
  ${ROLE_MENU_PERMISSION_FRAGMENT}
  ${ROLE_FRAGMENT}
  ${MENU_ITEM_FRAGMENT}
  mutation UpdateRoleMenuPermission($id: String!, $input: RoleMenuPermissionUpdateInput!) {
    updateRoleMenuPermission(id: $id, input: $input) {
      ...RoleMenuPermissionFragment
      role {
        ...RoleFragment
      }
      menuItem {
        ...MenuItemFragment
      }
    }
  }
`;

export const DELETE_ROLE_MENU_PERMISSION = gql`
  ${ROLE_MENU_PERMISSION_FRAGMENT}
  mutation DeleteRoleMenuPermission($id: String!) {
    deleteRoleMenuPermission(id: $id) {
      ...RoleMenuPermissionFragment
    }
  }
`;

// Bulk Operations
export const BULK_CREATE_ROLE_MENU_PERMISSIONS = gql`
  ${ROLE_MENU_PERMISSION_FRAGMENT}
  ${ROLE_FRAGMENT}
  ${MENU_ITEM_FRAGMENT}
  mutation BulkCreateRoleMenuPermissions($inputs: [RoleMenuPermissionCreateInput!]!) {
    bulkCreateRoleMenuPermissions(inputs: $inputs) {
      ...RoleMenuPermissionFragment
      role {
        ...RoleFragment
      }
      menuItem {
        ...MenuItemFragment
      }
    }
  }
`;

export const BULK_UPDATE_ROLE_MENU_PERMISSIONS = gql`
  mutation BulkUpdateRoleMenuPermissions($roleId: String!, $menuPermissions: [MenuPermissionInput!]!) {
    bulkUpdateRoleMenuPermissions(roleId: $roleId, menuPermissions: $menuPermissions)
  }
`;
