// ============================================================================
// INFORMATION HUB TYPES
// ============================================================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'sales' | 'crm' | 'hr' | 'inventory' | 'finance';
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface ChangeLogEntry {
  id: string;
  version: string;
  title: string;
  description: string;
  type: 'feature' | 'bugfix' | 'improvement' | 'security';
  module: string;
  releaseDate: Date;
  isPublished: boolean;
  author: string;
  tags: string[];
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  tags: string[];
  attachments: string[];
}

export interface UserGuide {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'interactive';
  module: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  isPublished: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  rating: number;
}

export interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  modules: TrainingModule[];
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  isPublished: boolean;
  prerequisite?: string[];
  certificate: boolean;
  createdAt: Date;
  updatedAt: Date;
  enrollmentCount: number;
  rating: number;
}

export interface TrainingModule {
  id: string;
  courseId: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'quiz' | 'assignment';
  duration: number;
  order: number;
  isCompleted?: boolean;
  resources: TrainingResource[];
}

export interface TrainingResource {
  id: string;
  name: string;
  type: 'file' | 'link' | 'video';
  url: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedTo: string[];
  createdBy: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  labels: string[];
  project?: string;
  estimatedHours?: number;
  actualHours?: number;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  category: string;
  tags: string[];
  likes: number;
  comments: CommunityComment[];
  isPublished: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
}

export interface CommunityComment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  parentId?: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'notifications' | 'tasks' | 'tickets' | 'analytics' | 'community' | 'training';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
  isVisible: boolean;
  userId: string;
}

export interface InformationHubReport {
  id: string;
  name: string;
  type: 'notifications' | 'tickets' | 'guides' | 'training' | 'community' | 'usage';
  parameters: Record<string, any>;
  schedule?: 'daily' | 'weekly' | 'monthly';
  format: 'pdf' | 'excel' | 'csv';
  createdBy: string;
  createdAt: Date;
  lastGenerated?: Date;
}

// Context Types
export interface InformationHubContextType {
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  
  // Change Log
  changeLog: ChangeLogEntry[];
  
  // Support
  tickets: SupportTicket[];
  createTicket: (ticket: Partial<SupportTicket>) => Promise<void>;
  
  // Guides
  guides: UserGuide[];
  
  // Training
  courses: TrainingCourse[];
  enrollInCourse: (courseId: string) => Promise<void>;
  
  // Tasks
  tasks: Task[];
  createTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  
  // Community
  posts: CommunityPost[];
  createPost: (post: Partial<CommunityPost>) => Promise<void>;
  
  // Dashboard
  widgets: DashboardWidget[];
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => Promise<void>;
  
  // Reports
  generateReport: (reportId: string) => Promise<void>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

// Module Configuration
export interface InformationHubModule {
  id: string;
  name: string;
  icon: string;
  path: string;
  description: string;
  permissions: string[];
  isEnabled: boolean;
  config: Record<string, any>;
}

export const INFORMATION_HUB_MODULES: InformationHubModule[] = [
  {
    id: 'dashboard',
    name: 'Dashboard cá nhân hóa',
    icon: 'dashboard',
    path: '/information-hub',
    description: 'Tổng quan cá nhân hóa với thông tin quan trọng',
    permissions: ['hub.dashboard.view'],
    isEnabled: true,
    config: {}
  },
  {
    id: 'notifications',
    name: 'Thông báo',
    icon: 'bell',
    path: '/information-hub/notifications',
    description: 'Quản lý thông báo thời gian thực và lịch sử',
    permissions: ['hub.notifications.view'],
    isEnabled: true,
    config: { realtime: true, maxHistory: 1000 }
  },
  {
    id: 'changelog',
    name: 'Nhật ký thay đổi',
    icon: 'history',
    path: '/information-hub/changelog',
    description: 'Theo dõi cập nhật hệ thống và tính năng mới',
    permissions: ['hub.changelog.view'],
    isEnabled: true,
    config: {}
  },
  {
    id: 'support',
    name: 'Hỗ trợ nội bộ',
    icon: 'support',
    path: '/information-hub/support',
    description: 'Tạo ticket hỗ trợ và chatbot AI',
    permissions: ['hub.support.view', 'hub.support.create'],
    isEnabled: true,
    config: { aiChatbot: true, grokApi: true }
  },
  {
    id: 'guides',
    name: 'Hướng dẫn sử dụng',
    icon: 'book',
    path: '/information-hub/guides',
    description: 'Tài liệu và hướng dẫn sử dụng hệ thống',
    permissions: ['hub.guides.view'],
    isEnabled: true,
    config: { searchEnabled: true, ratingEnabled: true }
  },
  {
    id: 'training',
    name: 'Đào tạo',
    icon: 'graduation-cap',
    path: '/information-hub/training',
    description: 'Khóa học trực tuyến và chứng nhận',
    permissions: ['hub.training.view', 'hub.training.enroll'],
    isEnabled: true,
    config: { certificates: true, progress: true }
  },
  {
    id: 'analytics',
    name: 'Báo cáo & Phân tích',
    icon: 'chart-bar',
    path: '/information-hub/analytics',
    description: 'Báo cáo hoạt động và phân tích dữ liệu',
    permissions: ['hub.analytics.view', 'hub.analytics.export'],
    isEnabled: true,
    config: { exportFormats: ['pdf', 'excel', 'csv'] }
  },
  {
    id: 'tasks',
    name: 'Quản lý Tác vụ',
    icon: 'check-square',
    path: '/information-hub/tasks',
    description: 'Tạo và theo dõi tác vụ nội bộ',
    permissions: ['hub.tasks.view', 'hub.tasks.create', 'hub.tasks.assign'],
    isEnabled: true,
    config: { notifications: true, timeTracking: true }
  },
  {
    id: 'community',
    name: 'Cộng đồng nội bộ',
    icon: 'users',
    path: '/information-hub/community',
    description: 'Diễn đàn thảo luận và chia sẻ kinh nghiệm',
    permissions: ['hub.community.view', 'hub.community.post'],
    isEnabled: true,
    config: { comments: true, likes: true, moderation: true }
  }
];

// Permission Types
export type InformationHubPermission =
  | 'hub.dashboard.view'
  | 'hub.notifications.view'
  | 'hub.notifications.send'
  | 'hub.changelog.view'
  | 'hub.changelog.manage'
  | 'hub.support.view'
  | 'hub.support.create'
  | 'hub.support.assign'
  | 'hub.guides.view'
  | 'hub.guides.manage'
  | 'hub.training.view'
  | 'hub.training.enroll'
  | 'hub.training.manage'
  | 'hub.analytics.view'
  | 'hub.analytics.export'
  | 'hub.tasks.view'
  | 'hub.tasks.create'
  | 'hub.tasks.assign'
  | 'hub.tasks.manage'
  | 'hub.community.view'
  | 'hub.community.post'
  | 'hub.community.moderate';

export type InformationHubRole = 
  | 'hub.user'
  | 'hub.moderator'
  | 'hub.admin'
  | 'hub.super_admin';
