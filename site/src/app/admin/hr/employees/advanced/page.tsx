'use client';

import { useState, useEffect } from 'react';
import {
  UserIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  DocumentTextIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEnhancedHRPermissions } from '../lib/enhanced-permissions';

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  department: {
    id: string;
    name: string;
  };
  position: {
    id: string;
    title: string;
  };
  manager: {
    id: string;
    name: string;
  } | null;
  hireDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE' | 'PROBATION';
  contractType:
    | 'FULL_TIME'
    | 'PART_TIME'
    | 'CONTRACT'
    | 'INTERNSHIP'
    | 'FREELANCE';
  salary: number;
  address: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  nationality: string;
  emergencyContact: string;
  avatar?: string;
  tags: string[];
  skills: string[];
  certifications: string[];
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  performanceRating: number;
  attendanceRate: number;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Position {
  id: string;
  title: string;
  departmentId: string;
  level: string;
}

// Mock data for demonstration
const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    department: { id: '1', name: 'Engineering' },
    position: { id: '1', title: 'Senior Software Engineer' },
    manager: { id: '2', name: 'Jane Smith' },
    hireDate: '2023-01-15',
    status: 'ACTIVE',
    contractType: 'FULL_TIME',
    salary: 95000,
    address: '123 Main St, City, State 12345',
    dateOfBirth: '1990-05-15',
    gender: 'Male',
    nationality: 'American',
    emergencyContact: 'Jane Doe - +1 (555) 987-6543',
    tags: ['Senior', 'Team Lead', 'Full Stack'],
    skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    certifications: ['AWS Solutions Architect', 'Scrum Master'],
    createdAt: '2023-01-15T09:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    lastLogin: '2024-01-15T14:30:00Z',
    performanceRating: 4.8,
    attendanceRate: 98.5,
  },
  {
    id: '2',
    employeeId: 'EMP002',
    firstName: 'Jane',
    lastName: 'Smith',
    fullName: 'Jane Smith',
    email: 'jane.smith@company.com',
    phone: '+1 (555) 234-5678',
    department: { id: '2', name: 'Marketing' },
    position: { id: '2', title: 'Marketing Manager' },
    manager: null,
    hireDate: '2022-03-01',
    status: 'ACTIVE',
    contractType: 'FULL_TIME',
    salary: 85000,
    address: '456 Oak Ave, City, State 12345',
    dateOfBirth: '1988-08-22',
    gender: 'Female',
    nationality: 'American',
    emergencyContact: 'John Smith - +1 (555) 876-5432',
    tags: ['Manager', 'Digital Marketing'],
    skills: ['SEO', 'SEM', 'Analytics', 'Content Strategy'],
    certifications: ['Google Analytics', 'HubSpot'],
    createdAt: '2022-03-01T09:00:00Z',
    updatedAt: '2024-01-14T10:15:00Z',
    lastLogin: '2024-01-14T16:45:00Z',
    performanceRating: 4.6,
    attendanceRate: 96.8,
  },
  {
    id: '3',
    employeeId: 'EMP003',
    firstName: 'Bob',
    lastName: 'Johnson',
    fullName: 'Bob Johnson',
    email: 'bob.johnson@company.com',
    phone: '+1 (555) 345-6789',
    department: { id: '3', name: 'Sales' },
    position: { id: '3', title: 'Sales Representative' },
    manager: { id: '4', name: 'Alice Brown' },
    hireDate: '2023-06-10',
    status: 'PROBATION',
    contractType: 'FULL_TIME',
    salary: 65000,
    address: '789 Pine St, City, State 12345',
    dateOfBirth: '1992-12-03',
    gender: 'Male',
    nationality: 'Canadian',
    emergencyContact: 'Sarah Johnson - +1 (555) 765-4321',
    tags: ['New Hire', 'B2B Sales'],
    skills: ['Sales', 'CRM', 'Negotiation'],
    certifications: ['Salesforce Certified'],
    createdAt: '2023-06-10T09:00:00Z',
    updatedAt: '2024-01-13T11:20:00Z',
    lastLogin: '2024-01-13T17:30:00Z',
    performanceRating: 3.8,
    attendanceRate: 94.2,
  },
  {
    id: '4',
    employeeId: 'EMP004',
    firstName: 'Alice',
    lastName: 'Brown',
    fullName: 'Alice Brown',
    email: 'alice.brown@company.com',
    phone: '+1 (555) 456-7890',
    department: { id: '4', name: 'HR' },
    position: { id: '4', title: 'HR Specialist' },
    manager: { id: '5', name: 'Charlie Wilson' },
    hireDate: '2021-09-15',
    status: 'ACTIVE',
    contractType: 'FULL_TIME',
    salary: 70000,
    address: '321 Elm Dr, City, State 12345',
    dateOfBirth: '1985-04-18',
    gender: 'Female',
    nationality: 'British',
    emergencyContact: 'David Brown - +1 (555) 654-3210',
    tags: ['HR Expert', 'Recruiting'],
    skills: ['Recruitment', 'Employee Relations', 'HRIS'],
    certifications: ['SHRM-CP', 'PHR'],
    createdAt: '2021-09-15T09:00:00Z',
    updatedAt: '2024-01-12T13:45:00Z',
    lastLogin: '2024-01-12T18:20:00Z',
    performanceRating: 4.4,
    attendanceRate: 97.3,
  },
  {
    id: '5',
    employeeId: 'EMP005',
    firstName: 'Charlie',
    lastName: 'Wilson',
    fullName: 'Charlie Wilson',
    email: 'charlie.wilson@company.com',
    phone: '+1 (555) 567-8901',
    department: { id: '5', name: 'Finance' },
    position: { id: '5', title: 'Financial Analyst' },
    manager: null,
    hireDate: '2020-11-01',
    status: 'ON_LEAVE',
    contractType: 'FULL_TIME',
    salary: 75000,
    address: '654 Maple Rd, City, State 12345',
    dateOfBirth: '1987-07-30',
    gender: 'Male',
    nationality: 'Australian',
    emergencyContact: 'Emma Wilson - +1 (555) 543-2109',
    tags: ['Senior Analyst', 'Budget Planning'],
    skills: ['Financial Analysis', 'Excel', 'SQL', 'Tableau'],
    certifications: ['CFA Level 2', 'FRM'],
    createdAt: '2020-11-01T09:00:00Z',
    updatedAt: '2024-01-10T15:10:00Z',
    lastLogin: '2024-01-05T12:15:00Z',
    performanceRating: 4.7,
    attendanceRate: 89.5,
  },
];

const mockDepartments: Department[] = [
  { id: '1', name: 'Engineering', code: 'ENG' },
  { id: '2', name: 'Marketing', code: 'MKT' },
  { id: '3', name: 'Sales', code: 'SAL' },
  { id: '4', name: 'HR', code: 'HR' },
  { id: '5', name: 'Finance', code: 'FIN' },
];

const mockPositions: Position[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    departmentId: '1',
    level: 'Senior',
  },
  { id: '2', title: 'Marketing Manager', departmentId: '2', level: 'Manager' },
  {
    id: '3',
    title: 'Sales Representative',
    departmentId: '3',
    level: 'Junior',
  },
  { id: '4', title: 'HR Specialist', departmentId: '4', level: 'Mid' },
  { id: '5', title: 'Financial Analyst', departmentId: '5', level: 'Mid' },
];

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  TERMINATED: 'bg-red-100 text-red-800',
  ON_LEAVE: 'bg-yellow-100 text-yellow-800',
  PROBATION: 'bg-blue-100 text-blue-800',
};

const contractTypeColors = {
  FULL_TIME: 'bg-green-100 text-green-800',
  PART_TIME: 'bg-blue-100 text-blue-800',
  CONTRACT: 'bg-purple-100 text-purple-800',
  INTERNSHIP: 'bg-orange-100 text-orange-800',
  FREELANCE: 'bg-pink-100 text-pink-800',
};

export default function AdvancedEmployeePage() {
  // Simulate current user for permissions (in real app, this would come from auth context)
  const currentUser = { roleId: 'hr_admin', departmentId: '4', userId: '4' };
  const permissions = useEnhancedHRPermissions(
    currentUser.roleId,
    currentUser.departmentId,
    currentUser.userId
  );

  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [contractTypeFilter, setContractTypeFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('fullName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch =
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      employee.position.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || employee.status === statusFilter;
    const matchesDepartment =
      departmentFilter === 'all' || employee.department.id === departmentFilter;
    const matchesContractType =
      contractTypeFilter === 'all' ||
      employee.contractType === contractTypeFilter;

    return (
      matchesSearch && matchesStatus && matchesDepartment && matchesContractType
    );
  });

  // Sort employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Employee];
    let bValue: any = b[sortBy as keyof Employee];

    // Handle nested object properties
    if (sortBy === 'department') {
      aValue = a.department.name;
      bValue = b.department.name;
    } else if (sortBy === 'position') {
      aValue = a.position.title;
      bValue = b.position.title;
    }

    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = (employee: Employee) => {
    if (!permissions.canDeleteEmployee(employee.department.id, employee.id)) {
      alert('You do not have permission to delete this employee.');
      return;
    }
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedEmployee) {
      setEmployees(employees.filter(emp => emp.id !== selectedEmployee.id));
      setShowDeleteModal(false);
      setSelectedEmployee(null);
    }
  };

  const handleViewDetails = (employee: Employee) => {
    if (!permissions.canReadEmployee(employee.department.id, employee.id)) {
      alert('You do not have permission to view this employee details.');
      return;
    }
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  const handleExport = () => {
    if (!permissions.canExportEmployee()) {
      alert('You do not have permission to export employee data.');
      return;
    }
    // Simulate export functionality
    const csvContent = employees
      .map(
        emp =>
          `${emp.employeeId},${emp.fullName},${emp.email},${emp.department.name},${emp.position.title},${emp.status}`
      )
      .join('\n');

    const blob = new Blob(
      [`Employee ID,Name,Email,Department,Position,Status\n${csvContent}`],
      { type: 'text/csv' }
    );
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employees.csv';
    link.click();
  };

  const handleImport = () => {
    if (!permissions.canImportEmployee()) {
      alert('You do not have permission to import employee data.');
      return;
    }
    // Simulate import functionality
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('Importing file:', file.name);
        // Here you would implement the actual import logic
      }
    };
    input.click();
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {Array.from({ length: 5 }).map((_, i) => (
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
            <h1 className="text-2xl font-bold text-gray-900">
              Employee Management
            </h1>
            <p className="text-gray-600">
              Manage your organization's workforce with advanced features
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleImport}
              disabled={!permissions.canImportEmployee()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
              Import
            </button>
            <button
              onClick={handleExport}
              disabled={!permissions.canExportEmployee()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </button>
            {permissions.canCreateEmployee() && (
              <Link
                href="/hr/employees/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Employee
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Employees
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <UserIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Employees
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.filter(emp => emp.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <BuildingOfficeIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockDepartments.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <StarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Avg Performance
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {(
                  employees.reduce(
                    (acc, emp) => acc + emp.performanceRating,
                    0
                  ) / employees.length
                ).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="TERMINATED">Terminated</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="PROBATION">Probation</option>
                </select>
              </div>
              <div>
                <select
                  value={departmentFilter}
                  onChange={e => setDepartmentFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Departments</option>
                  {mockDepartments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={contractTypeFilter}
                  onChange={e => setContractTypeFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Contract Types</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  viewMode === 'table'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  viewMode === 'cards'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Employees ({sortedEmployees.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('fullName')}
                  >
                    <div className="flex items-center">
                      Employee
                      {sortBy === 'fullName' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUpIcon className="h-4 w-4 ml-1" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('department')}
                  >
                    <div className="flex items-center">
                      Department
                      {sortBy === 'department' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUpIcon className="h-4 w-4 ml-1" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('hireDate')}
                  >
                    <div className="flex items-center">
                      Hire Date
                      {sortBy === 'hireDate' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUpIcon className="h-4 w-4 ml-1" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedEmployees.map(employee => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {employee.firstName[0]}
                              {employee.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.employeeId} • {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.department.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.position.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(employee.hireDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <StarIcon
                          className={`h-4 w-4 mr-1 ${getPerformanceColor(employee.performanceRating)}`}
                        />
                        <span
                          className={getPerformanceColor(
                            employee.performanceRating
                          )}
                        >
                          {employee.performanceRating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${contractTypeColors[employee.contractType]}`}
                      >
                        {employee.contractType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[employee.status]}`}
                      >
                        {employee.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(employee)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {permissions.canUpdateEmployee(
                          employee.department.id,
                          employee.id
                        ) && (
                          <Link
                            href={`/hr/employees/${employee.id}/edit`}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                        )}
                        {permissions.canDeleteEmployee(
                          employee.department.id,
                          employee.id
                        ) && (
                          <button
                            onClick={() => handleDelete(employee)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedEmployees.map(employee => (
            <div
              key={employee.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-600">
                      {employee.firstName[0]}
                      {employee.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {employee.fullName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {employee.employeeId}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[employee.status]}`}
                  >
                    {employee.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                    {employee.department.name}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <UserIcon className="h-4 w-4 mr-2" />
                    {employee.position.title}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    {employee.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Hired {new Date(employee.hireDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <StarIcon
                      className={`h-4 w-4 mr-1 ${getPerformanceColor(employee.performanceRating)}`}
                    />
                    <span
                      className={`text-sm font-medium ${getPerformanceColor(employee.performanceRating)}`}
                    >
                      {employee.performanceRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon
                      className={`h-4 w-4 mr-1 ${getAttendanceColor(employee.attendanceRate)}`}
                    />
                    <span
                      className={`text-sm font-medium ${getAttendanceColor(employee.attendanceRate)}`}
                    >
                      {employee.attendanceRate.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewDetails(employee)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </button>
                  {permissions.canUpdateEmployee(
                    employee.department.id,
                    employee.id
                  ) && (
                    <Link
                      href={`/hr/employees/${employee.id}/edit`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                  )}
                  {permissions.canDeleteEmployee(
                    employee.department.id,
                    employee.id
                  ) && (
                    <button
                      onClick={() => handleDelete(employee)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Employee Detail Modal */}
      {showDetailModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Employee Details
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2">
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Employee ID
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedEmployee.employeeId}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedEmployee.fullName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedEmployee.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedEmployee.phone}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Gender
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedEmployee.gender}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nationality
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedEmployee.nationality}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedEmployee.address}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Emergency Contact
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedEmployee.emergencyContact}
                    </p>
                  </div>
                </div>

                {/* Employment Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2">
                    Employment Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Department
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedEmployee.department.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Position
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedEmployee.position.title}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Manager
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedEmployee.manager?.name ||
                          'No manager assigned'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Hire Date
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(
                          selectedEmployee.hireDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Contract Type
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedEmployee.contractType.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[selectedEmployee.status]}`}
                      >
                        {selectedEmployee.status.replace('_', ' ')}
                      </span>
                    </div>
                    {permissions.canAccessPayroll(
                      selectedEmployee.department.id,
                      selectedEmployee.id
                    ) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Salary
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          ${selectedEmployee.salary.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Performance Rating
                      </label>
                      <div className="flex items-center mt-1">
                        <StarIcon
                          className={`h-4 w-4 mr-1 ${getPerformanceColor(selectedEmployee.performanceRating)}`}
                        />
                        <span
                          className={`text-sm font-medium ${getPerformanceColor(selectedEmployee.performanceRating)}`}
                        >
                          {selectedEmployee.performanceRating.toFixed(1)} / 5.0
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Attendance Rate
                      </label>
                      <div className="flex items-center mt-1">
                        <ClockIcon
                          className={`h-4 w-4 mr-1 ${getAttendanceColor(selectedEmployee.attendanceRate)}`}
                        />
                        <span
                          className={`text-sm font-medium ${getAttendanceColor(selectedEmployee.attendanceRate)}`}
                        >
                          {selectedEmployee.attendanceRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skills and Certifications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Skills
                    </label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedEmployee.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Certifications
                    </label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedEmployee.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tags
                    </label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedEmployee.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
                {permissions.canUpdateEmployee(
                  selectedEmployee.department.id,
                  selectedEmployee.id
                ) && (
                  <Link
                    href={`/hr/employees/${selectedEmployee.id}/edit`}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Edit Employee
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Delete Employee
              </h3>
              <div className="mt-4 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete{' '}
                  <strong>{selectedEmployee.fullName}</strong>? This action
                  cannot be undone and will permanently remove all employee
                  data.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedEmployee(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
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
