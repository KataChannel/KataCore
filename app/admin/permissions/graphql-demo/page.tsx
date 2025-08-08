'use client';

import { useState } from 'react';
import { useUsers, useRoles, useMenuItems, useCreateUser, useCreateRole } from '@/hooks/graphql';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function GraphQLUsersDemo() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  
  // GraphQL Hooks
  const { data: usersData, loading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers({
    search: searchTerm || undefined,
    isActive: isActive,
    take: 10
  });
  
  const { data: rolesData, loading: rolesLoading } = useRoles({ take: 10 });
  const { data: menuData, loading: menuLoading } = useMenuItems({ take: 10 });
  
  const [createUser] = useCreateUser();
  const [createRole] = useCreateRole();

  const handleCreateUser = async () => {
    try {
      const result = await createUser({
        variables: {
          input: {
            displayName: 'Test User GraphQL',
            email: 'test-gql@example.com',
            roleId: rolesData?.roles?.[0]?.id || 'default-role-id'
          }
        }
      });
      console.log('User created:', result.data);
      refetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleCreateRole = async () => {
    try {
      const result = await createRole({
        variables: {
          input: {
            name: 'GraphQL Test Role',
            description: 'Role created via GraphQL API',
            permissions: JSON.stringify({ read: true, write: false })
          }
        }
      });
      console.log('Role created:', result.data);
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            GraphQL API Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time data using GraphQL with DataLoader optimization
          </p>
        </div>
        
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={handleCreateUser}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <PlusIcon className="h-4 w-4" />
            Create User
          </button>
          
          <button
            onClick={handleCreateRole}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            <PlusIcon className="h-4 w-4" />
            Create Role
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Filters & Search
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Users
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              User Status
            </label>
            <select
              value={isActive === undefined ? 'all' : isActive.toString()}
              onChange={(e) => {
                const value = e.target.value;
                setIsActive(value === 'all' ? undefined : value === 'true');
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Users</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => refetchUsers()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Users Data */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Users ({usersData?.usersCount || 0})
        </h2>
        
        {usersLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : usersError ? (
          <div className="text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            Error: {usersError.message}
          </div>
        ) : (
          <div className="space-y-3">
            {usersData?.users?.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-300 font-medium">
                      {user.displayName?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.displayName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email} • {user.role?.name}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
            
            {!usersData?.users?.length && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No users found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Roles & Menu Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Roles
          </h2>
          
          {rolesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {rolesData?.roles?.map((role: any) => (
                <div key={role.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {role.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {role.description} • {role.userCount} users
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Menu Items */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Menu Items
          </h2>
          
          {menuLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {menuData?.menuItems?.map((menu: any) => (
                <div key={menu.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {menu.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {menu.url} • Order: {menu.sortOrder}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
