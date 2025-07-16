# 25. Call Center Testing & Validation Guide

## Overview
This guide provides comprehensive testing procedures for the Call Center system to ensure all components work correctly and integrations are functioning properly.

## Table of Contents
1. [Component Testing](#component-testing)
2. [API Testing](#api-testing)
3. [SIP Integration Testing](#sip-integration-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Performance Testing](#performance-testing)
6. [Validation Checklist](#validation-checklist)

---

## Component Testing

### 1. Layout Context Testing
```typescript
// Test context provider functionality
const contextTest = {
  sipStatus: 'connected',
  activeExtension: '9999',
  activeCalls: 2,
  systemHealth: 'operational'
};

// Verify context updates propagate to components
// Check real-time status updates
// Validate localStorage persistence
```

### 2. Page Component Testing
```typescript
// Test tab navigation
const tabTests = [
  'overview',
  'extensions', 
  'phone',
  'settings'
];

// Verify each tab loads correctly
// Check component state persistence
// Validate configuration loading
```

### 3. SIP Phone Component Testing
```typescript
// Test SIP phone functionality
const sipTests = {
  registration: 'Test SIP registration',
  calling: 'Test outbound calls',
  receiving: 'Test inbound calls',
  controls: 'Test call controls (hold, mute, transfer)',
  dtmf: 'Test DTMF tone sending'
};
```

---

## API Testing

### 1. Extensions API Testing
```bash
# Test Extension CRUD operations

# GET - List extensions
curl -X GET "http://localhost:3000/api/callcenter/extensions" \
  -H "Content-Type: application/json"

# POST - Create extension
curl -X POST "http://localhost:3000/api/callcenter/extensions" \
  -H "Content-Type: application/json" \
  -d '{
    "extcode": "9999",
    "password": "secretpass",
    "userId": "user123",
    "displayName": "Test Extension"
  }'

# PUT - Update extension
curl -X PUT "http://localhost:3000/api/callcenter/extensions/9999" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newpass",
    "displayName": "Updated Extension"
  }'

# DELETE - Remove extension
curl -X DELETE "http://localhost:3000/api/callcenter/extensions/9999"
```

### 2. Calls API Testing
```bash
# Test Call history and management

# GET - List calls with filters
curl -X GET "http://localhost:3000/api/callcenter/calls?extension=9999&date=2025-07-16" \
  -H "Content-Type: application/json"

# POST - Log new call
curl -X POST "http://localhost:3000/api/callcenter/calls" \
  -H "Content-Type: application/json" \
  -d '{
    "extensionId": "9999",
    "direction": "outbound",
    "number": "+1234567890",
    "duration": 120,
    "status": "completed"
  }'
```

### 3. Users API Testing
```bash
# Test User management integration

# GET - List users for extension assignment
curl -X GET "http://localhost:3000/api/callcenter/users" \
  -H "Content-Type: application/json"

# POST - Assign user to extension
curl -X POST "http://localhost:3000/api/callcenter/users/assign" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "extensionId": "9999"
  }'
```

---

## SIP Integration Testing

### 1. SIP Registration Test
```javascript
// Test SIP server connectivity
const sipConfig = {
  uri: 'sip:9999@tazaspa102019',
  password: 'NtRrcSl8Zp',
  ws_servers: 'wss://pbx01.onepos.vn:5000',
  display_name: 'Test Agent'
};

// Verify:
// - WebSocket connection establishment
// - SIP registration success
// - Authentication with PBX
// - Status change callbacks
```

### 2. Call Flow Testing
```javascript
// Test complete call flows
const callFlowTests = {
  outbound: {
    steps: [
      'Dial number',
      'Initiate call',
      'Handle ringing',
      'Call answered/busy/failed',
      'Call controls during conversation',
      'Call termination'
    ]
  },
  inbound: {
    steps: [
      'Receive incoming call',
      'Display caller info',
      'Answer/decline options',
      'Call controls',
      'Call logging'
    ]
  }
};
```

---

## End-to-End Testing

### 1. Complete Workflow Test
```typescript
// Test full call center workflow
const e2eTest = async () => {
  // 1. System initialization
  await testSystemStartup();
  
  // 2. Extension management
  await testExtensionCRUD();
  
  // 3. SIP registration
  await testSIPConnection();
  
  // 4. Call operations
  await testCallOperations();
  
  // 5. Data persistence
  await testDataStorage();
  
  // 6. Reporting
  await testReporting();
};
```

### 2. Multi-Extension Test
```typescript
// Test multiple extensions simultaneously
const multiExtensionTest = {
  extensions: ['9999', '9998', '9997'],
  scenarios: [
    'Multiple concurrent calls',
    'Call transfers between extensions',
    'Conference calls',
    'Queue management'
  ]
};
```

---

## Performance Testing

### 1. Load Testing
```javascript
// Test system under load
const loadTest = {
  concurrent_calls: 50,
  duration: '10 minutes',
  metrics: [
    'Response time',
    'Memory usage',
    'CPU utilization',
    'Network bandwidth',
    'Database performance'
  ]
};
```

### 2. Stress Testing
```javascript
// Test system limits
const stressTest = {
  max_extensions: 1000,
  max_concurrent_calls: 100,
  data_volume: '1M call records',
  sustained_load: '24 hours'
};
```

---

## Validation Checklist

### ✅ Functional Testing
- [ ] All tabs load and display correctly
- [ ] SIP registration works with provided credentials
- [ ] Extensions can be created, updated, and deleted
- [ ] Call history is properly logged and displayed
- [ ] Export functionality works for call data
- [ ] Settings are saved and persisted
- [ ] Real-time status updates work correctly

### ✅ Integration Testing
- [ ] API endpoints respond correctly
- [ ] Database operations work as expected
- [ ] SIP server connectivity is stable
- [ ] WebSocket connections are maintained
- [ ] Error handling works for all scenarios
- [ ] Authentication and authorization work

### ✅ UI/UX Testing
- [ ] Responsive design works on all screen sizes
- [ ] Dark/light mode themes work correctly
- [ ] Loading states and error messages are clear
- [ ] Navigation is intuitive and accessible
- [ ] Call controls are easy to use
- [ ] Status indicators are clear and accurate

### ✅ Security Testing
- [ ] SIP credentials are properly encrypted
- [ ] API endpoints require proper authentication
- [ ] User permissions are enforced
- [ ] Sensitive data is not exposed in logs
- [ ] HTTPS/WSS connections are enforced

### ✅ Performance Testing
- [ ] Page load times are acceptable
- [ ] Real-time updates don't cause lag
- [ ] Large datasets load efficiently
- [ ] Memory usage is optimized
- [ ] Network requests are minimized

---

## Test Execution Commands

### Run All Tests
```bash
# Navigate to site directory
cd /chikiet/kataoffical/tazagroup/site

# Run component tests
npm run test:components

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run performance tests
npm run test:performance
```

### Manual Testing Steps
1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Access Call Center**
   - Navigate to: `http://localhost:3000/admin/crm/callcenter`
   - Verify layout loads correctly
   - Check all tabs are accessible

3. **Test SIP Configuration**
   - Go to Settings tab
   - Enter SIP credentials
   - Test connection
   - Verify status updates in layout

4. **Test Extension Management**
   - Create new extension
   - Assign to user
   - Update extension details
   - Verify database persistence

5. **Test Call Operations**
   - Register SIP phone
   - Make test call
   - Receive test call
   - Verify call logging

---

## Troubleshooting Common Issues

### SIP Connection Issues
```javascript
// Check common SIP problems
const sipTroubleshooting = {
  connection_failed: 'Verify WebSocket URL and port',
  auth_failed: 'Check username/password credentials',
  registration_timeout: 'Verify network connectivity',
  call_failed: 'Check extension availability'
};
```

### API Response Issues
```javascript
// Debug API problems
const apiTroubleshooting = {
  404_errors: 'Verify API route configuration',
  500_errors: 'Check server logs and database connection',
  timeout_errors: 'Verify network and server performance',
  auth_errors: 'Check JWT tokens and permissions'
};
```

### Component Loading Issues
```javascript
// Debug component problems
const componentTroubleshooting = {
  context_undefined: 'Verify CallCenterProvider wrapper',
  state_not_persisting: 'Check localStorage implementation',
  updates_not_reflecting: 'Verify state management flow',
  ui_glitches: 'Check CSS and responsive design'
};
```

---

## Test Data Setup

### Sample Extensions
```json
{
  "extensions": [
    {
      "extcode": "9999",
      "password": "NtRrcSl8Zp",
      "userId": "agent001",
      "displayName": "Agent 001",
      "department": "Sales"
    },
    {
      "extcode": "9998",
      "password": "TestPass123",
      "userId": "agent002",
      "displayName": "Agent 002",
      "department": "Support"
    }
  ]
}
```

### Sample Call Data
```json
{
  "calls": [
    {
      "id": "call001",
      "extensionId": "9999",
      "direction": "inbound",
      "number": "+1234567890",
      "startTime": "2025-07-16T10:00:00Z",
      "endTime": "2025-07-16T10:05:30Z",
      "duration": 330,
      "status": "completed",
      "recordingFile": "rec_001.wav"
    }
  ]
}
```

---

## Next Steps

After completing this testing guide:
1. Execute all test scenarios
2. Document any issues found
3. Fix identified problems
4. Perform regression testing
5. Prepare for production deployment
6. Create monitoring and alerting setup

---

**File**: `docs/25_CALLCENTER-TESTING-VALIDATION-GUIDE.md`
**Created**: July 16, 2025
**Purpose**: Comprehensive testing procedures for call center system validation
**Next**: Deploy to production environment with monitoring
