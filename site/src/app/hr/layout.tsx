'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ReactNode } from 'react';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon,
  UsersIcon,
  Cog6ToothIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

interface HRLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/hr', icon: HomeIcon },
  { name: 'Employees', href: '/hr/employees', icon: UsersIcon },
  { name: 'Departments', href: '/hr/departments', icon: BuildingOfficeIcon },
  { name: 'Positions', href: '/hr/positions', icon: UserGroupIcon },
  { name: 'Attendance', href: '/hr/attendance', icon: ClockIcon },
  { name: 'Leave Requests', href: '/hr/leave-requests', icon: CalendarIcon },
  { name: 'Payroll', href: '/hr/payroll', icon: CurrencyDollarIcon },
  { name: 'Performance', href: '/hr/performance', icon: ChartBarIcon },
  { name: 'Reports', href: '/hr/reports', icon: DocumentTextIcon },
  { name: 'Settings', href: '/hr/settings', icon: Cog6ToothIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function HRLayout({ children }: HRLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="flex w-64 flex-col">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xl font-semibold text-gray-900">HR Manager</p>
                </div>
              </div>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const current = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      current
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-3 py-2 text-sm font-medium border-l-4 hover:bg-gray-50'
                    )}
                  >
                    <item.icon
                      className={classNames(
                        current ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
                        'mr-3 flex-shrink-0 h-6 w-6'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
