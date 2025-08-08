import { gql } from '@apollo/client';

// Fragment definitions for reusability
export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    email
    username
    phone
    displayName
    avatar
    bio
    status
    isVerified
    isActive
    lastSeen
    createdAt
    updatedAt
    roleId
  }
`;

export const ROLE_FRAGMENT = gql`
  fragment RoleFragment on Role {
    id
    name
    description
    permissions
    createdAt
    updatedAt
    isSystemRole
    level
    modules
    userCount
  }
`;

export const MENU_ITEM_FRAGMENT = gql`
  fragment MenuItemFragment on MenuItem {
    id
    name
    description
    url
    icon
    sortOrder
    isActive
    parentId
    createdAt
    updatedAt
    childrenCount
  }
`;

export const ROLE_MENU_PERMISSION_FRAGMENT = gql`
  fragment RoleMenuPermissionFragment on RoleMenuPermission {
    id
    roleId
    menuItemId
    canView
    canAccess
    createdAt
  }
`;

// User Queries
export const GET_USERS = gql`
  ${USER_FRAGMENT}
  ${ROLE_FRAGMENT}
  query GetUsers($skip: Int, $take: Int, $search: String, $roleId: String, $isActive: Boolean) {
    users(skip: $skip, take: $take, search: $search, roleId: $roleId, isActive: $isActive) {
      ...UserFragment
      role {
        ...RoleFragment
      }
    }
    usersCount(search: $search, roleId: $roleId, isActive: $isActive)
  }
`;

export const GET_USER = gql`
  ${USER_FRAGMENT}
  ${ROLE_FRAGMENT}
  query GetUser($id: String!) {
    user(id: $id) {
      ...UserFragment
      role {
        ...RoleFragment
      }
      userRoles {
        ...RoleFragment
      }
      conversationCount
    }
  }
`;

// Role Queries
export const GET_ROLES = gql`
  ${ROLE_FRAGMENT}
  query GetRoles($skip: Int, $take: Int, $search: String, $isSystemRole: Boolean) {
    roles(skip: $skip, take: $take, search: $search, isSystemRole: $isSystemRole) {
      ...RoleFragment
    }
  }
`;

export const GET_ROLE = gql`
  ${ROLE_FRAGMENT}
  ${ROLE_MENU_PERMISSION_FRAGMENT}
  query GetRole($id: String!) {
    role(id: $id) {
      ...RoleFragment
      menuPermissions {
        ...RoleMenuPermissionFragment
        menuItem {
          ...MenuItemFragment
        }
      }
    }
  }
`;

// Menu Queries
export const GET_MENU_ITEMS = gql`
  ${MENU_ITEM_FRAGMENT}
  query GetMenuItems($skip: Int, $take: Int, $search: String, $parentId: String, $isActive: Boolean) {
    menuItems(skip: $skip, take: $take, search: $search, parentId: $parentId, isActive: $isActive) {
      ...MenuItemFragment
      parent {
        ...MenuItemFragment
      }
    }
  }
`;

export const GET_MENU_TREE = gql`
  ${MENU_ITEM_FRAGMENT}
  query GetMenuTree($roleId: String, $isActive: Boolean) {
    menuTree(roleId: $roleId, isActive: $isActive) {
      ...MenuItemFragment
      children {
        ...MenuItemFragment
        children {
          ...MenuItemFragment
        }
      }
    }
  }
`;

// Permission Queries
export const GET_ROLE_MENU_PERMISSIONS = gql`
  ${ROLE_MENU_PERMISSION_FRAGMENT}
  ${ROLE_FRAGMENT}
  ${MENU_ITEM_FRAGMENT}
  query GetRoleMenuPermissions($roleId: String, $menuItemId: String, $canView: Boolean, $canAccess: Boolean) {
    roleMenuPermissions(roleId: $roleId, menuItemId: $menuItemId, canView: $canView, canAccess: $canAccess) {
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

// Dashboard Query
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      usersCount
      rolesCount
      menuItemsCount
      permissionsCount
    }
  }
`;
