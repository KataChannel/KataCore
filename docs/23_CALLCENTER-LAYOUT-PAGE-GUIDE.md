# 23. Call Center System - Layout & Page Structure Guide

## 📋 Overview

This guide documents the updated Call Center layout and page structure, focusing on state management, real-time updates, and component integration for optimal call center operations.

## 🏗️ Architecture Updates

### Enhanced Context Management

The new layout implements a robust context system for global state management:

```typescript
interface CallCenterContextType {
  sipStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  activeExtension: string | null;
  activeCallCount: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  updateSipStatus: (status) => void;
  updateActiveExtension: (extension) => void;
  updateActiveCallCount: (count) => void;
}
```

### Real-time Status Bar

The enhanced status bar provides comprehensive system monitoring:

- **SIP Connection Status**: Real-time visual indicators with animations
- **Active Extension Display**: Current user's extension number
- **Call Count Indicator**: Shows number of active calls
- **System Health Monitoring**: Overall system status
- **Emergency Controls**: Quick access to emergency protocols
- **Live Clock**: Real-time system time display

## 🔧 File Structure

### layout.tsx - Global State Provider
```tsx
/src/app/admin/crm/callcenter/layout.tsx
```

**Key Features:**
- ✅ Context Provider for shared state
- ✅ Real-time status updates
- ✅ SIP connection monitoring
- ✅ Emergency controls
- ✅ Audio element management
- ✅ Notification system
- ✅ Local storage integration

### page.tsx - Main Interface
```tsx
/src/app/admin/crm/callcenter/page.tsx
```

**Key Features:**
- ✅ Enhanced tab navigation with descriptions
- ✅ SIP configuration management
- ✅ Context integration
- ✅ Component orchestration
- ✅ State persistence
- ✅ Dynamic configuration updates

## 🎯 Implementation Details

### 1. State Management Integration

**Layout Context Hook:**
```typescript
export const useCallCenter = () => {
  const context = useContext(CallCenterContext);
  if (!context) {
    throw new Error('useCallCenter must be used within CallCenterLayout');
  }
  return context;
};
```

**Usage in Components:**
```typescript
const { updateSipStatus, updateActiveExtension } = useCallCenter();
```

### 2. Configuration Persistence

**Automatic Configuration Loading:**
```typescript
useEffect(() => {
  const savedConfig = localStorage.getItem('callcenter_sip_config');
  if (savedConfig) {
    const config = JSON.parse(savedConfig);
    setSipConfig(config);
    // Extract and update extension
    const extensionMatch = config.uri.match(/sip:(\\d+)@/);
    if (extensionMatch) {
      updateActiveExtension(extensionMatch[1]);
    }
  }
}, [updateActiveExtension]);
```

### 3. Enhanced Tab System

**Tab Configuration with Descriptions:**
```typescript
const tabs = [
  {
    id: 'overview',
    name: 'Tổng quan cuộc gọi',
    description: 'Lịch sử cuộc gọi, thống kê và báo cáo',
    icon: ChartBarIcon,
    component: <CallHistoryOverview />
  },
  // ... other tabs
];
```

### 4. Real-time Status Indicators

**Dynamic SIP Status:**
```typescript
const getSipStatusIcon = () => {
  switch (sipStatus) {
    case 'connected':
      return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>;
    case 'connecting':
      return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>;
    case 'error':
      return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
    default:
      return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
  }
};
```

## 🚀 Core Features

### 1. Extension Management (CRUD)
- **Create Extensions**: Form-based creation with validation
- **Read Extensions**: List view with search and filtering
- **Update Extensions**: In-place editing capabilities
- **Delete Extensions**: Safe deletion with confirmation
- **User Assignment**: Link extensions to user accounts
- **Password Management**: Secure password handling

### 2. User Integration
- **User Profiles**: Complete user information display
- **Extension Linking**: Automatic user-extension associations
- **Role Management**: Department and role-based organization
- **Activity Tracking**: User activity and call history

### 3. Call History & Analytics
- **CDR Integration**: Real-time call data from API
- **Advanced Filtering**: By extension, user, time range, status
- **Call Notes**: Persistent note-taking functionality
- **Export Features**: CSV and Excel export capabilities
- **Summary Statistics**: Call duration, success rates, etc.

### 4. SIP Phone Integration
- **WebRTC Calling**: Browser-based VoIP functionality
- **Call Controls**: Hold, mute, transfer, hangup
- **DTMF Support**: Dial pad for in-call interactions
- **Status Monitoring**: Real-time call state tracking
- **Recording Integration**: Automatic call recording

## 📱 User Interface

### Enhanced Status Bar
```typescript
// Visual elements:
- SIP connection indicator with animations
- Active call counter with real-time updates
- System health monitoring
- Current extension display
- Live clock
- Emergency button
```

### Improved Tab Navigation
```typescript
// Features:
- Icon-based navigation
- Descriptive subtitles
- Active state indicators
- Smooth transitions
- Responsive design
```

### Component Architecture
```typescript
// Modular design:
- Reusable components
- State isolation
- Props-based configuration
- Event-driven communication
```

## 🔧 Configuration Management

### SIP Settings
```typescript
interface SIPConfig {
  uri: string;              // SIP URI (sip:ext@domain)
  password: string;         // Authentication password
  ws_servers: string;       // WebSocket server URL
  display_name?: string;    // Display name for calls
}
```

### System Settings
```typescript
interface CallCenterSettings {
  recordingEnabled: boolean;
  autoAnswer: boolean;
  callTimeout: number;
  maxCallDuration: number;
  notificationsEnabled: boolean;
}
```

## 🔄 Integration Points

### API Endpoints
- `/api/callcenter/extensions` - Extension CRUD operations
- `/api/callcenter/calls` - Call history and CDR data
- `/api/callcenter/users` - User management
- `/api/callcenter/export` - Data export functionality

### External Services
- **FreeSWITCH PBX**: SIP server integration
- **WebRTC**: Browser-based calling
- **CDR Database**: Call detail records
- **Recording Storage**: Call recording files

## 🛠️ Development Guidelines

### Component Development
1. **Use Context**: Leverage the CallCenter context for state
2. **Event Handling**: Implement proper event propagation
3. **Error Handling**: Comprehensive error management
4. **Loading States**: User-friendly loading indicators
5. **Responsive Design**: Mobile-friendly interfaces

### State Management
1. **Local State**: Component-specific data
2. **Context State**: Shared application state
3. **Persistence**: Critical data in localStorage
4. **Synchronization**: Real-time updates across components

### Testing Approach
1. **Unit Tests**: Individual component testing
2. **Integration Tests**: Cross-component functionality
3. **E2E Tests**: Complete user workflows
4. **Performance Tests**: Load and stress testing

## 🔒 Security Considerations

### Authentication
- SIP credential protection
- Session management
- Access control validation

### Data Protection
- Call recording encryption
- PII data handling
- Audit trail maintenance

### Network Security
- Secure WebSocket connections
- API endpoint protection
- CORS configuration

## 📊 Monitoring & Analytics

### System Metrics
- SIP connection uptime
- Call success rates
- System response times
- Error rates and types

### User Analytics
- Agent performance metrics
- Call volume statistics
- Extension utilization
- User activity patterns

## 🚨 Emergency Procedures

### Emergency Mode
```typescript
const handleEmergency = () => {
  // Emergency protocol activation
  - End all active calls
  - Alert supervisors
  - Log emergency event
  - Switch to emergency mode
};
```

### Failover Procedures
- Backup SIP server configuration
- Alternative communication channels
- Data backup and recovery
- System restoration procedures

## 🔮 Future Enhancements

### Planned Features
- Queue management system
- Skills-based call routing
- Real-time dashboard widgets
- Mobile application support
- Advanced analytics and reporting

### Technical Improvements
- WebSocket real-time updates
- Progressive Web App (PWA) features
- Offline functionality
- Enhanced security measures
- Performance optimizations

---

**Documentation Version:** 1.0  
**Last Updated:** December 2024  
**Next Review:** January 2025  
**Compatibility:** Next.js 14+, React 18+, TypeScript 5+
