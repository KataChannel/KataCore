# GraphQL API với Prisma và NextJS

## Tổng quan

Hệ thống GraphQL API được xây dựng với:
- **GraphQL Yoga**: Server GraphQL hiện đại
- **Nexus**: Schema-first GraphQL với TypeScript
- **Prisma**: ORM và Database toolkit
- **DataLoader**: Tối ưu hóa N+1 queries
- **Apollo Client**: Frontend GraphQL client

## Cấu trúc thư mục

```
lib/graphql/
├── schema.ts           # Nexus schema definition
├── context.ts          # GraphQL context với DataLoaders
├── server.ts           # GraphQL Yoga server setup
├── types/              # GraphQL type definitions
│   ├── index.ts
│   ├── base.ts         # Base types (User, Role, MenuItem, etc.)
│   ├── queries.ts      # Query definitions
│   ├── mutations.ts    # Mutation definitions
│   └── scalars.ts      # Custom scalar types
├── dataloaders/        # DataLoader definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── field-transformer.ts
└── generated/          # Auto-generated files
    ├── schema.graphql  # Generated GraphQL schema
    └── nexus-typegen.ts

lib/apollo/
├── client.ts          # Apollo Client configuration
├── queries.ts         # GraphQL queries
├── mutations.ts       # GraphQL mutations
└── index.ts

hooks/graphql/
└── index.ts           # React hooks for GraphQL operations
```

## Tính năng chính

### 1. Dynamic Query Selection
GraphQL cho phép client chỉ request các field cần thiết:

```graphql
query GetUsers {
  users(take: 10) {
    id
    displayName
    email
    role {
      name
      description
    }
  }
}
```

### 2. DataLoader Optimization
Tự động batch và cache database queries để tránh N+1 problem:

```typescript
// Thay vì N+1 queries
users.forEach(user => user.role) // N queries to get roles

// DataLoader chỉ thực hiện 1 query
const roleLoader = createRoleLoader(prisma);
const roles = await Promise.all(users.map(user => roleLoader.load(user.roleId)));
```

### 3. Type Safety
Full TypeScript support từ database đến frontend:

```typescript
// Auto-generated types từ Prisma schema
const user: User = await prisma.users.findUnique({
  where: { id },
  include: { roles: true }
});
```

### 4. Real-time Updates
Apollo Client cache tự động update UI khi data thay đổi:

```typescript
const [createUser] = useCreateUser();
// Tự động refetch users list sau khi create
```

## API Endpoints

### GraphQL Endpoint
- **URL**: `/api/graphql`
- **Methods**: GET, POST
- **Content-Type**: `application/json`

### GraphQL Playground (Development only)
- **URL**: `http://localhost:3900/api/graphql`
- **Features**: Interactive query explorer, schema documentation

## Queries có sẵn

### Users
```graphql
# Get all users with filtering
query GetUsers($search: String, $roleId: String, $isActive: Boolean) {
  users(search: $search, roleId: $roleId, isActive: $isActive) {
    id
    displayName
    email
    isActive
    role {
      name
    }
  }
  usersCount(search: $search, roleId: $roleId, isActive: $isActive)
}

# Get single user
query GetUser($id: String!) {
  user(id: $id) {
    id
    displayName
    email
    role {
      name
      description
    }
    conversationCount
  }
}
```

### Roles
```graphql
# Get all roles
query GetRoles($search: String, $isSystemRole: Boolean) {
  roles(search: $search, isSystemRole: $isSystemRole) {
    id
    name
    description
    userCount
    menuPermissions {
      menuItem {
        name
        url
      }
      canView
      canAccess
    }
  }
}
```

### Menu Items
```graphql
# Get menu tree (hierarchical)
query GetMenuTree($roleId: String, $isActive: Boolean) {
  menuTree(roleId: $roleId, isActive: $isActive) {
    id
    name
    url
    icon
    children {
      id
      name
      url
      icon
    }
  }
}
```

### Dashboard Stats
```graphql
query GetDashboardStats {
  dashboardStats {
    usersCount
    rolesCount
    menuItemsCount
    permissionsCount
  }
}
```

## Mutations có sẵn

### Create User
```graphql
mutation CreateUser($input: UserCreateInput!) {
  createUser(input: $input) {
    id
    displayName
    email
    role {
      name
    }
  }
}
```

### Bulk Update Permissions
```graphql
mutation BulkUpdatePermissions($roleId: String!, $menuPermissions: [MenuPermissionInput!]!) {
  bulkUpdateRoleMenuPermissions(roleId: $roleId, menuPermissions: $menuPermissions)
}
```

## React Hooks

### Sử dụng hooks trong components:

```typescript
import { useUsers, useCreateUser, useDashboardStats } from '@/hooks/graphql';

function UsersComponent() {
  // Query with automatic caching và refetch
  const { data, loading, error, refetch } = useUsers({
    search: 'john',
    isActive: true,
    take: 10
  });

  // Mutation với automatic cache update
  const [createUser] = useCreateUser();

  const handleCreate = async () => {
    await createUser({
      variables: {
        input: {
          displayName: 'New User',
          email: 'user@example.com',
          roleId: 'role-id'
        }
      }
    });
    // Cache tự động update, không cần manual refetch
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.users?.map(user => (
        <div key={user.id}>{user.displayName}</div>
      ))}
    </div>
  );
}
```

## Authentication

API sử dụng JWT tokens từ NextAuth:

```typescript
// Headers
{
  "Authorization": "Bearer your-jwt-token"
}
```

Token được tự động gửi bởi Apollo Client thông qua authLink.

## Error Handling

### GraphQL Errors
```typescript
const { data, error } = useUsers();

if (error) {
  // error.graphQLErrors: Lỗi từ GraphQL resolvers  
  // error.networkError: Lỗi mạng hoặc server
  console.error('GraphQL Error:', error.message);
}
```

### Network Errors
Apollo Client tự động handle 401 (unauthorized) và redirect về login page.

## Performance Optimizations

### 1. DataLoader Batching
Tự động batch multiple requests trong cùng execution context:

```typescript
// 100 users với cùng roleId sẽ chỉ tạo 1 query thay vì 100
const users = await Promise.all(
  userIds.map(id => userLoader.load(id))
);
```

### 2. Field Selection
Chỉ query các fields được request:

```typescript
// GraphQL query
{
  users {
    id
    name  // Chỉ select id và name từ database
  }
}
```

### 3. Cache Normalization
Apollo Client normalize data theo ID để tránh duplicate data:

```typescript
// User được cache theo ID, update 1 nơi sẽ update toàn bộ app
cache.writeFragment({
  id: 'User:123',
  fragment: USER_FRAGMENT,
  data: updatedUser
});
```

## Testing

### GraphQL Playground
Truy cập `http://localhost:3900/api/graphql` để test queries interactively.

### React Components
Sử dụng `/admin/permissions/graphql-demo` để test các tính năng GraphQL trong UI.

## Production Deployment

### Environment Variables
```bash
# Required
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"

# Optional
NODE_ENV="production"
NEXTAUTH_URL="https://your-domain.com"
```

### Optimizations
- GraphQL Playground tự động disabled trong production
- Error masking enabled trong production
- Apollo Client devtools disabled trong production

## Troubleshooting

### Common Issues

1. **Schema Generation Error**
   ```bash
   npx tsx -e "import { schema } from './lib/graphql/schema'; console.log('Schema OK');"
   ```

2. **DataLoader Cache Issues**
   ```typescript
   // Clear cache manually
   const clearCache = useClearCache();
   clearCache();
   ```

3. **Authentication Errors**
   Check JWT token trong browser DevTools > Application > Local Storage

### Debug Mode
```bash
NODE_OPTIONS='--inspect' npm run dev
```

Mở Chrome DevTools > Node.js để debug GraphQL resolvers.

## Schema Documentation

Generated GraphQL schema có sẵn tại: `lib/graphql/generated/schema.graphql`

Hoặc view trong GraphQL Playground: `http://localhost:3900/api/graphql`
