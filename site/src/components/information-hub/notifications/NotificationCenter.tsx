'use client';

import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'task' | 'training' | 'community' | 'ticket';
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  actionUrl?: string;
  metadata?: {
    taskId?: string;
    courseId?: string;
    ticketId?: string;
    userId?: string;
  };
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Nhiệm vụ mới được giao',
        message: 'Bạn có một nhiệm vụ mới: "Hoàn thành báo cáo Q3 2025"',
        type: 'info',
        category: 'task',
        isRead: false,
        priority: 'high',
        createdAt: '2025-07-19T10:30:00Z',
        actionUrl: '/tasks/123',
        metadata: { taskId: '123' }
      },
      {
        id: '2',
        title: 'Khóa học sắp hết hạn',
        message: 'Khóa học "React Advanced Patterns" sẽ hết hạn trong 3 ngày',
        type: 'warning',
        category: 'training',
        isRead: false,
        priority: 'medium',
        createdAt: '2025-07-19T09:15:00Z',
        actionUrl: '/training/react-advanced',
        metadata: { courseId: 'react-advanced' }
      },
      {
        id: '3',
        title: 'Cập nhật hệ thống',
        message: 'Hệ thống sẽ được bảo trì vào 22:00 - 24:00 hôm nay',
        type: 'info',
        category: 'system',
        isRead: true,
        priority: 'low',
        createdAt: '2025-07-19T08:00:00Z'
      },
      {
        id: '4',
        title: 'Ticket được giải quyết',
        message: 'Ticket #TK-001 "Lỗi đăng nhập" đã được giải quyết thành công',
        type: 'success',
        category: 'ticket',
        isRead: false,
        priority: 'low',
        createdAt: '2025-07-19T07:45:00Z',
        actionUrl: '/tickets/TK-001',
        metadata: { ticketId: 'TK-001' }
      },
      {
        id: '5',
        title: 'Thảo luận mới trong cộng đồng',
        message: 'Có 5 bình luận mới trong chủ đề "Chiến lược Marketing Q3"',
        type: 'info',
        category: 'community',
        isRead: true,
        priority: 'low',
        createdAt: '2025-07-19T06:30:00Z',
        actionUrl: '/community/marketing-q3'
      },
      {
        id: '6',
        title: 'Lỗi đồng bộ dữ liệu',
        message: 'Có lỗi xảy ra khi đồng bộ dữ liệu với server chính',
        type: 'error',
        category: 'system',
        isRead: false,
        priority: 'high',
        createdAt: '2025-07-19T05:20:00Z'
      }
    ];

    setTimeout(() => {
      setNotifications(mockNotifications);
      setFilteredNotifications(mockNotifications);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter notifications
  useEffect(() => {
    let filtered = notifications;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }

    // Filter by read status
    if (showUnreadOnly) {
      filtered = filtered.filter(n => !n.isRead);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, selectedCategory, showUnreadOnly, searchQuery]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'error':
        return 'border-l-red-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Cao</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Trung bình</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Thấp</span>;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    return `${Math.floor(diffInHours / 24)} ngày trước`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <BellIcon className="h-6 w-6 text-gray-600 mr-2" />
            <span className="text-lg font-semibold text-gray-900">
              Trung tâm thông báo
            </span>
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            <CheckIcon className="h-4 w-4 mr-2 inline" />
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm thông báo..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Category Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              <option value="system">Hệ thống</option>
              <option value="task">Nhiệm vụ</option>
              <option value="training">Đào tạo</option>
              <option value="community">Cộng đồng</option>
              <option value="ticket">Ticket</option>
            </select>

            {/* Unread Filter */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Chỉ chưa đọc</span>
            </label>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có thông báo</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || selectedCategory !== 'all' || showUnreadOnly
                ? 'Không tìm thấy thông báo phù hợp với bộ lọc.'
                : 'Bạn không có thông báo nào mới.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow border-l-4 ${getNotificationBorderColor(notification.type)} ${
                !notification.isRead ? 'bg-blue-50' : ''
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {getPriorityBadge(notification.priority)}
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        <div className="flex items-center space-x-2">
                          {notification.actionUrl && (
                            <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                              Xem chi tiết
                            </button>
                          )}
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {filteredNotifications.length > 0 && (
        <div className="text-center">
          <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Tải thêm thông báo
          </button>
        </div>
      )}
    </div>
  );
}