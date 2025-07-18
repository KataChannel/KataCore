'use client';

import React, { useState } from 'react';
import { 
  UsersIcon, 
  PlusIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  MapPinIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { CommunityPost } from '@/types/information-hub';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface CommunityCenterProps {
  className?: string;
}

const mockPosts: CommunityPost[] = [
  {
    id: '1',
    title: 'Tips & Tricks sử dụng CRM hiệu quả',
    content: 'Chia sẻ một số mẹo nhỏ giúp tăng hiệu suất làm việc với module CRM. Từ cách tổ chức khách hàng đến tự động hóa quy trình...',
    authorId: 'user1',
    authorName: 'Nguyễn Văn A',
    category: 'Tips & Tricks',
    tags: ['crm', 'productivity', 'tips'],
    likes: 15,
    comments: [],
    isPublished: true,
    isPinned: true,
    createdAt: new Date('2024-12-18T10:30:00'),
    updatedAt: new Date('2024-12-18T10:30:00'),
    viewCount: 89
  },
  {
    id: '2',
    title: 'Thảo luận: Cải thiện quy trình onboarding nhân viên mới',
    content: 'Mình muốn mở một cuộc thảo luận về cách cải thiện quy trình đào tạo và hướng dẫn nhân viên mới. Các bạn có ý tưởng gì không?',
    authorId: 'user2',
    authorName: 'Trần Thị B',
    category: 'Thảo luận',
    tags: ['onboarding', 'training', 'discussion'],
    likes: 8,
    comments: [],
    isPublished: true,
    isPinned: false,
    createdAt: new Date('2024-12-17T14:15:00'),
    updatedAt: new Date('2024-12-17T14:15:00'),
    viewCount: 67
  },
  {
    id: '3',
    title: 'Chia sẻ template báo cáo Sales hàng tuần',
    content: 'Mình đã tạo một template báo cáo Sales khá hay, ai cần thì comment nhé. Template này giúp tiết kiệm thời gian và có đầy đủ các metrics quan trọng.',
    authorId: 'user3',
    authorName: 'Lê Văn C',
    category: 'Chia sẻ',
    tags: ['sales', 'template', 'reports', 'sharing'],
    likes: 23,
    comments: [],
    isPublished: true,
    isPinned: false,
    createdAt: new Date('2024-12-16T09:45:00'),
    updatedAt: new Date('2024-12-16T09:45:00'),
    viewCount: 134
  }
];

const categories = [
  { id: 'all', name: 'Tất cả', count: mockPosts.length },
  { id: 'tips', name: 'Tips & Tricks', count: 1 },
  { id: 'discussion', name: 'Thảo luận', count: 1 },
  { id: 'sharing', name: 'Chia sẻ', count: 1 },
  { id: 'question', name: 'Hỏi đáp', count: 0 },
  { id: 'announcement', name: 'Thông báo', count: 0 }
];

export function CommunityCenter({ className }: CommunityCenterProps) {
  const [posts] = useState<CommunityPost[]>(mockPosts);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || 
      post.category.toLowerCase().includes(selectedCategory);
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cộng đồng nội bộ</h1>
          <p className="text-gray-600 mt-1">
            Diễn đàn thảo luận và chia sẻ kinh nghiệm làm việc
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Tạo bài viết mới
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Danh mục</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                      selectedCategory === category.id 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                        : 'text-gray-700'
                    }`}
                  >
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <Input
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Posts */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {post.title}
                            </h3>
                            {post.isPinned && (
                              <MapPinIcon className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <UserIcon className="h-3 w-3" />
                              {post.authorName}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {formatDate(post.createdAt)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {post.category}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {post.content}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                          <HeartIcon className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                          <ChatBubbleLeftIcon className="h-4 w-4" />
                          <span>{post.comments.length} bình luận</span>
                        </button>
                        <span className="flex items-center gap-1">
                          <EyeIcon className="h-4 w-4" />
                          <span>{post.viewCount} lượt xem</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có bài viết nào
                </h3>
                <p className="text-gray-500">
                  Hãy là người đầu tiên chia sẻ kinh nghiệm với cộng đồng
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
