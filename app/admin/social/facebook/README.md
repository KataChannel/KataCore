# Facebook Admin Module - Optimized Structure

## 📁 Directory Structure

```
app/admin/social/facebook/
├── components/           # UI Components
│   ├── FacebookApiConfig.tsx    # API configuration component
│   ├── SyncStatus.tsx          # Sync status display
│   ├── SyncControls.tsx        # Sync operation controls
│   ├── UserDataTable.tsx       # User data table with filtering
│   └── index.ts               # Component exports
├── hooks/               # Custom React Hooks
│   ├── useFacebookApi.ts       # API configuration management
│   ├── useFacebookSync.ts      # Sync operations management
│   ├── useUserData.ts         # User data fetching and filtering
│   └── index.ts               # Hook exports
├── services/            # Business Logic Services
│   └── FacebookApiService.ts  # Facebook API integration
├── types/              # TypeScript Type Definitions
│   └── index.ts               # All interface definitions
├── utils/              # Utility Functions
│   └── dataUtils.ts           # Data processing utilities
├── page.tsx            # Original page (legacy)
├── page-new.tsx        # New optimized page
└── README.md           # This documentation
```

## 🎯 Key Features

### 1. Sync Management
- ✅ Real-time sync status monitoring
- ✅ Progress tracking with performance indicators
- ✅ Individual page or bulk sync operations
- ✅ Detailed sync history and error reporting
- ✅ Cancellable sync operations

### 2. API Configuration Priority System
1. **Environment Variables** (.env files) - Highest priority
2. **Local Storage** (Browser storage) - Medium priority  
3. **User Input** (Form input) - Lowest priority

### 3. User Data Analysis
- ✅ Advanced filtering (phone/no-phone/comments/messages/high-interaction)
- ✅ Real-time search functionality
- ✅ Smart sorting by multiple criteria
- ✅ Optimized pagination with performance indicators
- ✅ Copy-to-clipboard functionality for all data fields
- ✅ CSV export functionality

## 🔧 Component Architecture

### Components (`/components/`)
Each component is self-contained and reusable:

- **FacebookApiConfig**: Manages API key and token configuration
- **SyncStatus**: Real-time sync monitoring with progress bars
- **SyncControls**: Comprehensive sync operation interface
- **UserDataTable**: Advanced data table with filtering and export

### Hooks (`/hooks/`)
Custom hooks for state management:

- **useFacebookApi**: API configuration and service management
- **useFacebookSync**: Sync status and operation management
- **useUserData**: Data fetching, filtering, and pagination

### Services (`/services/`)
Business logic layer:

- **FacebookApiService**: Centralized Facebook API integration

## 🚀 Usage Examples

### Basic Setup
```tsx
import { useFacebookApi, useFacebookSync, useUserData } from './hooks';

function MyComponent() {
  const { apiService, isConfigured } = useFacebookApi();
  const { syncStatus, startSync } = useFacebookSync();
  const { userData, loading } = useUserData(apiService);

  // Your component logic
}
```

### API Configuration
```tsx
import { FacebookApiConfigComponent } from './components';

function ConfigPage() {
  return (
    <FacebookApiConfigComponent
      config={config}
      isConfigured={isConfigured}
      onUpdateConfig={updateConfig}
    />
  );
}
```

## 📊 Data Flow

1. **Configuration**: API keys loaded from env → localStorage → user input
2. **Sync Operations**: User triggers sync → Progress tracking → Database update
3. **Data Display**: Database query → Filtering → Pagination → Table display
4. **Export**: Filtered data → CSV generation → File download

## 🎨 UI/UX Features

- **Emoji Indicators**: Visual status representation (🔄 ✅ ❌ 📱 💬 etc.)
- **Performance Indicators**: Real-time sync progress and statistics
- **Smart Filtering**: Multiple filter types with active filter display
- **Copy Functionality**: One-click copy for all user data fields
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Professional Dashboard**: Tabbed interface for organized workflow

## 🔄 Migration from Legacy

To migrate from the old page.tsx to the new structure:

1. **Replace page.tsx** with page-new.tsx content
2. **Import components** from the new component structure
3. **Update API calls** to use FacebookApiService
4. **Test functionality** to ensure compatibility

## 🛠️ Development

### Adding New Features
1. Create component in `/components/` if UI-related
2. Add business logic to `/services/`
3. Create custom hook in `/hooks/` for state management
4. Update types in `/types/` as needed

### Testing
- Test API configuration priority
- Verify sync operations work correctly
- Check data filtering and pagination
- Validate export functionality

## 📝 API Endpoints Expected

The module expects these API endpoints to be available:

- `GET /api/facebook/stats` - Get Facebook statistics
- `GET /api/facebook/pages` - Get Facebook pages
- `POST /api/facebook/sync` - Trigger sync operations
- `GET /api/facebook/users` - Get user data with filtering

## 🔧 Environment Variables

```env
NEXT_PUBLIC_FACEBOOK_API_KEY=your_api_key_here
NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN=your_access_token_here
```

## 🎯 Performance Optimizations

- **Lazy Loading**: Components load only when needed
- **Efficient Filtering**: Client-side search with server-side pagination
- **Caching**: API responses cached appropriately
- **Debounced Search**: Prevents excessive API calls
- **Smart Re-renders**: Optimized React hook dependencies
