'use client';

import { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PlusIcon,
  UserIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface LeaveRequest {
  id: string;
  employee: {
    id: string;
    name: string;
    employeeId: string;
    department: string;
    avatar?: string;
  };
  type:
    | 'ANNUAL'
    | 'SICK'
    | 'PERSONAL'
    | 'MATERNITY'
    | 'PATERNITY'
    | 'EMERGENCY';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  appliedDate: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  notes?: string;
}

interface LeaveBalance {
  employeeId: string;
  annual: number;
  sick: number;
  personal: number;
  used: {
    annual: number;
    sick: number;
    personal: number;
  };
}

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employee: {
      id: '1',
      name: 'John Doe',
      employeeId: 'EMP001',
      department: 'Engineering',
    },
    type: 'ANNUAL',
    startDate: '2024-01-20',
    endDate: '2024-01-25',
    days: 5,
    reason: 'Family vacation to Hawaii',
    status: 'PENDING',
    appliedDate: '2024-01-10',
  },
  {
    id: '2',
    employee: {
      id: '2',
      name: 'Jane Smith',
      employeeId: 'EMP002',
      department: 'Marketing',
    },
    type: 'SICK',
    startDate: '2024-01-15',
    endDate: '2024-01-16',
    days: 2,
    reason: 'Flu symptoms and medical appointment',
    status: 'APPROVED',
    appliedDate: '2024-01-14',
    approvedBy: 'HR Manager',
    approvedAt: '2024-01-14',
  },
  {
    id: '3',
    employee: {
      id: '3',
      name: 'Bob Johnson',
      employeeId: 'EMP003',
      department: 'Sales',
    },
    type: 'PERSONAL',
    startDate: '2024-01-18',
    endDate: '2024-01-18',
    days: 1,
    reason: 'Personal matters',
    status: 'REJECTED',
    appliedDate: '2024-01-17',
    rejectedBy: 'Department Manager',
    rejectedAt: '2024-01-17',
    notes: 'Insufficient personal leave balance',
  },
  {
    id: '4',
    employee: {
      id: '4',
      name: 'Alice Brown',
      employeeId: 'EMP004',
      department: 'HR',
    },
    type: 'MATERNITY',
    startDate: '2024-02-01',
    endDate: '2024-05-01',
    days: 90,
    reason: 'Maternity leave',
    status: 'APPROVED',
    appliedDate: '2024-01-05',
    approvedBy: 'HR Director',
    approvedAt: '2024-01-06',
  },
  {
    id: '5',
    employee: {
      id: '5',
      name: 'Charlie Wilson',
      employeeId: 'EMP005',
      department: 'Finance',
    },
    type: 'EMERGENCY',
    startDate: '2024-01-12',
    endDate: '2024-01-12',
    days: 1,
    reason: 'Family emergency',
    status: 'APPROVED',
    appliedDate: '2024-01-11',
    approvedBy: 'Department Manager',
    approvedAt: '2024-01-11',
  },
];

const leaveTypeColors = {
  ANNUAL: 'bg-blue-100 text-blue-800',
  SICK: 'bg-red-100 text-red-800',
  PERSONAL: 'bg-gray-100 text-gray-800',
  MATERNITY: 'bg-pink-100 text-pink-800',
  PATERNITY: 'bg-green-100 text-green-800',
  EMERGENCY: 'bg-orange-100 text-orange-800',
};

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const statusIcons = {
  PENDING: ClockIcon,
  APPROVED: CheckCircleIcon,
  REJECTED: XCircleIcon,
  CANCELLED: ExclamationTriangleIcon,
};

export default function LeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null
  );
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<
    'approve' | 'reject' | null
  >(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLeaveRequests(mockLeaveRequests);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch =
      request.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.employee.employeeId
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    const matchesDepartment =
      departmentFilter === 'all' ||
      request.employee.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesType && matchesDepartment;
  });

  const getRequestSummary = () => {
    const total = leaveRequests.length;
    const pending = leaveRequests.filter(r => r.status === 'PENDING').length;
    const approved = leaveRequests.filter(r => r.status === 'APPROVED').length;
    const rejected = leaveRequests.filter(r => r.status === 'REJECTED').length;

    return { total, pending, approved, rejected };
  };

  const summary = getRequestSummary();
  const departments = [
    ...new Set(leaveRequests.map(r => r.employee.department)),
  ];

  const handleApprovalAction = (
    request: LeaveRequest,
    action: 'approve' | 'reject'
  ) => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const confirmApproval = () => {
    if (!selectedRequest || !approvalAction) return;

    const updatedRequests = leaveRequests.map(request => {
      if (request.id === selectedRequest.id) {
        return {
          ...request,
          status: (approvalAction === 'approve' ? 'APPROVED' : 'REJECTED') as
            | 'APPROVED'
            | 'REJECTED',
          ...(approvalAction === 'approve'
            ? {
                approvedBy: 'Current User',
                approvedAt: new Date().toISOString(),
              }
            : {
                rejectedBy: 'Current User',
                rejectedAt: new Date().toISOString(),
              }),
          notes: approvalNotes || request.notes,
        };
      }
      return request;
    });

    setLeaveRequests(updatedRequests);
    setShowApprovalModal(false);
    setSelectedRequest(null);
    setApprovalAction(null);
    setApprovalNotes('');
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
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
            <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
            <p className="text-gray-600">
              Review and manage employee leave requests
            </p>
          </div>
          <Link
            href="/hr/leave-requests/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Request
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Requests
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.total}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.pending}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.approved}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.rejected}
              </p>
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
                  placeholder="Search requests..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="ANNUAL">Annual</option>
                  <option value="SICK">Sick</option>
                  <option value="PERSONAL">Personal</option>
                  <option value="MATERNITY">Maternity</option>
                  <option value="PATERNITY">Paternity</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>
              <div>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={departmentFilter}
                  onChange={e => setDepartmentFilter(e.target.value)}
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
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Leave Requests ({filteredRequests.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map(request => {
                const StatusIcon = statusIcons[request.status];
                return (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {request.employee.name
                                .split(' ')
                                .map(n => n[0])
                                .join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {request.employee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.employee.employeeId} •{' '}
                            {request.employee.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${leaveTypeColors[request.type]}`}
                      >
                        {request.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {new Date(request.startDate).toLocaleDateString()} -
                      </div>
                      <div>
                        {new Date(request.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.days}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[request.status]}`}
                        >
                          {request.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(request.appliedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={request.reason}>
                        {request.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {request.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() =>
                                handleApprovalAction(request, 'approve')
                              }
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleApprovalAction(request, 'reject')
                              }
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center h-12 w-12 mx-auto rounded-full bg-blue-100">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4 text-center">
                {approvalAction === 'approve' ? 'Approve' : 'Reject'} Leave
                Request
              </h3>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  {selectedRequest.employee.name} - {selectedRequest.type} Leave
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(selectedRequest.startDate).toLocaleDateString()} -{' '}
                  {new Date(selectedRequest.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedRequest.days} days
                </p>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  value={approvalNotes}
                  onChange={e => setApprovalNotes(e.target.value)}
                  placeholder="Add any comments..."
                />
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={confirmApproval}
                  className={`px-4 py-2 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    approvalAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  {approvalAction === 'approve' ? 'Approve' : 'Reject'}
                </button>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedRequest(null);
                    setApprovalAction(null);
                    setApprovalNotes('');
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
