'use client';

import React, { useState, useEffect } from 'react';
import { TailwindCard } from '@/components/ui/TailwindCard';
import { Button } from '@/components/ui/Button';

interface LeadData {
  id: string;
  form_name: string;
  created_time: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  confidence_score?: number;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED';
}

interface FacebookConfig {
  appId: string;
  appSecret: string;
  shortLivedToken: string;
  longLivedToken: string;
  apiVersion: string;
}

interface FacebookLeadAdsTabProps {
  config?: FacebookConfig;
}

export default function FacebookLeadAdsTab({ config }: FacebookLeadAdsTabProps) {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState('');
  const [pages, setPages] = useState<Array<{id: string, name: string}>>([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0
  });

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      loadLeads();
    }
  }, [selectedPage]);

  const loadPages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/facebook/pages');
      if (response.ok) {
        const data = await response.json();
        setPages(data.pages || []);
      }
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async () => {
    if (!selectedPage) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/facebook/lead-ads?pageId=${selectedPage}`);
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
        calculateStats(data.leads || []);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (leadsData: LeadData[]) => {
    const stats = {
      total: leadsData.length,
      new: leadsData.filter(lead => lead.status === 'NEW').length,
      contacted: leadsData.filter(lead => lead.status === 'CONTACTED').length,
      qualified: leadsData.filter(lead => lead.status === 'QUALIFIED').length,
      converted: leadsData.filter(lead => lead.status === 'CONVERTED').length,
    };
    setStats(stats);
  };

  const updateLeadStatus = async (leadId: string, status: LeadData['status']) => {
    try {
      const response = await fetch(`/api/facebook/lead-ads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setLeads(prev => prev.map(lead => 
          lead.id === leadId ? { ...lead, status } : lead
        ));
        calculateStats(leads.map(lead => 
          lead.id === leadId ? { ...lead, status } : lead
        ));
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const exportLeads = async () => {
    try {
      const response = await fetch(`/api/facebook/lead-ads/export?pageId=${selectedPage}&format=csv`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facebook-leads-${selectedPage}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting leads:', error);
    }
  };

  const getStatusBadge = (status: LeadData['status']) => {
    const badges = {
      NEW: 'bg-blue-100 text-blue-800',
      CONTACTED: 'bg-yellow-100 text-yellow-800',
      QUALIFIED: 'bg-green-100 text-green-800',
      CONVERTED: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status]}`}>
        {status}
      </span>
    );
  };

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <TailwindCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Facebook Lead Ads</h2>
              <p className="text-sm text-gray-600">
                Manage and track leads from Facebook Lead Ad campaigns (95% accuracy)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={loadLeads}
                disabled={loading || !selectedPage}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? '🔄 Loading...' : '🔄 Refresh'}
              </Button>
              <Button
                onClick={exportLeads}
                disabled={!selectedPage || leads.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                📊 Export CSV
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="page-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select Facebook Page
              </label>
              <select
                id="page-select"
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a page...</option>
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </TailwindCard>

      {/* Stats Overview */}
      {selectedPage && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <TailwindCard>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Leads</div>
            </div>
          </TailwindCard>
          <TailwindCard>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
              <div className="text-sm text-gray-600">New</div>
            </div>
          </TailwindCard>
          <TailwindCard>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.contacted}</div>
              <div className="text-sm text-gray-600">Contacted</div>
            </div>
          </TailwindCard>
          <TailwindCard>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.qualified}</div>
              <div className="text-sm text-gray-600">Qualified</div>
            </div>
          </TailwindCard>
          <TailwindCard>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.converted}</div>
              <div className="text-sm text-gray-600">Converted</div>
            </div>
          </TailwindCard>
        </div>
      )}

      {/* Leads Table */}
      {selectedPage && (
        <TailwindCard>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Leads Data</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600">Loading leads...</p>
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No leads found for this page.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lead Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confidence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {lead.form_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(lead.created_time).toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {lead.full_name && <div>👤 {lead.full_name}</div>}
                            {lead.email && <div>📧 {lead.email}</div>}
                            {lead.phone_number && <div>📱 {lead.phone_number}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getConfidenceColor(lead.confidence_score)}`}>
                            {lead.confidence_score ? `${lead.confidence_score}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(lead.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadData['status'])}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="QUALIFIED">Qualified</option>
                            <option value="CONVERTED">Converted</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TailwindCard>
      )}

      {/* Info Card */}
      <TailwindCard>
        <div className="p-6 bg-blue-50">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">Facebook Lead Ads Integration</h3>
              <p className="text-sm text-blue-700">
                This tab shows leads collected through Facebook Lead Ad campaigns. Lead Ads provide the highest 
                data accuracy (95%) as users voluntarily submit their contact information through official Facebook forms.
                Data is automatically synchronized and stored in compliance with GDPR regulations.
              </p>
            </div>
          </div>
        </div>
      </TailwindCard>
    </div>
  );
}
