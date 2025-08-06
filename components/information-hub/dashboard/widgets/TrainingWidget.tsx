'use client';

import React from 'react';
import { 
  AcademicCapIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { DashboardWidget } from '@/types/information-hub';

interface TrainingWidgetProps {
  widget: DashboardWidget;
  isEditMode: boolean;
  onUpdate: (updates: Partial<DashboardWidget>) => void;
}

export function TrainingWidget({ widget, isEditMode, onUpdate }: TrainingWidgetProps) {
  const trainingData = {
    activeCourses: 3,
    completedCourses: 12,
    totalHours: 48,
    currentCourses: [
      {
        id: 1,
        title: 'React Advanced Patterns',
        progress: 75,
        nextLesson: 'Context API Deep Dive',
        dueDate: '2025-07-25'
      },
      {
        id: 2,
        title: 'Project Management Fundamentals',
        progress: 45,
        nextLesson: 'Risk Management',
        dueDate: '2025-07-30'
      },
      {
        id: 3,
        title: 'Digital Marketing Strategy',
        progress: 20,
        nextLesson: 'SEO Basics',
        dueDate: '2025-08-05'
      }
    ],
    upcomingDeadlines: [
      {
        course: 'React Advanced Patterns',
        deadline: '3 ngày',
        type: 'assignment'
      },
      {
        course: 'Project Management',
        deadline: '1 tuần',
        type: 'quiz'
      }
    ]
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 h-full ${isEditMode ? 'border-2 border-dashed border-blue-300' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <AcademicCapIcon className="h-5 w-5 text-purple-600 mr-2" />
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
          <div className="text-2xl font-bold text-purple-600">{trainingData.activeCourses}</div>
          <div className="text-xs text-gray-500">Đang học</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{trainingData.completedCourses}</div>
          <div className="text-xs text-gray-500">Hoàn thành</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{trainingData.totalHours}h</div>
          <div className="text-xs text-gray-500">Tổng thời gian</div>
        </div>
      </div>

      {/* Current Courses */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Khóa học hiện tại</h4>
        <div className="space-y-3">
          {trainingData.currentCourses.map((course) => (
            <div key={course.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-gray-900 truncate">{course.title}</h5>
                <span className="text-xs text-purple-600 font-medium">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mb-1">Bài tiếp theo: {course.nextLesson}</p>
              <p className="text-xs text-gray-500">Hạn: {course.dueDate}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Hạn sắp tới</h4>
        <div className="space-y-2">
          {trainingData.upcomingDeadlines.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 text-orange-500 mr-2" />
                <span className="text-sm text-gray-900">{item.course}</span>
              </div>
              <span className="text-xs text-orange-600 font-medium">{item.deadline}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-gray-200">
        <button className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <BookOpenIcon className="h-4 w-4 mr-2 inline" />
          Xem tất cả khóa học
        </button>
      </div>
    </div>
  );
}