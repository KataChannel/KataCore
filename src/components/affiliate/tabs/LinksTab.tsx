/**
 * ============================================================================
 * LINKS TAB - AFFILIATE DASHBOARD
 * ============================================================================
 * Management interface for affiliate links creation and tracking
 */

'use client';

import React, { useState } from 'react';
import {
  PlusIcon,
  LinkIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

interface AffiliateLink {
  id: string;
  name: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  conversions: number;
  revenue: number;
  status: 'active' | 'paused' | 'expired';
  createdAt: string;
  expiresAt?: string;
  description?: string;
  category: string;
}

export interface LinksTabProps {
  affiliateId: string;
  links?: AffiliateLink[];
  onCreateLink?: (link: any) => void;
  onDeleteLink?: (linkId: string) => void;
}

export function LinksTab({ affiliateId, links = [], onCreateLink = () => {}, onDeleteLink = () => {} }: LinksTabProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newLink, setNewLink] = useState({
    name: '',
    originalUrl: '',
    description: '',
    category: 'product',
    expiresAt: ''
  });

  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'product', name: 'Sản phẩm' },
    { id: 'service', name: 'Dịch vụ' },
    { id: 'promotion', name: 'Khuyến mãi' },
    { id: 'content', name: 'Nội dung' }
  ];

  const filteredLinks = links?.filter(link => {
    const matchesCategory = selectedCategory === 'all' || link.category === selectedCategory;
    const matchesSearch = link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateLink = () => {
    if (newLink.name && newLink.originalUrl) {
      onCreateLink(newLink);
      setNewLink({
        name: '',
        originalUrl: '',
        description: '',
        category: 'product',
        expiresAt: ''
      });
      setShowCreateForm(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You can add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      active: 'Hoạt động',
      paused: 'Tạm dừng',
      expired: 'Hết hạn'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm liên kết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <EyeIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Tạo liên kết mới
        </button>
      </div>

      {/* Create Link Form */}
      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Tạo liên kết affiliate mới</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên liên kết</label>
              <input
                type="text"
                value={newLink.name}
                onChange={(e) => setNewLink({...newLink, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên mô tả cho liên kết"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
              <select
                value={newLink.category}
                onChange={(e) => setNewLink({...newLink, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.filter(cat => cat.id !== 'all').map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">URL gốc</label>
              <input
                type="url"
                value={newLink.originalUrl}
                onChange={(e) => setNewLink({...newLink, originalUrl: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/product"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả (tùy chọn)</label>
              <textarea
                value={newLink.description}
                onChange={(e) => setNewLink({...newLink, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mô tả chi tiết về liên kết này..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hết hạn (tùy chọn)</label>
              <input
                type="date"
                value={newLink.expiresAt}
                onChange={(e) => setNewLink({...newLink, expiresAt: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleCreateLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tạo liên kết
            </button>
          </div>
        </div>
      )}

      {/* Links List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên kết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hiệu suất
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLinks?.map((link:any) => (
                <tr key={link.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{link.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{link.shortUrl}</div>
                        {link.description && (
                          <div className="text-xs text-gray-400 mt-1">{link.description}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(link.status)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>Clicks: {link.clicks.toLocaleString()}</div>
                      <div>Conversions: {link.conversions}</div>
                      <div className="text-green-600 font-medium">${link.revenue.toFixed(2)}</div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(link.createdAt)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => copyToClipboard(link.shortUrl)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Copy link"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900"
                        title="View analytics"
                      >
                        <ChartBarIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.open(link.originalUrl, '_blank')}
                        className="text-gray-600 hover:text-gray-900"
                        title="Open original URL"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit link"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteLink(link.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete link"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLinks.length === 0 && (
          <div className="text-center py-12">
            <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có liên kết nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Không tìm thấy liên kết phù hợp với bộ lọc.' 
                : 'Bắt đầu bằng cách tạo liên kết affiliate đầu tiên của bạn.'
              }
            </p>
            {(!searchTerm && selectedCategory === 'all') && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Tạo liên kết mới
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
