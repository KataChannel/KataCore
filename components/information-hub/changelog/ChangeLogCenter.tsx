'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  TagIcon, 
  UserIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
  BugAntIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CalendarIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { ChangeLogEntry } from '@/types/information-hub';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ChangeLogCenterProps {
  className?: string;
}

const mockChangeLogData: ChangeLogEntry[] = [
  {
    id: '1',
    version: 'v2.1.0',
    title: 'Tích hợp AI Chatbot cho hỗ trợ khách hàng',
    description: 'Thêm tính năng chatbot AI sử dụng Grok API để hỗ trợ khách hàng tự động 24/7. Cải thiện trải nghiệm người dùng và giảm tải cho team support.',
    type: 'feature',
    module: 'CRM',
    releaseDate: new Date('2024-12-15'),
    isPublished: true,
    author: 'Development Team',
    tags: ['ai', 'chatbot', 'automation', 'customer-support']
  },
  {
    id: '2',
    version: 'v2.0.5',
    title: 'Sửa lỗi JWT token optimization',
    description: 'Khắc phục lỗi 431 Request Header Fields Too Large khi token JWT quá lớn. Tối ưu hóa cấu trúc token và cải thiện hiệu suất xác thực.',
    type: 'bugfix',
    module: 'Authentication',
    releaseDate: new Date('2024-12-10'),
    isPublished: true,
    author: 'Security Team',
    tags: ['security', 'jwt', 'optimization', 'bugfix']
  },
  {
    id: '3',
    version: 'v2.0.4',
    title: 'Cải thiện hiệu suất Dashboard Analytics',
    description: 'Tối ưu hóa các truy vấn database và caching cho Dashboard Analytics. Giảm thời gian tải từ 5s xuống 1.2s.',
    type: 'improvement',
    module: 'Analytics',
    releaseDate: new Date('2024-12-05'),
    isPublished: true,
    author: 'Performance Team',
    tags: ['performance', 'optimization', 'dashboard', 'analytics']
  },
  {
    id: '4',
    version: 'v2.0.3',
    title: 'Bảo mật RBAC nâng cao',
    description: 'Cập nhật hệ thống phân quyền Role-Based Access Control với các tính năng bảo mật nâng cao và audit log.',
    type: 'security',
    module: 'Security',
    releaseDate: new Date('2024-11-28'),
    isPublished: true,
    author: 'Security Team',
    tags: ['security', 'rbac', 'permissions', 'audit']
  },
  {
    id: '5',
    version: 'v2.0.2',
    title: 'Module quản lý Call Center',
    description: 'Ra mắt module Call Center hoàn chỉnh với tích hợp VoIP, recording cuộc gọi, và dashboard thống kê real-time.',
    type: 'feature',
    module: 'Call Center',
    releaseDate: new Date('2024-11-20'),
    isPublished: true,
    author: 'Product Team',
    tags: ['callcenter', 'voip', 'recording', 'real-time']
  }
];

const typeIcons = {
  feature: NewspaperIcon,
  bugfix: BugAntIcon,
  improvement: SparklesIcon,
  security: ShieldCheckIcon
};

const typeStyles = {
  feature: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    glow: 'hover:shadow-blue-200/50'
  },
  bugfix: {
    bg: 'bg-gradient-to-br from-red-50 to-pink-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: 'text-red-600',
    badge: 'bg-red-100 text-red-700 border-red-200',
    glow: 'hover:shadow-red-200/50'
  },
  improvement: {
    bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    glow: 'hover:shadow-emerald-200/50'
  },
  security: {
    bg: 'bg-gradient-to-br from-purple-50 to-violet-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    icon: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    glow: 'hover:shadow-purple-200/50'
  }
};

const typeLabels = {
  feature: 'Tính năng mới',
  bugfix: 'Sửa lỗi',
  improvement: 'Cải thiện',
  security: 'Bảo mật'
};

// Extract unique modules from mock data
const modules = Array.from(new Set(mockChangeLogData.map(entry => entry.module)));

export function ChangeLogCenter({ className }: ChangeLogCenterProps) {
  const [changeLog] = useState<ChangeLogEntry[]>(mockChangeLogData);
  const [filteredChangeLog, setFilteredChangeLog] = useState<ChangeLogEntry[]>(mockChangeLogData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Filter change log based on search and filters
  useEffect(() => {
    let filtered = changeLog;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Module filter
    if (selectedModule !== 'all') {
      filtered = filtered.filter(entry => entry.module === selectedModule);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(entry => entry.type === selectedType);
    }

    setFilteredChangeLog(filtered);
  }, [searchTerm, selectedModule, selectedType, changeLog]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className={`max-w-7xl mx-auto space-y-8 ${className}`}>
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                  <CodeBracketIcon className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
                  Version {mockChangeLogData[0]?.version || 'N/A'}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                Nhật ký thay đổi
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                Theo dõi toàn bộ lịch sử cập nhật, tính năng mới và các cải tiến của hệ thống. 
                Luôn cập nhật với những thay đổi mới nhất.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="text-2xl font-bold text-white">{filteredChangeLog.length}</div>
                <div className="text-sm text-slate-300">Cập nhật</div>
              </div>
              <div className="px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="text-2xl font-bold text-white">{modules.length}</div>
                <div className="text-sm text-slate-300">Module</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters with glassmorphism effect */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search with enhanced styling */}
            <div className="flex-1">
              <div className="relative group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 text-slate-400 transform -translate-y-1/2 transition-colors group-focus-within:text-blue-600" />
                <Input
                  placeholder="Tìm kiếm theo tiêu đề, mô tả hoặc tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                />
              </div>
            </div>

            {/* Module Filter with custom styling */}
            <div className="w-full lg:w-56">
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                  <SelectValue placeholder="Chọn module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả module</SelectItem>
                  {modules.map(module => (
                    <SelectItem key={module} value={module}>{module}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter with custom styling */}
            <div className="w-full lg:w-56">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                  <SelectValue placeholder="Loại cập nhật" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Log Timeline with enhanced design */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 hidden lg:block" />
        
        <div className="space-y-6">
          {filteredChangeLog.map((entry, index) => {
            const TypeIcon = typeIcons[entry.type];
            const style = typeStyles[entry.type];
            
            return (
              <div key={entry.id} className="relative group">
                {/* Timeline dot */}
                <div className="absolute left-8 top-8 w-4 h-4 bg-white border-4 border-slate-300 rounded-full hidden lg:block group-hover:border-blue-500 transition-colors duration-200" />
                
                <Card className={`ml-0 lg:ml-16 overflow-hidden border-slate-200 shadow-lg hover:shadow-2xl ${style.glow} transition-all duration-300 group-hover:-translate-y-1`}>
                  <div className={`absolute inset-0 ${style.bg} opacity-50`} />
                  <CardContent className="relative p-6 lg:p-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left section with icon and metadata */}
                      <div className="flex items-start gap-4 lg:w-72 flex-shrink-0">
                        <div className={`p-3 rounded-xl ${style.bg} ${style.border} border`}>
                          <TypeIcon className={`h-6 w-6 ${style.icon}`} />
                        </div>
                        <div className="flex-1">
                          <Badge variant="outline" className={`${style.badge} mb-2`}>
                            {typeLabels[entry.type]}
                          </Badge>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                              <CalendarIcon className="h-4 w-4" />
                              <span>{formatDate(entry.releaseDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <UserIcon className="h-4 w-4" />
                              <span>{entry.author}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-4">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-xl font-semibold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                              {entry.title}
                            </h3>
                            <Badge className="bg-slate-100 text-slate-700 font-mono flex-shrink-0">
                              {entry.version}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                            <TagIcon className="h-4 w-4" />
                            <span className="font-medium">{entry.module}</span>
                          </div>
                        </div>

                        <p className="text-slate-700 leading-relaxed mb-4">
                          {entry.description}
                        </p>

                        {/* Tags with enhanced styling */}
                        <div className="flex flex-wrap gap-2">
                          {entry.tags.map(tag => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200 transition-colors cursor-pointer"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      <div className="hidden lg:flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRightIcon className="h-5 w-5 text-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State with enhanced design */}
      {filteredChangeLog.length === 0 && (
        <Card className="border-slate-200 shadow-xl">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClockIcon className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Không tìm thấy cập nhật nào
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem các cập nhật khác
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
