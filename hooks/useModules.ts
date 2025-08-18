'use client';

import { useState, useEffect } from 'react';

interface Module {
  id: string;
  title: string;
  titleVi: string;
  subtitle: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  module: string;
  permissions: string[];
  isActive: boolean;
  sortOrder: number;
  hasAccess: boolean;
  canView: boolean;
  children?: Array<{
    id: string;
    name: string;
    nameVi: string;
    href: string;
    icon: string;
    permission?: string;
    canAccess: boolean;
  }>;
}

interface UseModulesParams {
  userId?: string;
  roleId?: string;
}

interface UseModulesReturn {
  modules: Module[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useModules({ userId, roleId }: UseModulesParams = {}): UseModulesReturn {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (roleId) params.append('roleId', roleId);

      const response = await fetch(`/api/modules?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setModules(data.data);
      } else {
        setError(data.error || 'Failed to fetch modules');
      }
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [userId, roleId]);

  const refetch = () => {
    fetchModules();
  };

  return {
    modules,
    loading,
    error,
    refetch,
  };
}
