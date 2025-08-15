import { useState, useCallback, useEffect } from 'react';
import { UserData, PaginationInfo, FilterOptions } from '../types';
import { FacebookApiService } from '../services/FacebookApiService';

export const useUserData = (apiService: FacebookApiService) => {
  const [userData, setUserData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 25,
    totalItems: 0
  });

  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    searchTerm: '',
    sortField: 'totalInteractions',
    sortDirection: 'desc',
    selectedPage: 'all-pages'
  });

  const loadUserData = useCallback(async () => {
    setLoading(true);
    try {
      // For now, use mock data since getUserData is not implemented
      // In production, this would call apiService.getPageUsers or similar
      const mockData: UserData[] = [];
      
      setUserData(mockData);
      setPagination(prev => ({
        ...prev,
        totalItems: mockData.length
      }));
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserData([]);
    } finally {
      setLoading(false);
    }
  }, [apiService, pagination.currentPage, pagination.pageSize, filters]);

  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const updatePagination = useCallback((newPagination: Partial<PaginationInfo>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const refreshData = useCallback(() => {
    loadUserData();
  }, [loadUserData]);

  // Load data when dependencies change
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return {
    userData,
    loading,
    pagination,
    filters,
    updateFilters,
    updatePagination,
    refreshData
  };
};
