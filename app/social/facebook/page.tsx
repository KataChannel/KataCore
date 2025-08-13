'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  MessageCircle, 
  RefreshCw, 
  Database, 
  Facebook, 
  Clock,
  Users,
  BarChart3,
  Settings,
  Zap
} from 'lucide-react';
import FacebookSyncManager from './components/FacebookSyncManager';

interface FacebookData {
  comments: any[];
  messages: any[];
  posts: any[];
  pages: any[];
  lastSync: string | null;
  totalCount: {
    comments: number;
    messages: number;
    posts: number;
    pages: number;
  };
}

type TabType = 'comments' | 'messages' | 'posts' | 'pages' | 'sync';

export default function FacebookSocialPage() {
  const [data, setData] = useState<FacebookData>({
    comments: [],
    messages: [],
    posts: [],
    pages: [],
    lastSync: null,
    totalCount: { comments: 0, messages: 0, posts: 0, pages: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('comments');
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [syncProgress, setSyncProgress] = useState<{ step: string; progress: number }>({ step: '', progress: 0 });

  useEffect(() => {
    loadDataFromDatabase();
  }, []);

  const loadDataFromDatabase = async () => {
    try {
      setLoading(true);
      setError('');

      // Load data from database (prioritized over API)
      const [commentsRes, messagesRes, postsRes, pagesRes] = await Promise.all([
        fetch('/api/social/facebook/database?type=comments'),
        fetch('/api/social/facebook/database?type=messages'),
        fetch('/api/social/facebook/database?type=posts'),
        fetch('/api/social/facebook/database?type=pages')
      ]);

      const [comments, messages, posts, pages] = await Promise.all([
        commentsRes.json(),
        messagesRes.json(),
        postsRes.json(),
        pagesRes.json()
      ]);

      // Get last sync time
      const syncRes = await fetch('/api/social/facebook/sync/status');
      const syncData = await syncRes.json();

      setData({
        comments: comments.data || [],
        messages: messages.data || [],
        posts: posts.data || [],
        pages: pages.data || [],
        lastSync: syncData.lastSync,
        totalCount: {
          comments: comments.total || 0,
          messages: messages.total || 0,
          posts: posts.total || 0,
          pages: pages.total || 0
        }
      });

      // Set first available page as selected
      if (pages.data?.length > 0 && !selectedPage) {
        setSelectedPage(pages.data[0].facebookPageId);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Lỗi tải dữ liệu từ database. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const syncWithFacebook = async (type: 'full' | 'comments' | 'messages' | 'posts' | 'pages' = 'full') => {
    try {
      setSyncing(true);
      setError('');
      setSyncProgress({ step: 'Bắt đầu đồng bộ...', progress: 0 });

      const syncSteps = type === 'full' 
        ? ['pages', 'posts', 'comments', 'messages']
        : [type];

      for (let i = 0; i < syncSteps.length; i++) {
        const step = syncSteps[i];
        setSyncProgress({ 
          step: `Đồng bộ ${step}...`, 
          progress: (i / syncSteps.length) * 100 
        });

        const response = await fetch('/api/social/facebook/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: step,
            pageId: selectedPage 
          })
        });

        if (!response.ok) {
          throw new Error(`Lỗi đồng bộ ${step}`);
        }

        const result = await response.json();
        console.log(`Synced ${step}:`, result);
      }

      setSyncProgress({ step: 'Hoàn thành!', progress: 100 });

      // Reload data after sync
      setTimeout(() => {
        loadDataFromDatabase();
        setSyncProgress({ step: '', progress: 0 });
      }, 1000);

    } catch (error) {
      console.error('Sync error:', error);
      setError(`Lỗi đồng bộ: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getTabData = () => {
    switch (activeTab) {
      case 'comments':
        return data.comments;
      case 'messages':
        return data.messages;
      case 'posts':
        return data.posts;
      case 'pages':
        return data.pages;
      case 'sync':
        return []; // Sync tab doesn't have data array
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu từ database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Facebook className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Facebook Social Integration
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Quản lý dữ liệu Facebook từ database với tính năng đồng bộ
              </p>
            </div>
          </div>
          
          {/* Sync Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => syncWithFacebook('full')}
              disabled={syncing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Đang đồng bộ...' : 'Đồng bộ Facebook'}
            </button>
            
            <button
              onClick={loadDataFromDatabase}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Database className="h-4 w-4 mr-2" />
              Tải lại từ DB
            </button>
          </div>
        </div>

        {/* Sync Progress */}
        {syncing && syncProgress.step && (
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {syncProgress.step}
              </span>
              <span className="text-sm text-blue-600 dark:text-blue-400">
                {Math.round(syncProgress.progress)}%
              </span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${syncProgress.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <MessageCircle className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Comments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.totalCount.comments.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Messages</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.totalCount.messages.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.totalCount.posts.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pages</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.totalCount.pages.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Last Sync Info */}
      {data.lastSync && (
        <div className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-2" />
            Lần đồng bộ cuối: {formatDate(data.lastSync)}
          </div>
        </div>
      )}

      {/* Page Selector */}
      {data.pages.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Chọn Facebook Page:
          </label>
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Tất cả pages</option>
            {data.pages.map((page) => (
              <option key={page.facebookPageId} value={page.facebookPageId}>
                {page.name} ({page.fanCount?.toLocaleString()} fans)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'comments', label: 'Comments', icon: MessageCircle },
              { key: 'messages', label: 'Messages', icon: MessageSquare },
              { key: 'posts', label: 'Posts', icon: BarChart3 },
              { key: 'pages', label: 'Pages', icon: Users },
              { key: 'sync', label: 'Sync Manager', icon: Zap }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {key !== 'sync' && (
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                    {data.totalCount[key as keyof typeof data.totalCount]}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {(() => {
            if (activeTab === 'sync') {
              return <FacebookSyncManager />;
            }
            
            const tabData = getTabData();
            if (tabData.length === 0) {
              return (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📱</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Chưa có dữ liệu {activeTab}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Nhấn "Đồng bộ Facebook" để lấy dữ liệu từ Facebook API
                  </p>
                  <button
                    onClick={() => {
                      syncWithFacebook(activeTab as any);
                    }}
                    disabled={syncing}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                    Đồng bộ {activeTab}
                  </button>
                </div>
              );
            }
            
            return (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {tabData.slice(0, 50).map((item: any, index: number) => (
                <div key={item.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  {activeTab === 'comments' && (
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {item.fromName || 'Unknown User'}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">{item.message}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {item.createdTime ? formatDate(item.createdTime) : 'N/A'}
                        </span>
                      </div>
                      {item.likesCount > 0 && (
                        <div className="mt-2 text-sm text-blue-600">
                          👍 {item.likesCount} likes
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'messages' && (
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {item.fromName || 'Unknown User'}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">{item.message || 'No message content'}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {item.createdTime ? formatDate(item.createdTime) : 'N/A'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center space-x-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${item.isRead ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.isRead ? 'Đã đọc' : 'Chưa đọc'}
                        </span>
                        <span className="text-gray-500">Type: {item.messageType}</span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'posts' && (
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-600 dark:text-gray-400">{item.message || item.story || 'No content'}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {item.createdTime ? formatDate(item.createdTime) : 'N/A'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>👍 {item.likesCount || 0}</span>
                        <span>💬 {item.commentsCount || 0}</span>
                        <span>🔄 {item.sharesCount || 0}</span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'pages' && (
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">{item.about || item.category}</p>
                          {item.phone && (
                            <p className="text-sm text-gray-500 mt-1">📞 {item.phone}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            👥 {(item.fanCount || 0).toLocaleString()} fans
                          </div>
                          <div className="text-sm text-gray-500">
                            👥 {(item.followersCount || 0).toLocaleString()} followers
                          </div>
                        </div>
                      </div>
                      {item.link && (
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Xem trang Facebook →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {getTabData().length > 50 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Hiển thị 50/{getTabData().length} mục đầu tiên. Sử dụng API để xem tất cả.
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
