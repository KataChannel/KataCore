'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  TrendingUp,
  Target,
  MessageSquare,
  MessageCircle,
  BarChart3,
  RefreshCw,
  Download,
  Filter,
  Search
} from 'lucide-react';

interface UserAnalytics {
  totalProcessed: number;
  phoneExtracted: number;
  emailExtracted: number;
  ageExtracted: number;
  locationExtracted: number;
  interestsExtracted: number;
  averageConfidence: number;
  topInterests: { interest: string; count: number }[];
  topLocations: { location: string; count: number }[];
  ageDistribution: Record<string, number>;
  recentExtractions: any[];
}

interface UserSummary {
  totalUniqueUsers: number;
  users: any[];
  topUsers: any[];
}

export default function FacebookUserAnalytics() {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'test'>('analytics');
  const [testText, setTestText] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
    loadPages();
  }, [selectedPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [analyticsRes, summaryRes] = await Promise.all([
        fetch(`/api/social/facebook/users?type=analytics${selectedPage ? `&pageId=${selectedPage}` : ''}`),
        fetch(`/api/social/facebook/users?type=summary${selectedPage ? `&pageId=${selectedPage}` : ''}`)
      ]);

      if (!analyticsRes.ok || !summaryRes.ok) {
        throw new Error('Failed to load user data');
      }

      const [analyticsData, summaryData] = await Promise.all([
        analyticsRes.json(),
        summaryRes.json()
      ]);

      setAnalytics(analyticsData.analytics);
      setSummary(summaryData.summary);

    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Lỗi tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  };

  const loadPages = async () => {
    try {
      const response = await fetch('/api/social/facebook/database?type=pages');
      if (response.ok) {
        const data = await response.json();
        setPages(data.data || []);
      }
    } catch (error) {
      console.error('Error loading pages:', error);
    }
  };

  const testExtraction = async () => {
    if (!testText.trim()) return;

    try {
      setProcessing(true);
      const response = await fetch(`/api/social/facebook/users?type=extraction_test&text=${encodeURIComponent(testText)}`);
      
      if (response.ok) {
        const result = await response.json();
        setTestResult(result);
      } else {
        throw new Error('Test failed');
      }
    } catch (error) {
      console.error('Test error:', error);
      setError('Lỗi test extraction');
    } finally {
      setProcessing(false);
    }
  };

  const reprocessData = async () => {
    try {
      setProcessing(true);
      const response = await fetch('/api/social/facebook/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reprocess', 
          data: { pageId: selectedPage } 
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Đã xử lý lại ${result.processed} tương tác`);
        loadData();
      } else {
        throw new Error('Reprocess failed');
      }
    } catch (error) {
      console.error('Reprocess error:', error);
      setError('Lỗi xử lý lại dữ liệu');
    } finally {
      setProcessing(false);
    }
  };

  const exportData = () => {
    if (!analytics || !summary) return;

    const exportData = {
      analytics,
      summary,
      exportTime: new Date().toISOString(),
      pageId: selectedPage || 'all'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facebook-user-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu người dùng...</p>
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
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Facebook User Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Phân tích dữ liệu người dùng từ comments và messages
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={reprocessData}
              disabled={processing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
              Xử lý lại dữ liệu
            </button>
            
            <button
              onClick={exportData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
      </div>

      {/* Page Selector */}
      {pages.length > 0 && (
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
            {pages.map((page) => (
              <option key={page.facebookPageId} value={page.facebookPageId}>
                {page.name} ({page.fanCount?.toLocaleString()} fans)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'analytics', label: 'Analytics', icon: BarChart3 },
              { key: 'users', label: 'Users', icon: Users },
              { key: 'test', label: 'Test Extraction', icon: Search }
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
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Phone className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Số điện thoại</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.phoneExtracted}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.emailExtracted}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Địa điểm</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.locationExtracted}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Độ tin cậy TB</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(analytics.averageConfidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Interests */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Sở thích phổ biến
              </h3>
              <div className="space-y-3">
                {analytics.topInterests.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.interest}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(item.count / Math.max(...analytics.topInterests.map(i => i.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Phân bố độ tuổi
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.ageDistribution).map(([range, count]) => (
                  <div key={range} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{range}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(count / Math.max(...Object.values(analytics.ageDistribution))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Extractions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Dữ liệu trích xuất gần đây
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {analytics.recentExtractions.map((item, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.userName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {item.source === 'comment' ? 'Comment' : 'Message'} • {item.extractedData.confidence > 0 && `${(item.extractedData.confidence * 100).toFixed(1)}% tin cậy`}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">"{item.content?.substring(0, 100)}..."</p>
                      </div>
                      <div className="text-right text-sm">
                        {item.extractedData.phone && (
                          <div className="text-green-600">📞 {item.extractedData.phone}</div>
                        )}
                        {item.extractedData.email && (
                          <div className="text-blue-600">✉️ {item.extractedData.email}</div>
                        )}
                        {item.extractedData.age && (
                          <div className="text-purple-600">🎂 {item.extractedData.age} tuổi</div>
                        )}
                        {item.extractedData.location && (
                          <div className="text-red-600">📍 {item.extractedData.location}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && summary && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Thống kê tổng quan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{summary.totalUniqueUsers}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Người dùng duy nhất</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{summary.topUsers.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Người dùng tích cực</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {summary.users.reduce((sum, user) => sum + user.totalComments + user.totalMessages, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tổng tương tác</div>
              </div>
            </div>
          </div>

          {/* Top Users */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Người dùng tích cực nhất
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {summary.topUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{user.userName}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>💬 {user.totalComments} comments</span>
                        <span>✉️ {user.totalMessages} messages</span>
                        <span>📅 Từ {new Date(user.firstInteraction).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {user.totalComments + user.totalMessages}
                      </div>
                      <div className="text-sm text-gray-500">tương tác</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Tab */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Test Data Extraction
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nhập text để test:
                </label>
                <textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Ví dụ: Chào shop, em tên Lan, 25 tuổi, ở Hà Nội. Số điện thoại em là 0987654321. Em muốn hỏi về dịch vụ spa..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                />
              </div>
              
              <button
                onClick={testExtraction}
                disabled={processing || !testText.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Search className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
                Test Extraction
              </button>
            </div>

            {testResult && (
              <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Kết quả:</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Phone:</strong> {testResult.extractedData.phone || 'Không tìm thấy'}
                    </div>
                    <div>
                      <strong>Email:</strong> {testResult.extractedData.email || 'Không tìm thấy'}
                    </div>
                    <div>
                      <strong>Age:</strong> {testResult.extractedData.age || 'Không tìm thấy'}
                    </div>
                    <div>
                      <strong>Location:</strong> {testResult.extractedData.location || 'Không tìm thấy'}
                    </div>
                  </div>
                  
                  {testResult.extractedData.interests?.length > 0 && (
                    <div>
                      <strong>Interests:</strong> {testResult.extractedData.interests.join(', ')}
                    </div>
                  )}
                  
                  <div>
                    <strong>Confidence:</strong> {(testResult.extractedData.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
