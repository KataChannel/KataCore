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
  SunIcon,
  MoonIcon,
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
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Get dark mode preference from localStorage
    const getDarkModeFromStorage = () => {
      try {
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode !== null) {
          return JSON.parse(savedDarkMode);
        }
        // If no preference saved, check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      } catch (error) {
        console.error('Error reading dark mode from localStorage:', error);
        return false;
      }
    };

    const initialDarkMode = getDarkModeFromStorage();
    setDarkMode(initialDarkMode);

    // Simulate API call
    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    try {
      localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    } catch (error) {
      console.error('Error saving dark mode to localStorage:', error);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

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
      <div
        className={`animate-pulse ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen p-6`}
      >
        <div className="mb-8">
          <div
            className={`h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/4 mb-2`}
          ></div>
          <div
            className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2`}
          ></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}
            >
              <div
                className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/3 mb-4`}
              ></div>
              <div
                className={`h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2 mb-2`}
              ></div>
              <div
                className={`h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/4`}
              ></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1
              className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}
            >
              HR Dashboard
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Welcome back! Here's what's happening with your organization.
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg border transition-colors ${
              darkMode
                ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map(card => (
            <div
              key={card.name}
              className={`rounded-lg shadow p-6 transition-all duration-300 ${
                darkMode
                  ? 'bg-gray-800 border border-gray-700 hover:bg-gray-750'
                  : 'bg-white border border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {card.name}
                  </p>
                  <p
                    className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {card.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                >
                  <card.icon
                    className={`h-6 w-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {card.changeType === 'increase' ? (
                  <ArrowUpIcon
                    className={`h-4 w-4 mr-1 ${darkMode ? 'text-green-400' : 'text-green-500'}`}
                  />
                ) : (
                  <ArrowDownIcon
                    className={`h-4 w-4 mr-1 ${darkMode ? 'text-red-400' : 'text-red-500'}`}
                  />
                )}
                <span
                  className={`text-sm ${
                    card.changeType === 'increase'
                      ? darkMode
                        ? 'text-green-400'
                        : 'text-green-600'
                      : darkMode
                        ? 'text-red-400'
                        : 'text-red-600'
                  }`}
                >
                  {card.change}
                </span>
                <span
                  className={`text-sm ml-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}
                >
                  from last month
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div
            className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <UsersIcon
                    className={`h-5 w-5 mr-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  />
                  <span
                    className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}
                  >
                    Add New Employee
                  </span>
                </div>
              </button>
              <button
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <CalendarIcon
                    className={`h-5 w-5 mr-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  />
                  <span
                    className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}
                  >
                    Review Leave Requests
                  </span>
                </div>
              </button>
              <button
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <ClockIcon
                    className={`h-5 w-5 mr-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  />
                  <span
                    className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}
                  >
                    Check Attendance
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div
            className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Recent Activities
            </h3>
            <div className="space-y-3">
              <div
                className={`flex items-center p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
              >
                <div className="flex-shrink-0">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-gray-400'}`}
                  >
                    <UsersIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}
                  >
                    New employee onboarded
                  </p>
                  <p
                    className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    John Doe - Software Engineer
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
              >
                <div className="flex-shrink-0">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-gray-400'}`}
                  >
                    <CalendarIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}
                  >
                    Leave request approved
                  </p>
                  <p
                    className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    Jane Smith - 3 days vacation
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
              >
                <div className="flex-shrink-0">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-gray-400'}`}
                  >
                    <CurrencyDollarIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}
                  >
                    Payroll processed
                  </p>
                  <p
                    className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    Monthly payroll for December
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Employee Growth
            </h3>
            <div
              className={`h-64 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Chart placeholder - Employee growth over time
              </p>
            </div>
          </div>
          <div
            className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Department Distribution
            </h3>
            <div
              className={`h-64 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Chart placeholder - Employees by department
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
