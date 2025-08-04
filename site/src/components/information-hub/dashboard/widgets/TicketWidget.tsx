'use client';

import React from 'react';
import { 
  TicketIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { DashboardWidget } from '@/types/information-hub';

interface TicketWidgetProps {
  widget: DashboardWidget;
  isEditMode: boolean;
  onUpdate: (updates: Partial<DashboardWidget>) => void;
}

export function TicketWidget({ widget, isEditMode, onUpdate }: TicketWidgetProps) {
  const ticketData = {
    openTickets: 5,
    inProgressTickets: 3,
    resolvedToday: 7,
    averageResponseTime: '2.5h',
    recentTickets: [
      {
        id: 'TK-001',
        title: 'Lỗi đăng nhập hệ thống',
        status: 'urgent',
        priority: 'high',
        assignee: 'Nguyễn Văn A',
        createdAt: '10 phút trước',
        category: 'Technical'
      },
      {
        id: 'TK-002',
        title: 'Yêu cầu cập nhật thông tin',
        status: 'in-progress',
        priority: 'medium',
        assignee: 'Trần Thị B',
        createdAt: '1 giờ trước',
        category: 'Request'
      },
      {
        id: 'TK-003',
        title: 'Hỗ trợ sử dụng tính năng mới',
        status: 'open',
        priority: 'low',
        assignee: 'Chưa phân công',
        createdAt: '2 giờ trước',
        category: 'Support'
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'open':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 h-full ${isEditMode ? 'border-2 border-dashed border-blue-300' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <TicketIcon className="h-5 w-5 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
        </div>
        {isEditMode && (
          <button
            onClick={() => onUpdate({ isVisible: !widget.isVisible })}
            className="text-gray-400 hover:text-gray-600"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{ticketData.openTickets}</div>
          <div className="text-xs text-gray-500">Đang mở</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{ticketData.inProgressTickets}</div>
          <div className="text-xs text-gray-500">Đang xử lý</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{ticketData.resolvedToday}</div>
          <div className="text-xs text-gray-500">Giải quyết hôm nay</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{ticketData.averageResponseTime}</div>
          <div className="text-xs text-gray-500">Thời gian phản hồi</div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Ticket gần đây</h4>
        <div className="space-y-3">
          {ticketData.recentTickets.map((ticket) => (
            <div key={ticket.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  {getPriorityIcon(ticket.priority)}
                  <span className="text-sm font-medium text-gray-900 ml-2">{ticket.id}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                  {ticket.status === 'urgent' ? 'Khẩn cấp' :
                   ticket.status === 'in-progress' ? 'Đang xử lý' : 'Mở'}
                </span>
              </div>
              <h5 className="text-sm text-gray-900 mb-1 line-clamp-1">{ticket.title}</h5>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Phụ trách: {ticket.assignee}</span>
                <span>{ticket.createdAt}</span>
              </div>
              <div className="mt-2">
                <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  {ticket.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 pt-4 border-t border-gray-200">
        <button className="flex-1 bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
          Tạo ticket
        </button>
        <button className="flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
          Xem tất cả
        </button>
      </div>
    </div>
  );
}