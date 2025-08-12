'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/components/auth/UnifiedAuthProvider';
import { getFacebookConfig, getFacebookHeaders, getFacebookConfigStatus, logFacebookConfigSource } from '@/lib/facebook-config';

interface Post {
  id: string;
  message?: string;
  created_time?: string;
  likes?: {
    summary?: {
      total_count: number;
    };
  };
  comments?: {
    summary?: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
}

interface Comment {
  id: string;
  message: string;
  created_time?: string;
  from?: {
    name: string;
  };
  likes?: {
    summary?: {
      total_count: number;
    };
  };
}

interface Message {
  id: string;
  message: string;
  created_time?: string;
  from?: {
    name: string;
  };
}

interface Participant {
  name: string;
}

interface Conversation {
  id: string;
  participants?: {
    data?: Participant[];
  };
  messages?: {
    data?: Message[];
  };
}

interface FacebookPage {
  id: string;
  name: string;
  category?: string;
  fan_count?: number;
  followers_count?: number;
  link?: string;
  about?: string;
  phone?: string;
  website?: string;
  // Database specific fields
  lastSyncAt?: string;
  interactionCount?: number;
  isSynced?: boolean;
  dbId?: string;
}

interface InteractionData {
  fanpage: string;
  fullName: string;
  phoneNumber: string;
  facebookLink: string;
  firstInteractionDate: string;
  lastInteractionDate: string;
  totalInteractions: number;
  latestMessage: string;
  interactionType: string;
}

interface PaginationData {
  current: number;
  limit: number;
  total: number;
  pages: number;
}

export default function Home() {
  // Auth and permissions
  const { user, hasModuleAccess, isSuperAdmin, isSystemAdmin } = useUnifiedAuth();
  
  // Check if user has admin permissions
  const isAdmin = isSuperAdmin() || isSystemAdmin() || 
                 hasModuleAccess('admin') || 
                 user?.role?.name?.includes('ADMIN') ||
                 (user?.role?.level && user.role.level >= 8);

  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [messages, setMessages] = useState<Conversation[]>([]);
  const [fanpages, setFanpages] = useState<FacebookPage[]>([]);
  const [interactions, setInteractions] = useState<InteractionData[]>([]);
  const [listProfile, setListProfile] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [activeTab, setActiveTab] = useState('fanpages');
  const [dataSource, setDataSource] = useState<'database' | 'facebook'>('database');
  const [syncStatus, setSyncStatus] = useState<{ [key: string]: 'syncing' | 'synced' | 'error' }>({});
  
  // Pagination and search states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string>('');

  // Facebook configuration states
  const [facebookPageId, setFacebookPageId] = useState<string>('');
  const [facebookAccessToken, setFacebookAccessToken] = useState<string>('');
  const [facebookLongLivedToken, setFacebookLongLivedToken] = useState<string>('');
  const [showConfiguration, setShowConfiguration] = useState(false);

  const fetchData = async (type: string, postId = '', pageId = '', page = 1, search = '') => {
    setLoading(true);
    setError(null);

    try {
      let url: string;
      let headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Determine data source and API endpoint
      if (dataSource === 'database') {
        // Fetch from database
        if (type === 'fanpages' || type === 'pages') {
          url = `/api/admin/social/facebook/database?action=pages`;
        } else if (type === 'posts') {
          const params = new URLSearchParams({
            action: 'posts',
            ...(pageId && { pageId }),
            ...(page > 1 && { page: page.toString() }),
            limit: '10'
          });
          url = `/api/admin/social/facebook/database?${params.toString()}`;
        } else if (type === 'comments') {
          const params = new URLSearchParams({
            action: 'comments',
            ...(postId && { postId }),
            ...(page > 1 && { page: page.toString() }),
            limit: '20'
          });
          url = `/api/admin/social/facebook/database?${params.toString()}`;
        } else if (type === 'messages') {
          const params = new URLSearchParams({
            action: 'messages',
            ...(pageId && { pageId }),
            ...(page > 1 && { page: page.toString() }),
            limit: '10'
          });
          url = `/api/admin/social/facebook/database?${params.toString()}`;
        } else if (type === 'interactions') {
          const params = new URLSearchParams({
            action: 'interactions',
            ...(pageId && { pageId }),
            ...(page > 1 && { page: page.toString() }),
            ...(search && { search }),
            limit: '10'
          });
          url = `/api/admin/social/facebook/database?${params.toString()}`;
        } else {
          // For any other types, fall back to Facebook API
          const params = new URLSearchParams({
            type,
            ...(postId && { postId }),
            ...(pageId && { pageId }),
            ...(page > 1 && { page: page.toString() }),
            ...(search && { search }),
            limit: '10'
          });
          url = `/api/social/facebook?${params.toString()}`;
          
          // Get Facebook headers with priority: env > localStorage
          const facebookHeaders = getFacebookHeaders();
          headers = { ...headers, ...facebookHeaders };
        }
      } else {
        // Fetch directly from Facebook API
        const params = new URLSearchParams({
          type,
          ...(postId && { postId }),
          ...(pageId && { pageId }),
          ...(page > 1 && { page: page.toString() }),
          ...(search && { search }),
          limit: '10'
        });
        url = `/api/social/facebook?${params.toString()}`;
        
        // Get Facebook headers with priority: env > localStorage
        const facebookHeaders = getFacebookHeaders();
        headers = { ...headers, ...facebookHeaders };
      }
      
      console.log('Fetching:', url, 'Source:', dataSource);

      const res = await fetch(url, { headers });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Response data:', data);

      // Check if we're using mock data (mock data has predictable IDs)
      if (data.data && data.data.length > 0 && data.data[0].id === '1') {
        setIsUsingMockData(true);
      } else {
        setIsUsingMockData(false);
      }

      if (type === 'fanpages' || type === 'pages') {
        setFanpages(data.data || []);
      } else if (type === 'posts') {
        setPosts(data.data || []);
      } else if (type === 'comments') {
        setComments(data.data || []);
      } else if (type === 'messages') {
        const Listid = data.data.map((v: any) => v.participants);
        const profile = Listid.map((v: any) => v.data)
          .flat()
          .filter((v: any) => v.id !== '272459726955766');
        setListProfile(profile);
        setMessages(data.data || []);
      } else if (type === 'interactions') {
        setInteractions(data.data || []);
        setPagination(data.pagination || null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load pages based on current data source
    fetchData('fanpages');
  }, [dataSource]);

  // Load Facebook configuration from environment variables first, then localStorage
  useEffect(() => {
    const config = getFacebookConfig();
    
    if (config.pageId) {
      setFacebookPageId(config.pageId);
    }
    if (config.accessToken) {
      setFacebookAccessToken(config.accessToken);
    }
    if (config.longLivedToken) {
      setFacebookLongLivedToken(config.longLivedToken);
    }
    
    // Log configuration source for debugging
    logFacebookConfigSource();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData('interactions', '', selectedPageId, 1, searchTerm);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchData('interactions', '', selectedPageId, page, searchTerm);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Save Facebook configuration to localStorage
  const saveFacebookConfiguration = () => {
    let savedItems = [];
    
    if (facebookPageId.trim()) {
      localStorage.setItem('NEXT_PUBLIC_FACEBOOK_PAGE_ID', facebookPageId.trim());
      savedItems.push('Page ID');
    }
    if (facebookAccessToken.trim()) {
      localStorage.setItem('NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN', facebookAccessToken.trim());
      savedItems.push('Access Token');
    }
    if (facebookLongLivedToken.trim()) {
      localStorage.setItem('NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN', facebookLongLivedToken.trim());
      savedItems.push('Long-Lived Token');
    }
    
    if (savedItems.length > 0) {
      // Show success message
      alert(`✅ Facebook configuration saved successfully!\n\nSaved: ${savedItems.join(', ')}\n\nThese values will now be used for Facebook API calls.`);
      setShowConfiguration(false);
      
      // Refresh fanpages with new configuration
      fetchData('fanpages');
    } else {
      alert('⚠️ Please enter at least one configuration value before saving.');
    }
  };

  // Clear Facebook configuration
  const clearFacebookConfiguration = () => {
    if (confirm('⚠️ Are you sure you want to clear the Facebook configuration?\n\nThis will remove the saved Page ID, Access Token, and Long-Lived Token from localStorage.')) {
      localStorage.removeItem('NEXT_PUBLIC_FACEBOOK_PAGE_ID');
      localStorage.removeItem('NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN');
      localStorage.removeItem('NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN');
      setFacebookPageId('');
      setFacebookAccessToken('');
      setFacebookLongLivedToken('');
      alert('🗑️ Facebook configuration cleared successfully!');
      
      // Refresh to show the effect
      fetchData('fanpages');
    }
  };

  // Sync pages from Facebook to database
  const syncPagesToDatabase = async () => {
    try {
      setLoading(true);
      setSyncStatus({ ...syncStatus, all: 'syncing' });

      // Get Facebook headers with priority: env > localStorage
      const headers = getFacebookHeaders();

      const response = await fetch('/api/admin/social/facebook/database', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'sync_pages'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync pages');
      }

      const result = await response.json();
      console.log('Sync result:', result);

      setSyncStatus({ ...syncStatus, all: 'synced' });
      
      // Show success message
      alert(`✅ Sync completed!\n\nSynced: ${result.synced} pages\nErrors: ${result.errors} pages`);
      
      // Refresh the pages list
      if (dataSource === 'database') {
        fetchData('fanpages');
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus({ ...syncStatus, all: 'error' });
      alert(`❌ Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Sync individual page interactions
  const syncPageInteractions = async (pageId: string) => {
    try {
      setSyncStatus({ ...syncStatus, [pageId]: 'syncing' });

      // Get Facebook headers with priority: env > localStorage
      const headers = getFacebookHeaders();

      const response = await fetch('/api/admin/social/facebook/database', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'sync_interactions',
          data: { pageId }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync interactions');
      }

      const result = await response.json();
      console.log('Interactions sync result:', result);

      setSyncStatus({ ...syncStatus, [pageId]: 'synced' });
      
      // Show success message
      alert(`✅ Interactions synced!\n\nSynced: ${result.synced} interactions\nErrors: ${result.errors} interactions`);
    } catch (error) {
      console.error('Interactions sync error:', error);
      setSyncStatus({ ...syncStatus, [pageId]: 'error' });
      alert(`❌ Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Sync posts for a specific page
  const syncPostsToDatabase = async (pageId: string) => {
    try {
      setSyncStatus({ ...syncStatus, [`posts-${pageId}`]: 'syncing' });

      // Get Facebook headers with priority: env > localStorage
      const headers = getFacebookHeaders();

      const response = await fetch('/api/admin/social/facebook/database', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'sync-posts',
          data: { pageId }
        })
      });
      if (!response.ok) {
        throw new Error('Failed to sync posts');
      }
      const result = await response.json();
      console.log('Posts sync result:', result);

      setSyncStatus({ ...syncStatus, [`posts-${pageId}`]: 'synced' });
      
      // Show success message
      alert(`✅ Posts synced!\n\n${result.message}`);
      
      // Refresh posts if we're viewing them
      if (activeTab === 'posts' && selectedPageId === pageId) {
        fetchData('posts', '', pageId);
      }
    } catch (error) {
      console.error('Posts sync error:', error);
      setSyncStatus({ ...syncStatus, [`posts-${pageId}`]: 'error' });
      alert(`❌ Posts sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Sync messages for a specific page
  const syncMessagesToDatabase = async (pageId: string) => {
    try {
      setSyncStatus({ ...syncStatus, [`messages-${pageId}`]: 'syncing' });

      // Get Facebook headers with priority: env > localStorage
      const headers = getFacebookHeaders();

      const response = await fetch('/api/admin/social/facebook/database', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'sync-messages',
          data: { pageId }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync messages');
      }

      const result = await response.json();
      console.log('Messages sync result:', result);

      setSyncStatus({ ...syncStatus, [`messages-${pageId}`]: 'synced' });
      
      // Show success message
      alert(`✅ Messages synced!\n\n${result.message}`);
      
      // Refresh messages if we're viewing them
      if (activeTab === 'messages' && selectedPageId === pageId) {
        fetchData('messages', '', pageId);
      }
    } catch (error) {
      console.error('Messages sync error:', error);
      setSyncStatus({ ...syncStatus, [`messages-${pageId}`]: 'error' });
      alert(`❌ Messages sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Sync comments for a specific post
  const syncCommentsToDatabase = async (postId: string) => {
    try {
      setSyncStatus({ ...syncStatus, [`comments-${postId}`]: 'syncing' });

      // Get Facebook headers with priority: env > localStorage
      const headers = getFacebookHeaders();

      const response = await fetch('/api/admin/social/facebook/database', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'sync-comments',
          data: { postId }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync comments');
      }

      const result = await response.json();
      console.log('Comments sync result:', result);

      setSyncStatus({ ...syncStatus, [`comments-${postId}`]: 'synced' });
      
      // Show success message
      alert(`✅ Comments synced!\n\n${result.message}`);
      
      // Refresh comments if we're viewing them
      if (activeTab === 'comments') {
        fetchData('comments', postId);
      }
    } catch (error) {
      console.error('Comments sync error:', error);
      setSyncStatus({ ...syncStatus, [`comments-${postId}`]: 'error' });
      alert(`❌ Comments sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Facebook Social Media Management</h1>
      
      {/* Data Source Toggle - Admin Only */}
      {isAdmin && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-4 border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Data Source</h2>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="dataSource"
                  value="database"
                  checked={dataSource === 'database'}
                  onChange={(e) => {
                    setDataSource(e.target.value as 'database' | 'facebook');
                    // Refresh data when source changes
                    if (activeTab === 'fanpages') {
                      fetchData('fanpages');
                    } else if (activeTab === 'interactions') {
                      fetchData('interactions', '', selectedPageId, currentPage, searchTerm);
                    }
                  }}
                  className="form-radio text-blue-600"
                />
                <span className="text-sm font-medium">Database (Synced)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="dataSource"
                  value="facebook"
                  checked={dataSource === 'facebook'}
                  onChange={(e) => {
                    setDataSource(e.target.value as 'database' | 'facebook');
                    // Refresh data when source changes
                    if (activeTab === 'fanpages') {
                      fetchData('fanpages');
                    } else if (activeTab === 'interactions') {
                      fetchData('interactions', '', selectedPageId, currentPage, searchTerm);
                    }
                  }}
                  className="form-radio text-green-600"
                />
                <span className="text-sm font-medium">Facebook API (Live)</span>
              </label>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>📊 <strong>Database:</strong> Shows synced data from your local database (faster, offline-capable)</p>
            <p>🌐 <strong>Facebook API:</strong> Shows live data directly from Facebook (requires internet, rate-limited)</p>
          </div>
        </div>
      )}
      
      {/* Facebook Configuration Section - Admin Only */}
      {isAdmin && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-4 border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Facebook API Configuration</h2>
            <button
              onClick={() => setShowConfiguration(!showConfiguration)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              {showConfiguration ? 'Hide Config' : 'Show Config'}
            </button>
          </div>

          {/* Configuration Status */}
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Page ID Configuration</h3>
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    getFacebookConfigStatus().environment.pageId ? 'bg-blue-500' : 'bg-gray-400'
                  }`}></span>
                  <span className="text-gray-700">
                    Environment: {getFacebookConfigStatus().environment.pageId ? 'Configured' : 'Not configured'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    getFacebookConfigStatus().localStorage.pageId ? 'bg-green-500' : 'bg-gray-400'
                  }`}></span>
                  <span className="text-gray-700">
                    localStorage: {getFacebookConfigStatus().localStorage.pageId ? 'Configured' : 'Not configured'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Current: {getFacebookConfigStatus().current.pageId || 'Not configured'}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Access Token Configuration</h3>
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    getFacebookConfigStatus().environment.accessToken ? 'bg-blue-500' : 'bg-gray-400'
                  }`}></span>
                  <span className="text-gray-700">
                    Environment: {getFacebookConfigStatus().environment.accessToken ? 'Configured' : 'Not configured'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    getFacebookConfigStatus().localStorage.accessToken ? 'bg-green-500' : 'bg-gray-400'
                  }`}></span>
                  <span className="text-gray-700">
                    localStorage: {getFacebookConfigStatus().localStorage.accessToken ? 'Configured' : 'Not configured'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Current: {getFacebookConfigStatus().current.accessToken ? 
                    `${getFacebookConfigStatus().current.accessToken?.substring(0, 20)}...` : 
                    'Not configured'}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Long-Lived Token Configuration</h3>
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    getFacebookConfigStatus().environment.longLivedToken ? 'bg-blue-500' : 'bg-gray-400'
                  }`}></span>
                  <span className="text-gray-700">
                    Environment: {getFacebookConfigStatus().environment.longLivedToken ? 'Configured' : 'Not configured'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    getFacebookConfigStatus().localStorage.longLivedToken ? 'bg-green-500' : 'bg-gray-400'
                  }`}></span>
                  <span className="text-gray-700">
                    localStorage: {getFacebookConfigStatus().localStorage.longLivedToken ? 'Configured' : 'Not configured'}
                  </span>
                </div>
                <div className="text-xs text-green-600 font-medium">
                  Type: {getFacebookConfigStatus().current.tokenType || 'Not configured'}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">🔧 Configuration Priority:</p>
                <p className="mb-1">1. <strong>Long-Lived Token</strong> (60 days) - Highest priority</p>
                <p className="mb-1">2. <strong>Regular Access Token</strong> (1-2 hours) - Lower priority</p>
                <p className="mb-2 text-xs border-t pt-2">Source Priority:</p>
                <p className="mb-1">1. <strong>Environment Variables</strong> (.env.local) - Higher priority</p>
                <p className="mb-1">2. <strong>localStorage</strong> (Browser storage) - Lower priority</p>
                <p className="text-xs">Environment variables override localStorage settings when both are present.</p>
              </div>
            </div>
          </div>

        {showConfiguration && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook Page ID
              </label>
              <input
                type="text"
                value={facebookPageId}
                onChange={(e) => setFacebookPageId(e.target.value)}
                placeholder="Enter Facebook Page ID (e.g., 593555107170691)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook Access Token (Regular - 1-2 hours)
              </label>
              <textarea
                value={facebookAccessToken}
                onChange={(e) => setFacebookAccessToken(e.target.value)}
                placeholder="Enter Facebook Access Token (short-lived)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook Long-Lived Token (Recommended - 60 days)
              </label>
              <textarea
                value={facebookLongLivedToken}
                onChange={(e) => setFacebookLongLivedToken(e.target.value)}
                placeholder="Enter Facebook Long-Lived Token (lasts 60 days)"
                rows={3}
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-green-600 mt-1">
                💡 Long-lived tokens are more reliable and last 60 days instead of 1-2 hours
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveFacebookConfiguration}
                disabled={!facebookPageId.trim() && !facebookAccessToken.trim() && !facebookLongLivedToken.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Configuration
              </button>
              <button
                onClick={clearFacebookConfiguration}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear Configuration
              </button>
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <p className="font-medium mb-1">Quick Setup:</p>
              <p className="mb-1">Page ID: 593555107170691</p>
              <p>Access Token: EAAIZCuUzXcokBPFDegEMUjKnK2ZCOJ81StOBn6l4u9Kk2uSfLsdl4WTPkRjNZBJmqoATdHYFKgkhEQGZBniZCkiuZCJUDDWUKEWZCNu8Y6yguiHI9lZBZB5n8FuZAKMbWXuazXuXsjZAxcSeW1Upg8ef8L8pZCH6BIiZA1Ct9Uq1eLcqB95Sd856w8HLXANcYBd964mZAuNtFP6fR6ZCpoZADYZBghWZCLSUPQfS9jBt7cIFT1jeFXGns0F04ZD</p>
              <button
                onClick={() => {
                  setFacebookPageId('593555107170691');
                  setFacebookAccessToken('EAAIZCuUzXcokBPFDegEMUjKnK2ZCOJ81StOBn6l4u9Kk2uSfLsdl4WTPkRjNZBJmqoATdHYFKgkhEQGZBniZCkiuZCJUDDWUKEWZCNu8Y6yguiHI9lZBZB5n8FuZAKMbWXuazXuXsjZAxcSeW1Upg8ef8L8pZCH6BIiZA1Ct9Uq1eLcqB95Sd856w8HLXANcYBd964mZAuNtFP6fR6ZCpoZADYZBghWZCLSUPQfS9jBt7cIFT1jeFXGns0F04ZD');
                }}
                className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Use Default Values
              </button>
            </div>
          </div>
        )}
        </div>
      )}
      
      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'fanpages', label: 'Fanpages', icon: '📄' },
            { id: 'interactions', label: 'Comprehensive Table', icon: '📊' },
            { id: 'posts', label: 'Posts', icon: '📝' },
            { id: 'messages', label: 'Messages', icon: '💬' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {listProfile.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">List of Participants</h2>
          <ul className="list-disc pl-5 space-y-2">
            {listProfile.map((profile, index) => (
              <li key={index} className="text-gray-800">
                <Link
                  href={`https://www.facebook.com/profile.php?id=${profile.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {profile.name || 'Unknown Participant'}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mock Data Warning */}
      {isUsingMockData && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <strong>Development Mode:</strong> Using mock data. To use real Facebook data, configure
          the Facebook Page ID and Access Token using the configuration section above, or set
          FACEBOOK_PAGE_ID and FACEBOOK_ACCESS_TOKEN in your .env.local file.
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Fanpages Section */}
      {activeTab === 'fanpages' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              Facebook Pages ({fanpages.length})
              <span className="text-sm font-normal text-gray-600 ml-2">
                {dataSource === 'database' ? '📊 From Database' : '🌐 From Facebook API'}
              </span>
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => fetchData('fanpages')}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh Pages'}
              </button>
              {isAdmin && dataSource === 'database' && (
                <button
                  onClick={syncPagesToDatabase}
                  disabled={loading || syncStatus.all === 'syncing'}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {syncStatus.all === 'syncing' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Syncing...
                    </>
                  ) : (
                    <>🔄 Sync from Facebook</>
                  )}
                </button>
              )}
            </div>
          </div>

          {loading && fanpages.length === 0 ? (
            <div className="text-center py-4">Loading fanpages...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {fanpages.map((page) => (
                <div key={page.id} className="bg-white rounded-lg shadow-md p-6 border">
                  {/* Sync Status Indicator */}
                  {dataSource === 'database' && (
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${
                          page.isSynced ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></span>
                        <span className="text-xs text-gray-600">
                          {page.isSynced ? 'Synced' : 'Not synced'}
                        </span>
                      </div>
                      {page.lastSyncAt && (
                        <span className="text-xs text-gray-500">
                          {formatDate(page.lastSyncAt)}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <h3 className="text-lg font-semibold mb-2">{page.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    {page.category && <p><strong>Category:</strong> {page.category}</p>}
                    {page.fan_count && <p><strong>Fans:</strong> {page.fan_count.toLocaleString()}</p>}
                    {page.followers_count && <p><strong>Followers:</strong> {page.followers_count.toLocaleString()}</p>}
                    {page.phone && <p><strong>Phone:</strong> {page.phone}</p>}
                    {page.website && <p><strong>Website:</strong> <a href={page.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{page.website}</a></p>}
                    {dataSource === 'database' && page.interactionCount !== undefined && (
                      <p><strong>Interactions:</strong> {page.interactionCount}</p>
                    )}
                  </div>
                  {page.about && (
                    <p className="mt-3 text-gray-700 text-sm line-clamp-3">{page.about}</p>
                  )}
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedPageId(page.id);
                        fetchData('comments', '', page.id);
                        setActiveTab('posts');
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      View Comments
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPageId(page.id);
                        fetchData('messages', '', page.id);
                        setActiveTab('messages');
                      }}
                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                    >
                      View Messages
                    </button>
                    {isAdmin && dataSource === 'database' && (
                      <>
                        <button
                          onClick={() => syncPostsToDatabase(page.id)}
                          disabled={syncStatus[`posts-${page.id}`] === 'syncing'}
                          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          {syncStatus[`posts-${page.id}`] === 'syncing' ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              Syncing...
                            </>
                          ) : (
                            <>🔄 Sync Posts</>
                          )}
                        </button>
                        <button
                          onClick={() => syncMessagesToDatabase(page.id)}
                          disabled={syncStatus[`messages-${page.id}`] === 'syncing'}
                          className="px-3 py-1 bg-pink-600 text-white rounded text-sm hover:bg-pink-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          {syncStatus[`messages-${page.id}`] === 'syncing' ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              Syncing...
                            </>
                          ) : (
                            <>🔄 Sync Messages</>
                          )}
                        </button>
                        <button
                          onClick={() => syncPageInteractions(page.id)}
                          disabled={syncStatus[page.id] === 'syncing'}
                          className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        {syncStatus[page.id] === 'syncing' ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            Sync
                          </>
                        ) : (
                          <>🔄 Sync Data</>
                        )}
                      </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {fanpages.length === 0 && !loading && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  {dataSource === 'database' 
                    ? 'No pages in database. Click "Sync from Facebook" to import pages.'
                    : 'No fanpages found. Make sure your Facebook credentials are configured correctly.'
                  }
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Comprehensive Interactions Table */}
      {activeTab === 'interactions' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              Comprehensive Interactions Table
              <span className="text-sm font-normal text-gray-600 ml-2">
                {dataSource === 'database' ? '📊 From Database' : '🌐 From Facebook API'}
              </span>
            </h2>
            <button
              onClick={() => fetchData('interactions', '', selectedPageId, 1, searchTerm)}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search by name, message, or fanpage..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="w-64">
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Page</label>
                <select
                  value={selectedPageId}
                  onChange={(e) => setSelectedPageId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Pages</option>
                  {fanpages.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Search
              </button>
            </div>
          </div>

          {/* Data Table */}
          {loading && interactions.length === 0 ? (
            <div className="text-center py-4">Loading interactions...</div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fanpage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Facebook Link
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        First Interaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Interaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Interactions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {interactions.map((interaction, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {interaction.fanpage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {interaction.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {interaction.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <a
                            href={interaction.facebookLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Profile
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(interaction.firstInteractionDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(interaction.lastInteractionDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {interaction.totalInteractions}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= pagination.pages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">
                          {(currentPage - 1) * pagination.limit + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * pagination.limit, pagination.total)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === currentPage
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= pagination.pages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}

              {interactions.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No interactions found. Try adjusting your search criteria or make sure there is data available.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Posts Section */}
      {activeTab === 'posts' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold">Posts ({posts.length})</h2>
              {dataSource === 'database' && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Showing data from database
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchData('posts', '', selectedPageId)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh Posts'}
              </button>
              {isAdmin && dataSource === 'database' && selectedPageId && (
                <button
                  onClick={() => syncPostsToDatabase(selectedPageId)}
                  disabled={syncStatus[`posts-${selectedPageId}`] === 'syncing'}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {syncStatus[`posts-${selectedPageId}`] === 'syncing' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Syncing...
                    </>
                  ) : (
                    <>🔄 Sync from Facebook</>
                  )}
                </button>
              )}
            </div>
          </div>

          {loading && posts.length === 0 ? (
            <div className="text-center py-4">Loading posts...</div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-md p-6 border">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-gray-800 flex-1">{post.message || 'No message'}</p>
                    {dataSource === 'database' && (post as any).isSynced && (
                      <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Synced
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">{formatDate(post.created_time)}</div>
                  <div className="flex gap-4 text-sm text-gray-600 mb-3">
                    <span>👍 {post.likes?.summary?.total_count || 0} likes</span>
                    <span>💬 {post.comments?.summary?.total_count || 0} comments</span>
                    <span>🔄 {post.shares?.count || 0} shares</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchData('comments', post.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      Load Comments
                    </button>
                    {isAdmin && dataSource === 'database' && (
                      <button
                        onClick={() => syncCommentsToDatabase(post.id)}
                        disabled={syncStatus[`comments-${post.id}`] === 'syncing'}
                        className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        {syncStatus[`comments-${post.id}`] === 'syncing' ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            Syncing...
                          </>
                        ) : (
                          <>🔄 Sync Comments</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {posts.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No posts found.{' '}
                  {isUsingMockData
                    ? 'Mock data is being used for development.'
                    : 'Make sure your Facebook credentials are configured correctly.'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Comments Section */}
      {comments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Comments ({comments.length})</h2>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-gray-800 mb-2">{comment.message}</p>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>👤 {comment.from?.name || 'Unknown user'}</span>
                  <div className="flex gap-2">
                    <span>👍 {comment.likes?.summary?.total_count || 0}</span>
                    <span>{formatDate(comment.created_time)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Section */}
      {activeTab === 'messages' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold">Messages ({messages.length})</h2>
              {dataSource === 'database' && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Showing data from database
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchData('messages', '', selectedPageId)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh Messages'}
              </button>
              {isAdmin && dataSource === 'database' && selectedPageId && (
                <button
                  onClick={() => syncMessagesToDatabase(selectedPageId)}
                  disabled={syncStatus[`messages-${selectedPageId}`] === 'syncing'}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {syncStatus[`messages-${selectedPageId}`] === 'syncing' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Syncing...
                    </>
                  ) : (
                    <>🔄 Sync from Facebook</>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {messages.map((conversation) => (
              <div key={conversation.id} className="bg-white rounded-lg shadow-md p-6 border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <strong>Participants:</strong>{' '}
                    {conversation.participants?.data?.map((p) => p.name).join(', ') || 'Unknown'}
                  </div>
                  {dataSource === 'database' && (conversation as any).isSynced && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Synced
                    </span>
                  )}
                </div>
                {conversation.messages?.data && conversation.messages.data.length > 0 && (
                  <div>
                    <strong>Messages:</strong>
                    <div className="mt-2 space-y-2">
                      {conversation.messages.data.map((msg) => (
                        <div key={msg.id} className="bg-gray-50 p-3 rounded">
                          <p className="text-gray-800">{msg.message}</p>
                          <div className="text-sm text-gray-600 mt-1">
                            👤 {msg.from?.name || 'Unknown'} • {formatDate(msg.created_time)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {messages.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                No messages found. Click "Load Messages" to fetch conversations.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
