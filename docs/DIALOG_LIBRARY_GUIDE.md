# Dialog Library Documentation

## Tổng quan

Thư viện Dialog được phát triển để cung cấp các component dialog responsive, linh hoạt và dễ sử dụng cho ứng dụng React. Thư viện hỗ trợ:

- ✅ **Responsive full-screen** - Tự động điều chỉnh kích thước theo thiết bị
- ✅ **Multiple sizes** - Từ xs đến 5xl và auto-sizing
- ✅ **Draggable dialogs** - Kéo thả dialog trong viewport
- ✅ **Scrollable content** - Cuộn nội dung dài tự động
- ✅ **Confirmation dialogs** - Dialog xác nhận với promise-based API
- ✅ **Form dialogs** - Form dialog với validation tích hợp
- ✅ **Type-safe** - Đầy đủ TypeScript support

## Cài đặt

```bash
# Thư viện đã được tích hợp trong project
# Chỉ cần import từ components/ui/dialog
```

## Components chính

### 1. Dialog (Base Dialog)

Component dialog cơ bản với đầy đủ tính năng.

```tsx
import { Dialog, useDialog } from '@/components/ui/dialog';

function MyComponent() {
  const dialog = useDialog();

  return (
    <>
      <button onClick={dialog.open}>Mở Dialog</button>
      
      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        title="Dialog Title"
        size="md"
        draggable={true}
        scrollable={true}
      >
        <p>Nội dung dialog</p>
      </Dialog>
    </>
  );
}
```

#### Props

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `isOpen` | `boolean` | - | Trạng thái mở/đóng dialog |
| `onClose` | `() => void` | - | Callback khi đóng dialog |
| `onConfirm` | `() => void` | - | Callback xác nhận (tùy chọn) |
| `title` | `string` | - | Tiêu đề dialog |
| `description` | `string` | - | Mô tả ngắn |
| `size` | `DialogSize` | `'md'` | Kích thước: xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, full, auto |
| `fullScreen` | `boolean` | `false` | Hiển thị full màn hình |
| `draggable` | `boolean` | `false` | Cho phép kéo thả |
| `scrollable` | `boolean` | `true` | Cho phép cuộn nội dung |
| `closeOnOverlayClick` | `boolean` | `true` | Đóng khi click overlay |
| `closeOnEscape` | `boolean` | `true` | Đóng khi nhấn Escape |

### 2. ConfirmDialog

Dialog xác nhận với design đẹp và promise-based API.

```tsx
import { useConfirm } from '@/components/ui/dialog';

function MyComponent() {
  const confirm = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa mục này?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      destructive: true
    });

    if (confirmed) {
      // Thực hiện xóa
    }
  };

  return <button onClick={handleDelete}>Xóa</button>;
}
```

### 3. FormDialog

Dialog form với validation tự động và field helpers.

```tsx
import { 
  FormDialog, 
  useDialog,
  createTextField,
  createEmailField,
  createSelectField 
} from '@/components/ui/dialog';

function MyComponent() {
  const dialog = useDialog();

  const formFields = [
    createTextField('name', 'Họ và tên', { 
      required: true,
      validation: { minLength: 2 }
    }),
    createEmailField('email', 'Email', { required: true }),
    createSelectField('department', 'Phòng ban', [
      { label: 'IT', value: 'it' },
      { label: 'HR', value: 'hr' }
    ])
  ];

  const handleSubmit = (data) => {
    console.log('Form data:', data);
    dialog.close();
  };

  return (
    <>
      <button onClick={dialog.open}>Thêm mới</button>
      
      <FormDialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        onSubmit={handleSubmit}
        title="Thêm nhân viên"
        formFields={formFields}
      />
    </>
  );
}
```

### 4. DialogProvider

Provider để quản lý dialog global và confirmation dialogs.

```tsx
import { DialogProvider } from '@/components/ui/dialog';

function App() {
  return (
    <DialogProvider>
      {/* Toàn bộ ứng dụng */}
      <MyApp />
    </DialogProvider>
  );
}
```

## Form Field Helpers

Thư viện cung cấp các helper để tạo form fields một cách dễ dàng:

### Text Fields

```tsx
import { 
  createTextField,
  createEmailField,
  createPasswordField,
  createNumberField,
  createTextareaField
} from '@/components/ui/dialog';

const fields = [
  createTextField('name', 'Họ và tên', {
    required: true,
    placeholder: 'Nhập họ và tên',
    validation: {
      minLength: 2,
      maxLength: 50
    }
  }),
  
  createEmailField('email', 'Email', {
    required: true,
    placeholder: 'example@company.com'
  }),
  
  createPasswordField('password', 'Mật khẩu', {
    required: true,
    validation: {
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    }
  }),
  
  createNumberField('age', 'Tuổi', {
    validation: {
      min: 18,
      max: 65
    }
  }),
  
  createTextareaField('description', 'Mô tả', {
    placeholder: 'Nhập mô tả...'
  })
];
```

### Select và Other Fields

```tsx
const moreFields = [
  createSelectField('department', 'Phòng ban', [
    { label: 'IT', value: 'it' },
    { label: 'Marketing', value: 'marketing' },
    { label: 'Sales', value: 'sales' }
  ], { required: true }),
  
  createDateField('startDate', 'Ngày bắt đầu', {
    required: true
  }),
  
  createCheckboxField('isActive', 'Đang hoạt động'),
  
  createFileField('avatar', 'Ảnh đại diện')
];
```

## Validation

### Built-in Validators

```tsx
const fieldWithValidation = createTextField('username', 'Tên đăng nhập', {
  required: true,
  validation: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    custom: (value) => {
      if (value === 'admin') {
        return 'Không được sử dụng tên "admin"';
      }
      return null;
    }
  }
});
```

### Validation Options

| Option | Type | Mô tả |
|--------|------|-------|
| `pattern` | `RegExp` | Regex pattern validation |
| `min` | `number` | Giá trị tối thiểu (cho number) |
| `max` | `number` | Giá trị tối đa (cho number) |
| `minLength` | `number` | Độ dài tối thiểu (cho string) |
| `maxLength` | `number` | Độ dài tối đa (cho string) |
| `custom` | `(value) => string \| null` | Custom validation function |

## Table Integration

### Tích hợp với Table Library

```tsx
import { 
  TableActions,
  TableToolbarActions,
  createDialogActionsColumn,
  type TableDialogActions,
  type TableDialogConfig
} from '@/components/ui/table';

// Define actions
const tableActions: TableDialogActions<Employee> = {
  onAdd: async (data) => {
    // Thêm mới logic
  },
  onEdit: async (data, original) => {
    // Cập nhật logic  
  },
  onDelete: async (data) => {
    // Xóa logic
  },
  onView: (data) => {
    // Xem chi tiết logic
  }
};

// Define dialog configs
const dialogConfig: TableDialogConfig<Employee> = {
  addDialog: {
    title: 'Thêm nhân viên',
    size: 'lg',
    fields: formFields
  },
  editDialog: {
    title: 'Sửa nhân viên',
    size: 'lg', 
    fields: formFields
  },
  deleteDialog: {
    title: 'Xác nhận xóa',
    message: 'Bạn có chắc chắn muốn xóa?'
  }
};

// Create actions column
const actionsColumn = createDialogActionsColumn(
  tableActions,
  dialogConfig,
  { width: 120, sticky: 'right' }
);
```

### Bulk Actions

```tsx
const toolbarActions = {
  onAdd: () => {
    // Mở dialog thêm mới
  },
  onBulkDelete: async (selectedRows) => {
    // Xóa nhiều rows
  },
  onExport: async (selectedRows) => {
    // Xuất dữ liệu
  }
};

<TableToolbarActions
  selectedRows={selectedRows}
  actions={toolbarActions}
  loading={loading}
/>
```

## Responsive Behavior

### Breakpoints

- **Mobile** (< 640px): Dialog chiếm full width với padding nhỏ
- **Tablet** (640px - 1024px): Dialog responsive với max-width phù hợp
- **Desktop** (> 1024px): Dialog centered với full features

### Full-screen Mode

```tsx
<Dialog
  isOpen={true}
  onClose={onClose}
  fullScreen={true} // Luôn full-screen
  // hoặc
  responsive={true} // Auto full-screen trên mobile
/>
```

## Advanced Features

### Draggable Dialogs

```tsx
<Dialog
  draggable={true}
  dragHandle=".dialog-header" // CSS selector cho drag handle
/>
```

### Custom Animations

```tsx
<Dialog
  animation="fade" // fade, slide, zoom, none
/>
```

### Scrollable Content

```tsx
<Dialog
  scrollable={true}
  maxHeight="80vh" // Giới hạn chiều cao
>
  {/* Long content */}
</Dialog>
```

## Best Practices

### 1. Performance

- Sử dụng `useDialog` hook thay vì state thông thường
- Lazy load dialog content nếu có thể
- Avoid rendering heavy content khi dialog đóng

### 2. UX Guidelines

- Luôn có title và description rõ ràng
- Sử dụng confirmation dialog cho destructive actions
- Cung cấp loading states trong form dialogs
- Test trên các screen sizes khác nhau

### 3. Accessibility

- Dialog tự động focus vào element đầu tiên
- Hỗ trợ keyboard navigation (Tab, Escape)
- Screen reader friendly với proper ARIA labels

## Examples

### Basic Dialog

```tsx
function BasicExample() {
  const dialog = useDialog();

  return (
    <DialogProvider>
      <button onClick={dialog.open}>Open Dialog</button>
      
      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        title="Basic Dialog"
        size="md"
      >
        <p>This is a basic dialog example.</p>
      </Dialog>
    </DialogProvider>
  );
}
```

### Form Dialog with Validation

```tsx
function FormExample() {
  const dialog = useDialog();
  
  const fields = [
    createTextField('name', 'Full Name', { required: true }),
    createEmailField('email', 'Email', { required: true }),
    createSelectField('role', 'Role', [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' }
    ])
  ];

  return (
    <DialogProvider>
      <button onClick={dialog.open}>Add User</button>
      
      <FormDialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        onSubmit={(data) => {
          console.log('User data:', data);
          dialog.close();
        }}
        title="Add New User"
        formFields={fields}
        size="lg"
      />
    </DialogProvider>
  );
}
```

### Confirmation Dialog

```tsx
function ConfirmExample() {
  const confirm = useConfirm();

  const handleDelete = async () => {
    const result = await confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true
    });

    if (result) {
      // Perform delete
      console.log('Item deleted');
    }
  };

  return (
    <DialogProvider>
      <button onClick={handleDelete}>Delete Item</button>
    </DialogProvider>
  );
}
```

## Troubleshooting

### Common Issues

1. **Dialog không hiển thị**: Đảm bảo wrap app trong `DialogProvider`
2. **Form validation không hoạt động**: Check field names và validation rules
3. **Performance issues**: Sử dụng lazy loading cho heavy content
4. **Styling conflicts**: Check CSS class conflicts với Tailwind

### Debug Mode

```tsx
// Bật debug mode để xem dialog state
<Dialog
  isOpen={true}
  onClose={() => {}}
  // ... other props
  className="debug-dialog" // Add debug styles
/>
```
