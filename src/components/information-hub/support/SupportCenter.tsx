'use client';

import React, { useState, useEffect } from 'react';
import { 
  LifebuoyIcon, 
  TicketIcon, 
  ChatBubbleBottomCenterTextIcon,
  QuestionMarkCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  UserIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { SupportTicket } from '@/types/information-hub';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SupportCenterProps {
  className?: string;
}

const mockTickets: SupportTicket[] = [
  {
    id: 'TK-001',
    title: 'Lỗi đăng nhập không thành công',
    description: 'Không thể đăng nhập vào hệ thống với tài khoản admin',
    status: 'open',
    priority: 'high',
    category: 'Authentication',
    assignedTo: 'john.doe@company.com',
    createdBy: 'user@company.com',
    createdAt: new Date('2024-12-19T09:00:00'),
    updatedAt: new Date('2024-12-19T09:00:00'),
    tags: ['login', 'authentication', 'urgent'],
    attachments: []
  },
  {
    id: 'TK-002',
    title: 'Dashboard không load được dữ liệu',
    description: 'Dashboard Analytics hiển thị trống, không có dữ liệu thống kê',
    status: 'in-progress',
    priority: 'normal',
    category: 'Analytics',
    assignedTo: 'jane.smith@company.com',
    createdBy: 'manager@company.com',
    createdAt: new Date('2024-12-18T14:30:00'),
    updatedAt: new Date('2024-12-19T08:30:00'),
    tags: ['dashboard', 'analytics', 'data'],
    attachments: ['screenshot.png']
  }
];

const mockFAQs = [
  {
    id: '1',
    question: 'Làm thế nào để reset mật khẩu?',
    answer: 'Bạn có thể reset mật khẩu bằng cách click vào "Quên mật khẩu" trên trang đăng nhập.',
    category: 'Authentication',
    views: 245
  },
  {
    id: '2',
    question: 'Tại sao dashboard tải chậm?',
    answer: 'Dashboard có thể tải chậm do lượng dữ liệu lớn. Hãy thử refresh trang hoặc liên hệ IT support.',
    category: 'Performance',
    views: 156
  }
];

const statusColors = {
  open: 'bg-red-100 text-red-800 border-red-200',
  'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200'
};

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  normal: 'bg-gray-100 text-gray-800 border-gray-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
};

export function SupportCenter({ className }: SupportCenterProps) {
  const [tickets] = useState<SupportTicket[]>(mockTickets);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>(mockTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'tickets' | 'faq' | 'ai-chat'>('tickets');

  useEffect(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === selectedStatus);
    }

    setFilteredTickets(filtered);
  }, [searchTerm, selectedStatus, tickets]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hỗ trợ nội bộ</h1>
          <p className="text-gray-600 mt-1">
            Ticket hỗ trợ, FAQ và chatbot AI cho nhân viên
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Tạo ticket mới
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'tickets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TicketIcon className="h-4 w-4" />
            Tickets
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'faq'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <QuestionMarkCircleIcon className="h-4 w-4" />
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('ai-chat')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'ai-chat'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
            AI Chatbot
          </button>
        </nav>
      </div>

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
                    <Input
                      placeholder="Tìm kiếm ticket..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-48">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="open">Mở</SelectItem>
                      <SelectItem value="in-progress">Đang xử lý</SelectItem>
                      <SelectItem value="resolved">Đã giải quyết</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {ticket.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {ticket.id} • {ticket.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={statusColors[ticket.status]}>
                            {ticket.status === 'open' && 'Mở'}
                            {ticket.status === 'in-progress' && 'Đang xử lý'}
                            {ticket.status === 'resolved' && 'Đã giải quyết'}
                            {ticket.status === 'closed' && 'Đã đóng'}
                          </Badge>
                          <Badge variant="outline" className={priorityColors[ticket.priority]}>
                            {ticket.priority === 'low' && 'Thấp'}
                            {ticket.priority === 'normal' && 'Bình thường'}
                            {ticket.priority === 'high' && 'Cao'}
                            {ticket.priority === 'urgent' && 'Khẩn cấp'}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">
                        {ticket.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <UserIcon className="h-4 w-4" />
                          {ticket.createdBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          {formatDate(ticket.createdAt)}
                        </span>
                        {ticket.assignedTo && (
                          <span className="flex items-center gap-1">
                            <UserIcon className="h-4 w-4" />
                            Assigned: {ticket.assignedTo}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {ticket.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="grid gap-4">
            {mockFAQs.map((faq) => (
              <Card key={faq.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {faq.question}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {faq.views} lượt xem
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-3">
                    {faq.answer}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {faq.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AI Chat Tab */}
      {activeTab === 'ai-chat' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
                AI Support Assistant (Powered by Grok)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 min-h-[400px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <ChatBubbleBottomCenterTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">AI Chatbot sẽ được tích hợp tại đây</p>
                  <p className="text-sm">
                    Sử dụng Grok API để trả lời tự động các câu hỏi hỗ trợ
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Nhập câu hỏi của bạn..." className="flex-1" />
                <Button>Gửi</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {activeTab === 'tickets' && filteredTickets.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <LifebuoyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy ticket nào
            </h3>
            <p className="text-gray-500">
              Thử thay đổi bộ lọc hoặc tạo ticket mới
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
