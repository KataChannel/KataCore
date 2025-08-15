import { useState, useCallback } from 'react';
import { SyncStatus, SyncResult, FacebookPage } from '../types';
import { FacebookApiService } from '../services/FacebookApiService';

export const useFacebookSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isActive: false,
    progress: 0,
    message: '',
    processedCount: 0,
    totalCount: 0,
    errors: [],
    syncHistory: []
  });

  const updateSyncStatus = useCallback((update: Partial<SyncStatus>) => {
    setSyncStatus(prev => ({ ...prev, ...update }));
  }, []);

  const startSync = useCallback(async (
    apiService: FacebookApiService,
    pageId: string | 'all',
    syncType: 'posts' | 'comments' | 'messages' | 'all'
  ) => {
    updateSyncStatus({
      isActive: true,
      startTime: new Date(),
      progress: 0,
      message: 'Initializing sync...',
      processedCount: 0,
      errors: []
    });

    try {
      let results: SyncResult[] = [];
      
      if (pageId === 'all') {
        updateSyncStatus({ message: 'Syncing all pages...' });
        results = await apiService.syncAllPages(syncType);
      } else {
        updateSyncStatus({ message: `Syncing page ${pageId}...` });
        const result = await apiService.syncPageData(pageId, syncType);
        results = [result];
      }

      const totalProcessed = results.reduce((sum, r) => sum + r.processed, 0);
      const totalSynced = results.reduce((sum, r) => sum + r.synced, 0);
      const allErrors = results.flatMap(r => r.errors);

      updateSyncStatus({
        isActive: false,
        progress: 100,
        message: `Sync completed. Processed: ${totalProcessed}, Synced: ${totalSynced}`,
        processedCount: totalProcessed,
        totalCount: totalProcessed,
        errors: allErrors,
        lastSyncTime: new Date()
      });

      // Add to sync history
      setSyncStatus(prev => ({
        ...prev,
        syncHistory: [
          {
            type: syncType,
            startTime: prev.startTime!,
            endTime: new Date(),
            success: allErrors.length === 0,
            itemsProcessed: totalProcessed,
            errors: allErrors
          },
          ...prev.syncHistory.slice(0, 9) // Keep last 10 syncs
        ]
      }));

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateSyncStatus({
        isActive: false,
        progress: 0,
        message: `Sync failed: ${errorMessage}`,
        errors: [errorMessage]
      });
      throw error;
    }
  }, [updateSyncStatus]);

  const cancelSync = useCallback(() => {
    updateSyncStatus({
      isActive: false,
      progress: 0,
      message: 'Sync cancelled',
      errors: ['Sync was cancelled by user']
    });
  }, [updateSyncStatus]);

  return {
    syncStatus,
    startSync,
    cancelSync,
    updateSyncStatus
  };
};
