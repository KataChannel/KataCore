'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpenIcon, 
  MagnifyingGlassIcon,
  PlayIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  CommandLineIcon,
  ClockIcon,
  EyeIcon,
  StarIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { UserGuide } from '@/types/information-hub';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserGuidesCenterProps {
  className?: string;
}

const mockGuides: UserGuide[] = [
  {
    id: '1',
    title: 'Hướng dẫn sử dụng Dashboard Analytics',
    content: 'Hướng dẫn chi tiết cách sử dụng các tính năng trong Dashboard Analytics để xem và phân tích dữ liệu.',
    type: 'text',
    module: 'Analytics',
    category: 'Dashboard',
    difficulty: 'beginner',
    estimatedReadTime: 15,
    isPublished: true,
    tags: ['dashboard', 'analytics', 'beginner', 'data-visualization'],
    createdAt: new Date('2024-12-15T10:00:00'),
    updatedAt: new Date('2024-12-15T10:00:00'),
    viewCount: 156,
    rating: 4.5
  },
  {
    id: '2',
    title: 'Video: Tạo báo cáo Sales nâng cao',
    content: 'Video hướng dẫn từng bước tạo và tùy chỉnh báo cáo Sales với các filter và chart nâng cao.',
    type: 'video',
    module: 'Sales',
    category: 'Reports',
    difficulty: 'intermediate',
    estimatedReadTime: 25,
    isPublished: true,
    tags: ['sales', 'reports', 'video', 'advanced'],
    createdAt: new Date('2024-12-12T14:30:00'),
    updatedAt: new Date('2024-12-12T14:30:00'),
    viewCount: 89,
    rating: 4.8
  },
  {
    id: '3',
    title: 'Tương tác: Cấu hình hệ thống Call Center',
    content: 'Hướng dẫn tương tác step-by-step để cấu hình VoIP, routing cuộc gọi và dashboard real-time.',
    type: 'interactive',
    module: 'Call Center',
    category: 'Configuration',
    difficulty: 'advanced',
    estimatedReadTime: 45,
    isPublished: true,
    tags: ['callcenter', 'voip', 'configuration', 'interactive'],
    createdAt: new Date('2024-12-10T09:15:00'),
    updatedAt: new Date('2024-12-10T09:15:00'),
    viewCount: 67,
    rating: 4.7
  },
  {
    id: '4',
    title: 'Quản lý phân quyền và RBAC',
    content: 'Hướng dẫn cách thiết lập và quản lý hệ thống phân quyền Role-Based Access Control.',
    type: 'text',
    module: 'Security',
    category: 'Permissions',
    difficulty: 'intermediate',
    estimatedReadTime: 20,
    isPublished: true,
    tags: ['security', 'rbac', 'permissions', 'roles'],
    createdAt: new Date('2024-12-08T11:00:00'),
    updatedAt: new Date('2024-12-08T11:00:00'),
    viewCount: 124,
    rating: 4.6
  },
  {
    id: '5',
    title: 'API Integration và Webhooks',
    content: 'Hướng dẫn tích hợp API và thiết lập webhooks cho các module khác nhau.',
    type: 'text',
    module: 'Development',
    category: 'API',
    difficulty: 'advanced',
    estimatedReadTime: 35,
    isPublished: true,
    tags: ['api', 'webhooks', 'integration', 'development'],
    createdAt: new Date('2024-12-05T16:20:00'),
    updatedAt: new Date('2024-12-05T16:20:00'),
    viewCount: 78,
    rating: 4.9
  }
];

const typeIcons = {
  text: DocumentTextIcon,
  video: VideoCameraIcon,
  interactive: CommandLineIcon
};

const typeColors = {
  text: 'bg-blue-100 text-blue-800 border-blue-200',
  video: 'bg-purple-100 text-purple-800 border-purple-200',
  interactive: 'bg-green-100 text-green-800 border-green-200'
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  advanced: 'bg-red-100 text-red-800 border-red-200'
};

export function UserGuidesCenter({ className }: UserGuidesCenterProps) {
  const [guides] = useState<UserGuide[]>(mockGuides);
  const [filteredGuides, setFilteredGuides] = useState<UserGuide[]>(mockGuides);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Get unique modules for filter
  const modules = Array.from(new Set(guides.map(guide => guide.module)));

  // Filter and sort guides
  useEffect(() => {
    let filtered = guides;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(guide => 
        guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Module filter
    if (selectedModule !== 'all') {
      filtered = filtered.filter(guide => guide.module === selectedModule);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(guide => guide.type === selectedType);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(guide => guide.difficulty === selectedDifficulty);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'most-viewed':
        filtered.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'highest-rated':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'shortest':
        filtered.sort((a, b) => a.estimatedReadTime - b.estimatedReadTime);
        break;
      case 'longest':
        filtered.sort((a, b) => b.estimatedReadTime - a.estimatedReadTime);
        break;
    }

    setFilteredGuides(filtered);
  }, [searchTerm, selectedModule, selectedType, selectedDifficulty, sortBy, guides]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarIcon key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hướng dẫn sử dụng</h1>
          <p className="text-gray-600 mt-1">
            Tài liệu, video và hướng dẫn tương tác để sử dụng hệ thống hiệu quả
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {filteredGuides.length} hướng dẫn
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col xl:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
                <Input
                  placeholder="Tìm kiếm hướng dẫn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Module Filter */}
            <div className="w-full xl:w-40">
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {modules.map(module => (
                    <SelectItem key={module} value={module}>{module}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="w-full xl:w-40">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="text">Văn bản</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="interactive">Tương tác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Filter */}
            <div className="w-full xl:w-40">
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="beginner">Cơ bản</SelectItem>
                  <SelectItem value="intermediate">Trung cấp</SelectItem>
                  <SelectItem value="advanced">Nâng cao</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="w-full xl:w-40">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="oldest">Cũ nhất</SelectItem>
                  <SelectItem value="most-viewed">Xem nhiều</SelectItem>
                  <SelectItem value="highest-rated">Đánh giá cao</SelectItem>
                  <SelectItem value="shortest">Ngắn nhất</SelectItem>
                  <SelectItem value="longest">Dài nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGuides.map((guide) => {
          const TypeIcon = typeIcons[guide.type];
          return (
            <Card key={guide.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-lg ${typeColors[guide.type]}`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStarRating(guide.rating)}
                    <span className="text-sm text-gray-600 ml-1">
                      ({guide.rating})
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {guide.title}
                </h3>

                {/* Content Preview */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {guide.content}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <TagIcon className="h-3 w-3" />
                    {guide.module}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {guide.estimatedReadTime} phút
                  </span>
                  <span className="flex items-center gap-1">
                    <EyeIcon className="h-3 w-3" />
                    {guide.viewCount}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className={typeColors[guide.type]}>
                    {guide.type === 'text' && 'Văn bản'}
                    {guide.type === 'video' && 'Video'}
                    {guide.type === 'interactive' && 'Tương tác'}
                  </Badge>
                  <Badge variant="outline" className={difficultyColors[guide.difficulty]}>
                    {guide.difficulty === 'beginner' && 'Cơ bản'}
                    {guide.difficulty === 'intermediate' && 'Trung cấp'}
                    {guide.difficulty === 'advanced' && 'Nâng cao'}
                  </Badge>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {guide.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                  {guide.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{guide.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {formatDate(guide.createdAt)}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {guide.type === 'video' ? (
                      <PlayIcon className="h-3 w-3" />
                    ) : (
                      <BookOpenIcon className="h-3 w-3" />
                    )}
                    {guide.type === 'video' ? 'Xem' : 'Đọc'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredGuides.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy hướng dẫn nào
            </h3>
            <p className="text-gray-500">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
