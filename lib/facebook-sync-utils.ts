// Comprehensive Facebook Sync Functions
// These functions provide comprehensive synchronization capabilities

export const comprehensiveSyncFunctions = {
  // Sync all posts from all pages
  syncAllPosts: async () => {
    try {
      const response = await fetch('/api/admin/social/facebook/database?action=sync-all-posts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to sync all posts');
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message,
        details: result.details || result.summary
      };
    } catch (error) {
      console.error('Sync all posts error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  // Sync all messages from all pages
  syncAllMessages: async () => {
    try {
      const response = await fetch('/api/admin/social/facebook/database?action=sync-all-messages', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to sync all messages');
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message,
        details: result.details || result.summary
      };
    } catch (error) {
      console.error('Sync all messages error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  // Comprehensive sync of all data
  syncAllData: async () => {
    try {
      const response = await fetch('/api/admin/social/facebook/database?action=sync-all-data', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to sync all data');
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message,
        details: result.details || result.summary
      };
    } catch (error) {
      console.error('Sync all data error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};

export default comprehensiveSyncFunctions;
