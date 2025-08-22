'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/tailwind-ui';
import { TailwindCard } from '@/components/ui/TailwindCard';
import { usePermissions } from '@/hooks/usePermissions';
import * as XLSX from 'xlsx';

interface UserData {
  pageId: string;
  userId: string;
  fanpage: string;
  fullName: string;
  phoneNumber: string;
  facebookLink: string;
  firstInteractionDate: string;
  lastInteractionDate: string;
  totalInteractions: number;
  commentCount: number;
  messageCount: number;
  latestMessage: string;
  interactionType: string;
}

interface FilterOptions {
  type: 'all' | 'message' | 'comment' | 'post';
  searchTerm: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  selectedPage: string;
  phoneFilter: 'all' | 'has-phone' | 'no-phone';
  dateRange: {
    start: string;
    end: string;
  };
  interactionRange: {
    min: number;
    max: number;
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function FacebookUserDataTab() {
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  
  const [userData, setUserData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    searchTerm: '',
    sortField: 'lastInteractionDate',
    sortDirection: 'desc',
    selectedPage: 'all-pages',
    phoneFilter: 'all',
    dateRange: {
      start: '',
      end: ''
    },
    interactionRange: {
      min: 0,
      max: 1000
    }
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [pages, setPages] = useState<any[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Permission check
  const canViewFacebookUsers = hasPermission('admin.social.facebook.users');

  useEffect(() => {
    if (canViewFacebookUsers && !permissionsLoading) {
      loadUserData();
      loadPages();
    }
  }, [filters, pagination.currentPage, canViewFacebookUsers, permissionsLoading]);

  if (permissionsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading permissions...</span>
      </div>
    );
  }

  if (!canViewFacebookUsers) {
    return (
      <TailwindCard>
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">
            You don't have permission to view Facebook user data.
          </p>
        </div>
      </TailwindCard>
    );
  }

  const loadPages = async () => {
    try {
      const response = await fetch('/api/admin/social/facebook/database?action=pages');
      const data = await response.json();
      if (data.data) {
        setPages(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
  };

  const loadUserData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'users',
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
        search: filters.searchTerm,
        sort: filters.sortField,
        order: filters.sortDirection,
        pageId: filters.selectedPage === 'all-pages' ? '' : filters.selectedPage,
        type: filters.type === 'all' ? '' : filters.type,
        phoneFilter: filters.phoneFilter,
        dateStart: filters.dateRange.start,
        dateEnd: filters.dateRange.end,
        minInteractions: filters.interactionRange.min.toString(),
        maxInteractions: filters.interactionRange.max.toString()
      });

      const response = await fetch(`/api/admin/social/facebook/database?${params}`);
      const data = await response.json();
      
      if (data.data) {
        setUserData(data.data || []);
        setPagination(prev => ({
          ...prev,
          totalPages: data.pagination?.pages || 1,
          totalItems: data.pagination?.total || 0
        }));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handleSort = (field: string) => {
    const direction = filters.sortField === field && filters.sortDirection === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({ ...prev, sortField: field, sortDirection: direction }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Get all data without pagination
      const allParams = new URLSearchParams({
        action: 'users',
        page: '1',
        limit: '10000', // Large limit to get all data
        search: filters.searchTerm,
        sort: filters.sortField,
        order: filters.sortDirection,
        pageId: filters.selectedPage === 'all-pages' ? '' : filters.selectedPage,
        type: filters.type === 'all' ? '' : filters.type,
        phoneFilter: filters.phoneFilter,
        dateStart: filters.dateRange.start,
        dateEnd: filters.dateRange.end,
        minInteractions: filters.interactionRange.min.toString(),
        maxInteractions: filters.interactionRange.max.toString()
      });

      const response = await fetch(`/api/admin/social/facebook/database?${allParams}`);
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        // Prepare Excel data
        const excelData = data.data.map((user: UserData, index: number) => ({
          'STT': index + 1,
          'Page ID': user.pageId || 'N/A',
          'Page Name': user.fanpage || 'Unknown',
          'User ID': user.userId || 'N/A', 
          'Full Name': user.fullName || 'Unknown',
          'Phone Number': user.phoneNumber || 'No phone',
          'Facebook Link': user.facebookLink || 'N/A',
          'First Interaction': user.firstInteractionDate 
            ? new Date(user.firstInteractionDate).toLocaleDateString('vi-VN', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
              })
            : 'Unknown',
          'Last Interaction': user.lastInteractionDate
            ? new Date(user.lastInteractionDate).toLocaleDateString('vi-VN', {
                year: 'numeric', month: '2-digit', day: '2-digit', 
                hour: '2-digit', minute: '2-digit'
              })
            : 'No activity',
          'Total Interactions': user.totalInteractions || 0,
          'Comments': user.commentCount || 0,
          'Messages': user.messageCount || 0,
          'Interaction Type': user.interactionType || 'Unknown',
          'Latest Message': user.latestMessage || 'No message'
        }));

        // Create Excel file
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        
        // Set column widths
        const colWidths = [
          { wch: 5 },   // STT
          { wch: 15 },  // Page ID
          { wch: 20 },  // Page Name
          { wch: 15 },  // User ID
          { wch: 20 },  // Full Name
          { wch: 15 },  // Phone Number
          { wch: 30 },  // Facebook Link
          { wch: 18 },  // First Interaction
          { wch: 18 },  // Last Interaction
          { wch: 12 },  // Total Interactions
          { wch: 10 },  // Comments
          { wch: 10 },  // Messages
          { wch: 15 },  // Interaction Type
          { wch: 30 }   // Latest Message
        ];
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, 'Facebook Users');
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        const filename = `facebook_users_${timestamp}.xlsx`;
        
        // Download file
        XLSX.writeFile(wb, filename);
        
        // Show success message
        alert(`Đã xuất ${excelData.length} người dùng thành file Excel!`);
      } else {
        alert('Không có dữ liệu để xuất!');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Lỗi khi xuất file Excel!');
    } finally {
      setIsExporting(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'message': return 'bg-blue-100 text-blue-800';
      case 'comment': return 'bg-green-100 text-green-800';
      case 'post': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message': return '💬';
      case 'comment': return '💭';
      case 'post': return '📝';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <TailwindCard>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Facebook User Data</h3>
              <p className="text-sm text-gray-600">
                {pagination.totalItems} users found
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                {showAdvancedFilters ? '🔼' : '🔽'} Advanced Filters
              </Button>
              
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={loading || userData.length === 0 || isExporting}
              >
                {isExporting ? '⏳ Exporting...' : '📥 Export Excel'}
              </Button>
            </div>
          </div>

          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Search by name, email, phone..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interaction Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="message">Messages</option>
                <option value="comment">Comments</option>
                <option value="post">Posts</option>
              </select>
            </div>

            {/* Page Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Page</label>
              <select
                value={filters.selectedPage}
                onChange={(e) => handleFilterChange('selectedPage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all-pages">All Pages</option>
                {pages.map((page, index) => (
                  <option key={page.facebookPageId || page.id || `page-${index}`} value={page.facebookPageId || page.id}>
                    {page.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={`${filters.sortField}-${filters.sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  if (field && direction) {
                    setFilters(prev => ({ ...prev, sortField: field, sortDirection: direction as 'asc' | 'desc' }));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="lastInteractionDate-desc">Latest Activity</option>
                <option value="lastInteractionDate-asc">Oldest Activity</option>
                <option value="firstInteractionDate-desc">First Interaction (Latest)</option>
                <option value="firstInteractionDate-asc">First Interaction (Oldest)</option>
                <option value="totalInteractions-desc">Most Interactions</option>
                <option value="totalInteractions-asc">Least Interactions</option>
                <option value="commentCount-desc">Most Comments</option>
                <option value="commentCount-asc">Least Comments</option>
                <option value="messageCount-desc">Most Messages</option>
                <option value="messageCount-asc">Least Messages</option>
                <option value="pageId-asc">Page ID A-Z</option>
                <option value="pageId-desc">Page ID Z-A</option>
                <option value="userId-asc">User ID A-Z</option>
                <option value="userId-desc">User ID Z-A</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Advanced Filters</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Phone Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <select
                    value={filters.phoneFilter}
                    onChange={(e) => handleFilterChange('phoneFilter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Users</option>
                    <option value="has-phone">Has Phone Number</option>
                    <option value="no-phone">No Phone Number</option>
                  </select>
                </div>

                {/* Date Range Start */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Date Range End */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Interaction Range Min */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Interactions: {filters.interactionRange.min}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={filters.interactionRange.min}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      interactionRange: { ...prev.interactionRange, min: parseInt(e.target.value) }
                    }))}
                    className="w-full"
                  />
                </div>

                {/* Interaction Range Max */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Interactions: {filters.interactionRange.max}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filters.interactionRange.max}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      interactionRange: { ...prev.interactionRange, max: parseInt(e.target.value) }
                    }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      phoneFilter: 'all',
                      dateRange: { start: '', end: '' },
                      interactionRange: { min: 0, max: 1000 }
                    }));
                  }}
                >
                  🔄 Reset Advanced
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      type: 'all',
                      searchTerm: '',
                      sortField: 'lastInteractionDate',
                      sortDirection: 'desc',
                      selectedPage: 'all-pages',
                      phoneFilter: 'all',
                      dateRange: { start: '', end: '' },
                      interactionRange: { min: 0, max: 1000 }
                    });
                  }}
                >
                  🗑️ Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </TailwindCard>

      {/* Data Table */}
      <TailwindCard>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading user data...</span>
            </div>
          ) : userData.length > 0 ? (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('pageId')}
                      >
                        Page ID {filters.sortField === 'pageId' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('userId')}
                      >
                        User ID {filters.sortField === 'userId' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('firstInteractionDate')}
                      >
                        First Time {filters.sortField === 'firstInteractionDate' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('lastInteractionDate')}
                      >
                        Last Time {filters.sortField === 'lastInteractionDate' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('totalInteractions')}
                      >
                        Total Interactions {filters.sortField === 'totalInteractions' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('commentCount')}
                      >
                        Comments {filters.sortField === 'commentCount' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('messageCount')}
                      >
                        Messages {filters.sortField === 'messageCount' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userData.map((user, index) => (
                      <tr key={`${user.userId}-${user.pageId}-${index}`} className="hover:bg-gray-50">
                        {/* Page ID */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">
                            <div className="flex items-center gap-1">
                              <span>📄</span>
                              <span className="truncate max-w-[120px]" title={user.pageId}>
                                {user.pageId || 'N/A'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {user.fanpage || 'Unknown Page'}
                            </div>
                          </div>
                        </td>

                        {/* User ID */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-blue-600">
                                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                                </span>
                              </div>
                              <div>
                                <div className="font-mono text-xs truncate max-w-[120px]" title={user.userId}>
                                  {user.userId || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.fullName || 'Unknown User'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Phone */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.phoneNumber && user.phoneNumber !== '' ? (
                              <div className="flex items-center gap-1">
                                <span>📞</span>
                                <span>{user.phoneNumber}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">No phone</span>
                            )}
                          </div>
                        </td>
                        
                        {/* First Time */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              <span>🕒</span>
                              <span>
                                {user.firstInteractionDate 
                                  ? new Date(user.firstInteractionDate).toLocaleDateString('vi-VN', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : 'Unknown'
                                }
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Last Time */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              <span>🕓</span>
                              <span>
                                {user.lastInteractionDate 
                                  ? new Date(user.lastInteractionDate).toLocaleDateString('vi-VN', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : 'No activity'
                                }
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Total Interactions */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium text-center">
                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs inline-block">
                              {user.totalInteractions || 0}
                            </div>
                          </div>
                        </td>
                        
                        {/* Comments */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium text-center">
                            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs inline-block">
                              💬 {user.commentCount || 0}
                            </div>
                          </div>
                        </td>
                        
                        {/* Messages */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium text-center">
                            <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs inline-block">
                              💌 {user.messageCount || 0}
                            </div>
                          </div>
                        </td>
                        
                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigator.clipboard.writeText(user.facebookLink)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Copy Facebook Link"
                            >
                              📋
                            </button>
                            <button
                              onClick={() => window.open(user.facebookLink, '_blank')}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Facebook Profile"
                            >
                              👤
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                  {pagination.totalItems} results
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage <= 1}
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  >
                    Previous
                  </Button>
                  
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage >= pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No user data found</h3>
              <p className="text-gray-600">
                {filters.searchTerm || filters.type !== 'all' || filters.selectedPage !== 'all-pages'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Start by syncing data from the Sync tab to see user information here.'
                }
              </p>
            </div>
          )}
        </div>
      </TailwindCard>
    </div>
  );
}
