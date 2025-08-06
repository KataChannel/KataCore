// Demo component để test Simple Roles API
'use client';

import { useState, useEffect } from 'react';

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  level: number;
  modules: string[];
  isSystemRole: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    roles: Role[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
  message?: string;
  timestamp: string;
}

export default function SimpleRolesDemo() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: '',
    level: 1,
    modules: '',
  });
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Fetch roles
  const fetchRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/admin/roles?${params}`);
      const data: ApiResponse = await response.json();
      
      if (data.success && data.data) {
        setRoles(data.data.roles);
      } else {
        setError(data.error || 'Failed to fetch roles');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Create role
  const createRole = async () => {
    if (!formData.name) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions.split(',').map(p => p.trim()).filter(Boolean),
          level: formData.level,
          modules: formData.modules.split(',').map(m => m.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchRoles();
        resetForm();
        setError('');
      } else {
        setError(data.error || 'Failed to create role');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Update role
  const updateRole = async () => {
    if (!editingRole) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingRole.id,
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions.split(',').map(p => p.trim()).filter(Boolean),
          level: formData.level,
          modules: formData.modules.split(',').map(m => m.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchRoles();
        resetForm();
        setEditingRole(null);
        setError('');
      } else {
        setError(data.error || 'Failed to update role');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Delete role
  const deleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/roles?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchRoles();
        setError('');
      } else {
        setError(data.error || 'Failed to delete role');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: '',
      level: 1,
      modules: '',
    });
    setEditingRole(null);
  };

  const editRole = (role: Role) => {
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions.join(', '),
      level: role.level,
      modules: role.modules.join(', '),
    });
    setEditingRole(role);
  };

  useEffect(() => {
    fetchRoles();
  }, [searchQuery]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Simple Roles API Demo</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search roles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Create/Edit Form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingRole ? 'Edit Role' : 'Create New Role'}
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="Role name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="Role description"
              rows={2}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Permissions (comma-separated)</label>
            <input
              type="text"
              value={formData.permissions}
              onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="read:users, write:users"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Modules (comma-separated)</label>
            <input
              type="text"
              value={formData.modules}
              onChange={(e) => setFormData({ ...formData, modules: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="hr, admin, finance"
            />
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          {editingRole ? (
            <>
              <button
                onClick={updateRole}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Role'}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={createRole}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Role'}
            </button>
          )}
        </div>
      </div>

      {/* Roles List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Roles ({roles.length})</h2>
        </div>
        
        {loading && !editingRole ? (
          <div className="p-6 text-center">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">System</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{role.name}</div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{role.level}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{role.userCount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        role.isSystemRole 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {role.isSystemRole ? 'System' : 'Custom'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => editRole(role)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      {!role.isSystemRole && (
                        <button
                          onClick={() => deleteRole(role.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
