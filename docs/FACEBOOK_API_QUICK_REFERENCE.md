# Facebook Graph API v23.0 - Quick Reference

## 🔗 Endpoints Summary

| Endpoint | Purpose | Location | Status |
|----------|---------|----------|--------|
| `POST /oauth/access_token` | Token Exchange | `/token/exchange/route.ts` | ✅ Active |
| `GET /me/accounts` | Get User Pages | `/sync/pages/route.ts` | ✅ Active |
| `GET /{page_id}/posts` | Get Page Posts | `/sync/posts/route.ts` | ✅ Active |
| `GET /{post_id}/comments` | Get Post Comments | `/sync/comments/route.ts` | ✅ Active |
| `GET /{page_id}/conversations` | Get Page Conversations | `/sync/messages/route.ts` | ✅ Active |
| `GET /{conversation_id}/messages` | Get Conversation Messages | `/sync/messages/route.ts` | ✅ Active |

## 🎯 Access Token Types

| Token Type | Usage | Scope |
|------------|-------|-------|
| **User Access Token** | Initial pages discovery | `pages_manage_metadata, pages_read_engagement` |
| **Page Access Token** | All page operations | Page-specific permissions |

## ⚡ Quick Commands

### Test Endpoints
```bash
# Test pages sync
curl -X POST /api/admin/social/facebook/sync/pages \
  -H "Content-Type: application/json" \
  -d '{"accessToken":"USER_TOKEN"}'

# Test posts sync  
curl -X POST /api/admin/social/facebook/sync/posts \
  -d '{"pageIds":["PAGE_ID"]}'

# Test comments sync
curl -X POST /api/admin/social/facebook/sync/comments \
  -d '{"postIds":["POST_ID"],"pageId":"PAGE_ID"}'

# Test messages sync
curl -X POST /api/admin/social/facebook/sync/messages \
  -d '{"pageIds":["PAGE_ID"]}'
```

## 🔥 Smart Endpoints (Recommended)

- **Comments Smart:** `/sync/comments/smart` - Auto page filtering
- **Messages Smart:** `/sync/messages/smart` - Enhanced error handling

## 📊 Performance Limits

| Resource | Limit per Call | Frequency |
|----------|----------------|-----------|
| Posts | 50 | Hourly |
| Comments | 50 per post | Real-time |
| Messages | 10-50 per conversation | Real-time |
| Conversations | 50 per page | Real-time |

## 🚨 Common Issues & Fixes

| Error | Solution |
|-------|----------|
| `Invalid OAuth 2.0 Access Token` | Use page access token instead of user token |
| `This method must be called with a Page Access Token` | Check token type in database |
| `Unsupported get request` | Check permissions or resource existence |
| Rate limit exceeded | Implement delays and retry logic |

---

*Quick reference for TazaGroup Facebook API Integration*
