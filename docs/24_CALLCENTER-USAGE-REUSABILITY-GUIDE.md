# 24. Call Center System - Complete Usage & Reusability Guide

## 📋 Quick Start Guide

### 🚀 Getting Started

1. **Navigate to Call Center Module**
   ```
   /admin/crm/callcenter
   ```

2. **Initial Setup**
   - Configure SIP settings in "Cài đặt hệ thống" tab
   - Create initial extensions in "Quản lý Extension" tab
   - Assign users to extensions
   - Test SIP connection

3. **Daily Operations**
   - Monitor call activity in "Tổng quan cuộc gọi"
   - Make/receive calls via "Điện thoại SIP"
   - Manage extensions as needed

## 🏗️ Complete Feature Breakdown

### 1. Extension Management (CRUD)

#### Creating Extensions
**Path:** `Quản lý Extension` → `Add Extension`

```typescript
// Required Fields:
- extcode: string (3-6 digits)
- password: string (min 6 characters)
- name: string (display name)

// Optional Fields:
- description: string
- userId: string (assign to user)
- status: 'active' | 'inactive'
```

**Example Usage:**
```typescript
const extensionData = {
  extCode: "1001",
  password: "SecurePass123",
  userId: "user-123",
  description: "Customer Service Agent",
  status: "active"
};
```

#### Reading/Viewing Extensions
**Features:**
- Search by extension code, user name, or description
- Filter by status (active/inactive)
- Pagination for large datasets
- Real-time status indicators

#### Updating Extensions
**Editable Fields:**
- Extension password
- User assignment
- Description
- Status (active/inactive)

#### Deleting Extensions
**Safety Features:**
- Confirmation dialog
- Check for active calls
- Audit trail logging

### 2. User Information & Extension Linking

#### User Assignment Process
```typescript
// Automatic user detection
const assignedUser = extensions.find(ext => ext.userId === currentUser.id);

// User information display
interface UserDisplay {
  displayName: string;
  email?: string;
  phone?: string;
  department: string;
  role: string;
}
```

#### Integration Points
- **User Management**: Links to existing user database
- **Permission System**: Role-based access control
- **Activity Tracking**: User login/logout events
- **Performance Metrics**: Call statistics per user

### 3. Call History & Overview System

#### Call Data Structure
```typescript
interface Call {
  id: string;
  customerName: string;
  phoneNumber: string;
  extensionNumber?: string;
  status: 'completed' | 'missed' | 'failed' | 'busy';
  direction: 'inbound' | 'outbound';
  timestamp: Date;
  duration?: number;
  hangupCause?: string;
  recordingUrl?: string;
  notes?: string;
}
```

#### Advanced Filtering Options
**Time-based Filters:**
```typescript
const timeFilters = {
  today: () => filterByDate(new Date()),
  yesterday: () => filterByDate(addDays(new Date(), -1)),
  thisWeek: () => filterByWeek(new Date()),
  thisMonth: () => filterByMonth(new Date()),
  custom: (from: Date, to: Date) => filterByRange(from, to)
};
```

**User/Extension Filters:**
```typescript
const userFilters = {
  byExtension: (extCode: string) => filterByExtension(extCode),
  byUser: (userId: string) => filterByUser(userId),
  byDepartment: (dept: string) => filterByDepartment(dept)
};
```

#### Call Summary Statistics
```typescript
interface CallSummary {
  total: number;
  completed: number;
  missed: number;
  failed: number;
  busy: number;
  totalDuration: number;
  averageDuration: number;
  successRate: number;
}
```

#### Recording File Integration
**API Integration:**
```typescript
// Recording URL format
const recordingUrl = `/api/recordings/${callId}.wav`;

// Recording playback
const playRecording = (url: string) => {
  const audio = new Audio(url);
  audio.play();
};
```

### 4. Total Time Calculation

#### Call Duration Tracking
```typescript
// Real-time duration display
const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Total time calculations
const calculateTotalTime = (calls: Call[]) => {
  return calls.reduce((total, call) => total + (call.duration || 0), 0);
};
```

#### Time-based Queries
```typescript
// Query examples
const queries = {
  dailyTotal: (date: Date) => getTotalTimeByDate(date),
  userTotal: (userId: string, period: string) => getUserTotalTime(userId, period),
  extensionTotal: (extCode: string, period: string) => getExtensionTotalTime(extCode, period),
  departmentTotal: (dept: string, period: string) => getDepartmentTotalTime(dept, period)
};
```

## 🔄 Reusability Framework

### 1. Component Reusability

#### Extension Management Component
```typescript
// Standalone usage
import ExtensionManagement from './components/ExtensionManagement';

const MyPage = () => {
  return (
    <div>
      <ExtensionManagement 
        onExtensionCreate={handleCreate}
        onExtensionUpdate={handleUpdate}
        customFilters={customFilters}
      />
    </div>
  );
};
```

#### Call History Component
```typescript
// With custom configuration
import CallHistoryOverview from './components/CallHistoryOverview';

const CustomCallHistory = () => {
  return (
    <CallHistoryOverview
      defaultFilters={{ status: 'completed' }}
      enableExport={true}
      showNotes={true}
      customColumns={['customer', 'duration', 'notes']}
    />
  );
};
```

#### SIP Phone Component
```typescript
// Embeddable phone widget
import SIPPhone from './components/SIPPhone';

const PhoneWidget = () => {
  const sipConfig = {
    uri: 'sip:1001@pbx.company.com',
    password: 'password123',
    ws_servers: 'wss://pbx.company.com:8088/ws'
  };

  return (
    <SIPPhone 
      config={sipConfig}
      minimizable={true}
      autoConnect={true}
      onStatusChange={handleStatusChange}
    />
  );
};
```

### 2. Hook Reusability

#### Extension Management Hook
```typescript
import { useExtensions } from './hooks/useExtensions';

const MyComponent = () => {
  const { 
    extensions, 
    loading, 
    error,
    createExtension,
    updateExtension,
    deleteExtension,
    refreshExtensions
  } = useExtensions();

  // Use hook methods
  const handleCreate = async (data) => {
    await createExtension(data);
    // Handle success
  };
};
```

#### Call History Hook
```typescript
import { useCalls } from './hooks/useCalls';

const CallComponent = () => {
  const {
    calls,
    summary,
    loading,
    updateCallNotes,
    exportCalls,
    applyFilters
  } = useCalls();

  // Filter calls
  applyFilters({
    extension: '1001',
    dateFrom: '2024-01-01',
    dateTo: '2024-01-31'
  });
};
```

#### SIP Integration Hook
```typescript
import { useSIP } from './hooks/useSIP';

const PhoneComponent = () => {
  const {
    isRegistered,
    currentCall,
    makeCall,
    answerCall,
    hangupCall,
    holdCall,
    muteCall
  } = useSIP(sipConfig);

  const handleCall = (number: string) => {
    if (isRegistered) {
      makeCall(number);
    }
  };
};
```

### 3. Service Layer Reusability

#### API Service
```typescript
import { CallCenterAPIService } from './services/api.service';

// Direct API usage
const fetchExtensions = async () => {
  const extensions = await CallCenterAPIService.getExtensions({
    search: 'agent',
    status: 'active'
  });
  return extensions;
};

// Create extension
const createNewExtension = async (data) => {
  const result = await CallCenterAPIService.createExtension(data);
  return result;
};
```

#### SIP Service
```typescript
import { SIPService } from './services/sip.service';

// Initialize SIP service
const sipService = new SIPService(sipConfig);

// Set up event handlers
sipService.setEventHandlers({
  onStatusChange: (status) => console.log('SIP Status:', status),
  onCallStateChange: (state) => console.log('Call State:', state),
  onRegistrationChange: (registered) => console.log('Registered:', registered)
});

// Initialize connection
await sipService.initialize();
```

## 📦 Package Structure for Reuse

### NPM Package Structure
```
call-center-components/
├── package.json
├── README.md
├── src/
│   ├── components/
│   │   ├── ExtensionManagement/
│   │   ├── CallHistory/
│   │   ├── SIPPhone/
│   │   └── Settings/
│   ├── hooks/
│   │   ├── useExtensions.ts
│   │   ├── useCalls.ts
│   │   └── useSIP.ts
│   ├── services/
│   │   ├── api.service.ts
│   │   └── sip.service.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── helpers.ts
└── dist/
```

### Package.json Configuration
```json
{
  "name": "@company/call-center-components",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@heroicons/react": "^2.0.0"
  },
  "dependencies": {
    "jssip": "^3.10.1"
  }
}
```

## 🎯 Usage Examples

### 1. Basic Implementation
```typescript
import { CallCenterProvider, CallHistoryOverview } from '@company/call-center-components';

const App = () => {
  return (
    <CallCenterProvider apiBaseUrl="/api/callcenter">
      <div className="container">
        <h1>Call Center Dashboard</h1>
        <CallHistoryOverview />
      </div>
    </CallCenterProvider>
  );
};
```

### 2. Custom Configuration
```typescript
import { ExtensionManagement, SIPPhone } from '@company/call-center-components';

const CustomCallCenter = () => {
  const sipConfig = {
    uri: 'sip:2001@custom.pbx.com',
    password: 'custompass',
    ws_servers: 'wss://custom.pbx.com:8088/ws'
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <ExtensionManagement 
        showUserAssignment={true}
        enableBulkOperations={true}
      />
      <SIPPhone 
        config={sipConfig}
        showDialPad={true}
        enableRecording={true}
      />
    </div>
  );
};
```

### 3. Integration with Existing System
```typescript
import { useCalls, useExtensions } from '@company/call-center-components';

const ExistingDashboard = () => {
  const { calls } = useCalls();
  const { extensions } = useExtensions();

  // Integrate with existing state management
  useEffect(() => {
    updateDashboardStats({
      totalCalls: calls.length,
      activeExtensions: extensions.filter(e => e.status === 'active').length
    });
  }, [calls, extensions]);

  return (
    <div>
      {/* Existing dashboard content */}
      <CallSummaryWidget calls={calls} />
    </div>
  );
};
```

## 🛠️ Configuration Options

### Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_CALLCENTER_API_URL=https://api.company.com/callcenter
NEXT_PUBLIC_SIP_WS_SERVER=wss://pbx.company.com:8088/ws

# Default SIP Settings
NEXT_PUBLIC_DEFAULT_SIP_DOMAIN=company.com
NEXT_PUBLIC_DEFAULT_SIP_PORT=5060

# Recording Configuration
NEXT_PUBLIC_RECORDING_BASE_URL=https://recordings.company.com
```

### Runtime Configuration
```typescript
// Configuration provider
const callCenterConfig = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_CALLCENTER_API_URL,
    timeout: 30000,
    retryAttempts: 3
  },
  sip: {
    defaultDomain: process.env.NEXT_PUBLIC_DEFAULT_SIP_DOMAIN,
    wsServer: process.env.NEXT_PUBLIC_SIP_WS_SERVER,
    stunServers: ['stun:stun.l.google.com:19302']
  },
  ui: {
    theme: 'modern',
    enableAnimations: true,
    compactMode: false
  }
};
```

## 📊 Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Components loaded on demand
2. **Memoization**: Expensive calculations cached
3. **Virtual Scrolling**: Large call history lists
4. **Debounced Search**: Reduced API calls
5. **Pagination**: Limited data loading

### Best Practices
```typescript
// Memoized components
const MemoizedCallHistory = React.memo(CallHistoryOverview);

// Debounced search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};
```

## 🔐 Security Implementation

### Authentication Requirements
```typescript
// JWT token handling
const useAuth = () => {
  const token = localStorage.getItem('auth_token');
  
  const apiCall = async (url: string, options: RequestInit) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });
  };
  
  return { apiCall };
};
```

### Data Protection
```typescript
// Sensitive data handling
const encryptSensitiveData = (data: any) => {
  // Implement encryption for PII
  return encrypted_data;
};

const maskPhoneNumber = (phone: string) => {
  return phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
};
```

---

**Guide Version:** 1.0  
**Last Updated:** December 2024  
**Author:** Call Center Development Team  
**Next Review:** January 2025
