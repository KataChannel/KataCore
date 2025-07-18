'use client';

import React from 'react';
import { CheckIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { DashboardWidget } from '@/types/information-hub';
import { useInformationHub } from '@/providers/InformationHubProvider';

interface TaskWidgetProps {
  widget: DashboardWidget;
  isEditMode: boolean;
  onUpdate: (updates: Partial<DashboardWidget>) => void;
}

export function TaskWidget({ widget, isEditMode }: TaskWidgetProps) {
  const { tasks } = useInformationHub();
  const myTasks = tasks.slice(0, 5);
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckIcon className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <ClockIcon className="h-4 w-4 text-blue-600" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'in-progress':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'normal':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Tác vụ của tôi</h3>
        </div>
        <div className="text-sm text-gray-500">
          {completedTasks}/{totalTasks}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Tiến độ hoàn thành</span>
          <span>{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%'
            }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {myTasks.length > 0 ? (
          myTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-lg border ${getStatusColor(task.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  {getStatusIcon(task.status)}
                  <div className="ml-2 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {task.title}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-gray-500">
                          {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <CheckIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Không có tác vụ nào</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Xem tất cả tác vụ →
        </button>
      </div>
    </div>
  );
}
