'use client';

import React, { useState, useEffect } from 'react';
import { 
  PhoneIcon,
  PhoneXMarkIcon,
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  ClockIcon,
  UserIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { Call, CallFilter, CallSummary } from '../types/callcenter.types';
import { useCalls } from '../hooks/useCalls';

interface CallFilterPanelProps {
  filter: CallFilter;
  onFilterChange: (filter: CallFilter) => void;
  onExport: (format: 'csv' | 'excel') => void;
  onRefresh: () => void;
  isLoading: boolean;
}

function CallFilterPanel({ filter, onFilterChange, onExport, onRefresh, isLoading }: CallFilterPanelProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof CallFilter, value: string) => {
    onFilterChange({
      ...filter,
      [key]: value || undefined
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>
          
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onExport('csv')}
            className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={() => onExport('excel')}
            className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filter.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filter.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Extension
            </label>
            <input
              type="text"
              placeholder="Extension code"
              value={filter.extCode || ''}
              onChange={(e) => handleFilterChange('extCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="Phone number"
              value={filter.phoneNumber || ''}
              onChange={(e) => handleFilterChange('phoneNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filter.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="missed">Missed</option>
              <option value="answered">Answered</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Direction
            </label>
            <select
              value={filter.direction || ''}
              onChange={(e) => handleFilterChange('direction', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Directions</option>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface CallSummaryCardsProps {
  summary: CallSummary | null;
  loading: boolean;
}

function CallSummaryCards({ summary, loading }: CallSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 ? `${hours}h ${minutes}m ${secs}s` : `${minutes}m ${secs}s`;
  };

  const answerRate = summary.totalCalls > 0 ? ((summary.answeredCalls / summary.totalCalls) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center">
          <PhoneIcon className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Calls</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalCalls}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center">
          <PhoneIcon className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Answer Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{answerRate}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center">
          <ClockIcon className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Duration</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatDuration(summary.totalDuration)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center">
          <ClockIcon className="h-8 w-8 text-orange-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Duration</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatDuration(summary.averageDuration)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CallNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  call: Call | null;
  onSave: (callId: string, notes: string) => Promise<void>;
}

function CallNotesModal({ isOpen, onClose, call, onSave }: CallNotesModalProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (call) {
      setNotes(call.notes || '');
    }
  }, [call]);

  const handleSave = async () => {
    if (!call) return;

    try {
      setIsSubmitting(true);
      await onSave(call.id, notes);
      onClose();
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !call) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Call Notes
        </h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Phone:</strong> {call.phoneNumber}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Duration:</strong> {call.duration ? `${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}` : 'N/A'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Time:</strong> {new Date(call.timestamp).toLocaleString()}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            rows={4}
            placeholder="Add notes about this call..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CallHistoryOverview() {
  const { calls, summary, loading, error, updateCallNotes, exportCalls, updateFilter, filter, refreshCalls } = useCalls();
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);

  const getStatusIcon = (status: string, direction: string) => {
    if (direction === 'inbound') {
      return <PhoneArrowDownLeftIcon className="h-5 w-5 text-blue-600" />;
    } else {
      return <PhoneArrowUpRightIcon className="h-5 w-5 text-green-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'completed':
      case 'answered':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'missed':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
    }
  };

  const handleAddNotes = (call: Call) => {
    setSelectedCall(call);
    setShowNotesModal(true);
  };

  const handleSaveNotes = async (callId: string, notes: string) => {
    await updateCallNotes(callId, notes);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Call History & Overview</h1>
        <p className="text-gray-600 dark:text-gray-400">Monitor and analyze call activity</p>
      </div>

      {/* Summary Cards */}
      <CallSummaryCards summary={summary} loading={loading} />

      {/* Filters */}
      <CallFilterPanel
        filter={filter}
        onFilterChange={updateFilter}
        onExport={exportCalls}
        onRefresh={refreshCalls}
        isLoading={loading}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Calls Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading calls...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Call Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Agent/Extension
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {calls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(call.status, call.callDirection)}
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {call.callDirection}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {call.phoneNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {call.customerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {call.user?.displayName || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Ext: {call.extCode || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {formatDuration(call.duration)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(call.status)}>
                        {call.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(call.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {call.recordingUrl && (
                          <button
                            onClick={() => window.open(call.recordingUrl, '_blank')}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Play recording"
                          >
                            <PlayIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleAddNotes(call)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Add notes"
                        >
                          <UserIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {calls.length === 0 && !loading && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No calls found for the selected criteria.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notes Modal */}
      <CallNotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        call={selectedCall}
        onSave={handleSaveNotes}
      />
    </div>
  );
}
