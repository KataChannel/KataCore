# 🚨 Facebook User Profile Access Issues & Permissions Analysis

## 🔍 Vấn đề Phát Hiện

### 1. **URL Facebook Profile**
- ✅ **URL hoạt động**: `https://www.facebook.com/24271147095873149` trả về HTTP 200 OK
- ❌ **API Facebook không truy cập được**: Graph API trả về lỗi permissions

### 2. **Lỗi API Cụ Thể**
```
Error: "(#100) Tried accessing nonexisting field (phone) on node type (User)"
```

**📌 Nguyên nhân:**
- Facebook Graph API v23.0 đã **DEPRECATED** field `phone` cho User nodes
- Chỉ page access tokens mới có thể truy cập một số user fields
- User privacy settings cao không cho phép truy cập public profile

---

## 📋 Facebook Graph API User Fields - Permissions Required

### ✅ **Public Fields (Không cần permissions)**
```typescript
// Các field này có thể truy cập mà không cần đặc biệt permissions
const publicFields = [
  'id',
  'name',
  'picture'
];
```

### ⚠️ **Limited Fields (Cần permissions)**
```typescript
// Cần specific permissions hoặc user consent
const limitedFields = [
  'email',          // Cần permission: email
  'birthday',       // Cần permission: user_birthday
  'location',       // Cần permission: user_location
  'hometown',       // Cần permission: user_hometown
  'relationship_status', // Cần permission: user_relationships
  'work',          // Cần permission: user_work_history
  'education',     // Cần permission: user_education_history
  'about',         // Cần permission: user_about_me
  'gender',        // Deprecated và cần permission
  'age_range',     // Cần permission: user_age_range
  'locale',        // Có thể truy cập nhưng không đáng tin cậy
  'timezone',      // Deprecated
  'updated_time'   // Có thể truy cập
];
```

### ❌ **Deprecated/Removed Fields**
```typescript
// Các field này đã bị xóa hoặc deprecated trong v23.0
const deprecatedFields = [
  'phone',         // ❌ REMOVED - Không còn available
  'interested_in', // ❌ DEPRECATED
  'political',     // ❌ REMOVED  
  'religion',      // ❌ REMOVED
  'quotes',        // ❌ REMOVED
  'website'        // ❌ REMOVED cho User nodes
];
```

---

## 🔑 Permissions Cần Có Để Truy Cập User Data

### **App-level Permissions**
Để truy cập user profile data, Facebook app cần có các permissions sau được approve bởi Meta:

```typescript
const requiredPermissions = [
  // Basic Info
  'public_profile',     // ✅ Default - name, id, picture
  
  // Contact Info  
  'email',             // ⚠️ Cần review - email address
  
  // Personal Info
  'user_birthday',     // ⚠️ Cần review - birthday
  'user_location',     // ⚠️ Cần review - current city
  'user_hometown',     // ⚠️ Cần review - hometown
  
  // Relationship & Life
  'user_relationships', // ⚠️ Cần review - relationship status
  'user_work_history', // ⚠️ Cần review - work experience
  'user_education_history', // ⚠️ Cần review - education
  
  // Additional
  'user_about_me',     // ⚠️ Cần review - about section
  'user_age_range'     // ⚠️ Cần review - age range
];
```

### **Token Types**
```typescript
// User Access Token vs Page Access Token
const tokenCapabilities = {
  userAccessToken: {
    canAccess: ['public_profile', 'email'], // Limited to approved permissions
    scope: 'User gave explicit consent',
    lifespan: '60 days (long-lived)'
  },
  
  pageAccessToken: {
    canAccess: ['page_data', 'page_insights', 'conversations'], 
    scope: 'Page management only',
    lifespan: 'Unlimited (until page permissions revoked)'
  }
};
```

---

## 🛠️ Current Implementation Issues

### **1. API Call với Deprecated Fields**
**File:** `/app/api/admin/social/facebook/user-profile/route.ts`

```typescript
// ❌ PROBLEMATIC - Contains deprecated fields
const profileResponse = await fetch(
  `https://graph.facebook.com/v23.0/${userId}?access_token=${accessToken}&fields=id,name,email,picture,location,hometown,work,education,relationship_status,birthday,gender,about,phone,locale,timezone,updated_time`
);
```

**Issues:**
- `phone` field không còn available → Gây lỗi API
- `gender`, `timezone` deprecated
- Sử dụng page access token để fetch user data (không đúng scope)

### **2. Access Token Type Mismatch**
```typescript
// ❌ WRONG - Using page access token for user data
const pageAccessToken = page.accessToken;  // This is for page management
const userProfileCall = `${userId}?access_token=${pageAccessToken}`;  // Wrong scope
```

**Correct approach:**
```typescript
// ✅ CORRECT - Need user access token with proper permissions
const userAccessToken = userConsentedToken;  // From OAuth flow
const userProfileCall = `${userId}?access_token=${userAccessToken}`;
```

---

## 🔧 Solutions & Fixes

### **Fix 1: Remove Deprecated Fields**
```typescript
// ✅ FIXED API Call
const profileResponse = await fetch(
  `https://graph.facebook.com/v23.0/${userId}?access_token=${accessToken}&fields=id,name,picture,email,location,hometown,work,education,relationship_status,birthday,about,age_range,locale,updated_time`
);
```

### **Fix 2: Implement Proper User OAuth Flow**
```typescript
// Need to implement user consent flow for accessing their profile data
const facebookOAuthUrl = `https://www.facebook.com/v23.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=public_profile,email,user_location,user_hometown&response_type=code`;
```

### **Fix 3: Use Alternative Data Sources**
```typescript
// Since direct user profile access is limited, use available interaction data
const userDataSources = {
  fromMessages: extractPhoneFromMessage(user.messages),
  fromComments: extractLocationFromComments(user.comments),
  fromInteractions: extractPersonalInfoFromConversations(user.interactions),
  publicProfile: getPublicFieldsOnly(user.id) // Only id, name, picture
};
```

---

## 📊 Current Working Permissions Analysis

### **Permissions Hiện Có**
Dựa trên code analysis, hiện tại có:

```typescript
const currentlyWorking = {
  pageManagement: '✅ Full access',
  postsAccess: '✅ Full access', 
  commentsAccess: '✅ Full access',
  messagesAccess: '✅ Full access via page tokens',
  conversationsAccess: '✅ Full access via page tokens',
  
  userProfileAccess: '❌ Limited/Broken',
  userPersonalData: '❌ No permissions',
  userContactInfo: '❌ No access'
};
```

### **Missing Permissions cho User Data**
```typescript
const missingPermissions = [
  'user_birthday',
  'user_location', 
  'user_hometown',
  'user_work_history',
  'user_education_history',
  'user_relationships',
  'user_about_me',
  'user_age_range'
];
```

---

## 🚀 Recommended Implementation Strategy

### **Strategy 1: Fix Current API Calls (Immediate)**
1. Remove deprecated fields từ API calls
2. Handle permissions errors gracefully
3. Use only available public fields

### **Strategy 2: Enhance Data Extraction (Short-term)**
1. Improve text parsing from messages/comments
2. Build user profiles from interaction data
3. Use AI/ML để extract personal info từ conversations

### **Strategy 3: Implement User Consent Flow (Long-term)**
1. Add Facebook Login integration
2. Request user permissions cho personal data
3. Store user access tokens sau khi consent

### **Strategy 4: Alternative Data Sources**
1. Use phone number extraction từ messages
2. Location inference từ conversation context
3. Interest analysis từ comment patterns
4. Behavior analysis từ interaction frequency

---

## 🔗 Debugging Commands

### **Test User Profile Access**
```bash
# Test với public fields only
curl "https://graph.facebook.com/v23.0/24271147095873149?access_token=YOUR_TOKEN&fields=id,name,picture"

# Test permissions
curl "https://graph.facebook.com/v23.0/me/permissions?access_token=YOUR_TOKEN"

# Test app permissions
curl "https://graph.facebook.com/v23.0/YOUR_APP_ID?access_token=YOUR_TOKEN&fields=restrictions"
```

### **Current Error Recreation**
```bash
# This will fail due to deprecated phone field
curl "https://graph.facebook.com/v23.0/24271147095873149?access_token=PAGE_TOKEN&fields=phone"
# Error: "(#100) Tried accessing nonexisting field (phone) on node type (User)"
```

---

## 📈 Next Steps

1. **Immediate**: Fix deprecated fields trong API calls
2. **Short-term**: Enhance data extraction từ existing conversations
3. **Medium-term**: Implement user OAuth flow
4. **Long-term**: Apply for advanced permissions từ Meta

**Priority**: Start with fixing deprecated fields để resolve immediate API errors.
