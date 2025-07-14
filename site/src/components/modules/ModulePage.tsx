'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Download, Upload, Eye, Edit, Trash2, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ModuleConfig {
  name: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  sections: {
    id: string;
    title: string;
    description: string;
    permissions: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  }[];
}

interface ModulePageProps {
  config: ModuleConfig;
  userPermissions: any[];
  userModules: string[];
}

export function ModulePage({ config, userPermissions, userModules }: ModulePageProps) {
  const [activeTab, setActiveTab] = useState(config.sections[0]?.id || 'overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Check if user has access to this module
  const hasModuleAccess = userModules.includes(config.name);

  // Check specific permissions
  const checkPermission = (action: string, resource: string) => {
    return userPermissions.some((permission) => {
      if (typeof permission === 'string') {
        const [permAction, permResource] = permission.split(':');
        return permAction === action && permResource === resource;
      } else if (typeof permission === 'object') {
        return permission.action === action && permission.resource === resource;
      }
      return false;
    });
  };

  // Load module data
  const loadData = async () => {
    setLoading(true);
    try {
      // Here you would fetch actual data from your API
      // For now, we'll simulate loading
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      setData([
        { id: 1, name: 'Sample Record 1', status: 'active', createdAt: new Date().toISOString() },
        { id: 2, name: 'Sample Record 2', status: 'inactive', createdAt: new Date().toISOString() },
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasModuleAccess) {
      loadData();
    }
  }, [hasModuleAccess, activeTab]);

  if (!hasModuleAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access the {config.title} module.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeSection = config.sections.find((section) => section.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Module Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${config.color}`}>{config.icon}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{config.title}</h1>
              <p className="text-gray-600">{config.description}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            {config.name.toUpperCase()} Module
          </Badge>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
          {config.sections.map((section) => (
            <TabsTrigger key={section.id} value={section.id} className="px-6">
              {section.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {config.sections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="space-y-6">
            {/* Section Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {section.permissions.create && (
                      <Button className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Add New</span>
                      </Button>
                    )}
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </Button>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Upload className="h-4 w-4" />
                      <span>Import</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Filters and Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder={`Search ${section.title.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterValue} onValueChange={setFilterValue}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Records</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {section.title} ({data.length} records)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                            ID
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                            Name
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                            Status
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                            Created
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-3">{item.id}</td>
                            <td className="border border-gray-200 px-4 py-3 font-medium">
                              {item.name}
                            </td>
                            <td className="border border-gray-200 px-4 py-3">
                              <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                                {item.status}
                              </Badge>
                            </td>
                            <td className="border border-gray-200 px-4 py-3">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </td>
                            <td className="border border-gray-200 px-4 py-3">
                              <div className="flex space-x-2">
                                {section.permissions.read && (
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                {section.permissions.update && (
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                {section.permissions.delete && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
