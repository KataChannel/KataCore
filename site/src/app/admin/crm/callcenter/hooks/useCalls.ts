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

      // Tạo payload từ filter hiện tại
      const syncPayload = {
        from: filter.dateFrom ? `${filter.dateFrom} 00:00:00` : undefined,
        to: filter.dateTo ? `${filter.dateTo} 23:59:59` : undefined,
        caller_id_number: filter.extCode || undefined,
        domain: "tazaspa102019" // Có thể đưa vào config
      };
      console.log('Synchronizing calls with payload:', syncPayload);
      
      // Gọi API sync
      const syncResponse = await fetch('/api/callcenter/calls/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(syncPayload),
      });

      if (!syncResponse.ok) {
        console.log('syncResponse:', syncResponse);
        
        throw new Error('Failed to sync calls');
      }

      // Sau khi sync xong, refresh dữ liệu
      await refreshCalls();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while syncing calls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

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
