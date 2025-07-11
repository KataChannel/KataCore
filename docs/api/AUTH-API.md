# 🔐 TazaCore Authentication API Documentation

## Overview
The TazaCore Authentication API provides secure user authentication, authorization, and session management for the TazaCore platform. It supports multiple authentication methods including JWT tokens, OAuth2, and API keys.

## Base URL
```
https://your-domain.com/api/auth
```

## Authentication Methods

### 1. JWT Token Authentication
Most common method for web applications and mobile apps.

### 2. API Key Authentication
For server-to-server communication and automated systems.

### 3. OAuth2 Authentication
For third-party integrations and SSO.

## Endpoints

### 🔑 User Authentication

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "rememberMe": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_001",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "permissions": ["read", "write", "delete"],
      "lastLogin": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": 3600
    }
  }
}
```

#### Register
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "acceptTerms": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification.",
  "data": {
    "user": {
      "id": "user_002",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "status": "pending_verification",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### Logout
```http
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": 3600
    }
  }
}
```

### 📧 Email Verification

#### Send Verification Email
```http
POST /api/auth/verify/send
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

#### Verify Email
```http
POST /api/auth/verify/confirm
```

**Request Body:**
```json
{
  "token": "verification_token_here",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "user_002",
      "email": "user@example.com",
      "status": "active",
      "verifiedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 🔄 Password Reset

#### Request Password Reset
```http
POST /api/auth/password/reset-request
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

#### Reset Password
```http
POST /api/auth/password/reset
```

**Request Body:**
```json
{
  "token": "reset_token_here",
  "email": "user@example.com",
  "newPassword": "newSecurePassword123",
  "confirmPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

#### Change Password
```http
POST /api/auth/password/change
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword123",
  "confirmPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 👤 User Profile

#### Get Current User
```http
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_001",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "permissions": ["read", "write", "delete"],
      "profile": {
        "avatar": "https://example.com/avatar.jpg",
        "phone": "+1-555-0123",
        "department": "Engineering",
        "position": "Senior Developer"
      },
      "settings": {
        "theme": "dark",
        "language": "en",
        "notifications": true
      },
      "lastLogin": "2024-01-15T10:30:00Z",
      "createdAt": "2023-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### Update Profile
```http
PUT /api/auth/profile
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-0123",
  "profile": {
    "avatar": "https://example.com/new-avatar.jpg",
    "department": "Engineering",
    "position": "Senior Developer"
  },
  "settings": {
    "theme": "dark",
    "language": "en",
    "notifications": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "user_001",
      "updatedAt": "2024-01-15T15:45:00Z"
    }
  }
}
```

### 🔑 API Key Management

#### Generate API Key
```http
POST /api/auth/api-keys
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "name": "Production API Key",
  "description": "API key for production environment",
  "permissions": ["read", "write"],
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "API key generated successfully",
  "data": {
    "apiKey": {
      "id": "key_001",
      "name": "Production API Key",
      "key": "taza_live_sk_1234567890abcdef",
      "permissions": ["read", "write"],
      "expiresAt": "2024-12-31T23:59:59Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### List API Keys
```http
GET /api/auth/api-keys
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "apiKeys": [
      {
        "id": "key_001",
        "name": "Production API Key",
        "keyPreview": "taza_live_sk_1234...cdef",
        "permissions": ["read", "write"],
        "lastUsed": "2024-01-15T10:30:00Z",
        "expiresAt": "2024-12-31T23:59:59Z",
        "status": "active",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### Revoke API Key
```http
DELETE /api/auth/api-keys/{id}
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

### 🔐 OAuth2 Authentication

#### OAuth2 Authorization URL
```http
GET /api/auth/oauth/authorize
```

**Query Parameters:**
- `client_id` (required): OAuth2 client ID
- `redirect_uri` (required): Redirect URI after authorization
- `response_type` (required): "code" for authorization code flow
- `scope` (optional): Requested permissions (space-separated)
- `state` (optional): State parameter for security

**Response:**
```
HTTP/1.1 302 Found
Location: https://your-domain.com/oauth/authorize?client_id=...&redirect_uri=...&response_type=code&scope=read+write&state=...
```

#### OAuth2 Token Exchange
```http
POST /api/auth/oauth/token
```

**Request Body (application/x-www-form-urlencoded):**
```
grant_type=authorization_code
&code=auth_code_here
&client_id=your_client_id
&client_secret=your_client_secret
&redirect_uri=https://your-app.com/callback
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "scope": "read write"
}
```

#### OAuth2 User Info
```http
GET /api/auth/oauth/userinfo
```

**Headers:**
```
Authorization: Bearer <oauth-access-token>
```

**Response:**
```json
{
  "sub": "user_001",
  "email": "user@example.com",
  "name": "John Doe",
  "given_name": "John",
  "family_name": "Doe",
  "picture": "https://example.com/avatar.jpg",
  "email_verified": true
}
```

### 🛡️ Two-Factor Authentication (2FA)

#### Enable 2FA
```http
POST /api/auth/2fa/enable
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "message": "2FA setup initiated",
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "secret": "JBSWY3DPEHPK3PXP",
    "backupCodes": [
      "12345678",
      "87654321",
      "11111111",
      "22222222",
      "33333333"
    ]
  }
}
```

#### Confirm 2FA Setup
```http
POST /api/auth/2fa/confirm
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "token": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "2FA enabled successfully"
}
```

#### Verify 2FA Token
```http
POST /api/auth/2fa/verify
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "token": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "2FA token verified successfully"
}
```

#### Disable 2FA
```http
POST /api/auth/2fa/disable
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "password": "currentPassword123",
  "token": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "2FA disabled successfully"
}
```

### 📊 Session Management

#### Get Active Sessions
```http
GET /api/auth/sessions
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session_001",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "ipAddress": "192.168.1.100",
        "location": "New York, NY",
        "device": "Desktop",
        "browser": "Chrome",
        "current": true,
        "lastActivity": "2024-01-15T10:30:00Z",
        "createdAt": "2024-01-15T09:00:00Z"
      }
    ]
  }
}
```

#### Revoke Session
```http
DELETE /api/auth/sessions/{id}
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Session revoked successfully"
}
```

#### Revoke All Sessions
```http
DELETE /api/auth/sessions/all
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "message": "All sessions revoked successfully"
}
```

### 🔍 Security Audit

#### Get Security Events
```http
GET /api/auth/security/events
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Event type filter
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "event_001",
        "type": "login_success",
        "description": "User logged in successfully",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "location": "New York, NY",
        "riskLevel": "low",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      {
        "id": "event_002",
        "type": "login_failed",
        "description": "Failed login attempt",
        "ipAddress": "192.168.1.200",
        "userAgent": "Mozilla/5.0...",
        "location": "Unknown",
        "riskLevel": "medium",
        "timestamp": "2024-01-15T10:25:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

## Error Handling

### Common Error Responses

#### Invalid Credentials
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

#### Token Expired
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Access token has expired"
  }
}
```

#### Account Locked
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account has been locked due to multiple failed login attempts",
    "details": {
      "lockedUntil": "2024-01-15T11:30:00Z",
      "remainingTime": 1800
    }
  }
}
```

#### Rate Limit Exceeded
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 60
    }
  }
}
```

### HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Security Features

### 🔐 Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Cannot be a common password

### 🛡️ Security Measures
- **Password Hashing**: bcrypt with salt rounds
- **Token Security**: JWT with RS256 signing
- **Rate Limiting**: Configurable per endpoint
- **Account Lockout**: After failed attempts
- **IP Whitelisting**: For sensitive operations
- **Device Fingerprinting**: For fraud detection
- **Audit Logging**: All security events logged

### 🔍 Token Security
- **Access Token**: Short-lived (1 hour default)
- **Refresh Token**: Long-lived (30 days default)
- **Token Rotation**: Automatic refresh token rotation
- **Token Revocation**: Immediate token invalidation
- **Token Blacklisting**: Revoked tokens blacklisted

## Rate Limiting

### Default Limits
- **Login attempts**: 5 per minute per IP
- **Registration**: 3 per minute per IP
- **Password reset**: 1 per minute per email
- **API key generation**: 10 per hour per user
- **Profile updates**: 20 per hour per user

### Rate Limit Headers
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1640995200
X-RateLimit-RetryAfter: 60
```

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

class TazaCoreAuth {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.accessToken = null;
    this.refreshToken = null;
  }

  async login(email, password) {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email,
        password
      });
      
      this.accessToken = response.data.data.tokens.accessToken;
      this.refreshToken = response.data.data.tokens.refreshToken;
      
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.error.message);
    }
  }

  async getProfile() {
    try {
      const response = await axios.get(`${this.baseURL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      if (error.response.status === 401) {
        await this.refreshAccessToken();
        return this.getProfile();
      }
      throw new Error(error.response.data.error.message);
    }
  }

  async refreshAccessToken() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refreshToken: this.refreshToken
      });
      
      this.accessToken = response.data.data.tokens.accessToken;
      this.refreshToken = response.data.data.tokens.refreshToken;
      
      return response.data;
    } catch (error) {
      this.accessToken = null;
      this.refreshToken = null;
      throw new Error('Session expired. Please login again.');
    }
  }

  async logout() {
    try {
      await axios.post(`${this.baseURL}/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });
      
      this.accessToken = null;
      this.refreshToken = null;
    } catch (error) {
      // Ignore errors during logout
    }
  }
}

// Usage
const auth = new TazaCoreAuth('https://your-domain.com/api');
await auth.login('user@example.com', 'password123');
const profile = await auth.getProfile();
```

### Python
```python
import requests
import time

class TazaCoreAuth:
    def __init__(self, base_url):
        self.base_url = base_url
        self.access_token = None
        self.refresh_token = None
        self.session = requests.Session()
    
    def login(self, email, password):
        response = self.session.post(f'{self.base_url}/auth/login', json={
            'email': email,
            'password': password
        })
        
        if response.status_code == 200:
            data = response.json()
            self.access_token = data['data']['tokens']['accessToken']
            self.refresh_token = data['data']['tokens']['refreshToken']
            self.session.headers.update({
                'Authorization': f'Bearer {self.access_token}'
            })
            return data
        else:
            raise Exception(response.json()['error']['message'])
    
    def get_profile(self):
        response = self.session.get(f'{self.base_url}/auth/me')
        
        if response.status_code == 401:
            self.refresh_access_token()
            response = self.session.get(f'{self.base_url}/auth/me')
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(response.json()['error']['message'])
    
    def refresh_access_token(self):
        response = self.session.post(f'{self.base_url}/auth/refresh', json={
            'refreshToken': self.refresh_token
        })
        
        if response.status_code == 200:
            data = response.json()
            self.access_token = data['data']['tokens']['accessToken']
            self.refresh_token = data['data']['tokens']['refreshToken']
            self.session.headers.update({
                'Authorization': f'Bearer {self.access_token}'
            })
        else:
            self.access_token = None
            self.refresh_token = None
            raise Exception('Session expired. Please login again.')

# Usage
auth = TazaCoreAuth('https://your-domain.com/api')
auth.login('user@example.com', 'password123')
profile = auth.get_profile()
```

## Testing

### Demo Credentials
```
Email: demo@tazacore.com
Password: Demo123456!
```

### Test Endpoints
```bash
# Login
curl -X POST "https://demo.tazacore.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@tazacore.com",
    "password": "Demo123456!"
  }'

# Get profile
curl -X GET "https://demo.tazacore.com/api/auth/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Register new user
curl -X POST "https://demo.tazacore.com/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Test123456!",
    "confirmPassword": "Test123456!",
    "acceptTerms": true
  }'
```

## Webhooks

### Authentication Events
The system can send webhook notifications for authentication events:

```json
{
  "event": "user.login",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "userId": "user_001",
    "email": "user@example.com",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "location": "New York, NY"
  }
}
```

### Supported Events
- `user.login`
- `user.logout`
- `user.register`
- `user.verify_email`
- `user.password_reset`
- `user.2fa_enabled`
- `user.2fa_disabled`
- `user.account_locked`
- `user.suspicious_activity`

## Support

For authentication API support:
- 📧 Email: auth-support@tazacore.com
- 📚 Documentation: https://docs.tazacore.com/api/auth
- 🔒 Security Issues: security@tazacore.com
- 💬 Community: https://discord.gg/tazacore

---

**Last Updated**: January 2024  
**API Version**: v1.0  
**Status**: Production Ready 🚀
