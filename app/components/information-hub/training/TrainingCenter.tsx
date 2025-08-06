'use client';

import React, { useState } from 'react';
import { 
  AcademicCapIcon, 
  PlayIcon,
  BookOpenIcon,
  ClockIcon,
  UsersIcon,
  StarIcon,
  CheckCircleIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { TrainingCourse } from '@/types/information-hub';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TrainingCenterProps {
  className?: string;
}

const mockCourses: TrainingCourse[] = [
  {
    id: '1',
    title: 'Khóa học Quản lý Khách hàng CRM',
    description: 'Học cách sử dụng hiệu quả các tính năng CRM để quản lý khách hàng và tăng doanh số.',
    modules: [],
    duration: 180,
    difficulty: 'beginner',
    category: 'CRM',
    isPublished: true,
    prerequisite: [],
    certificate: true,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
    enrollmentCount: 45,
    rating: 4.7
  },
  {
    id: '2',
    title: 'Analytics và Báo cáo nâng cao',
    description: 'Khóa học chuyên sâu về phân tích dữ liệu và tạo báo cáo chi tiết.',
    modules: [],
    duration: 240,
    difficulty: 'intermediate',
    category: 'Analytics',
    isPublished: true,
    prerequisite: ['Khóa học CRM cơ bản'],
    certificate: true,
    createdAt: new Date('2024-11-25'),
    updatedAt: new Date('2024-11-25'),
    enrollmentCount: 32,
    rating: 4.9
  }
];

export function TrainingCenter({ className }: TrainingCenterProps) {
  const [courses] = useState<TrainingCourse[]>(mockCourses);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Đào tạo</h1>
          <p className="text-gray-600 mt-1">
            Khóa học trực tuyến và chứng nhận chuyên nghiệp
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                </div>
                {course.certificate && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <TrophyIcon className="h-3 w-3 mr-1" />
                    Chứng nhận
                  </Badge>
                )}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {course.title}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {course.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  {course.duration} phút
                </span>
                <span className="flex items-center gap-1">
                  <UsersIcon className="h-4 w-4" />
                  {course.enrollmentCount} học viên
                </span>
                <div className="flex items-center gap-1">
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>{course.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">
                  {course.difficulty === 'beginner' && 'Cơ bản'}
                  {course.difficulty === 'intermediate' && 'Trung cấp'}
                  {course.difficulty === 'advanced' && 'Nâng cao'}
                </Badge>
                <Badge variant="secondary">{course.category}</Badge>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Button className="w-full flex items-center gap-2">
                  <PlayIcon className="h-4 w-4" />
                  Bắt đầu học
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
