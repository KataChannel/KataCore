'use client';

import React, { useState } from 'react';
import { 
  CheckIcon, 
  PlusIcon,
  ClockIcon,
  UserIcon,
  FlagIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Task } from '@/types/information-hub';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface TasksCenterProps {
  className?: string;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Cập nhật tài liệu hướng dẫn CRM',
    description: 'Cần cập nhật các tài liệu hướng dẫn cho phiên bản CRM mới',
    status: 'in-progress',
    priority: 'high',
    assignedTo: ['john.doe@company.com'],
    createdBy: 'manager@company.com',
    dueDate: new Date('2024-12-25'),
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-19'),
    labels: ['documentation', 'crm'],
    project: 'Information Hub',
    estimatedHours: 8,
    actualHours: 5
  },
  {
    id: '2',
    title: 'Tạo video hướng dẫn Call Center',
    description: 'Quay video demo các tính năng chính của module Call Center',
    status: 'todo',
    priority: 'normal',
    assignedTo: ['jane.smith@company.com'],
    createdBy: 'product@company.com',
    dueDate: new Date('2024-12-30'),
    createdAt: new Date('2024-12-18'),
    updatedAt: new Date('2024-12-18'),
    labels: ['video', 'callcenter', 'training'],
    project: 'Training Content',
    estimatedHours: 12,
    actualHours: 0
  }
];

const statusColors = {
  todo: 'bg-gray-100 text-gray-800 border-gray-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  completed: 'bg-green-100 text-green-800 border-green-200'
};

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  normal: 'bg-gray-100 text-gray-800 border-gray-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
};

export function TasksCenter({ className }: TasksCenterProps) {
  const [tasks] = useState<Task[]>(mockTasks);
  const [activeTab, setActiveTab] = useState<'all' | 'my-tasks' | 'assigned'>('all');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const isOverdue = (dueDate: Date | undefined) => {
    if (!dueDate) return false;
    return new Date() > dueDate;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Tác vụ</h1>
          <p className="text-gray-600 mt-1">
            Tạo, theo dõi và quản lý tác vụ nội bộ
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Tạo tác vụ mới
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tất cả tác vụ
          </button>
          <button
            onClick={() => setActiveTab('my-tasks')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-tasks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tác vụ của tôi
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assigned'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tác vụ đã giao
          </button>
        </nav>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {task.title}
                    </h3>
                    {isOverdue(task.dueDate) && task.status !== 'completed' && (
                      <Badge variant="destructive" className="text-xs">
                        Quá hạn
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">
                    {task.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusColors[task.status]}>
                    {task.status === 'todo' && 'Chờ làm'}
                    {task.status === 'in-progress' && 'Đang làm'}
                    {task.status === 'review' && 'Đang review'}
                    {task.status === 'completed' && 'Hoàn thành'}
                  </Badge>
                  <Badge variant="outline" className={priorityColors[task.priority]}>
                    {task.priority === 'low' && 'Thấp'}
                    {task.priority === 'normal' && 'Bình thường'}
                    {task.priority === 'high' && 'Cao'}
                    {task.priority === 'urgent' && 'Khẩn cấp'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <UserIcon className="h-4 w-4" />
                  {task.assignedTo.join(', ')}
                </span>
                {task.dueDate && (
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    Hạn: {formatDate(task.dueDate)}
                  </span>
                )}
                {task.estimatedHours && (
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    {task.actualHours || 0}/{task.estimatedHours}h
                  </span>
                )}
                {task.project && (
                  <span className="flex items-center gap-1">
                    <FlagIcon className="h-4 w-4" />
                    {task.project}
                  </span>
                )}
              </div>

              {task.labels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {task.labels.map(label => (
                    <Badge key={label} variant="secondary" className="text-xs">
                      #{label}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
