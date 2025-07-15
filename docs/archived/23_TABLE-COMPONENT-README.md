# Table Components

Bộ component Table đã được tách nhỏ để dễ phát triển và quản lý, với hỗ trợ dark/light mode.

## Cấu trúc thư mục

```
table/
├── types.ts              # Định nghĩa các interface và types
├── utils.ts              # Utility functions và constants
├── TableSearch.tsx       # Component tìm kiếm
├── TableFilters.tsx      # Component bộ lọc
├── BulkActions.tsx       # Component hành động hàng loạt
├── TableHeader.tsx       # Component header của bảng
├── TableRow.tsx          # Component row của bảng
├── Pagination.tsx        # Component phân trang
├── Table.tsx            # Component chính
├── TableDemo.tsx        # Component demo với dữ liệu mẫu
├── index.ts             # Export tất cả components
└── README.md            # Hướng dẫn này
```

## Tính năng chính

### 🎨 **Dark/Light Mode Support**
- Tự động chuyển đổi theme dựa trên hệ thống
- Smooth transitions giữa các modes
- Consistent color scheme

### 🔍 **Tìm kiếm & Bộ lọc**
- Tìm kiếm tổng quát across multiple columns
- Bộ lọc động với nhiều operators
- Real-time filtering

### 📊 **Sorting & Pagination**
- Multi-column sorting
- Customizable page sizes
- Smart pagination với ellipsis

### ✏️ **Inline Editing**
- Click-to-edit cells
- Different input types (text, email, select)
- Auto-save on blur or Enter

### ☑️ **Bulk Operations**
- Select all/individual rows
- Bulk status updates
- Bulk delete với confirmation

### 📏 **Resizable Columns**
- Drag-to-resize columns
- Persistent column widths
- Minimum width constraints

## Cách sử dụng

### Sử dụng Demo component:
```tsx
import { TableDemo } from '@/components/ui/shared/table';

function MyPage() {
    return <TableDemo />;
}
```

### Import component chính:
```tsx
import { Table } from '@/components/ui/shared/table';

function MyPage() {
    const data = [
        { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
        // ... more data
    ];

    return <Table data={data} />;
}
```

### Import components riêng lẻ:
```tsx
import { 
    Table,          // Component chính
    TableSearch,    // Component tìm kiếm
    TableFilters,   // Component bộ lọc
    BulkActions,    // Component hành động hàng loạt
    TableHeader,    // Component header của bảng
    TableRow,       // Component row của bảng
    Pagination,     // Component phân trang
    TableDemo       // Component demo với tất cả tính năng
} from '@/components/ui/shared/table';
```

### Import types:
```tsx
import type { 
    TableData,         // Interface cho dữ liệu row
    ColumnDefinition,  // Interface cho cấu hình column
    FilterCriterion,   // Interface cho filter criteria
    SortConfig,        // Interface cho sort configuration
    PaginationInfo     // Interface cho pagination info
} from '@/components/ui/shared/table';
```

## Demo

### TableDemo component bao gồm:
- **Component Integration Examples**: Demonstriert cách tích hợp với Card, Tabs, Button và các UI components khác
- **Interactive Controls**: Theme switcher (dark/light mode), feature toggles, và data export/import
- **Multiple Layout Examples**: 
  - Basic integration trong cards
  - Dashboard layout với metrics
  - Advanced usage với các tính năng phức tạp
- **Code Examples**: Copy-paste ready code cho các use cases khác nhau
- **Responsive Design**: Table hoạt động mượt mà trong mọi kích thước container

### Các tính năng demo:
- **Theme Toggle**: Chuyển đổi dark/light mode real-time
- **Feature Controls**: Bật/tắt advanced features
- **Export/Import**: Xuất/nhập dữ liệu JSON
- **Integration Showcase**: Dashboard view, card integration, form workflows
- **Code Snippets**: Ready-to-use implementation examples

### Chạy demo:
```tsx
import { TableDemo } from '@/components/ui/shared/table';

// Trong component của bạn
<TableDemo />
```

## Integration Examples

### 1. Basic Card Integration:
```tsx
import { Table } from '@/components/ui/shared/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function UserManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table />
      </CardContent>
    </Card>
  );
}
```

### 2. Dashboard Layout:
```tsx
import { Table } from '@/components/ui/shared/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent>Total Users: 125</CardContent></Card>
        <Card><CardContent>Active: 98</CardContent></Card>
        <Card><CardContent>Roles: 8</CardContent></Card>
      </div>
      
      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table />
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3. Responsive Container:
```tsx
import { Table } from '@/components/ui/shared/table';

function ResponsiveTable() {
  return (
    <div className="w-full">
      <div className="h-96 overflow-auto"> {/* Constrained height */}
        <Table />
      </div>
    </div>
  );
}
```

## Customization

### Thêm column mới:
1. Cập nhật `TableData` interface trong `types.ts`
2. Thêm column definition trong `Table.tsx`
3. Cập nhật `TableRow.tsx` để render cell
4. Update `TableDemo.tsx` với sample data

### Thêm filter operator mới:
1. Cập nhật `operators` object trong `utils.ts`
2. Implement logic trong `apply` function
3. Test trong `TableDemo`

### Custom styling:
- Tất cả components sử dụng Tailwind CSS classes
- Dark mode được implement với `dark:` prefix
- Smooth transitions với `transition-colors duration-300`

## Development

### Thêm tính năng mới:
1. Tạo component riêng trong thư mục `table/`
2. Define types trong `types.ts`
3. Export trong `index.ts`
4. Test trong `TableDemo.tsx`
5. Update documentation

### Testing:
```bash
npm run test -- table/
```

### Building:
```bash
npm run build
```

## Architecture

### Separation of Concerns:
- **types.ts**: Data structures và interfaces
- **utils.ts**: Pure functions và constants
- **Component files**: UI logic và presentation
- **Table.tsx**: Main orchestrator component
- **TableDemo.tsx**: Demo component với mock data

### Props Flow:
```
Table.tsx (main state)
├── TableSearch (search state)
├── TableFilters (filter state)
├── BulkActions (selection state)
├── TableHeader (sort state)
├── TableRow (edit state)
└── Pagination (page state)

TableDemo.tsx (comprehensive demo)
├── Theme Controls (dark/light mode)
├── Feature Toggles (advanced features)
├── Integration Examples
│   ├── Basic Card Integration
│   ├── Dashboard Layout
│   └── Advanced Usage
├── Code Examples (copy-paste ready)
└── Table.tsx (with all features enabled)
```

### Component Integration:
- **TableDemo**: Comprehensive demo với tất cả UI components
- **Card Integration**: Table trong Card components
- **Responsive Design**: Adaptive layouts cho different screen sizes
- **Theme Support**: Dark/Light mode switching
- **Export Components**: Reusable components cho different use cases

### State Management:
- Local state trong main Table component
- Props drilling cho child components
- Memoization để optimize performance
- Demo state isolated trong TableDemo

## Performance Optimizations

- `useMemo` cho expensive calculations
- `useCallback` cho event handlers
- Virtual scrolling ready architecture
- Efficient re-rendering patterns

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Follow existing code style
2. Add TypeScript types for new features
3. Include dark mode support
4. Test trong TableDemo component
5. Write comprehensive tests
6. Update documentation

