'use client';

import { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';

interface PayrollRecord {
  id: string;
  employee: {
    id: string;
    fullName: string;
    employeeId: string;
    position: {
      title: string;
      department: {
        name: string;
      };
    };
  };
  period: string;
  basicSalary: number;
  overtime: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  paidAt?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PayrollSummary {
  totalRecords: number;
  totalBasicSalary: number;
  totalOvertime: number;
  totalBonus: number;
  totalDeductions: number;
  totalNetSalary: number;
  paidRecords: number;
  unpaidRecords: number;
}

interface Employee {
  id: string;
  fullName: string;
  employeeId: string;
  salary: number;
}

const mockPayrollRecords: PayrollRecord[] = [
  {
    id: '1',
    employee: {
      id: '1',
      fullName: 'John Doe',
      employeeId: 'EMP001',
      position: {
        title: 'Senior Software Engineer',
        department: { name: 'Engineering' },
      },
    },
    period: '2024-01',
    basicSalary: 85000,
    overtime: 2500,
    bonus: 5000,
    deductions: 1200,
    netSalary: 91300,
    paidAt: '2024-01-31T10:00:00Z',
    status: 'PAID',
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-25T09:00:00Z',
  },
  {
    id: '2',
    employee: {
      id: '2',
      fullName: 'Jane Smith',
      employeeId: 'EMP002',
      position: {
        title: 'Marketing Manager',
        department: { name: 'Marketing' },
      },
    },
    period: '2024-01',
    basicSalary: 75000,
    overtime: 1500,
    bonus: 3000,
    deductions: 950,
    netSalary: 78550,
    paidAt: '2024-01-31T10:00:00Z',
    status: 'PAID',
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-25T09:00:00Z',
  },
  {
    id: '3',
    employee: {
      id: '3',
      fullName: 'Bob Johnson',
      employeeId: 'EMP003',
      position: {
        title: 'Sales Representative',
        department: { name: 'Sales' },
      },
    },
    period: '2024-01',
    basicSalary: 55000,
    overtime: 800,
    bonus: 2500,
    deductions: 650,
    netSalary: 57650,
    status: 'PROCESSED',
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-25T09:00:00Z',
  },
  {
    id: '4',
    employee: {
      id: '4',
      fullName: 'Alice Brown',
      employeeId: 'EMP004',
      position: {
        title: 'HR Specialist',
        department: { name: 'HR' },
      },
    },
    period: '2024-01',
    basicSalary: 60000,
    overtime: 500,
    bonus: 1500,
    deductions: 750,
    netSalary: 61250,
    status: 'PROCESSED',
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-25T09:00:00Z',
  },
  {
    id: '5',
    employee: {
      id: '5',
      fullName: 'Charlie Wilson',
      employeeId: 'EMP005',
      position: {
        title: 'Financial Analyst',
        department: { name: 'Finance' },
      },
    },
    period: '2024-01',
    basicSalary: 70000,
    overtime: 1200,
    bonus: 2000,
    deductions: 850,
    netSalary: 72350,
    status: 'DRAFT',
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-25T09:00:00Z',
  },
];

const mockEmployees: Employee[] = [
  { id: '1', fullName: 'John Doe', employeeId: 'EMP001', salary: 85000 },
  { id: '2', fullName: 'Jane Smith', employeeId: 'EMP002', salary: 75000 },
  { id: '3', fullName: 'Bob Johnson', employeeId: 'EMP003', salary: 55000 },
  { id: '4', fullName: 'Alice Brown', employeeId: 'EMP004', salary: 60000 },
  { id: '5', fullName: 'Charlie Wilson', employeeId: 'EMP005', salary: 70000 },
];

export default function PayrollPage() {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showBulkProcessModal, setShowBulkProcessModal] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    period: '',
    basicSalary: '',
    overtime: '',
    bonus: '',
    deductions: '',
    notes: '',
  });

  useEffect(() => {
    setTimeout(() => {
      setPayrollRecords(mockPayrollRecords);
      setEmployees(mockEmployees);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRecords = payrollRecords.filter(record => {
    const matchesPeriod = record.period === selectedPeriod;
    const matchesSearch =
      record.employee.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      record.employee.employeeId
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || record.status === statusFilter;
    const matchesDepartment =
      departmentFilter === 'all' ||
      record.employee.position.department.name === departmentFilter;

    return matchesPeriod && matchesSearch && matchesStatus && matchesDepartment;
  });

  const getSummary = (): PayrollSummary => {
    const records = payrollRecords.filter(r => r.period === selectedPeriod);
    return {
      totalRecords: records.length,
      totalBasicSalary: records.reduce((sum, r) => sum + r.basicSalary, 0),
      totalOvertime: records.reduce((sum, r) => sum + r.overtime, 0),
      totalBonus: records.reduce((sum, r) => sum + r.bonus, 0),
      totalDeductions: records.reduce((sum, r) => sum + r.deductions, 0),
      totalNetSalary: records.reduce((sum, r) => sum + r.netSalary, 0),
      paidRecords: records.filter(r => r.status === 'PAID').length,
      unpaidRecords: records.filter(r => r.status !== 'PAID').length,
    };
  };

  const summary = getSummary();
  const departments = [
    ...new Set(payrollRecords.map(r => r.employee.position.department.name)),
  ];

  const handleBulkProcess = () => {
    const draftRecords = filteredRecords.filter(r => r.status === 'DRAFT');

    const updatedRecords = payrollRecords.map(record => {
      if (draftRecords.some(draft => draft.id === record.id)) {
        return { ...record, status: 'PROCESSED' as const };
      }
      return record;
    });

    setPayrollRecords(updatedRecords);
    setShowBulkProcessModal(false);
  };

  const handleMarkAsPaid = (recordId: string) => {
    const updatedRecords = payrollRecords.map(record => {
      if (record.id === recordId) {
        return {
          ...record,
          status: 'PAID' as const,
          paidAt: new Date().toISOString(),
        };
      }
      return record;
    });

    setPayrollRecords(updatedRecords);
  };

  const handleEdit = (payroll: PayrollRecord) => {
    setSelectedPayroll(payroll);
    setFormData({
      employeeId: payroll.employee.id,
      period: payroll.period,
      basicSalary: payroll.basicSalary.toString(),
      overtime: payroll.overtime.toString(),
      bonus: payroll.bonus.toString(),
      deductions: payroll.deductions.toString(),
      notes: '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const netSalary =
      parseFloat(formData.basicSalary) +
      parseFloat(formData.overtime || '0') +
      parseFloat(formData.bonus || '0') -
      parseFloat(formData.deductions || '0');

    if (selectedPayroll) {
      const updatedRecords = payrollRecords.map(record => {
        if (record.id === selectedPayroll.id) {
          return {
            ...record,
            basicSalary: parseFloat(formData.basicSalary),
            overtime: parseFloat(formData.overtime || '0'),
            bonus: parseFloat(formData.bonus || '0'),
            deductions: parseFloat(formData.deductions || '0'),
            netSalary: netSalary,
            updatedAt: new Date().toISOString(),
          };
        }
        return record;
      });
      setPayrollRecords(updatedRecords);
    } else {
      const employee = employees.find(e => e.id === formData.employeeId);
      if (employee) {
        const newRecord: PayrollRecord = {
          id: Date.now().toString(),
          employee: {
            id: employee.id,
            fullName: employee.fullName,
            employeeId: employee.employeeId,
            position: {
              title: 'Employee',
              department: { name: 'General' },
            },
          },
          period: formData.period,
          basicSalary: parseFloat(formData.basicSalary),
          overtime: parseFloat(formData.overtime || '0'),
          bonus: parseFloat(formData.bonus || '0'),
          deductions: parseFloat(formData.deductions || '0'),
          netSalary: netSalary,
          status: 'DRAFT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setPayrollRecords([...payrollRecords, newRecord]);
      }
    }

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      period: '',
      basicSalary: '',
      overtime: '',
      bonus: '',
      deductions: '',
      notes: '',
    });
    setSelectedPayroll(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Payroll Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage employee payroll and salary payments
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Create Payroll
              </button>
              <button
                onClick={() => setShowBulkProcessModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircleIcon className="h-5 w-5" />
                Bulk Process
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Total Records
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {summary.totalRecords}
                </p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  Total Net Salary
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(summary.totalNetSalary)}
                </p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">
                  Paid Records
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  {summary.paidRecords}
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">
                  Unpaid Records
                </p>
                <p className="text-2xl font-bold text-red-900">
                  {summary.unpaidRecords}
                </p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period
            </label>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="2024-01">January 2024</option>
              <option value="2024-02">February 2024</option>
              <option value="2024-03">March 2024</option>
              <option value="2024-04">April 2024</option>
              <option value="2024-05">May 2024</option>
              <option value="2024-06">June 2024</option>
              <option value="2024-07">July 2024</option>
              <option value="2024-08">August 2024</option>
              <option value="2024-09">September 2024</option>
              <option value="2024-10">October 2024</option>
              <option value="2024-11">November 2024</option>
              <option value="2024-12">December 2024</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PROCESSED">Processed</option>
              <option value="PAID">Paid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Basic Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overtime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bonus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {record.employee.fullName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.employee.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.employee.employeeId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(record.basicSalary)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(record.overtime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(record.bonus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(record.deductions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(record.netSalary)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'PROCESSED'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(record)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {record.status !== 'PAID' && (
                        <button
                          onClick={() => handleMarkAsPaid(record.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Mark as Paid"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => console.log('Delete', record.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedPayroll ? 'Edit Payroll' : 'Create New Payroll'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee *
                </label>
                <select
                  value={formData.employeeId}
                  onChange={e =>
                    setFormData({ ...formData, employeeId: e.target.value })
                  }
                  required
                  disabled={!!selectedPayroll}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Employee</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.fullName} - {employee.employeeId}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period *
                </label>
                <input
                  type="month"
                  value={formData.period}
                  onChange={e =>
                    setFormData({ ...formData, period: e.target.value })
                  }
                  required
                  disabled={!!selectedPayroll}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Basic Salary *
                </label>
                <input
                  type="number"
                  value={formData.basicSalary}
                  onChange={e =>
                    setFormData({ ...formData, basicSalary: e.target.value })
                  }
                  required
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overtime
                </label>
                <input
                  type="number"
                  value={formData.overtime}
                  onChange={e =>
                    setFormData({ ...formData, overtime: e.target.value })
                  }
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bonus
                </label>
                <input
                  type="number"
                  value={formData.bonus}
                  onChange={e =>
                    setFormData({ ...formData, bonus: e.target.value })
                  }
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deductions
                </label>
                <input
                  type="number"
                  value={formData.deductions}
                  onChange={e =>
                    setFormData({ ...formData, deductions: e.target.value })
                  }
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={e =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {selectedPayroll ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Process Modal */}
      {showBulkProcessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Bulk Process Payrolls</h3>
              <button
                onClick={() => setShowBulkProcessModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                This will process all draft payroll records for the selected
                period.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Records to process:</strong>{' '}
                {filteredRecords.filter(r => r.status === 'DRAFT').length}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBulkProcess}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Process All
              </button>
              <button
                onClick={() => setShowBulkProcessModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
