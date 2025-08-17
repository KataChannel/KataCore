# Advanced Table Library - Thư viện Table nâng cao

Thư viện table đầy đủ tính năng cho ứng dụng React/Next.js với TypeScript.

## 🚀 Tính năng

### Core Features
- ✅ **Search & Filter**: Tìm kiếm và lọc dữ liệu nâng cao
- ✅ **Sort**: Sắp xếp theo nhiều cột
- ✅ **Pagination**: Phân trang tự động và thủ công
- ✅ **Selection**: Chọn single/multiple rows
- ✅ **Column Visibility**: Ẩn/hiện cột
- ✅ **Export**: Xuất dữ liệu CSV/JSON

### Advanced Features
- ✅ **Resizable Columns**: Thay đổi kích thước cột
- ✅ **Drag & Drop**: Kéo thả cột và hàng
- ✅ **Sticky Headers**: Header cố định khi scroll
- ✅ **Sticky Columns**: Cột cố định trái/phải
- ✅ **Virtual Scrolling**: Hiệu suất cao với dữ liệu lớn
- ✅ **Responsive Design**: Tự động thích ứng mobile
- ✅ **Dark Mode**: Hỗ trợ chế độ tối

## 📦 Cài đặt

```bash
# Thư viện đã được tích hợp sẵn trong project
# Không cần cài đặt thêm
```

## 🎯 Sử dụng cơ bản

### 1. Import thư viện

```typescript
import {
  AdvancedTable,
  TableToolbar,
  TablePagination,
  createColumn,
  createActionsColumn,
  defaultTableProps,
  type TableColumn
} from '@/components/ui/table';
```

### 2. Định nghĩa dữ liệu

```typescript
interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  salary: number;
  status: 'active' | 'inactive';
}

const employees: Employee[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    email: 'an@company.com',
    department: 'IT',
    salary: 25000000,
    status: 'active'
  }
  // ...
];
```

### 3. Định nghĩa cột

```typescript
const columns: TableColumn<Employee>[] = [
  createColumn<Employee>({
    id: 'name',
    header: 'Họ và tên',
    accessorKey: 'name',
    sortable: true,
    filterable: true,
    sticky: 'left', // Cố định bên trái
  }),
  
  createColumn<Employee>({
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    sortable: true,
    filterable: true,
  }),
  
  createColumn<Employee>({
    id: 'salary',
    header: 'Lương',
    accessorKey: 'salary',
    sortable: true,
    cell: (value) => (
      <span className="font-medium text-green-600">
        {new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(value)}
      </span>
    ),
  }),
  
  createActionsColumn<Employee>({
    id: 'actions',
    header: 'Thao tác',
    sticky: 'right', // Cố định bên phải
    cell: (_, row) => (
      <div className="flex space-x-2">
        <button onClick={() => handleEdit(row.id)}>Sửa</button>
        <button onClick={() => handleDelete(row.id)}>Xóa</button>
      </div>
    ),
  }),
];
```

### 4. Sử dụng Table

```typescript
function EmployeeTable() {
  return (
    <AdvancedTable
      data={employees}
      columns={columns}
      {...defaultTableProps}
      getRowId={(row) => row.id}
      onRowClick={(row) => console.log('Clicked:', row)}
      onSelectionChange={(selected) => console.log('Selected:', selected)}
    />
  );
}
```

## 🔧 API Reference

### TableColumn Interface

```typescript
interface TableColumn<T> {
  id: string;                    // ID duy nhất của cột
  header: string;                // Tiêu đề cột
  accessorKey?: keyof T;         // Key để lấy dữ liệu
  accessor?: (row: T) => any;    // Function để lấy dữ liệu
  cell?: (value, row, index) => ReactNode; // Custom render cell
  sortable?: boolean;            // Có thể sắp xếp
  filterable?: boolean;          // Có thể lọc
  resizable?: boolean;           // Có thể thay đổi kích thước
  sticky?: 'left' | 'right' | false; // Cố định cột
  width?: number;                // Chiều rộng mặc định
  minWidth?: number;             // Chiều rộng tối thiểu
  maxWidth?: number;             // Chiều rộng tối đa
  hidden?: boolean;              // Ẩn cột
}
```

### TableProps Interface

```typescript
interface TableProps<T> {
  data: T[];                     // Dữ liệu hiển thị
  columns: TableColumn<T>[];     // Định nghĩa cột
  loading?: boolean;             // Trạng thái loading
  enableSorting?: boolean;       // Bật sắp xếp
  enableFiltering?: boolean;     // Bật lọc
  enableSelection?: boolean;     // Bật chọn hàng
  enableSearch?: boolean;        // Bật tìm kiếm
  enableColumnResize?: boolean;  // Bật thay đổi kích thước
  enableColumnReorder?: boolean; // Bật kéo thả cột
  stickyHeader?: boolean;        // Header cố định
  pageSize?: number;             // Số hàng mỗi trang
  onRowClick?: (row, index) => void;
  onSelectionChange?: (selectedRows) => void;
  getRowId?: (row) => string;
}
```

## 🎨 Tùy chỉnh giao diện

### 1. Custom Cell Rendering

```typescript
const columns = [
  createColumn({
    id: 'status',
    header: 'Trạng thái',
    accessorKey: 'status',
    cell: (value) => {
      const config = {
        active: { label: 'Hoạt động', color: 'bg-green-100 text-green-800' },
        inactive: { label: 'Tạm nghỉ', color: 'bg-yellow-100 text-yellow-800' }
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${config[value].color}`}>
          {config[value].label}
        </span>
      );
    }
  })
];
```

### 2. Custom Styling

```typescript
<AdvancedTable
  data={data}
  columns={columns}
  className="min-h-[500px]"
  tableClassName="text-sm"
  headerClassName="bg-gray-100"
  rowClassName={(row, index) => 
    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
  }
/>
```

### 3. Custom Empty State

```typescript
<AdvancedTable
  data={[]}
  columns={columns}
  emptyState={
    <div className="text-center py-12">
      <h3>Không có dữ liệu</h3>
      <button>Thêm mới</button>
    </div>
  }
/>
```

## 📱 Responsive Design

Table tự động thích ứng với các kích thước màn hình:

- **Desktop**: Hiển thị đầy đủ tính năng
- **Tablet**: Ẩn một số cột không quan trọng
- **Mobile**: Chuyển sang card layout

```typescript
const columns = [
  createColumn({
    id: 'name',
    header: 'Tên',
    accessorKey: 'name',
    className: 'min-w-[200px]' // Responsive classes
  })
];
```

## 🎯 Ví dụ nâng cao

### 1. Table với Server-side Processing

```typescript
function ServerTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const table = useTable(data, columns, {
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onStateChange: async (state) => {
      setLoading(true);
      const result = await fetchData({
        page: state.pagination?.pageIndex,
        pageSize: state.pagination?.pageSize,
        sorts: state.sorts,
        filters: state.filters,
        search: state.search
      });
      setData(result.data);
      setLoading(false);
    }
  });

  return (
    <AdvancedTable
      data={data}
      columns={columns}
      loading={loading}
      manualPagination
      manualSorting
      manualFiltering
    />
  );
}
```

### 2. Table với Bulk Actions

```typescript
function BulkActionsTable() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleBulkDelete = () => {
    // Delete selected rows
    console.log('Deleting:', selectedRows);
  };

  return (
    <div>
      {selectedRows.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <span>{selectedRows.length} hàng được chọn</span>
          <button onClick={handleBulkDelete}>Xóa tất cả</button>
        </div>
      )}
      
      <AdvancedTable
        data={data}
        columns={columns}
        enableSelection
        onSelectionChange={setSelectedRows}
      />
    </div>
  );
}
```

## 🚀 Performance Tips

1. **Sử dụng Virtual Scrolling** cho dữ liệu lớn (>1000 rows)
2. **Memoize columns** để tránh re-render không cần thiết
3. **Lazy load data** với pagination
4. **Debounce search** để giảm API calls

```typescript
const columns = useMemo(() => [
  // column definitions
], []);

const debouncedSearch = useDebounce(searchValue, 300);
```

## 🐛 Troubleshooting

### Lỗi thường gặp

1. **Table không hiển thị**: Kiểm tra data và columns
2. **Sorting không hoạt động**: Đảm bảo `sortable: true`
3. **Performance chậm**: Sử dụng `getRowId` và `React.memo`

### Debug Tips

```typescript
// Enable debug mode
<AdvancedTable
  data={data}
  columns={columns}
  onStateChange={(state) => console.log('Table state:', state)}
/>
```

## 📄 License

MIT License - Tự do sử dụng trong dự án thương mại và cá nhân.

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Create Pull Request

---

**Được phát triển với ❤️ cho TazaGroup**
