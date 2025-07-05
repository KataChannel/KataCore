'use client';

import { useState, useEffect } from 'react';
import {
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  pendingLeaves: number;
  todayAttendance: number;
  monthlyPayroll: number;
}

interface StatCard {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const mockStats: DashboardStats = {
  totalEmployees: 247,
  activeEmployees: 235,
  totalDepartments: 12,
  pendingLeaves: 8,
  todayAttendance: 92,
  monthlyPayroll: 2450000,
};

export default function HRDashboard() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  const statCards: StatCard[] = [
    {
      name: 'Total Employees',
      value: stats.totalEmployees.toString(),
      change: '+12%',
      changeType: 'increase',
      icon: UsersIcon,
    },
    {
      name: 'Active Employees',
      value: stats.activeEmployees.toString(),
      change: '+2%',
      changeType: 'increase',
      icon: ChartBarIcon,
    },
    {
      name: 'Departments',
      value: stats.totalDepartments.toString(),
      change: 'No change',
      changeType: 'increase',
      icon: BuildingOfficeIcon,
    },
    {
      name: 'Pending Leaves',
      value: stats.pendingLeaves.toString(),
      change: '-3%',
      changeType: 'decrease',
      icon: CalendarIcon,
    },
    {
      name: 'Today Attendance',
      value: `${stats.todayAttendance}%`,
      change: '+5%',
      changeType: 'increase',
      icon: ClockIcon,
    },
    {
      name: 'Monthly Payroll',
      value: `$${stats.monthlyPayroll.toLocaleString()}`,
      change: '+8%',
      changeType: 'increase',
      icon: CurrencyDollarIcon,
    },
  ];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your organization.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.name} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.name}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <card.icon className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {card.changeType === 'increase' ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {card.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              <div className="flex items-center">
                <UsersIcon className="h-5 w-5 text-indigo-600 mr-3" />
                <span className="text-sm font-medium text-indigo-900">Add New Employee</span>
              </div>
            </button>
            <button className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-green-900">Review Leave Requests</span>
              </div>
            </button>
            <button className="w-full text-left p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-yellow-600 mr-3" />
                <span className="text-sm font-medium text-yellow-900">Check Attendance</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <UsersIcon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">New employee onboarded</p>
                <p className="text-xs text-gray-500">John Doe - Software Engineer</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CalendarIcon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Leave request approved</p>
                <p className="text-xs text-gray-500">Jane Smith - 3 days vacation</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <CurrencyDollarIcon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Payroll processed</p>
                <p className="text-xs text-gray-500">Monthly payroll for December</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Growth</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - Employee growth over time</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - Employees by department</p>
          </div>
        </div>
      </div>
    </div>
  );
}
