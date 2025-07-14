'use client';

import React from 'react';
import { AuthProvider, useAuth } from '@/components/auth/ModuleGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, User, Users, Shield, Settings } from 'lucide-react';

// Demo user accounts for testing
const DEMO_ACCOUNTS = [
  {
    id: '1',
    email: 'admin@taza.com',
    name: 'System Administrator',
    role: 'admin',
    systemRole: 10,
    permissions: ['read', 'write', 'delete', 'manage', 'admin'],
    modules: ['sales', 'crm', 'inventory', 'finance', 'hrm', 'projects', 'manufacturing', 'marketing', 'support', 'analytics', 'ecommerce']
  },
  {
    id: '2',
    email: 'manager@taza.com',
    name: 'Department Manager',
    role: 'manager',
    systemRole: 7,
    permissions: ['read', 'write', 'manage'],
    modules: ['sales', 'crm', 'inventory', 'projects', 'marketing', 'analytics']
  },
  {
    id: '3',
    email: 'employee@taza.com',
    name: 'Sales Employee',
    role: 'employee',
    systemRole: 3,
    permissions: ['read', 'write'],
    modules: ['sales', 'crm']
  },
  {
    id: '4',
    email: 'viewer@taza.com',
    name: 'Read-only User',
    role: 'viewer',
    systemRole: 1,
    permissions: ['read'],
    modules: ['sales', 'analytics']
  }
];

const MODULE_DESCRIPTIONS = {
  sales: 'Manage orders, quotes, and sales pipeline',
  crm: 'Customer relationship management and leads',
  inventory: 'Stock management and warehouse operations',
  finance: 'Accounting, invoicing, and financial reports',
  hrm: 'Human resource management and payroll',
  projects: 'Project planning and task management',
  manufacturing: 'Production planning and quality control',
  marketing: 'Campaigns, promotions, and market analysis',
  support: 'Customer support and ticket management',
  analytics: 'Business intelligence and reporting',
  ecommerce: 'Online store and order management'
};

function AuthDemo() {
  const { user, login, logout, checkModuleAccess, checkPermission } = useAuth();

  const handleDemoLogin = (demoUser: any) => {
    login(demoUser);
  };

  const getAccessLevel = (moduleId: string) => {
    if (!user) return 'none';
    const hasAccess = checkModuleAccess(moduleId);
    if (!hasAccess) return 'none';
    
    if (checkPermission('admin', 'system')) return 'admin';
    if (checkPermission('manage', moduleId)) return 'manage';
    if (checkPermission('write', moduleId)) return 'write';
    if (checkPermission('read', moduleId)) return 'read';
    return 'none';
  };

  const getAccessBadgeVariant = (level: string) => {
    switch (level) {
      case 'admin': return 'default';
      case 'manage': return 'secondary';
      case 'write': return 'outline';
      case 'read': return 'outline';
      default: return 'destructive';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">TazaCore Authentication Demo</h1>
        <p className="text-xl text-muted-foreground">
          Test role-based access control across all 11 business modules
        </p>
      </div>

      {/* Current User Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Current User Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary">{user.role}</Badge>
                    <Badge variant="outline">Level {user.systemRole}</Badge>
                  </div>
                </div>
                <Button onClick={logout} variant="outline">
                  <Unlock className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Not Authenticated</h3>
              <p className="text-muted-foreground">Please select a demo account to login</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Account Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Demo Accounts</span>
          </CardTitle>
          <CardDescription>
            Click any account to simulate login and test access levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEMO_ACCOUNTS.map((account) => (
              <div
                key={account.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                  user?.id === account.id ? 'bg-primary/10 border-primary' : ''
                }`}
                onClick={() => handleDemoLogin(account)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{account.name}</h4>
                  <Badge variant={user?.id === account.id ? 'default' : 'outline'}>
                    {account.role}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{account.email}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    Level {account.systemRole}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {account.modules.length} modules
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Module Access Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Module Access Matrix</span>
          </CardTitle>
          <CardDescription>
            Your access levels across all TazaCore business modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(MODULE_DESCRIPTIONS).map(([moduleId, description]) => {
              const accessLevel = getAccessLevel(moduleId);
              const hasAccess = accessLevel !== 'none';
              
              return (
                <div
                  key={moduleId}
                  className={`p-4 border rounded-lg ${
                    hasAccess ? 'bg-background' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize">{moduleId}</h4>
                    {hasAccess ? (
                      <Unlock className="h-4 w-4 text-green-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant={getAccessBadgeVariant(accessLevel)}>
                      {accessLevel === 'none' ? 'No Access' : accessLevel}
                    </Badge>
                    {hasAccess && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/${moduleId}`}>
                          Open Module
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Permission Details */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Detailed Permissions</span>
            </CardTitle>
            <CardDescription>
              Complete breakdown of your system permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">System Permissions</h4>
                <div className="flex flex-wrap gap-2">
                  {user.permissions.map((permission) => (
                    <Badge key={permission} variant="secondary">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Accessible Modules</h4>
                <div className="flex flex-wrap gap-2">
                  {user.modules.map((module) => (
                    <Badge key={module} variant="outline">
                      {module}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Access Level Distribution</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['read', 'write', 'manage', 'admin'].map((level) => {
                    const count = Object.keys(MODULE_DESCRIPTIONS).filter(
                      moduleId => getAccessLevel(moduleId) === level
                    ).length;
                    
                    return (
                      <div key={level} className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-sm text-muted-foreground capitalize">{level}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Test navigation to different modules based on your access level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <a href="/admin/users">User Management</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/sales">Sales Dashboard</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/crm">CRM System</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/analytics">Analytics</a>
              </Button>
              <Button variant="secondary" asChild>
                <a href="/login">Login Page</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AuthDemoPage() {
  return (
    <AuthProvider>
      <AuthDemo />
    </AuthProvider>
  );
}
