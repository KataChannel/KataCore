'use client';

import React from 'react';
import { 
  UserGroupIcon,
  ChatBubbleLeftEllipsisIcon,
  HeartIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { DashboardWidget } from '@/types/information-hub';

interface CommunityWidgetProps {
  widget: DashboardWidget;
  isEditMode: boolean;
  onUpdate: (updates: Partial<DashboardWidget>) => void;
}

export function CommunityWidget({ widget, isEditMode, onUpdate }: CommunityWidgetProps) {
  const communityData = {
    totalMembers: 1247,
    activeDiscussions: 8,
    newPosts: 23,
    recentActivities: [
      {
        id: 1,
        user: 'Nguyễn Văn A',
        action: 'đã tham gia thảo luận',
        topic: 'Chiến lược marketing Q3',
        time: '5 phút trước'
      },
      {
        id: 2,
        user: 'Trần Thị B',
        action: 'đã chia sẻ bài viết',
        topic: 'Xu hướng công nghệ 2025',
        time: '15 phút trước'
      },
      {
        id: 3,
        user: 'Lê Văn C',
        action: 'đã thích bài viết',
        topic: 'Kinh nghiệm làm việc nhóm',
        time: '30 phút trước'
      }
    ]
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 h-full ${isEditMode ? 'border-2 border-dashed border-blue-300' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <UserGroupIcon className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
        </div>
        {isEditMode && (
          <button
            onClick={() => onUpdate({ isVisible: !widget.isVisible })}
            className="text-gray-400 hover:text-gray-600"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{communityData.totalMembers}</div>
          <div className="text-xs text-gray-500">Thành viên</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{communityData.activeDiscussions}</div>
          <div className="text-xs text-gray-500">Thảo luận</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{communityData.newPosts}</div>
          <div className="text-xs text-gray-500">Bài viết mới</div>
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Hoạt động gần đây</h4>
        <div className="space-y-3">
          {communityData.recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                  <span className="text-blue-600">"{activity.topic}"</span>
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mr-2 inline" />
          Xem tất cả hoạt động
        </button>
      </div>
    </div>
  );
}