'use client';

import React, { useState, useEffect } from 'react';
import { TailwindCard } from '@/components/ui/TailwindCard';
import { Button } from '@/components/ui/Button';

interface InstagramUser {
  id: string;
  username?: string;
  full_name?: string;
  email?: string;
  bio?: string;
  profile_picture_url?: string;
  followers_count?: number;
  following_count?: number;
  media_count?: number;
  confidence_score?: number;
  source: 'COMMENT' | 'MENTION' | 'STORY' | 'DM' | 'MEDIA_INTERACTION';
  interaction_type?: string;
  last_interaction?: string;
}

interface InstagramStats {
  total_users: number;
  verified_emails: number;
  business_accounts: number;
  high_engagement: number;
}

interface FacebookConfig {
  appId: string;
  appSecret: string;
  shortLivedToken: string;
  longLivedToken: string;
  apiVersion: string;
}

interface FacebookInstagramTabProps {
  config?: FacebookConfig;
}

export default function FacebookInstagramTab({ config }: FacebookInstagramTabProps) {
  const [users, setUsers] = useState<InstagramUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<InstagramStats>({
    total_users: 0,
    verified_emails: 0,
    business_accounts: 0,
    high_engagement: 0
  });
  const [selectedSource, setSelectedSource] = useState<'ALL' | 'COMMENT' | 'MENTION' | 'STORY' | 'DM' | 'MEDIA_INTERACTION'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [instagramAccounts, setInstagramAccounts] = useState<Array<{id: string, username: string}>>([]);

  useEffect(() => {
    loadInstagramAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadInstagramData();
    }
  }, [selectedAccount]);

  const loadInstagramAccounts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/facebook/instagram-accounts');
      if (response.ok) {
        const data = await response.json();
        setInstagramAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error loading Instagram accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInstagramData = async () => {
    if (!selectedAccount) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/facebook/instagram-business?accountId=${selectedAccount}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setStats(data.stats || {
          total_users: 0,
          verified_emails: 0,
          business_accounts: 0,
          high_engagement: 0
        });
      }
    } catch (error) {
      console.error('Error loading Instagram data:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractInstagramData = async () => {
    if (!selectedAccount) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/facebook/instagram-business/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: selectedAccount,
          extractionMethods: ['COMMENT', 'MENTION', 'STORY', 'DM', 'MEDIA_INTERACTION']
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error extracting Instagram data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch(`/api/facebook/instagram-business/export?accountId=${selectedAccount}&format=csv`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `instagram-users-${selectedAccount}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSource = selectedSource === 'ALL' || user.source === selectedSource;
    const matchesSearch = searchTerm === '' || 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSource && matchesSearch;
  });

  const getSourceBadge = (source: InstagramUser['source']) => {
    const badges = {
      COMMENT: 'bg-blue-100 text-blue-800',
      MENTION: 'bg-green-100 text-green-800',
      STORY: 'bg-purple-100 text-purple-800',
      DM: 'bg-pink-100 text-pink-800',
      MEDIA_INTERACTION: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[source]}`}>
        {source}
      </span>
    );
  };

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatNumber = (num?: number) => {
    if (!num) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <TailwindCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Instagram Business Integration</h2>
              <p className="text-sm text-gray-600">
                Extract user data from Instagram Business API (50-70% accuracy)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={loadInstagramData}
                disabled={loading || !selectedAccount}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? '🔄 Loading...' : '🔄 Refresh'}
              </Button>
              <Button
                onClick={extractInstagramData}
                disabled={loading || !selectedAccount}
                className="bg-green-600 hover:bg-green-700"
              >
                📸 Extract Data
              </Button>
              <Button
                onClick={exportData}
                disabled={!selectedAccount || users.length === 0}
                className="bg-pink-600 hover:bg-pink-700"
              >
                📊 Export CSV
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <label htmlFor="account-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select Instagram Account
              </label>
              <select
                id="account-select"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an account...</option>
                {instagramAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    @{account.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Users
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by username, name, or email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="source-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Source
              </label>
              <select
                id="source-filter"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Sources</option>
                <option value="COMMENT">Comments</option>
                <option value="MENTION">Mentions</option>
                <option value="STORY">Stories</option>
                <option value="DM">Direct Messages</option>
                <option value="MEDIA_INTERACTION">Media Interactions</option>
              </select>
            </div>
          </div>
        </div>
      </TailwindCard>

      {/* Stats Overview */}
      {selectedAccount && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TailwindCard>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total_users}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </TailwindCard>
          <TailwindCard>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.verified_emails}</div>
              <div className="text-sm text-gray-600">Verified Emails</div>
            </div>
          </TailwindCard>
          <TailwindCard>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.business_accounts}</div>
              <div className="text-sm text-gray-600">Business Accounts</div>
            </div>
          </TailwindCard>
          <TailwindCard>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">{stats.high_engagement}</div>
              <div className="text-sm text-gray-600">High Engagement</div>
            </div>
          </TailwindCard>
        </div>
      )}

      {/* Users Table */}
      {selectedAccount && (
        <TailwindCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Instagram Users</h3>
              <div className="text-sm text-gray-600">
                {filteredUsers.length} of {users.length} users
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                <p className="mt-2 text-sm text-gray-600">Loading Instagram data...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {users.length === 0 ? 'No Instagram data found. Click "Extract Data" to begin.' : 'No users match your search criteria.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Profile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confidence
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {user.profile_picture_url && (
                              <img
                                className="h-10 w-10 rounded-full mr-3"
                                src={user.profile_picture_url}
                                alt=""
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.username ? `@${user.username}` : 'N/A'}
                              </div>
                              {user.full_name && (
                                <div className="text-sm text-gray-500">
                                  {user.full_name}
                                </div>
                              )}
                              {user.bio && (
                                <div className="text-xs text-gray-400 truncate max-w-xs">
                                  {user.bio}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {user.email && (
                              <div>📧 {user.email}</div>
                            )}
                            {user.interaction_type && (
                              <div className="text-gray-500">
                                💬 {user.interaction_type}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div>👥 {formatNumber(user.followers_count)} followers</div>
                          <div>📱 {formatNumber(user.following_count)} following</div>
                          <div>📸 {formatNumber(user.media_count)} posts</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getSourceBadge(user.source)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getConfidenceColor(user.confidence_score)}`}>
                            {user.confidence_score ? `${user.confidence_score}%` : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TailwindCard>
      )}

      {/* Info Card */}
      <TailwindCard>
        <div className="p-6 bg-pink-50">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📸</div>
            <div>
              <h3 className="text-sm font-medium text-pink-900 mb-1">Instagram Business API Integration</h3>
              <p className="text-sm text-pink-700">
                This integration extracts user data from Instagram Business accounts through comments, mentions, 
                stories, and direct message interactions. Data accuracy ranges from 50-70% depending on user 
                privacy settings and interaction type. All data extraction follows Instagram's Business API 
                guidelines and privacy policies.
              </p>
              <div className="mt-2 text-xs text-pink-600">
                <strong>Best Sources:</strong> Business Profile Interactions (70%), Comments (60%), Mentions (50%), Stories (45%)
              </div>
            </div>
          </div>
        </div>
      </TailwindCard>
    </div>
  );
}
