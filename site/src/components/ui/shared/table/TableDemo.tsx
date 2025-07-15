'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings, 
  Download,
  Upload,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import Table from './Table';

// Simple Alert component since it's not available
const Alert: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => (
  <div className={`border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 rounded-lg p-4 ${className}`}>
    {children}
  </div>
);

const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-sm text-blue-800 dark:text-blue-200">{children}</div>
);

// Simple Switch component
const Switch: React.FC<{ 
  checked: boolean; 
  onCheckedChange: (checked: boolean) => void;
  'aria-label'?: string;
}> = ({ checked, onCheckedChange, 'aria-label': ariaLabel }) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
      checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// Simple Label component
const Label: React.FC<{ 
  children: React.ReactNode; 
  htmlFor?: string; 
  className?: string 
}> = ({ children, htmlFor, className = "" }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}>
    {children}
  </label>
);

// Simple Separator component
const Separator = () => (
  <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
);

const TableDemo: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(true);
  const [activeDemo, setActiveDemo] = useState('basic');

  // Theme toggle effect
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleExportData = () => {
    const mockData = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', status: 'Active' },
    ];
    const dataStr = JSON.stringify(mockData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'table-demo-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Table Component Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Interactive demonstration of advanced table features with component integration
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm">🌞</span>
            <Switch
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
              aria-label="Toggle dark mode"
            />
            <span className="text-sm">🌙</span>
          </div>
          
          {/* Advanced Features Toggle */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="advanced-features" className="text-sm">
              Advanced Features
            </Label>
            <Switch
              checked={showAdvancedFeatures}
              onCheckedChange={setShowAdvancedFeatures}
            />
          </div>
        </div>
      </div>

      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Demo Controls & Integration Examples
          </CardTitle>
          <CardDescription>
            Control demo features and see integration examples with other components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Quick Actions */}
            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="space-y-2">
                <Button onClick={handleExportData} size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Demo Data
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-2">
              <Label>Key Features</Label>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Search className="h-3 w-3" />
                  Real-time Search
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-3 w-3" />
                  Advanced Filtering
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3" />
                  Bulk Operations
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-2">
              <Label>Table Stats</Label>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div>Columns: 5</div>
                <div>Sortable: Yes</div>
                <div>Resizable: Yes</div>
                <div>Editable: Yes</div>
              </div>
            </div>

            {/* Component Integration */}
            <div className="space-y-2">
              <Label>Integration</Label>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div>Cards: ✓</div>
                <div>Dialogs: ✓</div>
                <div>Tabs: ✓</div>
                <div>Forms: ✓</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Showcase */}
      {showAdvancedFeatures && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold">Search & Filter</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time search across all columns with dynamic filtering options
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold">Bulk Operations</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select multiple rows for batch status updates or bulk deletion
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <h3 className="font-semibold">Inline Editing</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click any cell to edit values directly within the table
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Table Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Interactive Table Demo
            </div>
            <Badge variant="secondary">Full Features</Badge>
          </CardTitle>
          <CardDescription>
            Complete table with all advanced features: search, filter, sort, edit, bulk operations, and resizable columns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table />
        </CardContent>
      </Card>

      {/* Integration Examples */}
      {showAdvancedFeatures && (
        <Card>
          <CardHeader>
            <CardTitle>Component Integration Examples</CardTitle>
            <CardDescription>
              See how the table integrates with various UI components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeDemo} onValueChange={setActiveDemo}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Integration</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard View</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Usage</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Basic integration shows how to embed the table within cards and forms.
                    The table maintains all its functionality while adapting to different container sizes.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">User Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-96 overflow-auto">
                        <Table />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New User
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Export Users
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Users
                      </Button>
                      <Separator />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        The table on the left demonstrates responsive behavior 
                        within a constrained container while maintaining all interactive features.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="dashboard" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Total Users
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        125
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Across all departments
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Active Users
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        98
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Currently online
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Departments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        8
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Different roles
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>User Activity Dashboard</CardTitle>
                    <CardDescription>
                      Complete user management interface with metrics and interactive table
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Advanced usage demonstrates the table's flexibility with complex UI patterns.
                    Features include modal integration, form workflows, and responsive layouts.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Advanced Table Features</CardTitle>
                      <CardDescription>
                        Explore all the advanced capabilities in action
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge>Column Resizing</Badge>
                          <Badge>Multi-sort</Badge>
                          <Badge>Inline Editing</Badge>
                          <Badge>Bulk Selection</Badge>
                          <Badge>Dynamic Filters</Badge>
                          <Badge>Pagination</Badge>
                          <Badge>Dark Mode</Badge>
                          <Badge>Responsive</Badge>
                        </div>
                        <Table />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Code Examples */}
      {showAdvancedFeatures && (
        <Card>
          <CardHeader>
            <CardTitle>Implementation Examples</CardTitle>
            <CardDescription>
              Copy these code examples to implement the table in your projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic">
              <TabsList>
                <TabsTrigger value="basic">Basic Usage</TabsTrigger>
                <TabsTrigger value="card">Card Integration</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard Layout</TabsTrigger>
              </TabsList>

              <TabsContent value="basic">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`import { Table } from '@/components/ui/shared/table';

function UserManagement() {
  return (
    <div className="p-6">
      <h1>User Management</h1>
      <Table />
    </div>
  );
}`}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="card">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`import { Table } from '@/components/ui/shared/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function UserCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table />
      </CardContent>
    </Card>
  );
}`}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="dashboard">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`import { Table } from '@/components/ui/shared/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent>Metric 1</CardContent></Card>
        <Card><CardContent>Metric 2</CardContent></Card>
        <Card><CardContent>Metric 3</CardContent></Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Data Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table />
        </CardContent>
      </Card>
    </div>
  );
}`}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TableDemo;
