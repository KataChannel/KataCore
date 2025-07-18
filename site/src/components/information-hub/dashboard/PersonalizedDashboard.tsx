'use client';

import React, { useState } from 'react';
import { 
  PlusIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useInformationHub } from '@/providers/InformationHubProvider';
import { DashboardWidget } from '@/types/information-hub';
import { NotificationWidget } from './widgets/NotificationWidget';
import { TaskWidget } from './widgets/TaskWidget';
import { AnalyticsWidget } from './widgets/AnalyticsWidget';
import { CommunityWidget } from './widgets/CommunityWidget';
import { TrainingWidget } from './widgets/TrainingWidget';
import { TicketWidget } from './widgets/TicketWidget';


interface DashboardGridProps {
  widgets: DashboardWidget[];
  isEditMode: boolean;
  onWidgetUpdate: (id: string, updates: Partial<DashboardWidget>) => void;
}

function DashboardGrid({ widgets, isEditMode, onWidgetUpdate }: DashboardGridProps) {
  const renderWidget = (widget: DashboardWidget) => {
    const commonProps = {
      widget,
      isEditMode,
      onUpdate: (updates: Partial<DashboardWidget>) => onWidgetUpdate(widget.id, updates),
    };

    switch (widget.type) {
      case 'notifications':
        return <NotificationWidget {...commonProps} />;
      case 'tasks':
        return <TaskWidget {...commonProps} />;
      case 'analytics':
        return <AnalyticsWidget {...commonProps} />;
      case 'community':
        return <CommunityWidget {...commonProps} />;
      case 'training':
        return <TrainingWidget {...commonProps} />;
      case 'tickets':
        return <TicketWidget {...commonProps} />;
      default:
        return <div className="p-4 bg-gray-100 rounded-lg">Unknown widget type</div>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {widgets
        .filter(widget => widget.isVisible)
        .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x)
        .map((widget) => (
          <div
            key={widget.id}
            className={`
              ${widget.position.w === 2 ? 'md:col-span-2' : ''}
              ${widget.position.h === 2 ? 'row-span-2' : ''}
              transition-all duration-200
              ${isEditMode ? 'ring-2 ring-blue-200 ring-dashed' : ''}
            `}
          >
            {renderWidget(widget)}
          </div>
        ))}
    </div>
  );
}

export function InformationHubDashboard() {
  const { widgets, updateWidget, isLoading } = useInformationHub();
  const [isEditMode, setIsEditMode] = useState(false);

  const handleWidgetUpdate = async (id: string, updates: Partial<DashboardWidget>) => {
    await updateWidget(id, updates);
  };

  const toggleWidgetVisibility = async (id: string) => {
    const widget = widgets.find(w => w.id === id);
    if (widget) {
      await handleWidgetUpdate(id, { isVisible: !widget.isVisible });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Dashboard của tôi</h2>
          <p className="text-sm text-gray-600 mt-1">
            Tùy chỉnh bảng điều khiển theo nhu cầu của bạn
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isEditMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Cog6ToothIcon className="h-4 w-4 mr-2 inline" />
            {isEditMode ? 'Hoàn thành' : 'Chỉnh sửa'}
          </button>
        </div>
      </div>

      {/* Widget Management Panel (shown in edit mode) */}
      {isEditMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-3">Quản lý Widget</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {widgets.map((widget) => (
              <button
                key={widget.id}
                onClick={() => toggleWidgetVisibility(widget.id)}
                className={`flex items-center p-2 rounded-md text-xs transition-colors ${
                  widget.isVisible
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                {widget.isVisible ? (
                  <EyeIcon className="h-3 w-3 mr-1" />
                ) : (
                  <EyeSlashIcon className="h-3 w-3 mr-1" />
                )}
                {widget.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <DashboardGrid
        widgets={widgets}
        isEditMode={isEditMode}
        onWidgetUpdate={handleWidgetUpdate}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Thông báo chưa đọc</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="bg-blue-400 rounded-full p-3">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Tác vụ hoàn thành</p>
              <p className="text-2xl font-bold">8/15</p>
            </div>
            <div className="bg-green-400 rounded-full p-3">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Khóa học đang học</p>
              <p className="text-2xl font-bold">3</p>
            </div>
            <div className="bg-purple-400 rounded-full p-3">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Ticket đang mở</p>
              <p className="text-2xl font-bold">2</p>
            </div>
            <div className="bg-orange-400 rounded-full p-3">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
