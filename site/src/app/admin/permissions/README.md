# Module Quản Lý Quyền

Module này đã được tái cấu trúc để cải thiện khả năng bảo trì và tổ chức mã nguồn. Dưới đây là cấu trúc và mục đích của từng thành phần.

## Cấu Trúc File

```
permissions/
├── page.tsx                    # Component trang chính
├── types.ts                    # Interfaces và types TypeScript
├── components/                 # Các thành phần UI
│   ├── index.ts               # Xuất các component
│   ├── PermissionHeader.tsx   # Header trang với các hành động
│   ├── TabNavigation.tsx      # Component điều hướng tab
│   ├── FilterControls.tsx     # Điều khiển tìm kiếm và lọc
│   ├── LoadingError.tsx       # Trạng thái loading và error
│   ├── RolesTab.tsx           # Danh sách và quản lý vai trò
│   ├── UsersTab.tsx           # Danh sách và quản lý người dùng
│   ├── PermissionsTab.tsx     # Hiển thị quyền hạn
│   ├── RoleModal.tsx          # Modal tạo/chỉnh sửa vai trò
│   └── UserRoleModal.tsx      # Modal gán vai trò cho người dùng
├── hooks/                     # Custom React hooks
│   └── usePermissionData.ts   # Lấy dữ liệu và các thao tác
└── utils/                     # Hàm tiện ích
    └── filters.ts             # Tiện ích lọc dữ liệu
```

## Tổng Quan Các Component

### Thành Phần Chính

- **page.tsx**: Component trang chính điều phối tất cả các component khác
- **types.ts**: Chứa tất cả TypeScript interfaces để đảm bảo type safety

### Thành Phần UI

- **PermissionHeader**: Header trang với tiêu đề và nút hành động
- **TabNavigation**: Chuyển đổi tab cho vai trò/người dùng/quyền hạn
- **FilterControls**: Thanh tìm kiếm và dropdown lọc
- **LoadingError**: Xử lý trạng thái loading và hiển thị lỗi
- **RolesTab**: Hiển thị lưới vai trò với hành động sửa/xóa
- **UsersTab**: Hiển thị bảng người dùng với quản lý vai trò
- **PermissionsTab**: Hiển thị quyền hạn được nhóm theo module
- **RoleModal**: Modal để tạo và chỉnh sửa vai trò
- **UserRoleModal**: Modal để thay đổi vai trò người dùng

### Hooks

- **usePermissionData**: Custom hook để lấy dữ liệu và quản lý state
- **useRoleOperations**: Hook cho các thao tác CRUD vai trò
- **useUserOperations**: Hook cho các thao tác quản lý người dùng

### Utils

- **filters.ts**: Hàm pure để lọc dữ liệu dựa trên từ khóa tìm kiếm và bộ lọc

## Lợi Ích Của Cấu Trúc Này

1. **Tách Biệt Trách Nhiệm**: Mỗi component có một trách nhiệm duy nhất
2. **Tái Sử Dụng**: Các component có thể dễ dàng tái sử dụng ở phần khác của ứng dụng
3. **Khả Năng Kiểm Thử**: Mỗi component có thể được kiểm thử độc lập
4. **Khả Năng Bảo Trì**: Thay đổi một component không ảnh hưởng đến component khác
5. **Type Safety**: Typing TypeScript mạnh mẽ xuyên suốt
6. **Hiệu Suất**: Tối ưu hóa chia tách mã và loading tốt hơn

## Cách Sử Dụng

Component trang chính import và sử dụng tất cả các sub-component:

```tsx
import {
  PermissionHeader,
  TabNavigation,
  FilterControls,
  // ... các component khác
} from './components';
```

Tất cả thao tác dữ liệu được xử lý thông qua custom hooks:

```tsx
const {
  loading,
  error,
  roles,
  users,
  permissions,
  // ... dữ liệu khác
} = usePermissionData(canManagePermissions);
```

## Hướng Dẫn Phát Triển

1. **Thêm Tính Năng Mới**: Tạo component mới trong thư mục `components/`
2. **Thao Tác Dữ Liệu**: Thêm hook mới trong thư mục `hooks/`
3. **Hàm Tiện Ích**: Thêm hàm pure vào thư mục `utils/`
4. **Định Nghĩa Type**: Cập nhật `types.ts` cho interface mới
5. **Kiểm Thử**: Mỗi component nên có test tương ứng

## Ghi Chú Di Chuyển

- File `page.tsx` nguyên thủy đã được chia nhỏ thành các component logic
- Tất cả chức năng vẫn giữ nguyên, chỉ được tổ chức tốt hơn
- Debug logging được bảo tồn để troubleshooting
- Tất cả API calls và logic quản lý state được duy trì

