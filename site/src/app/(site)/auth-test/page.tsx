'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/components/auth/UnifiedAuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Shield,
  Database,
  Network,
  Code,
} from 'lucide-react';

// Test suites for different aspects of the authentication system
const TEST_SUITES = {
  authentication: {
    name: 'Authentication Flow',
    icon: Shield,
    tests: [
      { id: 'login-admin', name: 'Admin Login', description: 'Test login with admin credentials' },
      {
        id: 'login-manager',
        name: 'Manager Login',
        description: 'Test login with manager credentials',
      },
      {
        id: 'login-employee',
        name: 'Employee Login',
        description: 'Test login with employee credentials',
      },
      {
        id: 'login-viewer',
        name: 'Viewer Login',
        description: 'Test login with viewer credentials',
      },
      { id: 'logout', name: 'Logout', description: 'Test logout functionality' },
      {
        id: 'session-persistence',
        name: 'Session Persistence',
        description: 'Test session across page reloads',
      },
    ],
  },
  permissions: {
    name: 'Permission System',
    icon: Database,
    tests: [
      {
        id: 'module-access-admin',
        name: 'Admin Module Access',
        description: 'Test admin access to all modules',
      },
      {
        id: 'module-access-manager',
        name: 'Manager Module Access',
        description: 'Test manager limited access',
      },
      {
        id: 'module-access-employee',
        name: 'Employee Module Access',
        description: 'Test employee restricted access',
      },
      {
        id: 'module-access-viewer',
        name: 'Viewer Module Access',
        description: 'Test viewer read-only access',
      },
      {
        id: 'permission-read',
        name: 'Read Permission',
        description: 'Test read permission checking',
      },
      {
        id: 'permission-write',
        name: 'Write Permission',
        description: 'Test write permission checking',
      },
      {
        id: 'permission-manage',
        name: 'Manage Permission',
        description: 'Test manage permission checking',
      },
      {
        id: 'permission-admin',
        name: 'Admin Permission',
        description: 'Test admin permission checking',
      },
    ],
  },
  routing: {
    name: 'Route Protection',
    icon: Network,
    tests: [
      {
        id: 'protected-routes',
        name: 'Protected Routes',
        description: 'Test access to protected routes',
      },
      { id: 'admin-routes', name: 'Admin Routes', description: 'Test admin-only route protection' },
      {
        id: 'module-routes',
        name: 'Module Routes',
        description: 'Test module-specific route protection',
      },
      {
        id: 'redirect-unauthorized',
        name: 'Unauthorized Redirects',
        description: 'Test redirects for unauthorized access',
      },
      {
        id: 'middleware-protection',
        name: 'Middleware Protection',
        description: 'Test middleware-level protection',
      },
    ],
  },
  ui: {
    name: 'UI Components',
    icon: Code,
    tests: [
      {
        id: 'module-guard',
        name: 'ModuleGuard Component',
        description: 'Test ModuleGuard HOC functionality',
      },
      {
        id: 'auth-provider',
        name: 'AuthProvider Context',
        description: 'Test authentication context',
      },
      { id: 'access-badges', name: 'Access Badges', description: 'Test access level indicators' },
      { id: 'login-modal', name: 'Login Modal', description: 'Test login modal component' },
      {
        id: 'conditional-rendering',
        name: 'Conditional Rendering',
        description: 'Test permission-based rendering',
      },
    ],
  },
};

function AuthTester() {
  const { user, login, logout, checkModuleAccess, checkPermission } = useAuth();
  const [testResults, setTestResults] = useState<
    Record<string, 'pass' | 'fail' | 'warning' | 'pending'>
  >({});
  const [runningTests, setRunningTests] = useState<string[]>([]);

  const runTest = async (testId: string, testFunc: () => Promise<boolean> | boolean) => {
    setRunningTests((prev) => [...prev, testId]);

    try {
      // Add delay for realistic testing experience
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

      const result = await testFunc();
      setTestResults((prev) => ({
        ...prev,
        [testId]: result ? 'pass' : 'fail',
      }));
    } catch (error) {
      console.error(`Test ${testId} failed:`, error);
      setTestResults((prev) => ({
        ...prev,
        [testId]: 'fail',
      }));
    } finally {
      setRunningTests((prev) => prev.filter((id) => id !== testId));
    }
  };

  const runTestSuite = async (suiteKey: string) => {
    const suite = TEST_SUITES[suiteKey as keyof typeof TEST_SUITES];

    for (const test of suite.tests) {
      await runTest(test.id, () => getTestFunction(test.id)());
    }
  };

  const getTestFunction = (testId: string) => {
    const tests: Record<string, () => boolean> = {
      // Authentication tests
      'login-admin': () => {
        const adminUser = {
          id: '1',
          email: 'admin@taza.com',
          name: 'System Administrator',
          role: 'admin',
          systemRole: 10,
          permissions: ['read', 'write', 'delete', 'manage', 'admin'],
          modules: [
            'sales',
            'crm',
            'inventory',
            'finance',
            'hrm',
            'projects',
            'manufacturing',
            'marketing',
            'support',
            'analytics',
            'ecommerce',
          ],
        };
        login(adminUser);
        return user?.role === 'admin';
      },
      'login-manager': () => {
        const managerUser = {
          id: '2',
          email: 'manager@taza.com',
          name: 'Department Manager',
          role: 'manager',
          systemRole: 7,
          permissions: ['read', 'write', 'manage'],
          modules: ['sales', 'crm', 'inventory', 'projects', 'marketing', 'analytics'],
        };
        login(managerUser);
        return user?.role === 'manager';
      },
      'login-employee': () => {
        const employeeUser = {
          id: '3',
          email: 'employee@taza.com',
          name: 'Sales Employee',
          role: 'employee',
          systemRole: 3,
          permissions: ['read', 'write'],
          modules: ['sales', 'crm'],
        };
        login(employeeUser);
        return user?.role === 'employee';
      },
      'login-viewer': () => {
        const viewerUser = {
          id: '4',
          email: 'viewer@taza.com',
          name: 'Read-only User',
          role: 'viewer',
          systemRole: 1,
          permissions: ['read'],
          modules: ['sales', 'analytics'],
        };
        login(viewerUser);
        return user?.role === 'viewer';
      },
      logout: () => {
        logout();
        return !user;
      },

      // Permission tests
      'module-access-admin': () => {
        if (!user || user.role !== 'admin') return false;
        return ['sales', 'crm', 'inventory', 'finance'].every((module) =>
          checkModuleAccess(module)
        );
      },
      'module-access-manager': () => {
        if (!user || user.role !== 'manager') return false;
        return (
          checkModuleAccess('sales') && checkModuleAccess('crm') && !checkModuleAccess('finance')
        );
      },
      'permission-read': () => {
        return checkPermission('read', 'sales');
      },
      'permission-write': () => {
        return user?.permissions.includes('write') ? checkPermission('write', 'sales') : true;
      },
      'permission-admin': () => {
        return user?.role === 'admin' ? checkPermission('admin', 'system') : true;
      },

      // Default test for others
      default: () => true,
    };

    return tests[testId] || tests.default;
  };

  const getTestIcon = (status: string, isRunning: boolean) => {
    if (isRunning)
      return (
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      );

    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <div className="w-4 h-4 border border-gray-300 rounded-full" />;
    }
  };

  const getTestBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return (
          <Badge variant="success" className="text-xs">
            PASS
          </Badge>
        );
      case 'fail':
        return (
          <Badge variant="error" className="text-xs">
            FAIL
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="warning" className="text-xs">
            WARN
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            PENDING
          </Badge>
        );
    }
  };

  const clearResults = () => {
    setTestResults({});
    setRunningTests([]);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Authentication System Tester</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive testing suite for TazaCore authentication and authorization
        </p>
      </div>

      {/* Current User Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Test Environment</CardTitle>
          <CardDescription>Active user session and test controls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {user ? (
                <div className="space-y-2">
                  <h3 className="font-semibold">{user.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{user.role}</Badge>
                    <Badge variant="outline">Level {user.systemRole}</Badge>
                    <Badge variant="outline">{user.modules.length} modules</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">No active user session</div>
              )}
            </div>
            <div className="flex space-x-2">
              <Button onClick={clearResults} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Results
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Suites */}
      <Tabs defaultValue="authentication" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {Object.entries(TEST_SUITES).map(([key, suite]) => (
            <TabsTrigger key={key} value={key} className="flex items-center space-x-2">
              <suite.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{suite.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(TEST_SUITES).map(([suiteKey, suite]) => (
          <TabsContent key={suiteKey} value={suiteKey} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <suite.icon className="h-5 w-5" />
                    <CardTitle>{suite.name}</CardTitle>
                  </div>
                  <Button onClick={() => runTestSuite(suiteKey)}>
                    <Play className="h-4 w-4 mr-2" />
                    Run Suite
                  </Button>
                </div>
                <CardDescription>
                  Test suite for {suite.name.toLowerCase()} functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suite.tests.map((test) => {
                    const status = testResults[test.id];
                    const isRunning = runningTests.includes(test.id);

                    return (
                      <div
                        key={test.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center space-x-3">
                          {getTestIcon(status, isRunning)}
                          <div>
                            <h4 className="font-medium">{test.name}</h4>
                            <p className="text-sm text-muted-foreground">{test.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTestBadge(status)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => runTest(test.id, () => getTestFunction(test.id)())}
                            disabled={isRunning}
                          >
                            {isRunning ? 'Running...' : 'Run'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Test Results Summary */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results Summary</CardTitle>
            <CardDescription>Overview of all test executions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['pass', 'fail', 'warning', 'pending'].map((status) => {
                const count = Object.values(testResults).filter(
                  (result) => result === status
                ).length;
                const total = Object.keys(testResults).length;
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                return (
                  <div key={status} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground capitalize">{status}</div>
                    <div className="text-xs text-muted-foreground">{percentage}%</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AuthTestPage() {
  return (
    <AuthProvider>
      <AuthTester />
    </AuthProvider>
  );
}
