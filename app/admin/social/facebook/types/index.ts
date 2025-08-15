export interface FacebookStats {
  totalPages: number;
  totalPosts: number;
  totalComments: number;
  totalMessages: number;
  totalConversations: number;
  totalInteractions: number;
}

export interface UserData {
  pageId: string;
  pageName: string;
  userId: string;
  userName: string;
  userLink: string;
  phone?: string;
  firstTime: Date;
  lastTime: Date;
  totalInteractions: number;
  commentCount: number;
  messageCount: number;
}

export interface FacebookUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  lastInteraction: Date;
  interactionCount: number;
  source: string;
  pageId: string;
}

export interface FacebookPost {
  id: string;
  message: string;
  createdTime: Date;
  updatedTime: Date;
  permalinkUrl: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  pageId: string;
}

export interface SyncResult {
  success: boolean;
  type: string;
  synced: number;
  processed: number;
  errors: string[];
  userDataExtracted: number;
  message: string;
  pageId?: string;
  startTime: Date;
  endTime: Date;
}

export interface SyncStatus {
  isActive: boolean;
  currentType?: string;
  progress: number;
  message: string;
  startTime?: Date;
  estimatedTimeRemaining?: number;
  processedCount: number;
  totalCount: number;
  errors: string[];
  lastSyncTime?: Date;
  syncHistory: Array<{
    type: string;
    startTime: Date;
    endTime: Date;
    success: boolean;
    itemsProcessed: number;
    errors: string[];
  }>;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export interface FacebookPage {
  id: string;
  name: string;
  accessToken?: string;
  isActive: boolean;
  category?: string;
  isPublished?: boolean;
  isVerified?: boolean;
  picture?: string;
}

export interface FacebookApiConfig {
  apiKey?: string;
  appId?: string;
  appSecret?: string;
  accessToken?: string;
  longLiveAccessToken?: string;
  isLongLiveToken?: boolean;
  pageIds?: string[];
  source: 'env' | 'localstorage' | 'user_input';
}

export interface FilterOptions {
  type: 'all' | 'phone' | 'no-phone' | 'comments' | 'messages' | 'high-interaction';
  searchTerm: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  selectedPage: string;
}
