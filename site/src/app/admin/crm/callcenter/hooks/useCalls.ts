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
  };
}
