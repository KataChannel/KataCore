'use client';

import React, { useState, useEffect } from 'react';
import { TailwindCard } from '@/components/ui/TailwindCard';

interface UserInteraction {
  userId: string;
  fullName: string;
  phoneNumber: string;
  facebookLink: string;
  fanpage: string;
  facebookPageId: string;
  totalInteractions: number;
  firstInteractionDate: string;
  lastInteractionDate: string;
  interactionType: string;
  latestMessage: string;
  stats?: {
    totalComments: number;
    totalMessages: number;
    avgCommentsPerPost: number;
  };
}

interface UserProfile {
  userId: string;
  userName: string;
  facebookLink: string;
  fanpage: string;
  facebookPageId: string;
  lastMessage: string;
  lastInteractionDate: string;
  facebookProfile?: {
    name: string;
    email?: string;
    picture?: string;
    location?: string;
    hometown?: string;
    work?: Array<{
      employer: string;
      position: string;
      startDate?: string;
      endDate?: string;
    }>;
    education?: Array<{
      school: string;
      type: string;
      year?: string;
    }>;
    relationshipStatus?: string;
    birthday?: string;
    gender?: string;
    about?: string;
    phone?: string;
  };
  interactionHistory: Array<{
    type: string;
    message: string;
    createdAt: string;
  }>;
  commentsHistory: Array<{
    message: string;
    createdTime: string;
    likesCount: number;
    postId: string;
    postMessage: string;
  }>;
  messagesHistory: Array<{
    message: string;
    createdTime: string;
    messageType: string;
    attachments: any;
  }>;
  stats: {
    totalInteractions: number;
    totalComments: number;
    totalMessages: number;
    totalActivities: number;
  };
}

interface SearchResult {
  userId: string;
  userName: string;
  facebookLink: string;
  fanpage: string;
  facebookPageId: string;
  phoneNumber?: string;
  lastMessage: string;
  lastInteractionDate: string;
  interactionType: string;
  matchType: string;
  matchReason: string[];
}

export default function FacebookUserInteractionsTab() {
  const [activeView, setActiveView] = useState<'list' | 'search' | 'profile'>('list');
  const [users, setUsers] = useState<UserInteraction[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // List view state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [includeProfile, setIncludeProfile] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'name' | 'phone' | 'message'>('all');
  
  // Available pages
  const [pages, setPages] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    loadPages();
    loadUsers();
  }, []);

  useEffect(() => {
    if (activeView === 'list') {
      loadUsers();
    }
  }, [currentPage, selectedPageId, includeProfile, activeView]);

  const loadPages = async () => {
    try {
      const response = await fetch('/api/admin/social/facebook/data?type=pages&limit=100');
      if (response.ok) {
        const data = await response.json();
        setPages(data.data.map((page: any) => ({
          id: page.facebookPageId,
          name: page.name
        })));
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const limit = 20;
      const offset = (currentPage - 1) * limit;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(selectedPageId && { pageId: selectedPageId }),
        ...(includeProfile && { includeProfile: 'true' })
      });

      const response = await fetch(`/api/admin/social/facebook/user-interactions?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load users: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
        setTotalPages(Math.ceil((data.pagination?.total || 0) / limit));
      } else {
        throw new Error(data.error || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setError('Search query must be at least 2 characters long');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type: searchType,
        limit: '50',
        ...(selectedPageId && { pageId: selectedPageId })
      });

      const response = await fetch(`/api/admin/social/facebook/user-search?${params}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results);
        setActiveView('search');
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setError(error instanceof Error ? error.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string, pageId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        userId,
        ...(pageId && { pageId })
      });

      const response = await fetch(`/api/admin/social/facebook/user-profile?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load profile: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSelectedProfile(data.user);
        setActiveView('profile');
      } else {
        throw new Error(data.error || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const params = new URLSearchParams({
        format: 'csv',
        limit: '1000',
        ...(selectedPageId && { pageId: selectedPageId })
      });

      const response = await fetch(`/api/admin/social/facebook/user-interactions?${params}`);
      
      if (response.ok) {
        const csvData = await response.text();
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facebook-user-interactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export data');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatPhone = (phone: string) => {
    if (!phone || phone === 'N/A') return 'N/A';
    // Format Vietnamese phone numbers
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <TailwindCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">User Interactions</h2>
              <p className="text-gray-600">Manage and analyze Facebook user interactions</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📋 List View
              </button>
              <button
                onClick={() => setActiveView('search')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'search'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔍 Search
              </button>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                📥 Export CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fanpage</label>
              <select
                value={selectedPageId}
                onChange={(e) => setSelectedPageId(e.target.value)}
                className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Pages</option>
                {pages.map(page => (
                  <option key={page.id} value={page.id}>{page.name}</option>
                ))}
              </select>
            </div>

            {activeView === 'list' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeProfile"
                  checked={includeProfile}
                  onChange={(e) => setIncludeProfile(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="includeProfile" className="ml-2 text-sm font-medium text-gray-700">
                  Include Facebook Profiles
                </label>
              </div>
            )}

            {activeView === 'search' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Type</label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as any)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="name">Name</option>
                    <option value="phone">Phone</option>
                    <option value="message">Message</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                    className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={searchUsers}
                    disabled={loading || searchQuery.length < 2}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    🔍 Search
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </TailwindCard>

      {/* Error Display */}
      {error && (
        <TailwindCard>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">❌ {error}</p>
          </div>
        </TailwindCard>
      )}

      {/* Content based on active view */}
      {activeView === 'list' && (
        <TailwindCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">User Interactions List</h3>
              {users.length > 0 && (
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} • {users.length} users
                </p>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading users...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No user interactions found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fanpage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interactions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={`${user.userId}_${user.facebookPageId}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-medium">
                                    {user.fullName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                <div className="text-sm text-gray-500">ID: {user.userId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatPhone(user.phoneNumber)}</div>
                            <a 
                              href={user.facebookLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Facebook Profile
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.fanpage}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {user.totalInteractions} total
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.interactionType === 'MESSAGE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {user.interactionType}
                              </span>
                            </div>
                            {user.stats && (
                              <div className="text-xs text-gray-500 mt-1">
                                💬 {user.stats.totalComments} • 📨 {user.stats.totalMessages}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{formatDate(user.lastInteractionDate)}</div>
                            <div className="text-xs text-gray-400 truncate max-w-32" title={user.latestMessage}>
                              {user.latestMessage?.substring(0, 50)}...
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => loadUserProfile(user.userId, user.facebookPageId)}
                              className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-2 text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </TailwindCard>
      )}

      {/* Search Results View */}
      {activeView === 'search' && (
        <TailwindCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Search Results</h3>
              {searchResults.length > 0 && (
                <p className="text-sm text-gray-600">{searchResults.length} results found</p>
              )}
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchQuery ? 'No users found matching your search' : 'Enter a search query above'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div key={`${result.userId}_${result.facebookPageId}`} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-lg">
                            {result.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{result.userName}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>📱 {formatPhone(result.phoneNumber || 'N/A')}</span>
                            <span>🏢 {result.fanpage}</span>
                            <span>🔗 {result.interactionType}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {result.matchReason.map((reason, index) => (
                              <span key={index} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                reason === 'name' ? 'bg-blue-100 text-blue-800' :
                                reason === 'phone' ? 'bg-green-100 text-green-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => loadUserProfile(result.userId, result.facebookPageId)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        View Profile
                      </button>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <strong>Latest:</strong> {result.lastMessage.substring(0, 200)}...
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Last activity: {formatDate(result.lastInteractionDate)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TailwindCard>
      )}

      {/* Profile View */}
      {activeView === 'profile' && selectedProfile && (
        <TailwindCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">User Profile</h3>
              <button
                onClick={() => setActiveView('list')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                ← Back to List
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                    {selectedProfile.facebookProfile?.picture ? (
                      <img 
                        src={selectedProfile.facebookProfile.picture} 
                        alt={selectedProfile.userName}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 font-medium text-xl">
                        {selectedProfile.userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{selectedProfile.userName}</h4>
                    <p className="text-gray-600">🏢 {selectedProfile.fanpage}</p>
                    <a 
                      href={selectedProfile.facebookLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      📘 Facebook Profile
                    </a>
                  </div>
                </div>

                {/* Facebook Profile Data */}
                {selectedProfile.facebookProfile && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">📘 Facebook Profile Information</h5>
                    <div className="space-y-2 text-sm">
                      {selectedProfile.facebookProfile.email && (
                        <div><strong>Email:</strong> {selectedProfile.facebookProfile.email}</div>
                      )}
                      {selectedProfile.facebookProfile.location && (
                        <div><strong>Location:</strong> {selectedProfile.facebookProfile.location}</div>
                      )}
                      {selectedProfile.facebookProfile.hometown && (
                        <div><strong>Hometown:</strong> {selectedProfile.facebookProfile.hometown}</div>
                      )}
                      {selectedProfile.facebookProfile.birthday && (
                        <div><strong>Birthday:</strong> {selectedProfile.facebookProfile.birthday}</div>
                      )}
                      {selectedProfile.facebookProfile.gender && (
                        <div><strong>Gender:</strong> {selectedProfile.facebookProfile.gender}</div>
                      )}
                      {selectedProfile.facebookProfile.relationshipStatus && (
                        <div><strong>Relationship:</strong> {selectedProfile.facebookProfile.relationshipStatus}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">📊 Activity Statistics</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedProfile.stats.totalInteractions}</div>
                      <div className="text-sm text-gray-600">Interactions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedProfile.stats.totalComments}</div>
                      <div className="text-sm text-gray-600">Comments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{selectedProfile.stats.totalMessages}</div>
                      <div className="text-sm text-gray-600">Messages</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedProfile.stats.totalActivities}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity History */}
              <div className="space-y-4">
                {/* Recent Messages */}
                {selectedProfile.messagesHistory.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">📨 Recent Messages</h5>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedProfile.messagesHistory.slice(0, 5).map((message, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 rounded p-3">
                          <div className="text-sm text-gray-900">{message.message}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(message.createdTime)} • {message.messageType}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Comments */}
                {selectedProfile.commentsHistory.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">💬 Recent Comments</h5>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedProfile.commentsHistory.slice(0, 5).map((comment, index) => (
                        <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-3">
                          <div className="text-sm text-gray-900">{comment.message}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(comment.createdTime)} • 👍 {comment.likesCount} likes
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Post: {comment.postMessage}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interaction History */}
                {selectedProfile.interactionHistory.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">🔄 Interaction History</h5>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedProfile.interactionHistory.slice(0, 10).map((interaction, index) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 rounded p-3">
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              interaction.type === 'MESSAGE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {interaction.type}
                            </span>
                            <span className="text-xs text-gray-500">{formatDate(interaction.createdAt)}</span>
                          </div>
                          <div className="text-sm text-gray-900 mt-1">{interaction.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TailwindCard>
      )}
    </div>
  );
}
