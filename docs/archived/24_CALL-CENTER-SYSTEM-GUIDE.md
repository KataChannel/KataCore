# 📞 Call Center Management System - Complete Guide

**File số:** 24  
**Ngày tạo:** July 16, 2025  
**Phiên bản:** v1.0.0  
**Trạng thái:** ✅ HOÀN THÀNH

---

## 📋 Tổng quan hệ thống

Call Center Management System là một hệ thống quản lý tổng đài chuyên nghiệp được xây dựng với công nghệ hiện đại, tích hợp đầy đủ các tính năng quản lý extension, user, lịch sử cuộc gọi và điện thoại SIP.

### 🎯 Mục tiêu chính
1. **CRUD Extension**: Quản lý extension với extcode và password
2. **User Management**: Gắn user cho extension với thông tin đầy đủ
3. **Call History**: Theo dõi lịch sử cuộc gọi từ API
4. **SIP Integration**: Tích hợp điện thoại SIP qua WebRTC
5. **Overview Dashboard**: Tổng quan và thống kê

---

## 🏗️ Kiến trúc hệ thống

### 📁 Cấu trúc thư mục
```
/src/app/admin/crm/callcenter/
├── 📄 page.tsx                    # Trang chính với tab interface
├── 📄 layout.tsx                  # Layout wrapper
├── 📁 types/
│   └── 📄 callcenter.types.ts     # Định nghĩa types TypeScript
├── 📁 components/                  # UI Components
│   ├── 📄 ExtensionManagement.tsx # Quản lý Extension CRUD
│   ├── 📄 CallHistoryOverview.tsx # Lịch sử cuộc gọi
│   ├── 📄 SIPPhone.tsx           # Điện thoại SIP
│   └── 📄 CallCenterSettings.tsx  # Cài đặt hệ thống
├── 📁 hooks/                      # Custom React Hooks
│   ├── 📄 useExtensions.ts       # Hook quản lý extension
│   ├── 📄 useCalls.ts           # Hook quản lý cuộc gọi
│   └── 📄 useSIP.ts             # Hook điện thoại SIP
├── 📁 services/                   # Service Layer
│   ├── 📄 api.service.ts        # API service abstraction
│   └── 📄 sip.service.ts        # SIP service cho WebRTC
└── 📁 /api/callcenter/            # Backend API Routes
    ├── 📄 extensions/route.ts    # Extension API endpoints
    ├── 📄 calls/route.ts        # Call history API
    ├── 📄 users/route.ts        # User management API
    └── 📄 export/route.ts       # Data export API
```

### 🔧 Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Framework**: Tailwind CSS, Heroicons
- **State Management**: React Hooks, Context API
- **SIP Integration**: JsSIP library
- **API**: Next.js API routes
- **Validation**: TypeScript interfaces

---

## 🚀 Tính năng chính

### 1. 📞 Extension Management (CRUD)

#### ✅ Tính năng đã hoàn thành:
- **Create Extension**: Tạo extension mới với validation
- **Read Extensions**: Hiển thị danh sách với pagination
- **Update Extension**: Chỉnh sửa thông tin extension
- **Delete Extension**: Xóa extension với confirmation
- **Search & Filter**: Tìm kiếm theo tên, extcode, description
- **Status Management**: Active/Inactive status
- **Password Generator**: Tự động tạo password mạnh

#### 🔧 Cách sử dụng:
```typescript
import { useExtensions } from '../hooks/useExtensions';

function ExtensionComponent() {
  const { 
    extensions, 
    loading, 
    error, 
    createExtension, 
    updateExtension, 
    deleteExtension 
  } = useExtensions();

  // Tạo extension mới
  const handleCreate = async (data: ExtensionFormData) => {
    await createExtension(data);
  };
}
```

### 2. 👥 User Information & Extension Linking

#### ✅ Tính năng đã hoàn thành:
- **User Profiles**: Thông tin đầy đủ (name, email, department, role)
- **Extension Assignment**: Gắn user cho extension
- **User Status**: Active/Inactive management
- **Department Integration**: Liên kết với phòng ban
- **Role-based Access**: Phân quyền theo vai trò

#### 📊 Dữ liệu User mẫu:
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  isActive: boolean;
}

// Sample users
const sampleUsers = [
  { name: "John Doe", email: "john@company.com", department: "Customer Service" },
  { name: "Jane Smith", email: "jane@company.com", department: "Technical Support" },
  { name: "Bob Wilson", email: "bob@company.com", department: "Sales" }
];
```

### 3. 📞 Call History & Overview

#### ✅ Tính năng đã hoàn thành:
- **Real-time Call Data**: Lấy từ CDR API
- **Call Summary Cards**: Thống kê tổng quan
- **Advanced Filtering**: Lọc theo extension, user, time, status
- **Call Notes**: Thêm ghi chú cho cuộc gọi
- **Export Functionality**: Xuất CSV/Excel
- **Duration Tracking**: Theo dõi thời gian gọi

#### 📈 Thống kê hỗ trợ:
```typescript
interface CallSummary {
  total: number;
  completed: number;
  missed: number;
  failed: number;
  busy: number;
  totalDuration: number;
  averageDuration: number;
}
```

### 4. 📱 SIP Phone Integration

#### ✅ Tính năng đã hoàn thành:
- **WebRTC Calling**: Gọi qua trình duyệt
- **Connection Status**: Hiển thị trạng thái kết nối
- **Call Controls**: Answer, Hangup, Hold, Mute
- **DTMF Support**: Gửi DTMF tones
- **Auto Registration**: Tự động đăng ký SIP
- **Audio Management**: Quản lý audio stream

#### 🔧 SIP Configuration:
```typescript
interface SIPConfig {
  uri: string;           // sip:extension@domain
  password: string;      // SIP password
  ws_servers: string;    // WebSocket server URL
  display_name?: string; // Display name
}
```

### 5. ⚙️ Configuration Management

#### ✅ Tính năng đã hoàn thành:
- **SIP Configuration**: Cài đặt thông số SIP
- **Connection Testing**: Test kết nối SIP
- **Settings Persistence**: Lưu cài đặt local
- **Default Values**: Reset về cài đặt mặc định
- **Validation**: Kiểm tra tính hợp lệ

---

## 📋 API Endpoints

### 🔗 Extension Management API
```http
GET    /api/callcenter/extensions       # Lấy danh sách extensions
POST   /api/callcenter/extensions       # Tạo extension mới
PUT    /api/callcenter/extensions       # Cập nhật extension
DELETE /api/callcenter/extensions?id=   # Xóa extension
```

### 📞 Call History API
```http
GET    /api/callcenter/calls           # Lấy lịch sử cuộc gọi
POST   /api/callcenter/calls           # Cập nhật ghi chú cuộc gọi
```

### 👥 User Management API
```http
GET    /api/callcenter/users           # Lấy danh sách users
POST   /api/callcenter/users           # Tạo user mới
PUT    /api/callcenter/users           # Cập nhật user
DELETE /api/callcenter/users?id=       # Xóa user
```

### 📤 Export API
```http
POST   /api/callcenter/export          # Xuất dữ liệu CSV/Excel
```

---

## 🛠️ Hướng dẫn cài đặt

### 1. 📥 Clone và cài đặt dependencies
```bash
# Navigate to project directory
cd /chikiet/kataoffical/tazagroup/site

# Install dependencies (if not already installed)
npm install @headlessui/react
npm install @heroicons/react
npm install jssip
```

### 2. 🔧 Cấu hình SIP Server
```bash
# Cần có SIP server hỗ trợ WebSocket (như FreeSWITCH)
# Example configuration trong FreeSWITCH:
```

### 3. 🚀 Khởi động development server
```bash
# Start the development server
npm run dev

# Access Call Center
http://localhost:3000/admin/crm/callcenter
```

---

## 🎯 Cách sử dụng hệ thống

### 1. 🔧 Cấu hình ban đầu
1. Truy cập `/admin/crm/callcenter`
2. Click tab "Cài đặt"
3. Nhập thông tin SIP:
   - URI: `sip:your_extension@your_domain`
   - Password: `your_sip_password`
   - WebSocket Server: `wss://your_pbx:port`
4. Click "Test Connection"
5. Click "Save Configuration"

### 2. 📞 Tạo Extensions
1. Click tab "Quản lý Extension"
2. Click "Add Extension"
3. Nhập thông tin:
   - Extension Code: e.g., "2001"
   - Password: (có thể generate tự động)
   - Assign User: Chọn user (optional)
   - Description: Mô tả
4. Click "Create"

### 3. 📱 Sử dụng SIP Phone
1. Click tab "Điện thoại SIP"
2. Kiểm tra status "Registered" (màu xanh)
3. Nhập số điện thoại
4. Click "Call" để gọi
5. Sử dụng các nút điều khiển: Hold, Mute, Hangup

### 4. 📊 Xem lịch sử cuộc gọi
1. Click tab "Tổng quan"
2. Xem call summary cards
3. Sử dụng bộ lọc:
   - Extension filter
   - Date range
   - Call status
   - Call direction
4. Click vào cuộc gọi để xem chi tiết
5. Thêm ghi chú nếu cần
6. Export dữ liệu nếu muốn

---

## 🔧 Customization Guide

### 1. 🎨 Thêm custom fields cho Extension
```typescript
// Cập nhật interface trong callcenter.types.ts
interface Extension {
  // ...existing fields...
  customField?: string;
  priority?: 'high' | 'medium' | 'low';
}

// Cập nhật form trong ExtensionManagement.tsx
<input
  name="customField"
  placeholder="Custom field"
  // ...
/>
```

### 2. 📊 Thêm thống kê mới
```typescript
// Cập nhật CallSummary interface
interface CallSummary {
  // ...existing fields...
  todayCalls: number;
  avgCallsPerHour: number;
}

// Cập nhật logic tính toán trong CallHistoryOverview.tsx
```

### 3. 🔌 Tích hợp API mới
```typescript
// Thêm method mới trong api.service.ts
class CallCenterAPIService {
  static async getCustomData(params: any) {
    const response = await fetch('/api/callcenter/custom', {
      method: 'GET',
      // ...
    });
    return response.json();
  }
}
```

---

## 🚀 Advanced Features

### 1. 📊 Real-time Updates
```typescript
// Sử dụng WebSocket cho real-time updates
const useRealtimeUpdates = () => {
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001/callcenter');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Update state based on real-time data
    };

    return () => ws.close();
  }, []);
};
```

### 2. 🔔 Notification System
```typescript
// Thêm notification cho events quan trọng
const useCallNotifications = () => {
  const showNotification = useCallback((call: Call) => {
    if ('Notification' in window) {
      new Notification(`Incoming call from ${call.phoneNumber}`);
    }
  }, []);
};
```

### 3. 📈 Analytics Dashboard
```typescript
// Tạo analytics component riêng
const CallAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>();
  
  // Fetch analytics data
  useEffect(() => {
    fetchAnalytics().then(setAnalytics);
  }, []);

  return (
    <div className="analytics-dashboard">
      {/* Charts and graphs */}
    </div>
  );
};
```

---

## 🔍 Troubleshooting

### 1. 🚫 SIP Connection Issues
```bash
# Kiểm tra WebSocket connection
# Browser Console → Network tab → WS
# Xem có connection tới SIP server không

# Common issues:
- CORS policy blocking WebSocket
- Firewall blocking WebSocket port
- Invalid SIP credentials
- SIP server không hỗ trợ WebRTC
```

### 2. 📞 Call Quality Issues
```bash
# Check network conditions
# Enable STUN/TURN servers
const sipConfig = {
  // ...existing config...
  stun_servers: ['stun:stun.l.google.com:19302'],
  turn_servers: [/* TURN server config */]
};
```

### 3. 📊 Data Loading Issues
```bash
# Check API endpoints
curl -X GET http://localhost:3000/api/callcenter/calls

# Check console for JavaScript errors
# Verify database connection
# Check API rate limiting
```

---

## 📝 Development Notes

### 🎯 Best Practices
1. **Type Safety**: Sử dụng TypeScript interfaces cho tất cả data
2. **Error Handling**: Implement proper error boundaries
3. **Loading States**: Hiển thị loading indicators
4. **Responsive Design**: Đảm bảo mobile-friendly
5. **Accessibility**: Tuân thủ WCAG guidelines

### 🔄 State Management
- Sử dụng React Hooks cho local state
- Context API cho global state
- Custom hooks cho business logic
- Memo optimization cho performance

### 🧪 Testing Strategy
```typescript
// Unit tests cho components
import { render, screen } from '@testing-library/react';
import ExtensionManagement from '../ExtensionManagement';

test('renders extension list', () => {
  render(<ExtensionManagement />);
  expect(screen.getByText('Extension Management')).toBeInTheDocument();
});

// Integration tests cho API
test('creates extension successfully', async () => {
  const response = await fetch('/api/callcenter/extensions', {
    method: 'POST',
    body: JSON.stringify(mockExtensionData)
  });
  expect(response.status).toBe(201);
});
```

---

## 📚 Resources & References

### 📖 Documentation Links
- [JsSIP Documentation](https://jssip.net/documentation/)
- [WebRTC API Reference](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Hooks Guide](https://reactjs.org/docs/hooks-intro.html)

### 🛠️ Tools & Libraries
- **SIP Library**: JsSIP v3.10+
- **UI Icons**: Heroicons v2.0+
- **Modal/Dropdown**: HeadlessUI v1.7+
- **Styling**: Tailwind CSS v3.0+

### 📞 SIP Server Resources
- [FreeSWITCH Configuration](https://freeswitch.org/confluence/display/FREESWITCH/WebRTC)
- [Asterisk WebRTC Setup](https://wiki.asterisk.org/wiki/display/AST/WebRTC)
- [Kamailio WebSocket](https://www.kamailio.org/docs/modules/5.5.x/modules/websocket.html)

---

## 🎉 Kết luận

Call Center Management System đã được xây dựng hoàn chỉnh với architecture modular, có thể mở rộng và bảo trì dễ dàng. Hệ thống hỗ trợ đầy đủ các tính năng cần thiết cho một tổng đài hiện đại và có thể tích hợp với các hệ thống khác.

### ✅ Điểm mạnh của hệ thống:
- **Modular Architecture**: Dễ maintain và extend
- **Type Safety**: Full TypeScript support
- **Real-time Integration**: SIP calling qua WebRTC
- **Comprehensive API**: RESTful API design
- **User-friendly UI**: Modern và responsive
- **Extensible**: Có thể customize theo nhu cầu

### 🚀 Hướng phát triển tiếp theo:
- WebSocket cho real-time updates
- Advanced analytics và reporting
- Mobile app companion
- Integration với CRM systems
- AI-powered call analytics
- Multi-tenant support

---

**📝 Ghi chú**: Tài liệu này được cập nhật thường xuyên. Vui lòng kiểm tra version mới nhất trong repository.

**👨‍💻 Tác giả**: TazaCore Development Team  
**📅 Cập nhật cuối**: July 16, 2025
