import { FacebookApiConfig, SyncResult, FacebookUser, FacebookPage, FacebookPost } from '../types';
import { FacebookTokenService } from './FacebookTokenService';

export class FacebookApiService {
  private config: FacebookApiConfig;

  constructor(config: FacebookApiConfig) {
    this.config = config;
  }

  /**
   * Get active access token with priority: Long Live Token > Regular Token
   */
  private async getAccessToken(): Promise<string> {
    if (this.config.longLiveAccessToken) {
      // Validate long live token first
      const isValid = await FacebookTokenService.validateToken(this.config.longLiveAccessToken);
      if (isValid) {
        return this.config.longLiveAccessToken;
      }
    }

    // Fallback to regular token or exchange for long live token
    if (this.config.accessToken) {
      if (!this.config.isLongLiveToken && this.config.appId && this.config.appSecret) {
        // Try to exchange for long live token
        try {
          const longLiveToken = await FacebookTokenService.exchangeForLongLiveToken(
            this.config.accessToken,
            this.config.appId,
            this.config.appSecret
          );
          
          // Update config with long live token
          this.config.longLiveAccessToken = longLiveToken.accessToken;
          this.config.isLongLiveToken = true;
          
          return longLiveToken.accessToken;
        } catch (error) {
          console.warn('Failed to exchange for long live token:', error);
          return this.config.accessToken;
        }
      }
      return this.config.accessToken;
    }

    throw new Error('No valid access token available');
  }

  /**
   * Make API request to Facebook Graph API
   */
  private async makeApiRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const accessToken = await this.getAccessToken();
    const url = new URL(`https://graph.facebook.com/v18.0/${endpoint}`);
    
    // Add access token and default params
    url.searchParams.append('access_token', accessToken);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`Facebook API Error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get Facebook pages that the user manages
   */
  async getPages(): Promise<FacebookPage[]> {
    try {
      const response = await this.makeApiRequest('me/accounts', {
        fields: 'id,name,access_token,category,is_published,is_verified,picture'
      });

      return response.data?.map((page: any) => ({
        id: page.id,
        name: page.name,
        accessToken: page.access_token,
        category: page.category,
        isPublished: page.is_published,
        isVerified: page.is_verified,
        picture: page.picture?.data?.url
      })) || [];
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  }

  /**
   * Get posts from a specific page
   */
  async getPagePosts(pageId: string, limit: number = 25, after?: string): Promise<{ posts: FacebookPost[], paging?: any }> {
    try {
      const params: Record<string, any> = {
        fields: 'id,message,created_time,updated_time,permalink_url,likes.summary(true),comments.summary(true),shares',
        limit
      };

      if (after) {
        params.after = after;
      }

      const response = await this.makeApiRequest(`${pageId}/posts`, params);

      const posts = response.data?.map((post: any) => ({
        id: post.id,
        message: post.message || '',
        createdTime: new Date(post.created_time),
        updatedTime: new Date(post.updated_time),
        permalinkUrl: post.permalink_url,
        likesCount: post.likes?.summary?.total_count || 0,
        commentsCount: post.comments?.summary?.total_count || 0,
        sharesCount: post.shares?.count || 0,
        pageId
      })) || [];

      return {
        posts,
        paging: response.paging
      };
    } catch (error) {
      console.error(`Error fetching posts for page ${pageId}:`, error);
      throw error;
    }
  }

  /**
   * Get comments from a specific post
   */
  async getPostComments(postId: string, limit: number = 25): Promise<any[]> {
    try {
      const response = await this.makeApiRequest(`${postId}/comments`, {
        fields: 'id,message,created_time,from,like_count,parent',
        limit
      });

      return response.data || [];
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Get users who interacted with the page
   */
  async getPageUsers(pageId: string): Promise<FacebookUser[]> {
    // Note: Due to Facebook API limitations, we can't directly get all users
    // This is a placeholder for collecting users from posts, comments, etc.
    const users: Map<string, FacebookUser> = new Map();

    try {
      // Get recent posts and their interactions
      const { posts } = await this.getPagePosts(pageId, 10);

      for (const post of posts) {
        // Get comments (which include user info)
        const comments = await this.getPostComments(post.id, 50);
        
        comments.forEach((comment: any) => {
          if (comment.from && comment.from.id) {
            const userId = comment.from.id;
            if (!users.has(userId)) {
              users.set(userId, {
                id: userId,
                name: comment.from.name || 'Unknown',
                email: '', // Not available from public API
                phone: '', // Not available from public API
                lastInteraction: new Date(comment.created_time),
                interactionCount: 1,
                source: 'facebook',
                pageId
              });
            } else {
              const user = users.get(userId)!;
              user.interactionCount++;
              const commentDate = new Date(comment.created_time);
              if (commentDate > user.lastInteraction) {
                user.lastInteraction = commentDate;
              }
            }
          }
        });
      }

      return Array.from(users.values());
    } catch (error) {
      console.error(`Error fetching users for page ${pageId}:`, error);
      throw error;
    }
  }

  /**
   * Sync data for a specific page
   */
  async syncPageData(pageId: string, syncType: 'posts' | 'comments' | 'messages' | 'all'): Promise<SyncResult> {
    const result: SyncResult = {
      pageId,
      type: syncType,
      processed: 0,
      synced: 0,
      errors: [],
      startTime: new Date(),
      endTime: new Date(),
      success: true,
      userDataExtracted: 0,
      message: 'Sync initialized'
    };

    try {
      if (syncType === 'posts' || syncType === 'all') {
        const { posts } = await this.getPagePosts(pageId, 100);
        result.processed += posts.length;
        result.synced += posts.length; // Assume all are synced successfully
      }

      if (syncType === 'comments' || syncType === 'all') {
        // Get comments from recent posts
        const { posts } = await this.getPagePosts(pageId, 10);
        let commentsCount = 0;
        
        for (const post of posts) {
          const comments = await this.getPostComments(post.id, 100);
          commentsCount += comments.length;
        }
        
        result.processed += commentsCount;
        result.synced += commentsCount;
      }

      if (syncType === 'messages' || syncType === 'all') {
        // Note: Messages require special permissions and are limited
        // This is a placeholder
        result.processed += 0;
        result.synced += 0;
      }

      result.endTime = new Date();
      result.success = result.errors.length === 0;
      result.message = result.success ? 'Sync completed successfully' : 'Sync completed with errors';
      return result;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      result.endTime = new Date();
      result.success = false;
      result.message = 'Sync failed';
      return result;
    }
  }

  /**
   * Sync data for all pages
   */
  async syncAllPages(syncType: 'posts' | 'comments' | 'messages' | 'all'): Promise<SyncResult[]> {
    try {
      const pages = await this.getPages();
      const results: SyncResult[] = [];

      for (const page of pages) {
        const result = await this.syncPageData(page.id, syncType);
        results.push(result);
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to sync all pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test API connection and permissions
   */
  async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const accessToken = await this.getAccessToken();
      
      // Test basic API access
      const userInfo = await this.makeApiRequest('me', {
        fields: 'id,name,email'
      });

      // Test pages access
      const pages = await this.getPages();

      return {
        success: true,
        message: `Connected successfully as ${userInfo.name}. Found ${pages.length} pages.`,
        data: {
          user: userInfo,
          pagesCount: pages.length,
          tokenType: this.config.longLiveAccessToken ? 'Long Live Token' : 'Regular Token'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<FacebookApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): FacebookApiConfig {
    return { ...this.config };
  }
}
