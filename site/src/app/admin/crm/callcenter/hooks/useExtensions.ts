import { useState, useEffect, useCallback } from 'react';
import { Extension, ExtensionFormData } from '../types/callcenter.types';
import { CallCenterAPIService } from '../services/api.service';

export function useExtensions() {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExtensions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CallCenterAPIService.getExtensions();
      setExtensions(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch extensions');
    } finally {
      setLoading(false);
    }
  }, []);

  const createExtension = useCallback(async (extensionData: ExtensionFormData) => {
    try {
      setError(null);
      const newExtension = await CallCenterAPIService.createExtension(extensionData);
      setExtensions(prev => [...prev, newExtension]);
      return newExtension;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create extension';
      setError(errorMessage);
      throw error;
    }
  }, []);

  const updateExtension = useCallback(async (id: string, extensionData: Partial<ExtensionFormData>) => {
    try {
      setError(null);
      const updatedExtension = await CallCenterAPIService.updateExtension(id, extensionData);
      setExtensions(prev => prev.map(ext => ext.id === id ? updatedExtension : ext));
      return updatedExtension;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update extension';
      setError(errorMessage);
      throw error;
    }
  }, []);

  const deleteExtension = useCallback(async (id: string) => {
    try {
      setError(null);
      await CallCenterAPIService.deleteExtension(id);
      setExtensions(prev => prev.filter(ext => ext.id !== id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete extension';
      setError(errorMessage);
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchExtensions();
  }, [fetchExtensions]);

  return {
    extensions,
    loading,
    error,
    fetchExtensions,
    createExtension,
    updateExtension,
    deleteExtension,
  };
}
