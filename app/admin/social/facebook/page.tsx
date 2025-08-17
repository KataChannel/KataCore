'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Input,
  Select,
  Option,
  Table,
  Chip,
  LinearProgress,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Alert,
  IconButton,
  Tooltip,
  Badge,
  AspectRatio,
  Sheet
} from '@mui/joy';
import { 
  RefreshRounded,
  DownloadRounded,
  VisibilityRounded,
  PhoneRounded,
  AccessTimeRounded,
  PersonRounded,
  ChatBubbleRounded,
  ThumbUpRounded,
  FacebookRounded,
  TuneRounded,
  NavigateBeforeRounded,
  NavigateNextRounded,
  ErrorRounded,
  CheckCircleRounded,
  SettingsRounded,
  ShowChartRounded,
  BarChartRounded,
  TrendingUpRounded,
  GroupRounded,
  SearchRounded,
  KeyboardArrowUpRounded,
  KeyboardArrowDownRounded,
  ContentCopyRounded
} from '@mui/icons-material';

interface FacebookStats {
  totalPages: number;
  totalPosts: number;
  totalComments: number;
  totalMessages: number;
  totalConversations: number;
  totalInteractions: number;
}

interface UserData {
  pageId: string;
  pageName: string;
  userId: string;
  userName: string;
  userLink: string;
  phone?: string;
  firstTime: Date;
  lastTime: Date;
  totalInteractions: number;
  commentCount: number;
  messageCount: number;
}

interface SyncResult {
  success: boolean;
  type: string;
  synced: number;
  processed: number;
  errors: string[];
  userDataExtracted: number;
  message: string;
}

interface SyncStatus {
  isActive: boolean;
  currentType?: string;
  progress: number;
  message: string;
  startTime?: Date;
  estimatedTimeRemaining?: number;
  processedCount: number;
  totalCount: number;
  errors: string[];
  lastSyncTime?: Date;
  syncHistory: Array<{
    type: string;
    startTime: Date;
    endTime: Date;
    success: boolean;
    itemsProcessed: number;
    errors: string[];
  }>;
}

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export default function AdminFacebookPage() {
  const [stats, setStats] = useState<FacebookStats | null>(null);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string>('all-pages');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('totalInteractions');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [pages, setPages] = useState<Array<{id: string, name: string}>>([]);
  
  // New state for sync progress and status
  const [syncProgress, setSyncProgress] = useState<SyncStatus>({
    isActive: false,
    progress: 0,
    message: '',
    processedCount: 0,
    totalCount: 0,
    errors: [],
    syncHistory: []
  });

  // New state for pagination
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 25,
    totalItems: 0
  });

  // New state for live updates
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Load initial data
  useEffect(() => {
    loadStats();
    loadUserData();
    loadPages();
    loadSyncStatus();
  }, []);

    // Auto refresh functionality
  useEffect(() => {
    if (autoRefresh && !syncLoading) {
      const interval = setInterval(() => {
        loadStats();
        loadSyncStatus();
        if (!syncProgress.isActive) {
          loadUserData();
        }
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, syncLoading]);

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard:', text);
      // You can add a toast notification here if needed
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // Reload data when filters change
  useEffect(() => {
    loadUserData();
  }, [selectedPage, searchTerm, filterType, sortField, sortDirection, pagination.currentPage, pagination.pageSize]);

  const loadSyncStatus = async () => {
    try {
      const response = await fetch('/api/admin/social/facebook/sync/status');
      const data = await response.json();
      
      if (data.success) {
        setSyncProgress(prev => ({
          ...prev,
          lastSyncTime: data.lastSync ? new Date(data.lastSync) : undefined,
          isActive: data.isActive || false
        }));
        
        if (data.lastSync) {
          setLastSyncTime(new Date(data.lastSync));
        }
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/social/facebook/sync');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadUserData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('type', 'summary');
      params.append('page', pagination.currentPage.toString());
      params.append('limit', pagination.pageSize.toString());
      params.append('sortField', sortField);
      params.append('sortDirection', sortDirection);
      
      if (selectedPage && selectedPage !== 'all-pages') params.append('pageId', selectedPage);
      if (searchTerm) params.append('search', searchTerm);
      if (filterType !== 'all') params.append('filter', filterType);
      
      const response = await fetch(`/api/admin/social/facebook/data?${params}`);
      const data = await response.json();
      console.log('User data loaded:', data);
      
      if (data.success) {
        setUserData(data.userData || data.data || []);
        setPagination(prev => ({
          ...prev,
          totalItems: data.totalCount || 0
        }));
      } else {
        console.error('Failed to load user data');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPages = async () => {
    try {
      const response = await fetch('/api/admin/social/facebook/data?type=pages');
      const data = await response.json();
      
      if (data.success && data.pagesData) {
        setPages(data.pagesData.map((page: any) => ({
          id: page.facebookPageId,
          name: page.name
        })));
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
  };

  const handleSync = async (type: string) => {
    setSyncLoading(true);
    setSyncProgress({
      isActive: true,
      currentType: type,
      progress: 0,
      message: `Initializing ${type} sync...`,
      processedCount: 0,
      totalCount: 0,
      errors: [],
      startTime: new Date(),
      syncHistory: []
    });

    try {
      // Start the sync process
      const body: any = { type };
      if (selectedPage && selectedPage !== 'all-pages') body.pageId = selectedPage;
      
      setSyncProgress(prev => ({
        ...prev,
        progress: 10,
        message: `Connecting to Facebook API...`
      }));

      const response = await fetch('/api/admin/social/facebook/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      setSyncProgress(prev => ({
        ...prev,
        progress: 30,
        message: `Processing ${type} data...`
      }));

      const result: SyncResult = await response.json();
      
      setSyncProgress(prev => ({
        ...prev,
        progress: 80,
        message: `Finalizing sync...`
      }));

      if (result.success) {
        setSyncProgress(prev => ({
          ...prev,
          progress: 100,
          message: `Sync completed successfully!`,
          processedCount: result.synced || 0,
          totalCount: result.processed || 0
        }));

        console.log(result.message);
        if (result.userDataExtracted > 0) {
          console.log(`Extracted ${result.userDataExtracted} user data records`);
        }
        
        // Reload data after successful sync
        await loadStats();
        await loadUserData();
        setLastSyncTime(new Date());
      } else {
        setSyncProgress(prev => ({
          ...prev,
          progress: 100,
          message: `Sync failed`,
          errors: result.errors || ['Unknown error occurred']
        }));
        console.error(`Sync failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      setSyncProgress(prev => ({
        ...prev,
        progress: 100,
        message: `Sync failed`,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      }));
      console.error('Sync failed:', error);
    } finally {
      setSyncLoading(false);
      
      // Clear progress after 3 seconds
      setTimeout(() => {
        setSyncProgress(prev => ({
          ...prev,
          isActive: false,
          progress: 0,
          message: '',
          processedCount: 0,
          totalCount: 0,
          errors: []
        }));
      }, 3000);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPagination(prev => ({ 
      ...prev, 
      itemsPerPage: newSize,
      currentPage: 1,
      totalPages: Math.ceil(prev.totalItems / newSize)
    }));
  };

  const exportData = async () => {
    try {
      const params = new URLSearchParams();
      params.append('type', 'summary');
      if (selectedPage && selectedPage !== 'all-pages') params.append('pageId', selectedPage);
      if (searchTerm) params.append('search', searchTerm);
      if (filterType !== 'all') params.append('filter', filterType);
      params.append('export', 'true');
      
      const response = await fetch(`/api/admin/social/facebook/data?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `facebook-user-data-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        console.log('Data exported successfully');
      } else {
        console.error('Export failed');
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const filteredData = userData.filter(user => {
    const matchesSearch = !searchTerm || 
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.pageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm) ||
      user.userId.includes(searchTerm);
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'phone' && user.phone) ||
      (filterType === 'no-phone' && !user.phone) ||
      (filterType === 'comment' && user.commentCount > 0) ||
      (filterType === 'message' && user.messageCount > 0) ||
      (filterType === 'high-interaction' && user.totalInteractions >= 10);
    
    return matchesSearch && matchesFilter;
  });

  // Helper functions for pagination and filtering
  const getCurrentPageUsers = () => {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredData.slice(startIndex, endIndex);
  };

  const getPageNumbers = (): (number | string)[] => {
    const totalPages = Math.ceil(filteredData.length / pagination.pageSize);
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, pagination.currentPage - delta); 
         i <= Math.min(totalPages - 1, pagination.currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (pagination.currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (pagination.currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((item, index, arr) => 
      item !== arr[index - 1] && totalPages > 1
    );
  };

  // Auto refresh functionality
  useEffect(() => {
    if (autoRefresh && !syncLoading) {
      const interval = setInterval(() => {
        loadStats();
        loadUserData();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, syncLoading]);

  return (
    <Box className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <Box className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Box className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Box>
            <Typography 
              level="h1" 
              className="text-3xl font-bold text-gray-900 flex items-center gap-3"
            >
              <FacebookRounded className="text-4xl text-blue-600" />
              Facebook Social Management
            </Typography>
            <Typography level="body-md" className="text-gray-600 mt-2">
              Manage Facebook fanpages, sync data, and extract user information
            </Typography>
          </Box>
          <Box className="flex gap-2">
            <Button
              variant="outlined"
              startDecorator={<RefreshRounded />}
              onClick={() => loadUserData()}
              size="sm"
              className="bg-white hover:bg-gray-50"
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startDecorator={<DownloadRounded />}
              onClick={exportData}
              size="sm"
              className="bg-white hover:bg-gray-50"
            >
              Export CSV
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        {stats && (
          <Box className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
          <Box className="flex items-center gap-3">
            <FacebookRounded className="text-3xl text-blue-600" />
            <Box>
              <Typography level="h2" className="text-2xl font-bold text-gray-900">
                {stats.totalPages}
              </Typography>
              <Typography level="body-sm" className="text-gray-600">
                Pages
              </Typography>
            </Box>
          </Box>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
          <Box className="flex items-center gap-3">
            <ChatBubbleRounded className="text-3xl text-green-600" />
            <Box>
              <Typography level="h2" className="text-2xl font-bold text-gray-900">
                {stats.totalPosts}
              </Typography>
              <Typography level="body-sm" className="text-gray-600">
                Posts
              </Typography>
            </Box>
          </Box>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
          <Box className="flex items-center gap-3">
            <ThumbUpRounded className="text-3xl text-orange-600" />
            <Box>
              <Typography level="h2" className="text-2xl font-bold text-gray-900">
                {stats.totalComments}
              </Typography>
              <Typography level="body-sm" className="text-gray-600">
                Comments
              </Typography>
            </Box>
          </Box>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
          <Box className="flex items-center gap-3">
            <ChatBubbleRounded className="text-3xl text-purple-600" />
            <Box>
              <Typography level="h2" className="text-2xl font-bold text-gray-900">
                {stats.totalMessages}
              </Typography>
              <Typography level="body-sm" className="text-gray-600">
                Messages
              </Typography>
            </Box>
          </Box>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
          <Box className="flex items-center gap-3">
            <PersonRounded className="text-3xl text-indigo-600" />
            <Box>
              <Typography level="h2" className="text-2xl font-bold text-gray-900">
                {stats.totalConversations}
              </Typography>
              <Typography level="body-sm" className="text-gray-600">
                Conversations
              </Typography>
            </Box>
          </Box>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
          <Box className="flex items-center gap-3">
            <VisibilityRounded className="text-3xl text-red-600" />
            <Box>
              <Typography level="h2" className="text-2xl font-bold text-gray-900">
                {stats.totalInteractions}
              </Typography>
              <Typography level="body-sm" className="text-gray-600">
                Interactions
              </Typography>
            </Box>
          </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Sync Controls */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6 space-y-4">
            <Box className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Box>
                <Typography level="h3" className="text-xl font-bold flex items-center gap-2 text-gray-900">
                  <ShowChartRounded className="text-blue-600" />
                  Sync Operations
                </Typography>
                <Typography level="body-md" className="text-gray-600 mt-1">
                  Sync Facebook data and extract user information
                </Typography>
              </Box>
              <Box className="flex items-center gap-3">
                <Button
                  variant={autoRefresh ? "solid" : "outlined"}
                  startDecorator={<RefreshRounded />}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  size="sm"
                  color={autoRefresh ? "success" : "neutral"}
                  className={autoRefresh ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
                </Button>
                {lastSyncTime && (
                  <Typography level="body-sm" className="text-gray-500">
                    Last sync: {lastSyncTime.toLocaleTimeString()}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Sync Progress */}
            {syncProgress.isActive && (
              <Alert 
                color="primary" 
                variant="soft"
                startDecorator={<RefreshRounded className="animate-spin" />}
                className="border border-blue-200"
              >
                <Box className="w-full">
                  <Box className="flex items-center justify-between mb-3">
                    <Typography level="body-md" className="font-semibold text-blue-900">
                      Syncing {syncProgress.currentType || 'data'}...
                    </Typography>
                    <Typography level="body-sm" className="text-blue-700">
                      {syncProgress.progress}%
                    </Typography>
                  </Box>
                  
                  <LinearProgress 
                    determinate 
                    value={syncProgress.progress} 
                    className="mb-3"
                    color="primary"
                  />
                  
                  <Box className="flex items-center justify-between mb-2">
                    <Typography level="body-sm" className="text-blue-700">
                      {syncProgress.message}
                    </Typography>
                    {syncProgress.totalCount > 0 && (
                      <Typography level="body-sm" className="text-blue-600">
                        {syncProgress.processedCount}/{syncProgress.totalCount} items
                      </Typography>
                    )}
                  </Box>
                  
                  {syncProgress.startTime && (
                    <Typography level="body-xs" className="text-blue-600">
                      Started: {syncProgress.startTime.toLocaleTimeString()}
                      {syncProgress.estimatedTimeRemaining && (
                        <span> • Est. {Math.round(syncProgress.estimatedTimeRemaining / 1000)}s remaining</span>
                      )}
                    </Typography>
                  )}
                  
                  {syncProgress.errors.length > 0 && (
                    <Alert color="danger" variant="soft" className="mt-3">
                      <Box>
                        <Typography level="body-sm" className="font-semibold flex items-center gap-1">
                          <ErrorRounded />
                          Errors encountered:
                        </Typography>
                        <Box component="ul" className="mt-1 text-sm list-disc list-inside">
                          {syncProgress.errors.map((error: string, index: number) => (
                            <li key={index}>{error}</li>
                          ))}
                        </Box>
                      </Box>
                    </Alert>
                  )}
                </Box>
              </Alert>
            )}

            <Box className="flex flex-wrap gap-4 items-center">
              <Select 
                value={selectedPage} 
                onChange={(_, value) => setSelectedPage(value || 'all-pages')}
                disabled={syncLoading}
                placeholder="Select page (optional)"
                className="min-w-48"
              >
                <Option value="all-pages">🌐 All pages ({pages.length} pages)</Option>
                {pages.map(page => (
                  <Option key={page.id} value={page.id}>
                    📘 {page.name}
                  </Option>
                ))}
              </Select>
              
              <Box className="flex gap-2 flex-wrap">
                <Button 
                  onClick={() => handleSync('fanpages')} 
                  disabled={syncLoading}
                  variant="outlined"
                  startDecorator={syncLoading ? <RefreshRounded className="animate-spin" /> : <FacebookRounded />}
                  className="hover:bg-blue-50"
                >
                  Sync Pages
                  {selectedPage !== 'all-pages' && <Chip size="sm" color="primary">Selected</Chip>}
                </Button>
                
                <Button 
                  onClick={() => handleSync('posts')} 
                  disabled={syncLoading}
                  variant="outlined"
                  startDecorator={syncLoading ? <RefreshRounded className="animate-spin" /> : <ChatBubbleRounded />}
                  className="hover:bg-green-50"
                >
                  Sync Posts
                  {selectedPage !== 'all-pages' && <Chip size="sm" color="success">Selected</Chip>}
                </Button>
                
                <Button 
                  onClick={() => handleSync('comments')} 
                  disabled={syncLoading}
                  variant="outlined"
                  startDecorator={syncLoading ? <RefreshRounded className="animate-spin" /> : <ThumbUpRounded />}
                  className="hover:bg-orange-50"
                >
                  Sync Comments
                  {selectedPage !== 'all-pages' && <Chip size="sm" color="warning">Selected</Chip>}
                </Button>
                
                <Button 
                  onClick={() => handleSync('messages')} 
                  disabled={syncLoading}
                  variant="outlined"
                  startDecorator={syncLoading ? <RefreshRounded className="animate-spin" /> : <ChatBubbleRounded />}
                  className="hover:bg-purple-50"
                >
                  Sync Messages
                  {selectedPage !== 'all-pages' && <Chip size="sm" color="neutral">Selected</Chip>}
                </Button>
                
                <Button 
                  onClick={() => handleSync('all')} 
                  disabled={syncLoading}
                  variant="solid"
                  startDecorator={syncLoading ? <RefreshRounded className="animate-spin" /> : <RefreshRounded />}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Sync All
                  {selectedPage !== 'all-pages' ? (
                    <Chip size="sm" color="primary" variant="solid">Selected Page</Chip>
                  ) : (
                    <Chip size="sm" color="neutral" variant="solid">All Pages</Chip>
                  )}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* User Data Analysis */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            {/* Advanced Filter Controls */}
            <Box className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
              <Box>
                <Typography level="h3" className="text-xl font-bold flex items-center gap-2 text-gray-900">
                  <GroupRounded className="text-green-600" />
                  User Data Analysis
                  <Chip color="primary" variant="soft" size="sm">
                    {filteredData.length} records
                  </Chip>
                </Typography>
                <Typography level="body-md" className="text-gray-600 mt-1">
                  Comprehensive data processing and extraction from Facebook interactions
                </Typography>
              </Box>
              
              <Box className="flex items-center gap-3 flex-wrap">
                {/* Quick Stats */}
                <Box className="flex gap-2">
                  <Chip color="success" variant="soft" size="sm">
                    📞 {userData.filter(u => u.phone).length} with phone
                  </Chip>
                  <Chip color="warning" variant="soft" size="sm">
                    💬 {userData.filter(u => u.commentCount > 0).length} commenters
                  </Chip>
                  <Chip color="neutral" variant="soft" size="sm">
                    📧 {userData.filter(u => u.messageCount > 0).length} messagers
                  </Chip>
                </Box>
              </Box>
            </Box>

            {/* Filter and Search Controls */}
            <Box className="flex flex-col lg:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
              <Box className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select 
                  value={filterType} 
                  onChange={(_, value) => setFilterType(value || 'all')}
                  placeholder="Filter by type"
                  startDecorator={<TuneRounded />}
                >
                  <Option value="all">🌐 All records</Option>
                  <Option value="phone">📞 Has phone ({userData.filter(u => u.phone).length})</Option>
                  <Option value="no-phone">❌ No phone ({userData.filter(u => !u.phone).length})</Option>
                  <Option value="comment">💬 Comments only ({userData.filter(u => u.commentCount > 0).length})</Option>
                  <Option value="message">📧 Messages only ({userData.filter(u => u.messageCount > 0).length})</Option>
                  <Option value="high-interaction">🔥 High interaction (≥10)</Option>
                </Select>
                
                <Select 
                  value={selectedPage} 
                  onChange={(_, value) => setSelectedPage(value || 'all-pages')}
                  placeholder="Filter by page"
                  startDecorator={<FacebookRounded />}
                >
                  <Option value="all-pages">🌐 All pages</Option>
                  {pages.map(page => (
                    <Option key={page.id} value={page.id}>
                      📘 {page.name}
                    </Option>
                  ))}
                </Select>

                <Select 
                  value={`${sortField}-${sortDirection}`} 
                  onChange={(_, value) => {
                    const [field, direction] = (value || 'totalInteractions-desc').split('-');
                    setSortField(field || 'totalInteractions');
                    setSortDirection((direction as 'asc' | 'desc') || 'desc');
                  }}
                  placeholder="Sort by"
                  startDecorator={<BarChartRounded />}
                >
                  <Option value="totalInteractions-desc">🔥 Interactions ↓</Option>
                  <Option value="totalInteractions-asc">🔥 Interactions ↑</Option>
                  <Option value="lastTime-desc">⏰ Last activity ↓</Option>
                  <Option value="lastTime-asc">⏰ Last activity ↑</Option>
                  <Option value="firstTime-desc">📅 First seen ↓</Option>
                  <Option value="firstTime-asc">📅 First seen ↑</Option>
                  <Option value="userName-asc">👤 Name A-Z</Option>
                  <Option value="userName-desc">👤 Name Z-A</Option>
                  <Option value="pageName-asc">📘 Page A-Z</Option>
                  <Option value="pageName-desc">📘 Page Z-A</Option>
                </Select>
              </Box>
              
              <Box className="flex-1 max-w-md">
                <Input
                  placeholder="🔍 Search by name, phone, user ID, or page..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  startDecorator={<SearchRounded />}
                  endDecorator={
                    searchTerm && (
                      <IconButton 
                        size="sm" 
                        variant="plain"
                        onClick={() => setSearchTerm('')}
                      >
                        ❌
                      </IconButton>
                    )
                  }
                />
              </Box>
              
              <Box className="flex gap-2">
                <Button 
                  onClick={loadUserData} 
                  variant="outlined" 
                  startDecorator={<RefreshRounded />}
                  size="sm"
                  loading={loading}
                >
                  Apply
                </Button>
                
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setSelectedPage('all-pages');
                    setSortField('totalInteractions');
                    setSortDirection('desc');
                  }} 
                  variant="outlined" 
                  color="neutral"
                  size="sm"
                >
                  Clear
                </Button>
              </Box>
            </Box>

            {/* Enhanced User Data Table */}
            <Sheet 
              className="border rounded-lg overflow-hidden" 
              sx={{ 
                '& *': { userSelect: 'text !important' }, 
                '& button': { userSelect: 'none !important' },
                '& .copy-button': { userSelect: 'none !important' }
              }}
            >
              <Table hoverRow stickyHeader>
                <thead>
                  <tr>
                    <th className="p-3">
                      <Box className="flex items-center justify-between">
                        <Typography level="body-sm" className="font-semibold text-gray-700">
                          📘 Fanpage
                        </Typography>
                        <IconButton 
                          size="sm" 
                          onClick={() => handleSort('pageName')}
                          className="copy-button"
                        >
                          {sortField === 'pageName' && (
                            sortDirection === 'asc' ? 
                            <KeyboardArrowUpRounded /> : 
                            <KeyboardArrowDownRounded />
                          )}
                        </IconButton>
                      </Box>
                    </th>
                    <th className="p-3">
                      <Box className="flex items-center justify-between">
                        <Typography level="body-sm" className="font-semibold text-gray-700">
                          👤 User Info
                        </Typography>
                        <IconButton 
                          size="sm" 
                          onClick={() => handleSort('userName')}
                          className="copy-button"
                        >
                          {sortField === 'userName' && (
                            sortDirection === 'asc' ? 
                            <KeyboardArrowUpRounded /> : 
                            <KeyboardArrowDownRounded />
                          )}
                        </IconButton>
                      </Box>
                    </th>
                    <th className="p-3">
                      <Typography level="body-sm" className="font-semibold text-gray-700">
                        🔗 Profile Link
                      </Typography>
                    </th>
                    <th className="p-3">
                      <Typography level="body-sm" className="font-semibold text-gray-700">
                        📞 Phone
                      </Typography>
                    </th>
                    <th className="p-3">
                      <Box className="flex items-center justify-between">
                        <Typography level="body-sm" className="font-semibold text-gray-700">
                          📅 First Seen
                        </Typography>
                        <IconButton 
                          size="sm" 
                          onClick={() => handleSort('firstTime')}
                          className="copy-button"
                        >
                          {sortField === 'firstTime' && (
                            sortDirection === 'asc' ? 
                            <KeyboardArrowUpRounded /> : 
                            <KeyboardArrowDownRounded />
                          )}
                        </IconButton>
                      </Box>
                    </th>
                    <th className="p-3">
                      <Box className="flex items-center justify-between">
                        <Typography level="body-sm" className="font-semibold text-gray-700">
                          ⏰ Last Activity
                        </Typography>
                        <IconButton 
                          size="sm" 
                          onClick={() => handleSort('lastTime')}
                          className="copy-button"
                        >
                          {sortField === 'lastTime' && (
                            sortDirection === 'asc' ? 
                            <KeyboardArrowUpRounded /> : 
                            <KeyboardArrowDownRounded />
                          )}
                        </IconButton>
                      </Box>
                    </th>
                    <th className="p-3">
                      <Box className="flex items-center justify-between">
                        <Typography level="body-sm" className="font-semibold text-gray-700">
                          🔥 Interactions
                        </Typography>
                        <IconButton 
                          size="sm" 
                          onClick={() => handleSort('totalInteractions')}
                          className="copy-button"
                        >
                          {sortField === 'totalInteractions' && (
                            sortDirection === 'asc' ? 
                            <KeyboardArrowUpRounded /> : 
                            <KeyboardArrowDownRounded />
                          )}
                        </IconButton>
                      </Box>
                    </th>
                    <th className="p-3">
                      <Typography level="body-sm" className="font-semibold text-gray-700">
                        📊 Activity Types
                      </Typography>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8">
                        <Box className="flex flex-col items-center gap-3">
                          <RefreshRounded className="animate-spin text-blue-600 text-2xl" />
                          <Typography level="body-md">Loading user data...</Typography>
                        </Box>
                      </td>
                    </tr>
                  ) : getCurrentPageUsers().length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8">
                        <Typography level="body-md" className="text-gray-500">
                          {searchTerm || filterType !== 'all' ? 
                            '🔍 No results found for current filters' : 
                            '📭 No user data available'
                          }
                        </Typography>
                        {(searchTerm || filterType !== 'all') && (
                          <Button 
                            variant="outlined" 
                            size="sm" 
                            onClick={() => {
                              setSearchTerm('');
                              setFilterType('all');
                            }}
                            className="mt-2"
                          >
                            Clear filters
                          </Button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    getCurrentPageUsers().map((user, index) => (
                      <tr key={`${user.pageId}-${user.userId}`} className="hover:bg-gray-50 group">
                        <td className="p-3" style={{ userSelect: 'text' }}>
                          <Box className="flex items-center justify-between">
                            <Box>
                              <Typography level="body-sm" className="font-medium select-text">
                                {user.pageName}
                              </Typography>
                              <Typography level="body-xs" className="text-gray-500 select-text font-mono">
                                {user.pageId}
                              </Typography>
                            </Box>
                            <IconButton 
                              size="sm" 
                              variant="plain"
                              onClick={() => copyToClipboard(`${user.pageName}\n${user.pageId}`)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity copy-button"
                              title="Copy page info"
                            >
                              <ContentCopyRounded />
                            </IconButton>
                          </Box>
                        </td>
                        <td className="p-3" style={{ userSelect: 'text' }}>
                          <Box className="flex items-center justify-between">
                            <Box>
                              <Typography level="body-sm" className="font-medium select-text">
                                {user.userName}
                              </Typography>
                              <Typography level="body-xs" className="text-gray-500 select-text font-mono">
                                {user.userId}
                              </Typography>
                            </Box>
                            <IconButton 
                              size="sm" 
                              variant="plain"
                              onClick={() => copyToClipboard(`${user.userName}\n${user.userId}`)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity copy-button"
                              title="Copy user info"
                            >
                              <ContentCopyRounded />
                            </IconButton>
                          </Box>
                        </td>
                        <td className="p-3" style={{ userSelect: 'text' }}>
                          <Box className="flex items-center justify-between">
                            <Button
                              component="a"
                              href={user.userLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="plain"
                              size="sm"
                              className="text-blue-600 hover:underline"
                            >
                              View Profile
                            </Button>
                            <IconButton 
                              size="sm" 
                              variant="plain"
                              onClick={() => copyToClipboard(user.userLink)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity copy-button"
                              title="Copy profile link"
                            >
                              <ContentCopyRounded />
                            </IconButton>
                          </Box>
                        </td>
                        <td className="p-3" style={{ userSelect: 'text' }}>
                          {user.phone ? (
                            <Box className="flex items-center justify-between">
                              <Box className="flex items-center gap-1">
                                <PhoneRounded className="text-sm text-green-600" />
                                <Typography level="body-sm" className="select-text font-mono">
                                  {user.phone}
                                </Typography>
                              </Box>
                              <IconButton 
                                size="sm" 
                                variant="plain"
                                onClick={() => copyToClipboard(user.phone || '')}
                                className="opacity-0 group-hover:opacity-100 transition-opacity copy-button"
                                title="Copy phone number"
                              >
                                <ContentCopyRounded />
                              </IconButton>
                            </Box>
                          ) : (
                            <Typography level="body-sm" className="text-gray-400">-</Typography>
                          )}
                        </td>
                        <td className="p-3" style={{ userSelect: 'text' }}>
                          <Box className="flex items-center gap-1">
                            <AccessTimeRounded className="text-sm text-blue-500" />
                            <Typography level="body-sm" className="select-text">
                              {new Date(user.firstTime).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </td>
                        <td className="p-3" style={{ userSelect: 'text' }}>
                          <Box className="flex items-center gap-1">
                            <AccessTimeRounded className="text-sm text-green-500" />
                            <Typography level="body-sm" className="select-text">
                              {new Date(user.lastTime).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </td>
                        <td className="p-3" style={{ userSelect: 'text' }}>
                          <Chip 
                            color={user.totalInteractions >= 10 ? "success" : "primary"} 
                            variant="soft" 
                            size="sm"
                          >
                            {user.totalInteractions >= 10 ? '🔥' : '📊'} {user.totalInteractions}
                          </Chip>
                        </td>
                        <td className="p-3" style={{ userSelect: 'text' }}>
                          <Box className="flex gap-1 flex-wrap">
                            {user.commentCount > 0 && (
                              <Chip color="success" variant="soft" size="sm">
                                💬 {user.commentCount}
                              </Chip>
                            )}
                            {user.messageCount > 0 && (
                              <Chip color="warning" variant="soft" size="sm">
                                📧 {user.messageCount}
                              </Chip>
                            )}
                            {user.commentCount === 0 && user.messageCount === 0 && (
                              <Chip color="neutral" variant="outlined" size="sm">
                                No activity
                              </Chip>
                            )}
                          </Box>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Sheet>
            
            {/* Enhanced Pagination with Performance Indicators */}
            {filteredData.length > 0 && (
              <Box className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
                <Box className="flex items-center gap-4">
                  <Box className="flex items-center gap-2">
                    <Typography level="body-sm" className="text-gray-700">Show</Typography>
                    <Select 
                      value={pagination.pageSize.toString()} 
                      onChange={(_, value) => setPagination(prev => ({ 
                        ...prev, 
                        pageSize: parseInt(value || '25'), 
                        currentPage: 1 
                      }))}
                      size="sm"
                    >
                      <Option value="10">10 per page</Option>
                      <Option value="25">25 per page</Option>
                      <Option value="50">50 per page</Option>
                      <Option value="100">100 per page</Option>
                      <Option value="999999">All</Option>
                    </Select>
                  </Box>
                  
                  <Box className="flex items-center gap-2">
                    <Chip color="primary" variant="soft" size="sm">
                      📊 {filteredData.length} total
                    </Chip>
                    <Chip color="success" variant="soft" size="sm">
                      📄 Page {pagination.currentPage}/{Math.ceil(filteredData.length / pagination.pageSize)}
                    </Chip>
                    <Chip color="neutral" variant="soft" size="sm">
                      👀 Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1}-{Math.min(pagination.currentPage * pagination.pageSize, filteredData.length)}
                    </Chip>
                  </Box>
                </Box>

                <Box className="flex items-center gap-2">
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: 1 }))}
                    disabled={pagination.currentPage === 1}
                    startDecorator={<NavigateBeforeRounded />}
                  >
                    First
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    disabled={pagination.currentPage === 1}
                    startDecorator={<NavigateBeforeRounded />}
                  >
                    Previous
                  </Button>
                  
                  <Box className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum, index) => (
                      <Button
                        key={index}
                        variant={pageNum === pagination.currentPage ? "solid" : "outlined"}
                        size="sm"
                        onClick={() => typeof pageNum === 'number' && setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                        disabled={typeof pageNum !== 'number'}
                        color={pageNum === pagination.currentPage ? "primary" : "neutral"}
                        className="w-10"
                      >
                        {pageNum === '...' ? '…' : pageNum}
                      </Button>
                    ))}
                  </Box>
                  
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    disabled={pagination.currentPage === Math.ceil(filteredData.length / pagination.pageSize)}
                    endDecorator={<NavigateNextRounded />}
                  >
                    Next
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => setPagination(prev => ({ 
                      ...prev, 
                      currentPage: Math.ceil(filteredData.length / pagination.pageSize) 
                    }))}
                    disabled={pagination.currentPage === Math.ceil(filteredData.length / pagination.pageSize)}
                    endDecorator={<NavigateNextRounded />}
                  >
                    Last
                  </Button>
                </Box>
              </Box>
            )}

            {/* Export and Bulk Actions */}
            {filteredData.length > 0 && (
              <Box className="flex items-center justify-between mt-4 p-4 bg-gray-50 rounded-lg border">
                <Box className="flex items-center gap-2">
                  <Typography level="body-sm" className="text-gray-600">
                    📈 Data insights:
                  </Typography>
                  <Chip color="success" variant="soft" size="sm">
                    📞 {filteredData.filter(u => u.phone).length} contacts
                  </Chip>
                  <Chip color="warning" variant="soft" size="sm">
                    🔥 {filteredData.filter(u => u.totalInteractions >= 10).length} high engagement
                  </Chip>
                  <Chip color="neutral" variant="soft" size="sm">
                    ⭐ {filteredData.reduce((sum, u) => sum + u.totalInteractions, 0)} total interactions
                  </Chip>
                </Box>
                
                <Box className="flex gap-2">
                  <Button 
                    onClick={exportData} 
                    variant="outlined" 
                    startDecorator={<DownloadRounded />}
                    size="sm"
                    color="success"
                  >
                    Export CSV ({filteredData.length} records)
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      const highEngagement = filteredData.filter(u => u.totalInteractions >= 10);
                      const exportText = highEngagement.map(u => 
                        `${u.userName}\t${u.phone || 'N/A'}\t${u.userLink}\t${u.totalInteractions}`
                      ).join('\n');
                      copyToClipboard(`Name\tPhone\tProfile\tInteractions\n${exportText}`);
                    }} 
                    variant="outlined" 
                    startDecorator={<ContentCopyRounded />}
                    size="sm"
                    color="primary"
                  >
                    Copy High Engagement
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
