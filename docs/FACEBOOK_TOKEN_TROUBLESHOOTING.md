/**
 * FACEBOOK TOKEN TROUBLESHOOTING GUIDE
 * ===================================
 * 
 * Solutions for "invalid_token" and "session invalidated" errors
 */

# Facebook Access Token Issues - Troubleshooting Guide

## Problem: "Error validating access token: The session was invalidated previously using an API call"

### Common Causes:
1. **Expired Access Token**: Facebook access tokens have limited lifespans
2. **Invalidated Session**: Token was manually revoked or app permissions changed
3. **API Version Mismatch**: Using incompatible Facebook Graph API version
4. **App Configuration Issues**: Facebook App settings problems

### Solutions:

#### 1. Generate New Access Token
```bash
# Go to Facebook Graph API Explorer
# https://developers.facebook.com/tools/explorer/

# Steps:
1. Select your Facebook App
2. Choose "Get Page Access Token" 
3. Select required permissions:
   - pages_read_engagement
   - pages_manage_posts
   - pages_read_user_content
   - pages_show_list
4. Generate Access Token
5. Copy the new token
```

#### 2. Update Token in Application
```typescript
// Option A: Environment Variables (Recommended)
// Add to .env.local:
NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN=your_new_token_here
NEXT_PUBLIC_FACEBOOK_PAGE_ID=your_page_id_here

// Option B: localStorage (Development only)
localStorage.setItem('NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN', 'your_new_token_here');
localStorage.setItem('NEXT_PUBLIC_FACEBOOK_PAGE_ID', 'your_page_id_here');
```

#### 3. Get Long-Lived Token (Recommended)
```bash
# Exchange short-lived token for long-lived token (60 days)
curl -G "https://graph.facebook.com/v20.0/oauth/access_token" \
  -d "grant_type=fb_exchange_token" \
  -d "client_id=YOUR_APP_ID" \
  -d "client_secret=YOUR_APP_SECRET" \
  -d "fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
```

#### 4. Page Access Token (Best for Page Operations)
```bash
# Get permanent page access token
curl -G "https://graph.facebook.com/v20.0/me/accounts" \
  -d "access_token=YOUR_LONG_LIVED_USER_TOKEN"

# Use the page access token from the response
```

### Testing Your Token:

#### Test Token Validity:
```bash
curl "https://graph.facebook.com/v20.0/me?access_token=YOUR_TOKEN"
```

#### Test Token Permissions:
```bash
curl "https://graph.facebook.com/v20.0/me/permissions?access_token=YOUR_TOKEN"
```

#### Test Page Access:
```bash
curl "https://graph.facebook.com/v20.0/YOUR_PAGE_ID/posts?access_token=YOUR_TOKEN&limit=5"
```

### Token Types & Lifespans:

1. **User Access Token**: 1-2 hours (short-lived)
2. **Extended User Token**: 60 days (long-lived)
3. **Page Access Token**: Never expires (when from long-lived user token)
4. **App Access Token**: Never expires (for app-level operations)

### Best Practices:

1. **Use Page Access Tokens** for page operations
2. **Store tokens securely** in environment variables
3. **Implement token refresh** logic in production
4. **Monitor token expiration** and renew proactively
5. **Handle token errors gracefully** with user-friendly messages

### Error Codes Reference:

- **190**: Invalid access token
- **102**: Session key invalid  
- **458**: App not installed
- **460**: Password changed
- **463**: Expired session
- **464**: Session invalidated
- **467**: Invalid access token signature

### Quick Fix Commands:

```bash
# 1. Check current token in app
curl "http://localhost:3900/api/admin/social/facebook/database?action=pages"

# 2. Test token directly with Facebook
curl "https://graph.facebook.com/v20.0/me?access_token=YOUR_TOKEN"

# 3. Get new token from Graph API Explorer
# https://developers.facebook.com/tools/explorer/

# 4. Update environment variable
echo "NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN=new_token_here" >> .env.local

# 5. Restart development server
bun run dev
```

### Emergency Recovery:

If you can't access Facebook Graph API Explorer:

1. **Facebook Business Manager**: Go to Business Settings → System Users
2. **Create System User** with required permissions
3. **Generate Access Token** for the system user
4. **Use System User Token** (longer lifespan)

### Monitoring & Alerts:

Consider implementing:
- Token expiration monitoring
- Automatic token refresh
- Error alerting system
- Fallback authentication methods

---

**Remember**: Always keep your access tokens secure and never commit them to version control!

export {};
