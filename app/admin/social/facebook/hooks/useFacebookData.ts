'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserData, PaginationInfo, FilterOptions, FacebookPage } from '../types';

interface UseFacebookDataResult {
  userData: UserData[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  pages: FacebookPage[];
  filters: FilterOptions;
  updateFilters: (filters: Partial<FilterOptions>) => void;
  updatePagination: (pagination: Partial<PaginationInfo>) => void;
  refreshData: () => void;
  exportData: () => void;
}

interface ApiResponse {
  success: boolean;
  userData: UserData[];
  total: number;
  pages?: Array<{
    facebookPageId: string;
    name: string;
    fanCount?: number;
    followersCount?: number;
  }>;
  error?: string;
}

export function useFacebookData(initialFilters: FilterOptions): UseFacebookDataResult {
  const [userData, setUserData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 25,
    totalItems: 0
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Map UI filter types to API filter types
      const mapFilterType = (type: string) => {
        switch (type) {
          case 'comments': return 'comment';
          case 'messages': return 'message';
          case 'high-interaction': return 'all'; // Handle this client-side
          default: return type;
        }
      };

      const params = new URLSearchParams({
        type: 'summary',
        limit: pagination.pageSize.toString(),
        offset: ((pagination.currentPage - 1) * pagination.pageSize).toString(),
        ...(filters.searchTerm && { search: filters.searchTerm }),
        ...(filters.type !== 'all' && { filter: mapFilterType(filters.type) }),
        ...(filters.selectedPage && filters.selectedPage !== 'all-pages' && { pageId: filters.selectedPage })
      });

      const response = await fetch(`/api/admin/social/facebook/data?${params}`);
      const result: ApiResponse = await response.json();

      if (result.success) {
        let userData = result.userData || [];
        
        // Handle high-interaction filter client-side
        if (filters.type === 'high-interaction') {
          userData = userData.filter(user => user.totalInteractions > 10);
        }

        setUserData(userData);
        setPagination(prev => ({
          ...prev,
          totalItems: result.total || 0
        }));

        if (result.pages) {
          const mappedPages: FacebookPage[] = result.pages.map(p => ({
            id: p.facebookPageId,
            name: p.name,
            isActive: true,
            category: undefined,
            isPublished: undefined,
            isVerified: undefined,
            picture: undefined
          }));
          setPages(mappedPages);
        }
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize, pagination.currentPage, filters]);

  const fetchPages = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/social/facebook/data?type=pages');
      const result = await response.json();

      if (result.success && result.data) {
        const mappedPages: FacebookPage[] = result.data.map((p: any) => ({
          id: p.facebookPageId,
          name: p.name,
          isActive: true,
          category: p.category,
          isPublished: true,
          isVerified: false,
          picture: undefined
        }));
        setPages(mappedPages);
      }
    } catch (err) {
      console.error('Failed to fetch pages:', err);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const updatePagination = useCallback((newPagination: Partial<PaginationInfo>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const exportData = useCallback(async () => {
    try {
      // Map UI filter types to API filter types
      const mapFilterType = (type: string) => {
        switch (type) {
          case 'comments': return 'comment';
          case 'messages': return 'message';
          case 'high-interaction': return 'all'; // Export all data for high-interaction
          default: return type;
        }
      };

      const params = new URLSearchParams({
        type: 'summary',
        export: 'true',
        ...(filters.searchTerm && { search: filters.searchTerm }),
        ...(filters.type !== 'all' && { filter: mapFilterType(filters.type) }),
        ...(filters.selectedPage && filters.selectedPage !== 'all-pages' && { pageId: filters.selectedPage })
      });

      const response = await fetch(`/api/admin/social/facebook/data?${params}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facebook-user-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  }, [filters]);

  // Initial data fetch
  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    userData,
    loading,
    error,
    pagination,
    pages,
    filters,
    updateFilters,
    updatePagination,
    refreshData,
    exportData
  };
}
