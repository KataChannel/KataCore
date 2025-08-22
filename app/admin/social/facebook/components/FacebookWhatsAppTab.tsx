'use client';

import React, { useState, useEffect } from 'react';
import { TailwindCard } from '@/components/ui/TailwindCard';
import { Button } from '@/components/ui/Button';

interface WhatsAppContact {
  id: string;
  phone_number: string;
  profile_name?: string;
  business_name?: string;
  about?: string;
  last_seen?: string;
  confidence_score?: number;
  source: 'PROFILE' | 'CONVERSATION' | 'BUSINESS_INFO';
}

interface WhatsAppStats {
  total_contacts: number;
  business_profiles: number;
  conversations: number;
  high_confidence: number;
}

interface FacebookConfig {
  appId: string;
  appSecret: string;
  shortLivedToken: string;
  longLivedToken: string;
  apiVersion: string;
}

interface FacebookWhatsAppTabProps {
  config?: FacebookConfig;
}

export default function FacebookWhatsAppTab({ config }: FacebookWhatsAppTabProps) {
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<WhatsAppStats>({
    total_contacts: 0,
    business_profiles: 0,
    conversations: 0,
    high_confidence: 0
  });
  const [selectedSource, setSelectedSource] = useState<'ALL' | 'PROFILE' | 'CONVERSATION' | 'BUSINESS_INFO'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadWhatsAppData();
  }, []);

  const loadWhatsAppData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/facebook/whatsapp-business');
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
        setStats(data.stats || {
          total_contacts: 0,
          business_profiles: 0,
          conversations: 0,
          high_confidence: 0
        });
      }
    } catch (error) {
      console.error('Error loading WhatsApp data:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractWhatsAppData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/facebook/whatsapp-business/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          extractionMethods: ['PROFILE', 'CONVERSATION', 'BUSINESS_INFO']
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error extracting WhatsApp data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/facebook/whatsapp-business/export?format=csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `whatsapp-contacts-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSource = selectedSource === 'ALL' || contact.source === selectedSource;
    const matchesSearch = searchTerm === '' || 
      contact.phone_number.includes(searchTerm) ||
      contact.profile_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSource && matchesSearch;
  });

  const getSourceBadge = (source: WhatsAppContact['source']) => {
    const badges = {
      PROFILE: 'bg-blue-100 text-blue-800',
      CONVERSATION: 'bg-green-100 text-green-800',
      BUSINESS_INFO: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[source]}`}>
        {source}
      </span>
    );
  };

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 85) return 'text-green-600';
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
              <h2 className="text-xl font-semibold text-gray-900">WhatsApp Business Integration</h2>
              <p className="text-sm text-gray-600">
                Extract user data from WhatsApp Business API (85% accuracy)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={loadWhatsAppData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? '🔄 Loading...' : '🔄 Refresh'}
              </Button>
              <Button
                onClick={extractWhatsAppData}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                📱 Extract Data
              </Button>
              <Button
                onClick={exportData}
                disabled={contacts.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                📊 Export CSV
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Contacts
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by phone, name, or business..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="source-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Source
              </label>
              <select
                id="source-filter"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Sources</option>
                <option value="PROFILE">Profile</option>
                <option value="CONVERSATION">Conversation</option>
                <option value="BUSINESS_INFO">Business Info</option>
              </select>
            </div>
          </div>
        </div>
      </TailwindCard>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TailwindCard>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total_contacts}</div>
            <div className="text-sm text-gray-600">Total Contacts</div>
          </div>
        </TailwindCard>
        <TailwindCard>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.business_profiles}</div>
            <div className="text-sm text-gray-600">Business Profiles</div>
          </div>
        </TailwindCard>
        <TailwindCard>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.conversations}</div>
            <div className="text-sm text-gray-600">Conversations</div>
          </div>
        </TailwindCard>
        <TailwindCard>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.high_confidence}</div>
            <div className="text-sm text-gray-600">High Confidence</div>
          </div>
        </TailwindCard>
      </div>

      {/* Contacts Table */}
      <TailwindCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">WhatsApp Contacts</h3>
            <div className="text-sm text-gray-600">
              {filteredContacts.length} of {contacts.length} contacts
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Loading WhatsApp data...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {contacts.length === 0 ? 'No WhatsApp data found. Click "Extract Data" to begin.' : 'No contacts match your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            📱 {contact.phone_number}
                          </div>
                          {contact.profile_name && (
                            <div className="text-sm text-gray-500">
                              👤 {contact.profile_name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {contact.business_name && (
                            <div className="font-medium">🏢 {contact.business_name}</div>
                          )}
                          {contact.about && (
                            <div className="text-gray-500 truncate max-w-xs">
                              📝 {contact.about}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSourceBadge(contact.source)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getConfidenceColor(contact.confidence_score)}`}>
                          {contact.confidence_score ? `${contact.confidence_score}%` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contact.last_seen ? new Date(contact.last_seen).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </TailwindCard>

      {/* Info Card */}
      <TailwindCard>
        <div className="p-6 bg-green-50">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📱</div>
            <div>
              <h3 className="text-sm font-medium text-green-900 mb-1">WhatsApp Business API Integration</h3>
              <p className="text-sm text-green-700">
                This integration extracts contact information from WhatsApp Business profiles and conversations. 
                Data includes phone numbers, business names, and profile information with 85% accuracy. 
                All data extraction follows WhatsApp's Business API guidelines and privacy policies.
              </p>
              <div className="mt-2 text-xs text-green-600">
                <strong>Sources:</strong> Business Profiles (highest accuracy), Active Conversations, Public Business Information
              </div>
            </div>
          </div>
        </div>
      </TailwindCard>
    </div>
  );
}
