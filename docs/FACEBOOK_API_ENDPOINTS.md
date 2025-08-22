# Facebook Graph API v23.0 Endpoints Documentation

## Tổng quan
Tài liệu này mô tả tất cả các Facebook Graph API v23.0 endpoints được sử dụng trong TazaGroup Facebook Integration system.

---

## 📋 Danh sách Endpoints theo thứ tự chức năng

### 1. **Authentication & Token Management**

#### 1.1 Token Exchange
- **Endpoint:** `POST https://graph.facebook.com/v23.0/oauth/access_token`
- **Purpose:** Exchange short-lived token for long-lived token
- **Location:** `/app/api/admin/social/facebook/token/exchange/route.ts`
- **Parameters:**
  ```
  grant_type=fb_exchange_token
  client_id={APP_ID}
  client_secret={APP_SECRET}
  fb_exchange_token={SHORT_LIVED_TOKEN}
  ```
- **Response:** Long-lived access token (60 days validity)
- **Usage:** Initial token setup for Facebook integration

---

### 2. **Pages Management**

#### 2.1 Get User's Pages
- **Endpoint:** `GET https://graph.facebook.com/v23.0/me/accounts`
- **Purpose:** Fetch all pages user manages
- **Location:** `/app/api/admin/social/facebook/sync/pages/route.ts`
- **Parameters:**
  ```
  access_token={USER_ACCESS_TOKEN}
  fields=id,name,category,fan_count,followers_count,link,about,phone,website,access_token
  ```
- **Response:** Array of page objects with page access tokens
- **Usage:** Initial pages discovery and access token collection

---

### 3. **Posts Management**

#### 3.1 Get Page Posts
- **Endpoint:** `GET https://graph.facebook.com/v23.0/{page_id}/posts`
- **Purpose:** Fetch posts from a specific page
- **Locations:** 
  - `/app/api/admin/social/facebook/sync/posts/route.ts` (Main sync)
  - `/app/api/admin/social/facebook/debug-sync/route.ts` (Debug)
  - `/app/api/admin/social/facebook/test-sync/route.ts` (Testing)
- **Parameters:**
  ```
  access_token={PAGE_ACCESS_TOKEN}
  fields=id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true),shares,attachments{media,target,type,url,title,description},permalink_url,is_published
  limit=50
  ```
- **Response:** Array of post objects with metadata
- **Usage:** Main posts synchronization

---

### 4. **Comments Management**

#### 4.1 Get Post Comments
- **Endpoint:** `GET https://graph.facebook.com/v23.0/{post_id}/comments`
- **Purpose:** Fetch comments for a specific post
- **Locations:**
  - `/app/api/admin/social/facebook/sync/comments/route.ts` (Standard sync)
  - `/app/api/admin/social/facebook/sync/comments/smart/route.ts` (Smart sync)
- **Parameters:**
  ```
  access_token={PAGE_ACCESS_TOKEN}
  fields=id,from,message,created_time,likes.summary(true),can_reply,can_hide,can_like,is_hidden,parent
  limit=50
  ```
- **Response:** Array of comment objects
- **Usage:** Comments synchronization for engagement tracking

---

### 5. **Messages & Conversations Management**

#### 5.1 Get Page Conversations
- **Endpoint:** `GET https://graph.facebook.com/v23.0/{page_id}/conversations`
- **Purpose:** Fetch conversations for a page
- **Locations:**
  - `/app/api/admin/social/facebook/sync/messages/route.ts` (Standard sync)
  - `/app/api/admin/social/facebook/sync/messages/smart/route.ts` (Smart sync)
- **Parameters:**
  ```
  access_token={PAGE_ACCESS_TOKEN}
  fields=id,participants,message_count,unread_count,can_reply,snippet,updated_time
  limit=50
  ```
- **Response:** Array of conversation objects
- **Usage:** Customer conversation management

#### 5.2 Get Conversation Messages
- **Endpoint:** `GET https://graph.facebook.com/v23.0/{conversation_id}/messages`
- **Purpose:** Fetch messages from a specific conversation
- **Locations:**
  - `/app/api/admin/social/facebook/sync/messages/route.ts` (Standard sync)
  - `/app/api/admin/social/facebook/sync/messages/smart/route.ts` (Smart sync)
- **Parameters:**
  ```
  access_token={PAGE_ACCESS_TOKEN}
  fields=id,from,message,attachments,created_time,tags,is_echo
  limit=50 (standard) | limit=10 (smart)
  ```
- **Response:** Array of message objects
- **Usage:** Customer message tracking and response management

---

## 🔧 Technical Implementation Details

### Access Token Strategy
- **User Access Token:** Used only for initial pages discovery (`/me/accounts`)
- **Page Access Token:** Used for all page-specific operations (posts, comments, messages)
- **Storage:** Page access tokens stored in database (`facebook_pages` table)
- **Security:** No external tokens required after initial setup

### API Version Consistency
- **Version:** `v23.0` used consistently across all endpoints
- **Compatibility:** Current stable version with full feature support
- **Migration:** Easy to update version number globally if needed

### Error Handling Strategy
```typescript
// Standard error categorization
if (response.status === 400 && errorData.error?.message?.includes('permission')) {
  // Permission denied
} else if (response.status === 429) {
  // Rate limited
} else if (response.status === 404) {
  // Resource not found
} else {
  // Generic API error
}
```

### Rate Limiting Protection
- **Delays:** Built-in delays between API calls (100-200ms)
- **Limits:** Respect Facebook's rate limits per endpoint
- **Retry:** Graceful degradation on rate limit hits

---

## 📊 Endpoint Usage Statistics

### Primary Sync Endpoints (Production)
1. **Pages Sync:** Initial setup only
2. **Posts Sync:** Daily/hourly sync for content management
3. **Comments Sync:** Real-time/frequent sync for engagement
4. **Messages Sync:** Real-time sync for customer service

### Smart Endpoints (Recommended)
- **Comments Smart Sync:** `/sync/comments/smart` - Page-aware filtering
- **Messages Smart Sync:** `/sync/messages/smart` - Enhanced error handling

### Debug/Test Endpoints
- **Debug Sync:** Development testing only
- **Test Sync:** Unit testing validation

---

## 🚀 Performance Optimizations

### Batch Processing
- **Posts:** Up to 50 posts per API call
- **Comments:** Up to 50 comments per post
- **Messages:** Up to 50 conversations + 10-50 messages per conversation

### Smart Filtering
- **Page-specific:** Process only pages with valid access tokens
- **Permission-aware:** Skip resources without proper permissions
- **Error-resilient:** Continue processing despite individual failures

### Database Efficiency
- **Upsert operations:** Handle both new and updated records
- **Selective updates:** Only update changed fields
- **Transaction batching:** Group related operations

---

## 🔐 Security Considerations

### Token Management
- **Page tokens stored securely** in database
- **No hardcoded tokens** in source code
- **Token validation** before API calls
- **Automatic token refresh** when needed

### Permission Handling
- **Least privilege principle** - request minimum required permissions
- **Graceful degradation** when permissions insufficient
- **Clear error messaging** for permission issues

### Data Privacy
- **GDPR compliance** in data handling
- **User data encryption** in database
- **Audit logging** for all sync operations

---

## 🛠 Maintenance & Monitoring

### Health Checks
- **API availability** monitoring
- **Token expiration** alerts
- **Sync failure** notifications
- **Performance metrics** tracking

### Update Strategy
- **API version updates** planned quarterly
- **Backward compatibility** maintained
- **Feature flags** for new functionality
- **Rollback procedures** documented

---

## 📈 Future Enhancements

### Planned Features
1. **Webhooks integration** for real-time updates
2. **Advanced analytics** endpoints
3. **Media management** APIs
4. **Instagram integration** (Graph API)

### Performance Improvements
1. **Parallel processing** for multiple pages
2. **Incremental sync** based on timestamps
3. **Caching strategy** for frequently accessed data
4. **Queue-based processing** for large operations

---

*Last updated: August 22, 2025*
*API Version: v23.0*
*System: TazaGroup Facebook Integration*
