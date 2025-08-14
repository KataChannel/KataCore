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

interface SyncProgress {
  isActive: boolean;
  type: string;
  progress: number;
  currentOperation: string;
  errors: string[];
  startTime?: Date;
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
  
  // New state for sync progress
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    isActive: false,
    type: '',
    progress: 0,
    currentOperation: '',
    errors: []
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
      
      if (data.lastSync) {
        setLastSyncTime(new Date(data.lastSync));
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
      type,
      progress: 0,
      currentOperation: `Initializing ${type} sync...`,
      errors: [],
      startTime: new Date()
    });

    try {
      // Start the sync process
      const body: any = { type };
      if (selectedPage && selectedPage !== 'all-pages') body.pageId = selectedPage;
      
      setSyncProgress(prev => ({
        ...prev,
        progress: 10,
        currentOperation: `Connecting to Facebook API...`
      }));

      const response = await fetch('/api/admin/social/facebook/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      setSyncProgress(prev => ({
        ...prev,
        progress: 30,
        currentOperation: `Processing ${type} data...`
      }));

      const result: SyncResult = await response.json();
      
      setSyncProgress(prev => ({
        ...prev,
        progress: 80,
        currentOperation: `Finalizing sync...`
      }));

      if (result.success) {
        setSyncProgress(prev => ({
          ...prev,
          progress: 100,
          currentOperation: `Sync completed successfully!`
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
          currentOperation: `Sync failed`,
          errors: result.errors || ['Unknown error occurred']
        }));
        console.error(`Sync failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      setSyncProgress(prev => ({
        ...prev,
        progress: 100,
        currentOperation: `Sync failed`,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      }));
      console.error('Sync failed:', error);
    } finally {
      setSyncLoading(false);
      
      // Clear progress after 3 seconds
      setTimeout(() => {
        setSyncProgress({
          isActive: false,
          type: '',
          progress: 0,
          currentOperation: '',
          errors: []
        });
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
      (filterType === 'message' && user.messageCount > 0);
    
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
                      Syncing {syncProgress.type}...
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
                  
                  <Typography level="body-sm" className="text-blue-700">
                    {syncProgress.currentOperation}
                  </Typography>
                  
                  {syncProgress.errors.length > 0 && (
                    <Alert color="danger" variant="soft" className="mt-3">
                      <Box>
                        <Typography level="body-sm" className="font-semibold flex items-center gap-1">
                          <ErrorRounded />
                          Errors encountered:
                        </Typography>
                        <Box component="ul" className="mt-1 text-sm list-disc list-inside">
                          {syncProgress.errors.map((error, index) => (
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
                <Option value="all-pages">All pages</Option>
                {pages.map(page => (
                  <Option key={page.id} value={page.id}>
                    {page.name}
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
                </Button>
                
                <Button 
                  onClick={() => handleSync('comments')} 
                  disabled={syncLoading}
                  variant="outlined"
                  startDecorator={syncLoading ? <RefreshRounded className="animate-spin" /> : <ThumbUpRounded />}
                  className="hover:bg-orange-50"
                >
                  Sync Comments
                </Button>
                
                <Button 
                  onClick={() => handleSync('messages')} 
                  disabled={syncLoading}
                  variant="outlined"
                  startDecorator={syncLoading ? <RefreshRounded className="animate-spin" /> : <ChatBubbleRounded />}
                  className="hover:bg-purple-50"
                >
                  Sync Messages
                </Button>
                
                <Button 
                  onClick={() => handleSync('all')} 
                  disabled={syncLoading}
                  variant="solid"
                  startDecorator={syncLoading ? <RefreshRounded className="animate-spin" /> : <RefreshRounded />}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Sync All
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* User Data Analysis */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <Box className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
              <Box>
                <Typography level="h3" className="text-xl font-bold flex items-center gap-2 text-gray-900">
                  <GroupRounded className="text-green-600" />
                  User Data Analysis
                </Typography>
                <Typography level="body-md" className="text-gray-600 mt-1">
                  Comprehensive data processing and extraction from Facebook interactions
                </Typography>
              </Box>
              <Box className="flex items-center gap-3 flex-wrap">
                <Select 
                  value={filterType} 
                  onChange={(_, value) => setFilterType(value || 'all')}
                  placeholder="Filter records"
                  className="min-w-48"
                >
                  <Option value="all">All records</Option>
                  <Option value="phone">Has phone</Option>
                  <Option value="no-phone">No phone</Option>
                  <Option value="comment">Comments only</Option>
                  <Option value="message">Messages only</Option>
                </Select>
                
                <Box className="relative">
                  <Input
                    placeholder="Search by name, phone, or user ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    startDecorator={<SearchRounded />}
                    className="w-64"
                  />
                </Box>
                
                <Button 
                  onClick={loadUserData} 
                  variant="outlined" 
                  startDecorator={<RefreshRounded />}
                  size="sm"
                >
                  Apply Filters
                </Button>
              </Box>
            </Box>

            {/* User Data Table */}
            <Sheet className="border rounded-lg overflow-hidden">
              <Table hoverRow stickyHeader>
                <thead>
                  <tr>
                    <th className="p-3">
                      <Button
                        variant="plain"
                        onClick={() => setSortField(sortField === 'pageName' && sortDirection === 'asc' ? 'pageName_desc' : 'pageName')}
                        className="text-left hover:text-blue-600 font-semibold"
                        endDecorator={
                          sortField === 'pageName' && (
                            sortDirection === 'asc' ? 
                            <KeyboardArrowUpRounded /> : 
                            <KeyboardArrowDownRounded />
                          )
                        }
                      >
                        Tên/ID Fanpage
                      </Button>
                    </th>
                    <th className="p-3">
                      <Button
                        variant="plain"
                        onClick={() => setSortField(sortField === 'userName' && sortDirection === 'asc' ? 'userName_desc' : 'userName')}
                        className="text-left hover:text-blue-600 font-semibold"
                        endDecorator={
                          sortField === 'userName' && (
                            sortDirection === 'asc' ? 
                            <KeyboardArrowUpRounded /> : 
                            <KeyboardArrowDownRounded />
                          )
                        }
                      >
                        Họ tên/ID User
                      </Button>
                    </th>
                    <th className="p-3">
                      <Typography level="body-sm" className="font-semibold text-gray-700">
                        Link Facebook User
                      </Typography>
                    </th>
                    <th className="p-3">
                      <Typography level="body-sm" className="font-semibold text-gray-700">
                        Phone User
                      </Typography>
                    </th>
                    <th className="p-3">
                      <Button
                        variant="plain"
                        onClick={() => setSortField(sortField === 'firstTime' && sortDirection === 'asc' ? 'firstTime_desc' : 'firstTime')}
                        className="text-left hover:text-blue-600 font-semibold"
                        endDecorator={
                          sortField === 'firstTime' && (
                            sortDirection === 'asc' ? 
                            <KeyboardArrowUpRounded /> : 
                            <KeyboardArrowDownRounded />
                          )
                        }
                      >
                        FirstTime
                      </Button>
                    </th>
                    <th className="p-3">
                      <Button
                        variant="plain"
                        onClick={() => setSortField(sortField === 'lastTime' && sortDirection === 'asc' ? 'lastTime_desc' : 'lastTime')}
                        className="text-left hover:text-blue-600 font-semibold"
                        endDecorator={
                          sortField === 'lastTime' && (
                            sortDirection === 'asc' ? 
                            <KeyboardArrowUpRounded /> : 
                            <KeyboardArrowDownRounded />
                          )
                        }
                      >
                        LastTime
                      </Button>
                    </th>
                    <th className="p-3">
                      <Button
                        variant="plain"
                        onClick={() => setSortField(sortField === 'totalInteractions' && sortDirection === 'asc' ? 'totalInteractions_desc' : 'totalInteractions')}
                        className="text-left hover:text-blue-600 font-semibold"
                        endDecorator={
                          sortField === 'totalInteractions' && (
                            sortDirection === 'asc' ? 
                            <KeyboardArrowUpRounded /> : 
                            <KeyboardArrowDownRounded />
                          )
                        }
                      >
                        Interactions
                      </Button>
                    </th>
                    <th className="p-3">
                      <Typography level="body-sm" className="font-semibold text-gray-700">
                        Types
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
                          No user data found
                        </Typography>
                      </td>
                    </tr>
                  ) : (
                    getCurrentPageUsers().map((user, index) => (
                      <tr key={`${user.pageId}-${user.userId}`} className="hover:bg-gray-50">
                        <td className="p-3">
                          <Box>
                            <Typography level="body-sm" className="font-medium">
                              {user.pageName}
                            </Typography>
                            <Typography level="body-xs" className="text-gray-500">
                              {user.pageId}
                            </Typography>
                          </Box>
                        </td>
                        <td className="p-3">
                          <Box>
                            <Typography level="body-sm" className="font-medium">
                              {user.userName}
                            </Typography>
                            <Typography level="body-xs" className="text-gray-500">
                              {user.userId}
                            </Typography>
                          </Box>
                        </td>
                        <td className="p-3">
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
                        </td>
                        <td className="p-3">
                          {user.phone ? (
                            <Box className="flex items-center gap-1">
                              <PhoneRounded className="text-sm text-green-600" />
                              <Typography level="body-sm">{user.phone}</Typography>
                            </Box>
                          ) : (
                            <Typography level="body-sm" className="text-gray-400">-</Typography>
                          )}
                        </td>
                        <td className="p-3">
                          <Box className="flex items-center gap-1">
                            <AccessTimeRounded className="text-sm text-gray-500" />
                            <Typography level="body-sm">
                              {new Date(user.firstTime).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </td>
                        <td className="p-3">
                          <Box className="flex items-center gap-1">
                            <AccessTimeRounded className="text-sm text-gray-500" />
                            <Typography level="body-sm">
                              {new Date(user.lastTime).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </td>
                        <td className="p-3">
                          <Chip color="primary" variant="soft" size="sm">
                            {user.totalInteractions}
                          </Chip>
                        </td>
                        <td className="p-3">
                          <Box className="flex gap-1 flex-wrap">
                            {user.commentCount > 0 && (
                              <Chip color="success" variant="soft" size="sm">
                                COMMENT ({user.commentCount})
                              </Chip>
                            )}
                            {user.messageCount > 0 && (
                              <Chip color="warning" variant="soft" size="sm">
                                MESSAGE ({user.messageCount})
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
            
            {/* Pagination */}
            {filteredData.length > 0 && (
              <Box className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                <Box className="flex items-center gap-3">
                  <Typography level="body-sm" className="text-gray-700">Show</Typography>
                  <Select 
                    value={pagination.pageSize.toString()} 
                    onChange={(_, value) => setPagination(prev => ({ ...prev, pageSize: parseInt(value || '25'), currentPage: 1 }))}
                    size="sm"
                  >
                    <Option value="10">10</Option>
                    <Option value="25">25</Option>
                    <Option value="50">50</Option>
                    <Option value="100">100</Option>
                  </Select>
                  <Typography level="body-sm" className="text-gray-700">
                    of {filteredData.length} records | Page {pagination.currentPage} of {Math.ceil(filteredData.length / pagination.pageSize)}
                  </Typography>
                </Box>

                <Box className="flex items-center gap-2">
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
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
