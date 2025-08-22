'use client';

import React, { useState, useEffect } from 'react';
import { TailwindCard } from '@/components/ui/TailwindCard';
import { Button } from '@/components/ui/Button';

interface ComprehensiveUserData {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  uid?: string;
  full_name?: string;
  confidence_score: number;
  sources: string[];
  data_sources: {
    leadAds?: boolean;
    whatsapp?: boolean;
    instagram?: boolean;
    textMining?: boolean;
    interactions?: boolean;
  };
  last_updated: string;
  gdpr_status: 'ACTIVE' | 'REQUESTED_DELETION' | 'DELETED';
}

interface ExtractionStats {
  total_users: number;
  high_confidence: number;
  verified_emails: number;
  verified_phones: number;
  multiple_sources: number;
}

interface ExtractionProgress {
  isRunning: boolean;
  currentMethod: string;
  progress: number;
  totalMethods: number;
  estimatedTime: number;
}

export default function FacebookComprehensiveTab() {
  const [userData, setUserData] = useState<ComprehensiveUserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress>({
    isRunning: false,
    currentMethod: '',
    progress: 0,
    totalMethods: 5,
    estimatedTime: 0
  });
  const [stats, setStats] = useState<ExtractionStats>({
    total_users: 0,
    high_confidence: 0,
    verified_emails: 0,
    verified_phones: 0,
    multiple_sources: 0
  });
  const [selectedMethods, setSelectedMethods] = useState({
    leadAds: true,
    whatsapp: true,
    instagram: true,
    textMining: true,
    interactions: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState<number>(0);

  useEffect(() => {
    loadComprehensiveData();
  }, []);

  const loadComprehensiveData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/facebook/comprehensive-extraction');
      if (response.ok) {
        const data = await response.json();
        setUserData(data.users || []);
        setStats(data.stats || {
          total_users: 0,
          high_confidence: 0,
          verified_emails: 0,
          verified_phones: 0,
          multiple_sources: 0
        });
      }
    } catch (error) {
      console.error('Error loading comprehensive data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startComprehensiveExtraction = async () => {
    const activeMethods = Object.entries(selectedMethods)
      .filter(([_, enabled]) => enabled)
      .map(([method, _]) => method);

    if (activeMethods.length === 0) {
      alert('Please select at least one extraction method.');
      return;
    }

    setExtractionProgress({
      isRunning: true,
      currentMethod: activeMethods[0] || 'Unknown',
      progress: 0,
      totalMethods: activeMethods.length,
      estimatedTime: activeMethods.length * 30 // 30 seconds per method estimate
    });

    try {
      const response = await fetch('/api/facebook/comprehensive-extraction/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          extractionMethods: activeMethods,
          mergeData: true,
          removeAliases: true
        }),
      });

      if (response.ok) {
        // Monitor extraction progress
        monitorExtractionProgress();
      }
    } catch (error) {
      console.error('Error starting comprehensive extraction:', error);
      setExtractionProgress(prev => ({ ...prev, isRunning: false }));
    }
  };

  const monitorExtractionProgress = async () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/facebook/comprehensive-extraction/progress');
        if (response.ok) {
          const progress = await response.json();
          
          setExtractionProgress(prev => ({
            ...prev,
            currentMethod: progress.currentMethod,
            progress: progress.completed,
            estimatedTime: progress.estimatedTimeRemaining
          }));

          if (progress.completed >= progress.total) {
            clearInterval(interval);
            setExtractionProgress(prev => ({ ...prev, isRunning: false }));
            loadComprehensiveData(); // Refresh data
          }
        }
      } catch (error) {
        console.error('Error monitoring progress:', error);
        clearInterval(interval);
        setExtractionProgress(prev => ({ ...prev, isRunning: false }));
      }
    }, 2000);
  };

  const exportData = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const response = await fetch(`/api/facebook/comprehensive-extraction/export?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comprehensive-user-data-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const requestGDPRDeletion = async (userId: string) => {
    try {
      const response = await fetch(`/api/facebook/comprehensive-extraction/gdpr-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setUserData(prev => prev.map(user => 
          user.id === userId ? { ...user, gdpr_status: 'REQUESTED_DELETION' } : user
        ));
      }
    } catch (error) {
      console.error('Error requesting GDPR deletion:', error);
    }
  };

  const filteredUsers = userData.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesConfidence = user.confidence_score >= confidenceFilter;
    
    return matchesSearch && matchesConfidence && user.gdpr_status === 'ACTIVE';
  });

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBackground = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <TailwindCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Comprehensive User Data Extraction</h2>
              <p className="text-sm text-gray-600">
                Combine all extraction methods for maximum data coverage (up to 95% accuracy)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={loadComprehensiveData}
                disabled={loading || extractionProgress.isRunning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? '🔄 Loading...' : '🔄 Refresh'}
              </Button>
              <Button
                onClick={() => exportData('csv')}
                disabled={userData.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                📊 Export CSV
              </Button>
              <Button
                onClick={() => exportData('json')}
                disabled={userData.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                📄 Export JSON
              </Button>
            </div>
          </div>

          {/* Extraction Methods Selection */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Extraction Methods</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(selectedMethods).map(([method, enabled]) => (
                <label key={method} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setSelectedMethods(prev => ({
                      ...prev,
                      [method]: e.target.checked
                    }))}
                    disabled={extractionProgress.isRunning}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {method === 'leadAds' && '🎯 Lead Ads (95%)'}
                    {method === 'whatsapp' && '📱 WhatsApp (85%)'}
                    {method === 'instagram' && '📸 Instagram (70%)'}
                    {method === 'textMining' && '🔍 Text Mining (60%)'}
                    {method === 'interactions' && '💬 Interactions (60%)'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              onClick={startComprehensiveExtraction}
              disabled={extractionProgress.isRunning || Object.values(selectedMethods).every(v => !v)}
              className="bg-red-600 hover:bg-red-700"
            >
              {extractionProgress.isRunning ? '⏳ Extracting...' : '🚀 Start Comprehensive Extraction'}
            </Button>

            <div className="flex items-center gap-4">
              <div>
                <label htmlFor="confidence-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Min. Confidence
                </label>
                <select
                  id="confidence-filter"
                  value={confidenceFilter}
                  onChange={(e) => setConfidenceFilter(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value={0}>All (0%+)</option>
                  <option value={50}>Medium (50%+)</option>
                  <option value={70}>High (70%+)</option>
                  <option value={90}>Very High (90%+)</option>
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Users
                </label>
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by username, email, phone, or name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </TailwindCard>

      {/* Extraction Progress */}
      {extractionProgress.isRunning && (
        <TailwindCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-900">Extraction in Progress</h3>
              <div className="text-sm text-gray-600">
                {Math.round((extractionProgress.progress / extractionProgress.totalMethods) * 100)}% Complete
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${(extractionProgress.progress / extractionProgress.totalMethods) * 100}%` 
                }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Current: {extractionProgress.currentMethod}</span>
              <span>~{extractionProgress.estimatedTime}s remaining</span>
            </div>
          </div>
        </TailwindCard>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <TailwindCard>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total_users}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
        </TailwindCard>
        <TailwindCard>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.high_confidence}</div>
            <div className="text-sm text-gray-600">High Confidence</div>
          </div>
        </TailwindCard>
        <TailwindCard>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.verified_emails}</div>
            <div className="text-sm text-gray-600">Verified Emails</div>
          </div>
        </TailwindCard>
        <TailwindCard>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.verified_phones}</div>
            <div className="text-sm text-gray-600">Verified Phones</div>
          </div>
        </TailwindCard>
        <TailwindCard>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.multiple_sources}</div>
            <div className="text-sm text-gray-600">Multiple Sources</div>
          </div>
        </TailwindCard>
      </div>

      {/* Users Table */}
      <TailwindCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Comprehensive User Data</h3>
            <div className="text-sm text-gray-600">
              {filteredUsers.length} of {userData.length} users
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Loading comprehensive data...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {userData.length === 0 ? 'No data found. Start comprehensive extraction to begin.' : 'No users match your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Sources
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.username ? `@${user.username}` : user.full_name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            UID: {user.uid || user.id}
                          </div>
                          <div className="text-xs text-gray-400">
                            Updated: {new Date(user.last_updated).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {user.email && <div>📧 {user.email}</div>}
                          {user.phone && <div>📱 {user.phone}</div>}
                          {!user.email && !user.phone && <div className="text-gray-400">No contact info</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.data_sources.leadAds && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              🎯 Lead
                            </span>
                          )}
                          {user.data_sources.whatsapp && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              📱 WA
                            </span>
                          )}
                          {user.data_sources.instagram && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800">
                              📸 IG
                            </span>
                          )}
                          {user.data_sources.textMining && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              🔍 Text
                            </span>
                          )}
                          {user.data_sources.interactions && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              💬 Int
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceBackground(user.confidence_score)} ${getConfidenceColor(user.confidence_score)}`}>
                          {user.confidence_score}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button
                          onClick={() => requestGDPRDeletion(user.id)}
                          className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1"
                        >
                          🗑️ GDPR Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </TailwindCard>

      {/* Info Card */}
      <TailwindCard>
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Comprehensive Data Extraction</h3>
              <p className="text-sm text-gray-700">
                This tab combines all extraction methods to provide the most comprehensive user data collection possible. 
                The system automatically deduplicates users across different sources and provides confidence scoring. 
                Lead Ads provide the highest accuracy (95%), followed by WhatsApp Business (85%), Instagram (70%), 
                and text mining (60%). Using multiple methods together can achieve up to 95% overall coverage for publicly available data.
              </p>
              <div className="mt-2 text-xs text-gray-600">
                <strong>Privacy Compliance:</strong> All data collection follows GDPR regulations with deletion options available. 
                Users can request data removal at any time.
              </div>
            </div>
          </div>
        </div>
      </TailwindCard>
    </div>
  );
}
