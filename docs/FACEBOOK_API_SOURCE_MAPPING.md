# Facebook Graph API v23.0 - Source Code Mapping

## 📁 File Structure & Endpoints

```
app/api/admin/social/facebook/
├── token/
│   └── exchange/route.ts          → POST /oauth/access_token
├── sync/
│   ├── pages/route.ts             → GET /me/accounts  
│   ├── posts/route.ts             → GET /{page_id}/posts
│   ├── comments/
│   │   ├── route.ts               → GET /{post_id}/comments
│   │   └── smart/route.ts         → GET /{post_id}/comments (enhanced)
│   └── messages/
│       ├── route.ts               → GET /{page_id}/conversations + /{conversation_id}/messages
│       └── smart/route.ts         → GET /{page_id}/conversations + /{conversation_id}/messages (enhanced)
├── debug-sync/route.ts            → GET /{page_id}/posts (debug)
└── test-sync/route.ts             → GET /{page_id}/posts (test)
```

## 🔍 Detailed Endpoint Mapping

### 1. Authentication (1 endpoint)
```typescript
// File: app/api/admin/social/facebook/token/exchange/route.ts
// Line: 15
const exchangeUrl = new URL('https://graph.facebook.com/v23.0/oauth/access_token');
```

### 2. Pages Management (1 endpoint)
```typescript
// File: app/api/admin/social/facebook/sync/pages/route.ts  
// Line: 21
`https://graph.facebook.com/v23.0/me/accounts?access_token=${accessToken}&fields=id,name,category,fan_count,followers_count,link,about,phone,website,access_token`
```

### 3. Posts Management (4 endpoints)
```typescript
// File: app/api/admin/social/facebook/sync/posts/route.ts
// Line: 72 (Production)
`https://graph.facebook.com/v23.0/${page.facebookPageId}/posts?access_token=${pageAccessToken}&fields=id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true),shares,attachments{media,target,type,url,title,description},permalink_url,is_published&limit=50`

// File: app/api/admin/social/facebook/debug-sync/route.ts  
// Line: 41 (Debug)
`https://graph.facebook.com/v23.0/${pageId}/posts?access_token=${page.accessToken}&fields=id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true),shares,attachments{media,target,type,url,title,description},permalink_url,is_published&limit=10`

// File: app/api/admin/social/facebook/test-sync/route.ts
// Line: 35 (Test)  
`https://graph.facebook.com/v23.0/${testPage.facebookPageId}/posts?access_token=${testPage.accessToken}&fields=id,message,created_time,likes.summary(true)&limit=3`

// File: debug-facebook-sync.ts
// Line: 67, 116 (Development tools)
`https://graph.facebook.com/v23.0/${testPage.facebookPageId}/posts?access_token=${testPage.accessToken}&fields=id,message,created_time&limit=5`
```

### 4. Comments Management (2 endpoints)
```typescript
// File: app/api/admin/social/facebook/sync/comments/route.ts
// Line: 81 (Standard)
`https://graph.facebook.com/v23.0/${postId}/comments?access_token=${accessToken}&fields=id,from,message,created_time,likes.summary(true),can_reply,can_hide,can_like,is_hidden,parent&limit=50`

// File: app/api/admin/social/facebook/sync/comments/smart/route.ts  
// Line: 66 (Smart - Recommended)
`https://graph.facebook.com/v23.0/${post.facebookPostId}/comments?access_token=${page.accessToken}&fields=id,from,message,created_time,likes.summary(true),can_reply,can_hide,can_like,is_hidden,parent&limit=50`
```

### 5. Messages & Conversations Management (4 endpoints)
```typescript
// File: app/api/admin/social/facebook/sync/messages/route.ts
// Line: 64 (Conversations - Standard)
`https://graph.facebook.com/v23.0/${pageId}/conversations?access_token=${pageInfo.token}&fields=id,participants,message_count,unread_count,can_reply,snippet,updated_time&limit=50`

// Line: 127 (Messages - Standard)  
`https://graph.facebook.com/v23.0/${conversation.id}/messages?access_token=${pageInfo.token}&fields=id,from,message,attachments,created_time,tags,is_echo&limit=50`

// File: app/api/admin/social/facebook/sync/messages/smart/route.ts
// Line: 57 (Conversations - Smart - Recommended)
`https://graph.facebook.com/v23.0/${pageId}/conversations?access_token=${page.accessToken}&fields=id,participants,message_count,unread_count,can_reply,snippet,updated_time&limit=${limit}`

// Line: 130 (Messages - Smart - Recommended)
`https://graph.facebook.com/v23.0/${conversation.id}/messages?access_token=${page.accessToken}&fields=id,from,message,attachments,created_time,tags,is_echo&limit=10`
```

### 6. Development & Debug Tools (2 endpoints)
```typescript
// File: debug-facebook-sync.ts
// Line: 49 (Page validation)
`https://graph.facebook.com/v23.0/${testPage.facebookPageId}?access_token=${testPage.accessToken}&fields=id,name,category`
```

## 🏷️ Field Specifications by Resource

### Page Fields
```
id, name, category, fan_count, followers_count, link, about, phone, website, access_token
```

### Post Fields  
```
id, message, story, created_time, updated_time, likes.summary(true), comments.summary(true), shares, attachments{media,target,type,url,title,description}, permalink_url, is_published
```

### Comment Fields
```
id, from, message, created_time, likes.summary(true), can_reply, can_hide, can_like, is_hidden, parent
```

### Conversation Fields
```
id, participants, message_count, unread_count, can_reply, snippet, updated_time
```

### Message Fields
```
id, from, message, attachments, created_time, tags, is_echo
```

## 🔄 Access Token Flow

```mermaid
graph TD
    A[User Access Token] --> B[/me/accounts]
    B --> C[Page Access Tokens]
    C --> D[/{page_id}/posts]
    C --> E[/{page_id}/conversations]
    C --> F[/{post_id}/comments]
    E --> G[/{conversation_id}/messages]
```

## 📊 Usage Frequency

| Endpoint Type | Frequency | Purpose |
|---------------|-----------|---------|
| **Token Exchange** | Once per setup | Authentication |
| **Pages Sync** | Once per setup | Initial discovery |
| **Posts Sync** | Hourly/Daily | Content management |
| **Comments Sync** | Real-time | Engagement tracking |
| **Messages Sync** | Real-time | Customer service |

## 🚀 Recommended Endpoints

### Production Use
- ✅ **Posts:** `/sync/posts/route.ts`
- ✅ **Comments:** `/sync/comments/smart/route.ts` (Smart version)
- ✅ **Messages:** `/sync/messages/smart/route.ts` (Smart version)

### Development/Testing
- 🛠️ **Debug:** `/debug-sync/route.ts`
- 🧪 **Test:** `/test-sync/route.ts`

---

*Complete mapping of Facebook Graph API v23.0 endpoints in TazaGroup codebase*
