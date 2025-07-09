'use client';

import { useState, useEffect } from 'react';
import {
  UsersIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  SunIcon,
  MoonIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';

// Types
interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  pendingLeaves: number;
  todayAttendance: number;
  monthlyPayroll: number;
  newHires: number;
  averageSalary: number;
}

interface StatCard {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ForwardRefExoticComponent<any>;
  color: string;
  description: string;
}

interface Activity {
  id: string;
  type: 'hire' | 'leave' | 'payroll' | 'attendance';
  message: string;
  timestamp: string;
  user: string;
}

// Mock data
const mockStats: DashboardStats = {
  totalEmployees: 1245,
  activeEmployees: 1186,
  totalDepartments: 12,
  pendingLeaves: 23,
  todayAttendance: 94,
  monthlyPayroll: 2450000,
  newHires: 15,
  averageSalary: 75000,
};

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'hire',
    message: 'John Doe joined as Software Engineer',
    timestamp: '2 hours ago',
    user: 'HR Team'
  },
  {
    id: '2',
    type: 'leave',
    message: 'Jane Smith\'s leave request approved',
    timestamp: '4 hours ago',
    user: 'Manager'
  },
  {
    id: '3',
    type: 'payroll',
    message: 'Monthly payroll processed',
    timestamp: '1 day ago',
    user: 'Finance'
  },
  {
    id: '4',
    type: 'attendance',
    message: 'Daily attendance report generated',
    timestamp: '1 day ago',
    user: 'System'
  }
];

export default function HRDashboard() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Get dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('admin-theme') === 'dark';
    setDarkMode(savedDarkMode);

    // Simulate API call
    setTimeout(() => {
      setStats(mockStats);
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    localStorage.setItem('admin-theme', newDarkMode ? 'dark' : 'light');
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const statCards: StatCard[] = [
    {
      name: 'Total Employees',
      value: stats.totalEmployees.toLocaleString(),
      change: '+12%',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'blue',
      description: 'All registered employees'
    },
    {
      name: 'Active Employees',
      value: stats.activeEmployees.toLocaleString(),
      change: '+2%',
      changeType: 'increase',
      icon: UserGroupIcon,
      color: 'green',
      description: 'Currently active staff'
    },
    {
      name: 'Departments',
      value: stats.totalDepartments.toString(),
      change: '+1',
      changeType: 'increase',
      icon: BuildingOfficeIcon,
      color: 'purple',
      description: 'Active departments'
    },
    {
      name: 'Pending Leaves',
      value: stats.pendingLeaves.toString(),
      change: '-5%',
      changeType: 'decrease',
      icon: CalendarIcon,
      color: 'orange',
      description: 'Awaiting approval'
    },
    {
      name: 'Today\'s Attendance',
      value: `${stats.todayAttendance}%`,
      change: '+3%',
      changeType: 'increase',
      icon: ClockIcon,
      color: 'green',
      description: 'Present today'
    },
    {
      name: 'Monthly Payroll',
      value: `$${(stats.monthlyPayroll / 1000000).toFixed(1)}M`,
      change: '+8%',
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      color: 'blue',
      description: 'This month\'s total'
    },
    {
      name: 'New Hires',
      value: stats.newHires.toString(),
      change: '+25%',
      changeType: 'increase',
      icon: BriefcaseIcon,
      color: 'purple',
      description: 'This month'
    },
    {
      name: 'Average Salary',
      value: `$${(stats.averageSalary / 1000).toFixed(0)}K`,
      change: '+5%',
      changeType: 'increase',
      icon: ChartBarIcon,
      color: 'green',
      description: 'Company average'
    },
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="mono-card p-6">
          <div className="h-8 bg-mono-100 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-mono-100 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="mono-card p-6">
              <div className="h-4 bg-mono-100 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-mono-100 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-mono-100 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mono-card p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              HR Dashboard
            </h1>
            <p className="text-text-secondary">
              Welcome back! Here's an overview of your HR operations today.
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <div className="text-right">
              <p className="text-sm text-text-secondary">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-xs text-text-secondary">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="mono-button secondary p-3"
              title="Toggle theme"
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.name} className="mono-card p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`p-2 rounded-lg ${
                    card.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    card.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                    card.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                    card.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                    'bg-gray-100 dark:bg-gray-900/30'
                  }`}>
                    <card.icon className={`h-5 w-5 ${
                      card.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      card.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      card.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                      card.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">{card.name}</p>
                    <p className="text-xs text-text-secondary">{card.description}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-primary mb-2">{card.value}</p>
                <div className="flex items-center space-x-1">
                  {card.changeType === 'increase' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    card.changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {card.change}
                  </span>
                  <span className="text-xs text-text-secondary">vs last month</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity and Department Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="mono-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'hire' ? 'bg-green-100 dark:bg-green-900/30' :
                  activity.type === 'leave' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  activity.type === 'payroll' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  'bg-gray-100 dark:bg-gray-900/30'
                }`}>
                  {activity.type === 'hire' && <UsersIcon className="h-4 w-4 text-green-600 dark:text-green-400" />}
                  {activity.type === 'leave' && <CalendarIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />}
                  {activity.type === 'payroll' && <CurrencyDollarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                  {activity.type === 'attendance' && <ClockIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">{activity.message}</p>
                  <p className="text-xs text-text-secondary">{activity.timestamp} • {activity.user}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <button className="mono-button ghost w-full">
              View All Activity
            </button>
          </div>
        </div>

        <div className="mono-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Department Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BuildingOfficeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Engineering</p>
                  <p className="text-xs text-text-secondary">45 employees</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">92%</p>
                <p className="text-xs text-text-secondary">Attendance</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <BuildingOfficeIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Marketing</p>
                  <p className="text-xs text-text-secondary">23 employees</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">96%</p>
                <p className="text-xs text-text-secondary">Attendance</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <BuildingOfficeIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Sales</p>
                  <p className="text-xs text-text-secondary">31 employees</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">94%</p>
                <p className="text-xs text-text-secondary">Attendance</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <button className="mono-button ghost w-full">
              View All Departments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
