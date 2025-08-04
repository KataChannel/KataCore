import { useState, useEffect, useCallback } from 'react';
import { Call, CallFilter, CallSummary } from '../types/callcenter.types';
import { CallCenterAPIService } from '../services/api.service';

export function useCalls() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [summary, setSummary] = useState<CallSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CallFilter>({});

  const fetchCalls = useCallback(async (newFilter?: CallFilter) => {
    try {
      setLoading(true);
      setError(null);
      const filterToUse = newFilter || filter;
      const [callsData, summaryData] = await Promise.all([
        CallCenterAPIService.getCalls(filterToUse),
        CallCenterAPIService.getCallSummary(filterToUse)
      ]);
      setCalls(callsData);
      setSummary(summaryData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch calls');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const updateCallNotes = useCallback(async (callId: string, notes: string) => {
    try {
      setError(null);
      const updatedCall = await CallCenterAPIService.updateCallNotes(callId, notes);
      setCalls(prev => prev.map(call => call.id === callId ? updatedCall : call));
      return updatedCall;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update call notes';
      setError(errorMessage);
      throw error;
    }
  }, []);

  const exportCalls = useCallback(async (format: 'csv' | 'excel' = 'csv') => {
    try {
      setError(null);
      const blob = await CallCenterAPIService.exportCalls(filter, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `calls-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export calls';
      setError(errorMessage);
      throw error;
    }
  }, [filter]);

  const updateFilter = useCallback((newFilter: CallFilter) => {
    setFilter(newFilter);
    fetchCalls(newFilter);
  }, [fetchCalls]);

  const refreshCalls = useCallback(() => {
    fetchCalls();
  }, [fetchCalls]);



  const syncCalls = async () => {
    try {
      setLoading(true);
      setError(null);

      const syncPayload = {
        from: filter.dateFrom ? `${filter.dateFrom} 00:00:00` : undefined,
        to: filter.dateTo ? `${filter.dateTo} 23:59:59` : undefined,
        domain: "tazaspa102019", // Có thể đưa vào config
        ...(filter.extCode && { caller_id_number: filter.extCode })
      };
      
      console.log('Synchronizing calls with payload:', syncPayload);
      
      // Gọi API sync trực tiếp
      const syncResponse = await fetch('/api/callcenter/calls/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(syncPayload),
      });

      if (!syncResponse.ok) {
        throw new Error('Failed to sync calls');
      }

      // Sau khi sync xong, refresh dữ liệu
      refreshCalls();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while syncing calls');
    } finally {
      setLoading(false);
    }
  };

  const syncLoopCalls = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy danh sách extensions để loop qua từng caller_id_number
      const extensions = await CallCenterAPIService.getExtensions({limit: 1000});
      
      console.log('Synchronizing calls for extensions:', extensions);

      // Batch size và delay để tránh quá tải API
      const BATCH_SIZE = 3;
      const DELAY_BETWEEN_BATCHES = 1000; // 1 giây
      const DELAY_BETWEEN_REQUESTS = 200; // 200ms

      let syncErrors: string[] = [];

      // Chia extensions thành các batch nhỏ
      for (let i = 0; i < extensions.length; i += BATCH_SIZE) {
        const batch = extensions.slice(i, i + BATCH_SIZE);
        
        // Xử lý song song trong batch với Promise.allSettled
        const batchPromises = batch.map(async (extension, index) => {
          try {
            // Delay giữa các request trong batch
            if (index > 0) {
              await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS * index));
            }

            const syncPayload = {
              from: filter.dateFrom ? `${filter.dateFrom} 00:00:00` : undefined,
              to: filter.dateTo ? `${filter.dateTo} 23:59:59` : undefined,
              caller_id_number: extension.extCode,
              domain: "tazaspa102019" // Có thể đưa vào config
            };
            
            console.log('Synchronizing calls with payload:', syncPayload);
            
            // Gọi API sync cho từng extension
            const syncResponse = await fetch('/api/callcenter/calls/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(syncPayload),
            });

            if (!syncResponse.ok) {
              console.log('syncResponse for extension', extension, ':', syncResponse);
              throw new Error(`Failed to sync calls for extension ${extension.extCode || extension.id}`);
            }

            return syncResponse;
          } catch (error) {
            const errorMsg = `Extension ${extension.extCode || extension.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            console.warn('Sync error for extension:', errorMsg);
            syncErrors.push(errorMsg);
            return null; // Trả về null thay vì throw error
          }
        });

        // Đợi batch hiện tại hoàn thành với Promise.allSettled
        await Promise.allSettled(batchPromises);
        
        // Delay giữa các batch (trừ batch cuối cùng)
        if (i + BATCH_SIZE < extensions.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }
      }

      // Sau khi sync xong tất cả extensions, refresh dữ liệu
      await refreshCalls();

      // Hiển thị warning nếu có lỗi nhưng không dừng quá trình
      if (syncErrors.length > 0) {
        console.warn('Some extensions failed to sync:', syncErrors);
        setError(`${syncErrors.length} extensions failed to sync. Check console for details.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while syncing calls');
    } finally {
      setLoading(false);
    }
  };

  return {
    calls,
    summary,
    loading,
    error,
    filter,
    fetchCalls,
    updateCallNotes,
    exportCalls,
    updateFilter,
    refreshCalls,
    syncCalls,
  };
}
