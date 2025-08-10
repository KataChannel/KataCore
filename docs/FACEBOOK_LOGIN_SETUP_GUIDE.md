# Facebook Login Setup Guide - TAZA Project

## 📋 Overview
This guide walks you through setting up Facebook Login for the TAZA project with comprehensive user management, including user creation and update functionality.

## ⚠️ HTTPS REQUIREMENT (Critical)
**Facebook requires HTTPS for all login-related API calls since June 8, 2018.**

### Allowed Environments:
- ✅ `https://` - Production and staging environments
- ✅ `localhost` - Local development 
- ✅ `127.0.0.1` - Local development

### Implementation:
All Facebook login components now include automatic HTTPS enforcement:

```javascript
// HTTPS check implemented in all Facebook login functions
const isSecure = window.location.protocol === 'https:' || 
                 window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1';

if (!isSecure) {
  throw new Error('Facebook login requires HTTPS. See: https://developers.facebook.com/blog/post/2018/06/08/enforce-https-facebook-login/');
}
```

**Reference:** [Facebook Developer Blog - Enforce HTTPS](https://developers.facebook.com/blog/post/2018/06/08/enforce-https-facebook-login/)

## 🔧 Environment Variables Setup

Add these variables to your `.env` file:

```bash
# ===== FACEBOOK INTEGRATION =====
NEXT_PUBLIC_FACEBOOK_APP_ID=633015044108937
FACEBOOK_APP_SECRET=929d5f0cbad24b614644492032224074
NEXT_PUBLIC_FACEBOOK_API_VERSION=v23.0
```

**⚠️ Security Note:** Never expose `FACEBOOK_APP_SECRET` in client-side code (no `NEXT_PUBLIC_` prefix).

## 🚀 Quick Start

### 1. Run Setup Check
```bash
npm run facebook:check
```

### 2. Start Development Server with HTTPS
```bash
npm run dev:https
```

### 3. Test Facebook Login
Navigate to your login page and test Facebook authentication.

## 📁 Files Modified/Created

### Core Authentication Files:
- `app/api/auth/facebook/route.ts` - Facebook authentication API endpoint
- `src/lib/auth/unified-auth.service.ts` - Enhanced with `socialLoginOrUpdate` method
- `src/components/auth/SocialLoginButton.tsx` - Facebook login UI component
- `src/types/social-auth.d.ts` - TypeScript definitions for Facebook SDK

### Configuration Files:
- `.env` - Environment variables (updated security)
- `package.json` - Added Facebook setup scripts
- `scripts/check-facebook-setup.js` - Setup validation script

## 🔐 Security Features

### HTTPS Requirement
Facebook Login requires HTTPS for security. The implementation includes:
- ✅ Automatic HTTPS detection
- ✅ Localhost development support
- ✅ Secure error messages for non-HTTPS environments

### Token Management
- ✅ Server-side token verification
- ✅ Secure cookie storage for refresh tokens
- ✅ Client-side access token management

### User Data Protection
- ✅ Email verification from Facebook
- ✅ Sensitive data sanitization
- ✅ Secure user profile updates

## 👤 User Management Features

### New User Creation
When a user logs in with Facebook for the first time:
- ✅ Creates new user account
- ✅ Sets verified status (Facebook emails are pre-verified)
- ✅ Stores Facebook profile information
- ✅ Links Facebook ID to user account

### Existing User Updates
When an existing user logs in with Facebook:
- ✅ Updates last login timestamp
- ✅ Increments login count
- ✅ Updates profile information if missing/outdated
- ✅ Links Facebook account if not already linked
- ✅ Preserves existing user data

### Profile Data Handled
- ✅ Display name
- ✅ First name & last name
- ✅ Profile avatar
- ✅ Email address
- ✅ Facebook user ID
- ✅ Account verification status

## 🛠 API Endpoints

### POST `/api/auth/facebook`
Handles Facebook authentication and user management.

**Request Body:**
```json
{
  "token": "facebook_access_token",
  "userID": "facebook_user_id"
}
```

**Success Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "displayName": "User Name",
    "firstName": "User",
    "lastName": "Name",
    "avatar": "profile_picture_url",
    "role": "user_role",
    "isVerified": true,
    "provider": "facebook",
    "loginCount": 1
  },
  "accessToken": "jwt_access_token",
  "message": "Login successful"
}
```

### GET `/api/auth/facebook?token=access_token`
Validates Facebook token status.

## 🧪 Testing

### Manual Testing Steps:
1. **Setup Check:** Run `npm run facebook:check`
2. **HTTPS Test:** Ensure app runs on HTTPS or localhost
3. **Login Flow:** Test complete Facebook login process
4. **User Creation:** Test with new Facebook account
5. **User Update:** Test with existing user account
6. **Error Handling:** Test without HTTPS, invalid tokens

### Browser Console Testing:
```javascript
// Check if Facebook SDK is loaded
window.FB ? console.log('✅ Facebook SDK loaded') : console.log('❌ Facebook SDK not loaded');

// Check Facebook login status
if (window.FB) {
  window.FB.getLoginStatus(response => console.log('FB Status:', response));
}
```

## 🔧 Development Commands

```bash
# Check Facebook setup
npm run facebook:check

# Start with HTTPS (required for Facebook)
npm run dev:https

# Regular development (Facebook may not work)
npm run dev

# Test Facebook functionality
npm run facebook:test
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Facebook SDK not loaded"**
   - Check internet connection
   - Verify Facebook App ID in environment variables
   - Check browser console for script loading errors

2. **"Facebook login requires HTTPS"**
   - Use `npm run dev:https` for development
   - Or access via `https://localhost:3000`
   - In production, ensure SSL certificate is properly configured

3. **"Invalid Facebook token"**
   - Check Facebook App configuration
   - Verify App Secret is correctly set (server-side only)
   - Ensure App ID matches your Facebook App

4. **"Email already exists"**
   - User has an account with different provider
   - Implement account linking UI if needed
   - Or guide user to use original login method

### Debug Mode:
Enable detailed logging by setting `NODE_ENV=development`.

## 📱 Facebook App Configuration

Ensure your Facebook App is configured with:

1. **Valid OAuth Redirect URIs:**
   - `https://yourdomain.com`
   - `https://localhost:3000` (for development)

2. **App Domains:**
   - `yourdomain.com`
   - `localhost` (for development)

3. **Required Permissions:**
   - `email` (required)
   - `public_profile` (required)

## 🔄 Future Enhancements

Planned improvements:
- [ ] Facebook account unlinking
- [ ] Profile picture sync preferences
- [ ] Facebook friends integration
- [ ] Advanced permission scopes
- [ ] Login analytics

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Run `npm run facebook:check` for diagnostics
3. Review browser console for detailed error messages
4. Verify Facebook App configuration in Facebook Developers

---

**✅ Facebook Login is now fully configured for the TAZA project!**
