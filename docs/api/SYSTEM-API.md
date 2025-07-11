# ⚙️ TazaCore System API Documentation

## Overview
The TazaCore System API provides administrative and system-level functionality for managing the TazaCore platform. This includes system monitoring, configuration management, user administration, and platform analytics.

## Base URL
```
https://your-domain.com/api/system
```

## Authentication
System API requires administrative privileges and uses API keys or admin JWT tokens:
```bash
Authorization: Bearer <admin-access-token>
# or
X-API-Key: <admin-api-key>
```

## Endpoints

### 📊 System Health & Monitoring

#### Get System Status
```http
GET /api/system/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "uptime": 86400,
    "services": {
      "database": {
        "status": "healthy",
        "responseTime": 5,
        "connections": {
          "active": 12,
          "idle": 8,
          "max": 100
        }
      },
      "redis": {
        "status": "healthy",
        "responseTime": 2,
        "memory": {
          "used": "125MB",
          "peak": "150MB",
          "limit": "1GB"
        }
      },
      "storage": {
        "status": "healthy",
        "diskUsage": {
          "used": "45GB",
          "total": "100GB",
          "percentage": 45
        }
      },
      "email": {
        "status": "healthy",
        "queue": {
          "pending": 5,
          "processing": 2,
          "failed": 0
        }
      }
    },
    "metrics": {
      "cpu": {
        "usage": 25.5,
        "cores": 4
      },
      "memory": {
        "used": "2.1GB",
        "total": "8GB",
        "percentage": 26.25
      },
      "network": {
        "bytesIn": 1024000,
        "bytesOut": 2048000
      }
    }
  }
}
```

#### Get System Metrics
```http
GET /api/system/metrics
```

**Query Parameters:**
- `timeRange` (optional): Time range (1h, 6h, 24h, 7d, 30d)
- `metric` (optional): Specific metric to retrieve
- `granularity` (optional): Data granularity (1m, 5m, 1h, 1d)

**Response:**
```json
{
  "success": true,
  "data": {
    "timeRange": "24h",
    "granularity": "1h",
    "metrics": {
      "cpu": [
        {
          "timestamp": "2024-01-15T10:00:00Z",
          "value": 25.5
        },
        {
          "timestamp": "2024-01-15T11:00:00Z",
          "value": 28.2
        }
      ],
      "memory": [
        {
          "timestamp": "2024-01-15T10:00:00Z",
          "value": 26.25
        },
        {
          "timestamp": "2024-01-15T11:00:00Z",
          "value": 27.8
        }
      ],
      "requests": [
        {
          "timestamp": "2024-01-15T10:00:00Z",
          "value": 1250
        },
        {
          "timestamp": "2024-01-15T11:00:00Z",
          "value": 1380
        }
      ]
    }
  }
}
```

#### Get System Logs
```http
GET /api/system/logs
```

**Query Parameters:**
- `level` (optional): Log level (debug, info, warn, error)
- `service` (optional): Service name
- `startDate` (optional): Start date
- `endDate` (optional): End date
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_001",
        "timestamp": "2024-01-15T10:30:00Z",
        "level": "info",
        "service": "auth",
        "message": "User login successful",
        "context": {
          "userId": "user_001",
          "ipAddress": "192.168.1.100"
        }
      },
      {
        "id": "log_002",
        "timestamp": "2024-01-15T10:29:00Z",
        "level": "warn",
        "service": "database",
        "message": "Slow query detected",
        "context": {
          "query": "SELECT * FROM users WHERE...",
          "duration": 2500
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1250,
      "pages": 25
    }
  }
}
```

### 🔧 Configuration Management

#### Get System Configuration
```http
GET /api/system/config
```

**Response:**
```json
{
  "success": true,
  "data": {
    "config": {
      "app": {
        "name": "TazaCore",
        "version": "1.0.0",
        "environment": "production",
        "debug": false,
        "maintenanceMode": false
      },
      "database": {
        "connectionPool": {
          "min": 5,
          "max": 100,
          "acquireTimeout": 30000
        },
        "backupSchedule": "0 2 * * *"
      },
      "cache": {
        "driver": "redis",
        "ttl": 3600,
        "prefix": "tazacore"
      },
      "security": {
        "rateLimiting": {
          "enabled": true,
          "windowMs": 900000,
          "max": 1000
        },
        "cors": {
          "enabled": true,
          "origins": ["https://app.tazacore.com"]
        }
      },
      "notifications": {
        "email": {
          "enabled": true,
          "provider": "sendgrid",
          "fromAddress": "noreply@tazacore.com"
        },
        "sms": {
          "enabled": true,
          "provider": "twilio"
        }
      }
    }
  }
}
```

#### Update System Configuration
```http
PUT /api/system/config
```

**Request Body:**
```json
{
  "config": {
    "app": {
      "maintenanceMode": true,
      "maintenanceMessage": "System maintenance in progress"
    },
    "security": {
      "rateLimiting": {
        "max": 500
      }
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Configuration updated successfully",
  "data": {
    "changes": [
      {
        "key": "app.maintenanceMode",
        "oldValue": false,
        "newValue": true
      },
      {
        "key": "security.rateLimiting.max",
        "oldValue": 1000,
        "newValue": 500
      }
    ],
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 👥 User Administration

#### Get All Users
```http
GET /api/system/users
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `role` (optional): Filter by role
- `status` (optional): Filter by status
- `search` (optional): Search by name or email
- `sortBy` (optional): Sort field
- `sortOrder` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_001",
        "email": "admin@tazacore.com",
        "firstName": "Admin",
        "lastName": "User",
        "role": "admin",
        "status": "active",
        "lastLogin": "2024-01-15T10:30:00Z",
        "loginCount": 150,
        "emailVerified": true,
        "twoFactorEnabled": true,
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1500,
      "pages": 75
    },
    "summary": {
      "totalUsers": 1500,
      "activeUsers": 1450,
      "inactiveUsers": 50,
      "adminUsers": 5,
      "regularUsers": 1495
    }
  }
}
```

#### Get User Details
```http
GET /api/system/users/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_001",
      "email": "admin@tazacore.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "permissions": ["system:read", "system:write", "users:manage"],
      "status": "active",
      "profile": {
        "avatar": "https://example.com/avatar.jpg",
        "phone": "+1-555-0123",
        "department": "IT",
        "position": "System Administrator"
      },
      "security": {
        "lastLogin": "2024-01-15T10:30:00Z",
        "loginCount": 150,
        "failedLoginAttempts": 0,
        "emailVerified": true,
        "twoFactorEnabled": true,
        "activeSessions": 2
      },
      "activity": {
        "lastActivity": "2024-01-15T10:30:00Z",
        "totalActions": 2500,
        "recentActions": [
          {
            "action": "user.update",
            "timestamp": "2024-01-15T10:25:00Z",
            "details": "Updated user profile"
          }
        ]
      },
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### Update User
```http
PUT /api/system/users/{id}
```

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "User",
  "role": "user",
  "status": "active",
  "permissions": ["read", "write"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": "user_001",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### Delete User
```http
DELETE /api/system/users/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### Impersonate User
```http
POST /api/system/users/{id}/impersonate
```

**Response:**
```json
{
  "success": true,
  "message": "Impersonation started successfully",
  "data": {
    "impersonationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "targetUser": {
      "id": "user_001",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "expiresAt": "2024-01-15T11:30:00Z"
  }
}
```

### 🏢 Organization Management

#### Get Organization Settings
```http
GET /api/system/organization
```

**Response:**
```json
{
  "success": true,
  "data": {
    "organization": {
      "id": "org_001",
      "name": "TazaCore Corporation",
      "domain": "tazacore.com",
      "logo": "https://example.com/logo.png",
      "settings": {
        "timezone": "UTC",
        "dateFormat": "YYYY-MM-DD",
        "currency": "USD",
        "language": "en"
      },
      "features": {
        "singleSignOn": true,
        "twoFactorAuth": true,
        "auditLogging": true,
        "apiAccess": true
      },
      "limits": {
        "maxUsers": 1000,
        "maxStorage": "100GB",
        "maxApiCalls": 100000
      },
      "billing": {
        "plan": "enterprise",
        "status": "active",
        "nextBilling": "2024-02-01T00:00:00Z"
      },
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### Update Organization Settings
```http
PUT /api/system/organization
```

**Request Body:**
```json
{
  "name": "Updated Corporation",
  "settings": {
    "timezone": "America/New_York",
    "dateFormat": "MM/DD/YYYY"
  },
  "features": {
    "singleSignOn": false
  }
}
```

### 📈 Analytics & Reporting

#### Get System Analytics
```http
GET /api/system/analytics
```

**Query Parameters:**
- `timeRange` (optional): Time range (7d, 30d, 90d, 1y)
- `metric` (optional): Specific metric
- `groupBy` (optional): Group by dimension

**Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "timeRange": "30d",
      "overview": {
        "totalUsers": 1500,
        "activeUsers": 1200,
        "newUsers": 150,
        "deletedUsers": 10,
        "totalSessions": 25000,
        "avgSessionDuration": 1800,
        "totalApiCalls": 500000,
        "errorRate": 0.05
      },
      "userActivity": {
        "dailyActiveUsers": [
          {
            "date": "2024-01-15",
            "count": 850
          },
          {
            "date": "2024-01-14",
            "count": 920
          }
        ],
        "usersByRole": {
          "admin": 5,
          "user": 1495
        },
        "usersByStatus": {
          "active": 1450,
          "inactive": 50
        }
      },
      "performance": {
        "avgResponseTime": 150,
        "throughput": 2000,
        "errorsByType": {
          "4xx": 100,
          "5xx": 25
        }
      },
      "features": {
        "mostUsed": [
          {
            "feature": "dashboard",
            "usage": 15000
          },
          {
            "feature": "reports",
            "usage": 8500
          }
        ]
      }
    }
  }
}
```

#### Generate System Report
```http
POST /api/system/reports/generate
```

**Request Body:**
```json
{
  "type": "system_overview",
  "timeRange": "30d",
  "format": "pdf",
  "includeCharts": true,
  "sections": [
    "users",
    "performance",
    "security",
    "usage"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report generation started",
  "data": {
    "reportId": "report_001",
    "status": "generating",
    "estimatedTime": 300,
    "downloadUrl": null
  }
}
```

#### Get Report Status
```http
GET /api/system/reports/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "report": {
      "id": "report_001",
      "type": "system_overview",
      "status": "completed",
      "progress": 100,
      "downloadUrl": "https://example.com/reports/report_001.pdf",
      "expiresAt": "2024-01-22T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T10:35:00Z"
    }
  }
}
```

### 🔐 Security Management

#### Get Security Settings
```http
GET /api/system/security
```

**Response:**
```json
{
  "success": true,
  "data": {
    "security": {
      "authentication": {
        "passwordPolicy": {
          "minLength": 8,
          "requireUppercase": true,
          "requireLowercase": true,
          "requireNumbers": true,
          "requireSpecialChars": true,
          "maxAge": 90
        },
        "sessionTimeout": 3600,
        "maxFailedAttempts": 5,
        "lockoutDuration": 900
      },
      "authorization": {
        "rbacEnabled": true,
        "defaultRole": "user",
        "roleHierarchy": {
          "admin": ["user"],
          "manager": ["user"]
        }
      },
      "encryption": {
        "algorithm": "AES-256",
        "keyRotationInterval": 30
      },
      "monitoring": {
        "auditLogging": true,
        "intrusion_detection": true,
        "anomalyDetection": true
      }
    }
  }
}
```

#### Update Security Settings
```http
PUT /api/system/security
```

**Request Body:**
```json
{
  "authentication": {
    "maxFailedAttempts": 3,
    "lockoutDuration": 1800
  },
  "monitoring": {
    "anomalyDetection": false
  }
}
```

#### Get Security Events
```http
GET /api/system/security/events
```

**Query Parameters:**
- `severity` (optional): Event severity (low, medium, high, critical)
- `type` (optional): Event type
- `startDate` (optional): Start date
- `endDate` (optional): End date
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "event_001",
        "type": "suspicious_login",
        "severity": "medium",
        "title": "Suspicious login attempt",
        "description": "Multiple failed login attempts from unusual location",
        "details": {
          "userId": "user_001",
          "ipAddress": "192.168.1.200",
          "location": "Unknown",
          "attempts": 5
        },
        "status": "investigating",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

### 🔧 Maintenance & Operations

#### Enable Maintenance Mode
```http
POST /api/system/maintenance/enable
```

**Request Body:**
```json
{
  "message": "System maintenance in progress. We'll be back shortly.",
  "estimatedDuration": 3600,
  "allowedIps": ["192.168.1.100", "10.0.0.1"],
  "bypassToken": "maintenance_bypass_token_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Maintenance mode enabled",
  "data": {
    "maintenanceMode": {
      "enabled": true,
      "message": "System maintenance in progress. We'll be back shortly.",
      "estimatedEnd": "2024-01-15T11:30:00Z",
      "enabledAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### Disable Maintenance Mode
```http
POST /api/system/maintenance/disable
```

**Response:**
```json
{
  "success": true,
  "message": "Maintenance mode disabled"
}
```

#### Run Database Backup
```http
POST /api/system/backup/database
```

**Request Body:**
```json
{
  "type": "full",
  "compression": true,
  "encryption": true,
  "storage": "s3"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Database backup started",
  "data": {
    "backupId": "backup_001",
    "status": "running",
    "estimatedTime": 600,
    "type": "full"
  }
}
```

#### Get Backup Status
```http
GET /api/system/backup/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "backup": {
      "id": "backup_001",
      "type": "full",
      "status": "completed",
      "progress": 100,
      "size": "2.5GB",
      "location": "s3://backups/backup_001.sql.gz",
      "checksum": "sha256:abc123...",
      "createdAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T10:40:00Z"
    }
  }
}
```

#### Clear System Cache
```http
POST /api/system/cache/clear
```

**Request Body:**
```json
{
  "type": "all", // or "specific"
  "keys": ["user_sessions", "api_responses"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared successfully",
  "data": {
    "clearedKeys": 1500,
    "freedMemory": "256MB"
  }
}
```

### 🌐 Integration Management

#### Get Integrations
```http
GET /api/system/integrations
```

**Response:**
```json
{
  "success": true,
  "data": {
    "integrations": [
      {
        "id": "integration_001",
        "name": "Slack",
        "type": "notification",
        "status": "active",
        "config": {
          "webhookUrl": "https://hooks.slack.com/...",
          "channel": "#alerts"
        },
        "lastSync": "2024-01-15T10:30:00Z",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### Test Integration
```http
POST /api/system/integrations/{id}/test
```

**Response:**
```json
{
  "success": true,
  "message": "Integration test successful",
  "data": {
    "testResults": {
      "connectivity": "passed",
      "authentication": "passed",
      "functionality": "passed",
      "responseTime": 250
    }
  }
}
```

## Error Handling

### System Error Response
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Administrative privileges required",
    "details": {
      "required_permission": "system:admin",
      "current_permissions": ["system:read"]
    }
  }
}
```

### Common Error Codes
- `INSUFFICIENT_PERMISSIONS`: Admin access required
- `MAINTENANCE_MODE`: System in maintenance mode
- `RESOURCE_LIMIT_EXCEEDED`: System resource limits exceeded
- `INVALID_CONFIGURATION`: Invalid configuration parameters
- `BACKUP_FAILED`: Backup operation failed
- `INTEGRATION_ERROR`: Integration connectivity issues

## Rate Limiting

### Admin API Limits
- **Configuration updates**: 10 per minute
- **User management**: 100 per minute
- **System queries**: 1000 per minute
- **Backup operations**: 5 per hour
- **Report generation**: 20 per hour

## Security Features

### Admin Authentication
- **Multi-factor authentication**: Required for all admin operations
- **IP whitelisting**: Restrict admin access to specific IPs
- **Session timeout**: Short session timeouts for security
- **Activity logging**: All admin actions logged

### Audit Trail
All system operations are logged with:
- User ID and session
- IP address and location
- Action performed
- Before/after values
- Timestamp

## SDK Examples

### Node.js Admin SDK
```javascript
const { SystemAPI } = require('@tazacore/system-api');

const systemApi = new SystemAPI({
  baseURL: 'https://your-domain.com/api',
  apiKey: 'your-admin-api-key'
});

// Get system health
const health = await systemApi.getHealth();

// Update configuration
await systemApi.updateConfig({
  app: {
    maintenanceMode: true
  }
});

// Get user analytics
const analytics = await systemApi.getAnalytics({
  timeRange: '30d',
  metric: 'users'
});
```

### Python Admin SDK
```python
from tazacore_system import SystemAPI

system_api = SystemAPI(
    base_url='https://your-domain.com/api',
    api_key='your-admin-api-key'
)

# Get system metrics
metrics = system_api.get_metrics(time_range='24h')

# Generate report
report = system_api.generate_report(
    type='system_overview',
    time_range='30d',
    format='pdf'
)
```

## Monitoring & Alerting

### Alert Configuration
```json
{
  "alerts": {
    "cpu_high": {
      "threshold": 80,
      "duration": 300,
      "severity": "warning"
    },
    "memory_high": {
      "threshold": 90,
      "duration": 180,
      "severity": "critical"
    },
    "error_rate_high": {
      "threshold": 5,
      "duration": 60,
      "severity": "critical"
    }
  }
}
```

### Notification Channels
- Email notifications
- Slack integration
- SMS alerts
- Webhook endpoints
- PagerDuty integration

## Support

For System API support:
- 📧 Email: system-support@tazacore.com
- 📚 Documentation: https://docs.tazacore.com/api/system
- 🚨 Critical Issues: emergency@tazacore.com
- 💬 Community: https://discord.gg/tazacore

---

**Last Updated**: January 2024  
**API Version**: v1.0  
**Status**: Production Ready 🚀  
**Access Level**: Administrative 🔐
