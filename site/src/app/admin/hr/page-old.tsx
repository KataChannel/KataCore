'use client';

import { useState, useEffect } from 'react';
import {
  UsersIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
  CheckCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
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
}

interface QuickAction {
  name: string;
  description: string;
  icon: React.ForwardRefExoticComponent<any>;
  color: string;
  href?: string;
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
    user: 'HR Team',
  },
  {
    id: '2',
    type: 'leave',
    message: "Jane Smith's leave request approved",
    timestamp: '4 hours ago',
    user: 'Manager',
  },
  {
    id: '3',
    type: 'payroll',
    message: 'Monthly payroll processed',
    timestamp: '1 day ago',
    user: 'Finance',
  },
  {
    id: '4',
    type: 'attendance',
    message: 'Daily attendance report generated',
    timestamp: '1 day ago',
    user: 'System',
  },
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
    const getDarkModeFromStorage = () => {
      try {
        const savedDarkMode = localStorage.getItem('admin-theme');
        return savedDarkMode === 'dark';
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
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    try {
      localStorage.setItem('admin-theme', newDarkMode ? 'dark' : 'light');
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
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
      value: stats.totalEmployees.toLocaleString(),
      change: '+12%',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'blue',
    },
    {
      name: 'Active Employees',
      value: stats.activeEmployees.toLocaleString(),
      change: '+2%',
      changeType: 'increase',
      icon: UserGroupIcon,
      color: 'green',
    },
    {
      name: 'Departments',
      value: stats.totalDepartments.toString(),
      change: 'No change',
      changeType: 'increase',
      icon: BuildingOfficeIcon,
      color: 'purple',
    },
    {
      name: 'Pending Leaves',
      value: stats.pendingLeaves.toString(),
      change: '-3%',
      changeType: 'decrease',
      icon: CalendarIcon,
      color: 'orange',
    },
    {
      name: 'Today Attendance',
      value: `${stats.todayAttendance}%`,
      change: '+5%',
      changeType: 'increase',
      icon: ClockIcon,
      color: 'teal',
    },
    {
      name: 'Monthly Payroll',
      value: `$${stats.monthlyPayroll.toLocaleString()}`,
      change: '+8%',
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      color: 'indigo',
    },
    {
      name: 'New Hires',
      value: stats.newHires.toString(),
      change: '+25%',
      changeType: 'increase',
      icon: BriefcaseIcon,
      color: 'pink',
    },
    {
      name: 'Average Salary',
      value: `$${stats.averageSalary.toLocaleString()}`,
      change: '+3%',
      changeType: 'increase',
      icon: ArrowTrendingUpIcon,
      color: 'cyan',
    },
  ];

  const quickActions: QuickAction[] = [
    {
      name: 'Add Employee',
      description: 'Register a new employee',
      icon: PlusIcon,
      color: 'blue',
      href: '/admin/hr/employees/new',
    },
    {
      name: 'Review Applications',
      description: 'Check pending applications',
      icon: EyeIcon,
      color: 'green',
      href: '/admin/hr/applications',
    },
    {
      name: 'Leave Requests',
      description: 'Approve or reject leaves',
      icon: CheckCircleIcon,
      color: 'orange',
      href: '/admin/hr/leave-requests',
    },
    {
      name: 'Generate Reports',
      description: 'Create HR reports',
      icon: DocumentTextIcon,
      color: 'purple',
      href: '/admin/hr/reports',
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
      {/* Header */}
      <div className="mono-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              HR Dashboard
            </h1>
            <p className="text-text-secondary">
              Welcome back! Here's what's happening with your organization.
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={toggleDarkMode}
              className="mono-button secondary"
              title="Toggle theme"
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5 mr-2" />
              ) : (
                <MoonIcon className="h-5 w-5 mr-2" />
              )}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(card => (
          <div
            key={card.name}
            className="mono-card p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-secondary mb-1">
                  {card.name}
                </p>
                <p className="text-2xl font-bold text-primary">{card.value}</p>
              </div>
              <div className="p-3 bg-mono-100 rounded-lg">
                <card.icon className="h-6 w-6 text-text-secondary" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {card.changeType === 'increase' ? (
                <ArrowUpIcon className="h-4 w-4 text-success mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-error mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  card.changeType === 'increase' ? 'text-success' : 'text-error'
                }`}
              >
                {card.change}
              </span>
              <span className="text-sm text-text-secondary ml-2">
                from last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="mono-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            {quickActions.map(action => (
              <button
                key={action.name}
                className="w-full flex items-center p-3 rounded-lg hover:bg-hover transition-colors text-left"
                onClick={() =>
                  action.href && window.open(action.href, '_blank')
                }
              >
                <div className="p-2 bg-mono-100 rounded-lg mr-3">
                  <action.icon className="h-5 w-5 text-text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-primary">{action.name}</p>
                  <p className="text-sm text-text-secondary">
                    {action.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="mono-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Recent Activities
          </h3>
          <div className="space-y-3">
            {activities.map(activity => (
              <div
                key={activity.id}
                className="flex items-start p-3 rounded-lg bg-mono-50"
              >
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                    {activity.type === 'hire' && (
                      <UsersIcon className="h-4 w-4 text-accent" />
                    )}
                    {activity.type === 'leave' && (
                      <CalendarIcon className="h-4 w-4 text-accent" />
                    )}
                    {activity.type === 'payroll' && (
                      <CurrencyDollarIcon className="h-4 w-4 text-accent" />
                    )}
                    {activity.type === 'attendance' && (
                      <ClockIcon className="h-4 w-4 text-accent" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">
                    {activity.message}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {activity.timestamp} • by {activity.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Growth Chart */}
        <div className="mono-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Employee Growth
          </h3>
          <div className="h-64 rounded-lg bg-mono-50 flex items-center justify-center">
            <div className="text-center">
              <ChartPieIcon className="h-12 w-12 text-text-secondary mx-auto mb-2" />
              <p className="text-text-secondary">
                Chart placeholder - Employee growth over time
              </p>
            </div>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="mono-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Department Distribution
          </h3>
          <div className="h-64 rounded-lg bg-mono-50 flex items-center justify-center">
            <div className="text-center">
              <BuildingOfficeIcon className="h-12 w-12 text-text-secondary mx-auto mb-2" />
              <p className="text-text-secondary">
                Chart placeholder - Employees by department
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
