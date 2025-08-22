'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/tailwind-ui';
import { TailwindCard } from '@/components/ui/TailwindCard';
import { usePermissions } from '@/hooks/usePermissions';

interface FacebookConfig {
  appId: string;
  appSecret: string;
  shortLivedToken: string;
  longLivedToken: string;
  apiVersion: string;
}

interface SyncProgress {
  stage: 'idle' | 'token-check' | 'pages' | 'posts' | 'comments' | 'messages' | 'completed';
  total: number;
  current: number;
  isActive: boolean;
  message: string;
  error?: string;
}

interface SyncData {
  pages: any[];
  posts: any[];
  comments: any[];
  messages: any[];
}

interface FacebookSyncTabProps {
  config: FacebookConfig;
}

export default function FacebookSyncTab({ config }: FacebookSyncTabProps) {
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  
  const [progress, setProgress] = useState<SyncProgress>({
    stage: 'idle',
    total: 0,
    current: 0,
    isActive: false,
    message: 'Ready to sync'
  });

  const [syncData, setSyncData] = useState<SyncData>({
    pages: [],
    posts: [],
    comments: [],
    messages: []
  });

  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  // Permission check
  const canSyncFacebook = hasPermission('admin.social.facebook.sync');

  if (permissionsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading permissions...</span>
      </div>
    );
  }

  if (!canSyncFacebook) {
    return (
      <TailwindCard>
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">
            You don't have permission to sync Facebook data.
          </p>
        </div>
      </TailwindCard>
    );
  }

  // Check if we have necessary tokens
  const hasShortToken = !!config.shortLivedToken;
  const hasLongToken = !!config.longLivedToken;
  const hasRequiredConfig = !!config.appId && !!config.appSecret;

  const generateLongLivedToken = async (shortToken: string) => {
    setIsGeneratingToken(true);
    try {
      const response = await fetch('/api/admin/social/facebook/token/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortToken,
          appId: config.appId,
          appSecret: config.appSecret
        })
      });

      const data = await response.json();
      if (data.success) {
        // Save to localStorage
        localStorage.setItem('NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN', data.longLivedToken);
        setProgress(prev => ({ ...prev, message: 'Long-lived token generated successfully!' }));
        return data.longLivedToken;
      } else {
        throw new Error(data.error || 'Failed to generate long-lived token');
      }
    } catch (error) {
      console.error('Token generation error:', error);
      setProgress(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Token generation failed' 
      }));
      return null;
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const startSync = async () => {
    let effectiveToken = config.longLivedToken || config.shortLivedToken;
    
    // If no short token, show dialog
    if (!effectiveToken) {
      setShowTokenDialog(true);
      return;
    }

    // If only short token, try to generate long-lived token
    if (!config.longLivedToken && config.shortLivedToken) {
      setProgress(prev => ({ ...prev, stage: 'token-check', message: 'Generating long-lived token...', isActive: true }));
      const longToken = await generateLongLivedToken(config.shortLivedToken);
      if (longToken) {
        effectiveToken = longToken;
      }
    }

    if (!effectiveToken) {
      setProgress(prev => ({ ...prev, error: 'No valid token available', isActive: false }));
      return;
    }

    // Start the sync process
    setProgress({
      stage: 'pages',
      total: 4, // pages, posts, comments, messages
      current: 0,
      isActive: true,
      message: 'Starting sync process...'
    });

    try {
      // Step 1: Sync Pages
      setProgress(prev => ({ ...prev, stage: 'pages', current: 1, message: 'Syncing Facebook pages...' }));
      const pagesResponse = await fetch('/api/admin/social/facebook/sync/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: effectiveToken })
      });
      const pagesData = await pagesResponse.json();
      
      if (!pagesData.success) {
        throw new Error(pagesData.error || 'Failed to sync pages');
      }

      setSyncData(prev => ({ ...prev, pages: pagesData.pages || [] }));

      // Step 2: Sync Posts
      setProgress(prev => ({ ...prev, stage: 'posts', current: 2, message: 'Syncing posts...' }));
      const postsResponse = await fetch('/api/admin/social/facebook/sync/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accessToken: effectiveToken,
          pageIds: pagesData.pages?.map((p: any) => p.facebookPageId) || []
        })
      });
      const postsData = await postsResponse.json();
      
      if (!postsData.success) {
        throw new Error(postsData.error || 'Failed to sync posts');
      }

      setSyncData(prev => ({ ...prev, posts: postsData.posts || [] }));

      // Step 3: Sync Comments
      setProgress(prev => ({ ...prev, stage: 'comments', current: 3, message: 'Syncing comments...' }));
      const commentsResponse = await fetch('/api/admin/social/facebook/sync/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accessToken: effectiveToken,
          postIds: postsData.posts?.map((p: any) => p.facebookPostId) || []
        })
      });
      const commentsData = await commentsResponse.json();
      
      setSyncData(prev => ({ ...prev, comments: commentsData.comments || [] }));

      // Step 4: Sync Messages
      setProgress(prev => ({ ...prev, stage: 'messages', current: 4, message: 'Syncing messages...' }));
      const messagesResponse = await fetch('/api/admin/social/facebook/sync/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accessToken: effectiveToken,
          pageIds: pagesData.pages?.map((p: any) => p.facebookPageId) || []
        })
      });
      const messagesData = await messagesResponse.json();
      
      setSyncData(prev => ({ ...prev, messages: messagesData.messages || [] }));

      // Completed
      setProgress({
        stage: 'completed',
        total: 4,
        current: 4,
        isActive: false,
        message: 'Sync completed successfully!'
      });

    } catch (error) {
      console.error('Sync error:', error);
      setProgress(prev => ({
        ...prev,
        isActive: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      }));
    }
  };

  const handleManualTokenSubmit = async () => {
    if (!manualToken.trim()) {
      alert('Please enter a token');
      return;
    }

    // Save manual token to localStorage
    localStorage.setItem('NEXT_PUBLIC_FACEBOOK_SHORT_LIVED_TOKEN', manualToken);
    
    // Try to generate long-lived token
    const longToken = await generateLongLivedToken(manualToken);
    
    setShowTokenDialog(false);
    setManualToken('');
    
    // Start sync with the new token
    if (longToken) {
      // Update config and start sync
      const updatedConfig = { ...config, shortLivedToken: manualToken, longLivedToken: longToken };
      // Restart sync process
      setTimeout(() => startSync(), 1000);
    }
  };

  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  const SyncTable = ({ title, data, columns }: { title: string; data: any[]; columns: { key: string; label: string }[] }) => (
    <TailwindCard>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title} ({data.length})</h3>
        
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map(column => (
                    <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.slice(0, 10).map((item, index) => (
                  <tr key={index}>
                    {columns.map(column => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {column.key.includes('Time') 
                          ? new Date(item[column.key]).toLocaleDateString()
                          : String(item[column.key] || '-').slice(0, 50)
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 10 && (
              <div className="px-6 py-3 text-sm text-gray-500 bg-gray-50">
                Showing 10 of {data.length} items
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No data available
          </div>
        )}
      </div>
    </TailwindCard>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Facebook Data Sync</h2>
        <p className="text-gray-600">Synchronize Facebook pages, posts, comments, and messages</p>
      </div>

      {/* Token Status & Controls */}
      <TailwindCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Controls</h3>
          
          {/* Token Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${hasRequiredConfig ? 'bg-green-500' : 'bg-red-500'}`} />
              <div className="text-sm text-gray-600">App Config</div>
              <div className={`text-xs font-medium ${hasRequiredConfig ? 'text-green-600' : 'text-red-600'}`}>
                {hasRequiredConfig ? 'Ready' : 'Missing'}
              </div>
            </div>
            
            <div className="text-center">
              <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${hasShortToken ? 'bg-green-500' : 'bg-red-500'}`} />
              <div className="text-sm text-gray-600">Short Token</div>
              <div className={`text-xs font-medium ${hasShortToken ? 'text-green-600' : 'text-red-600'}`}>
                {hasShortToken ? 'Available' : 'Missing'}
              </div>
            </div>
            
            <div className="text-center">
              <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${hasLongToken ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <div className="text-sm text-gray-600">Long Token</div>
              <div className={`text-xs font-medium ${hasLongToken ? 'text-green-600' : 'text-yellow-600'}`}>
                {hasLongToken ? 'Available' : 'Can Generate'}
              </div>
            </div>
            
            <div className="text-center">
              <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${progress.stage === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div className="text-sm text-gray-600">Sync Status</div>
              <div className={`text-xs font-medium ${progress.stage === 'completed' ? 'text-green-600' : 'text-gray-600'}`}>
                {progress.isActive ? 'In Progress' : progress.stage === 'completed' ? 'Completed' : 'Ready'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {progress.isActive && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{progress.message}</span>
                <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Display */}
          {progress.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-800">{progress.error}</div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-4">
            <Button
              variant="primary"
              onClick={startSync}
              disabled={progress.isActive || !hasRequiredConfig}
            >
              {progress.isActive ? 'Syncing...' : 'Start Sync'}
            </Button>
            
            {!hasShortToken && (
              <Button
                variant="outline"
                onClick={() => setShowTokenDialog(true)}
              >
                Enter Token
              </Button>
            )}
            
            {hasShortToken && !hasLongToken && (
              <Button
                variant="outline"
                onClick={() => generateLongLivedToken(config.shortLivedToken)}
                disabled={isGeneratingToken}
              >
                {isGeneratingToken ? 'Generating...' : 'Generate Long Token'}
              </Button>
            )}
          </div>
        </div>
      </TailwindCard>

      {/* Sync Results Tables */}
      <div className="space-y-6">
        <SyncTable
          title="Facebook Pages"
          data={syncData.pages}
          columns={[
            { key: 'name', label: 'Page Name' },
            { key: 'category', label: 'Category' },
            { key: 'fanCount', label: 'Fans' },
            { key: 'followersCount', label: 'Followers' },
            { key: 'updatedAt', label: 'Updated' }
          ]}
        />

        <SyncTable
          title="Posts"
          data={syncData.posts}
          columns={[
            { key: 'message', label: 'Message' },
            { key: 'createdTime', label: 'Created' },
            { key: 'likesCount', label: 'Likes' },
            { key: 'commentsCount', label: 'Comments' },
            { key: 'sharesCount', label: 'Shares' }
          ]}
        />

        <SyncTable
          title="Comments"
          data={syncData.comments}
          columns={[
            { key: 'fromName', label: 'From' },
            { key: 'message', label: 'Comment' },
            { key: 'createdTime', label: 'Created' },
            { key: 'likesCount', label: 'Likes' }
          ]}
        />

        <SyncTable
          title="Messages"
          data={syncData.messages}
          columns={[
            { key: 'fromName', label: 'From' },
            { key: 'message', label: 'Message' },
            { key: 'createdTime', label: 'Created' },
            { key: 'messageType', label: 'Type' }
          ]}
        />
      </div>

      {/* Token Input Dialog */}
      {showTokenDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Facebook Token</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please enter a Facebook short-lived access token to proceed with sync.
            </p>
            
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Enter Facebook access token"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTokenDialog(false);
                  setManualToken('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleManualTokenSubmit}
                disabled={!manualToken.trim()}
              >
                Submit & Generate Long Token
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
