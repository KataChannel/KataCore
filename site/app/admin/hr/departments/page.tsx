'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Department {
  id: string;
  name: string;
  description: string;
  code: string;
  budget: number;
  location: string;
  phone: string;
  email: string;
  isActive: boolean;
  manager: {
    id: string;
    name: string;
    email: string;
  } | null;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Engineering',
    description: 'Software development and technical operations',
    code: 'ENG',
    budget: 500000,
    location: 'Floor 3, Building A',
    phone: '+1 (555) 123-4567',
    email: 'engineering@company.com',
    isActive: true,
    manager: {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@company.com'
    },
    employeeCount: 25,
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2023-12-01T14:30:00Z'
  },
  {
    id: '2',
    name: 'Marketing',
    description: 'Brand management and customer acquisition',
    code: 'MKT',
    budget: 300000,
    location: 'Floor 2, Building A',
    phone: '+1 (555) 234-5678',
    email: 'marketing@company.com',
    isActive: true,
    manager: {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com'
    },
    employeeCount: 15,
    createdAt: '2023-01-20T09:30:00Z',
    updatedAt: '2023-11-15T16:45:00Z'
  },
  {
    id: '3',
    name: 'Sales',
    description: 'Revenue generation and client relationships',
    code: 'SLS',
    budget: 400000,
    location: 'Floor 1, Building B',
    phone: '+1 (555) 345-6789',
    email: 'sales@company.com',
    isActive: true,
    manager: {
      id: '3',
      name: 'Michael Brown',
      email: 'michael.brown@company.com'
    },
    employeeCount: 20,
    createdAt: '2023-02-01T11:15:00Z',
    updatedAt: '2023-12-10T13:20:00Z'
  },
  {
    id: '4',
    name: 'Human Resources',
    description: 'Employee management and organizational development',
    code: 'HR',
    budget: 200000,
    location: 'Floor 2, Building B',
    phone: '+1 (555) 456-7890',
    email: 'hr@company.com',
    isActive: true,
    manager: {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@company.com'
    },
    employeeCount: 8,
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2023-11-30T12:00:00Z'
  },
  {
    id: '5',
    name: 'Finance',
    description: 'Financial planning and accounting operations',
    code: 'FIN',
    budget: 250000,
    location: 'Floor 4, Building A',
    phone: '+1 (555) 567-8901',
    email: 'finance@company.com',
    isActive: true,
    manager: null,
    employeeCount: 12,
    createdAt: '2023-01-25T15:30:00Z',
    updatedAt: '2023-12-05T10:15:00Z'
  },
  {
    id: '6',
    name: 'Research & Development',
    description: 'Innovation and product development',
    code: 'RND',
    budget: 600000,
    location: 'Floor 5, Building A',
    phone: '+1 (555) 678-9012',
    email: 'rd@company.com',
    isActive: false,
    manager: null,
    employeeCount: 0,
    createdAt: '2023-06-01T14:00:00Z',
    updatedAt: '2023-08-15T09:45:00Z'
  },
];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; department: Department | null }>({
    show: false,
    department: null
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDepartments(mockDepartments);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dept.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dept.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && dept.isActive) ||
                         (statusFilter === 'inactive' && !dept.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (department: Department) => {
    setDeleteModal({ show: true, department });
  };

  const confirmDelete = () => {
    if (deleteModal.department) {
      setDepartments(prev => prev.filter(dept => dept.id !== deleteModal.department!.id));
      setDeleteModal({ show: false, department: null });
    }
  };

  const getTotalBudget = () => {
    return departments.reduce((total, dept) => total + dept.budget, 0);
  };

  const getTotalEmployees = () => {
    return departments.reduce((total, dept) => total + dept.employeeCount, 0);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded mb-4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
            <p className="text-gray-600">Manage organizational departments and structure</p>
          </div>
          <Link
            href="/hr/departments/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Department
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-full">
              <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Departments</p>
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalEmployees()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">${getTotalBudget().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search departments..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Departments</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => (
          <div key={department.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{department.name}</h3>
                    <p className="text-sm text-gray-500">{department.code}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    department.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {department.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{department.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  <span>{department.employeeCount} employees</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  <span>${department.budget.toLocaleString()} budget</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  <span>{department.location}</span>
                </div>
                {department.manager && (
                  <div className="flex items-center text-sm text-gray-500">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    <span>Manager: {department.manager.name}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-sm text-gray-500">
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  <span>{department.phone}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <EnvelopeIcon className="h-4 w-4 mr-1" />
                  <span>{department.email}</span>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/hr/departments/${department.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/hr/departments/${department.id}/edit`}
                    className="text-green-600 hover:text-green-900"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(department)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Updated {new Date(department.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Department</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{deleteModal.department?.name}"? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 mr-2"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteModal({ show: false, department: null })}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
