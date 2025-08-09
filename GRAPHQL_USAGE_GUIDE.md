# GraphQL API Usage Guide - Taza Group

## 🚀 Quick Start

### GraphQL Endpoint
```
POST /api/graphql
```

### Authentication
```typescript
// Include JWT token in headers
{
  "Authorization": "Bearer your-jwt-token"
}
```

## 📖 Common Usage Examples

### 🔐 Authentication

#### Login
```graphql
mutation Login {
  login(input: {
    email: "user@example.com"
    password: "password123"
  }) {
    success
    message
    tokens {
      accessToken
      refreshToken
    }
    user {
      id
      name
      email
      roles {
        id
        name
        permissions {
          action
          resource
        }
      }
    }
  }
}
```

#### Register New User
```graphql
mutation Register {
  register(input: {
    name: "John Doe"
    email: "john@example.com"
    password: "password123"
    phoneNumber: "+84901234567"
  }) {
    success
    message
    tokens {
      accessToken
      refreshToken
    }
    user {
      id
      name
      email
    }
  }
}
```

#### Get Current User
```graphql
query Me {
  me {
    id
    name
    email
    phoneNumber
    isActive
    roles {
      id
      name
      permissions {
        action
        resource
      }
    }
  }
}
```

### 👥 User Management

#### Get All Users with Pagination
```graphql
query GetUsers {
  users(skip: 0, take: 20, search: "john") {
    id
    name
    email
    phoneNumber
    isActive
    createdAt
    roles {
      id
      name
    }
  }
}
```

#### Create New User
```graphql
mutation CreateUser {
  createUser(input: {
    name: "Jane Smith"
    email: "jane@example.com"
    password: "password123"
    phoneNumber: "+84901234568"
    roleIds: ["role-id-1", "role-id-2"]
  }) {
    id
    name
    email
    isActive
    roles {
      name
    }
  }
}
```

### 📞 Call Center Management

#### Get Call Extensions
```graphql
query GetCallExtensions {
  callExtensions(status: "active") {
    id
    extCode
    name
    description
    status
    assignedUsersCount
    assignedUsers {
      id
      isActive
      user {
        id
        name
        email
      }
    }
  }
}
```

#### Create Call Extension
```graphql
mutation CreateCallExtension {
  createCallExtension(input: {
    extCode: "1001"
    password: "ext1001pass"
    name: "Sales Extension 1"
    description: "Main sales extension"
    status: "active"
  }) {
    id
    extCode
    name
    status
  }
}
```

#### Assign User to Extension
```graphql
mutation AssignUserToExtension {
  assignUserToCallExtension(input: {
    userId: "user-id-123"
    callExtensionId: "ext-id-456"
    isActive: true
  }) {
    id
    isActive
    user {
      name
      email
    }
    callExtension {
      extCode
      name
    }
  }
}
```

### 📝 Blog Management

#### Get Blog Posts
```graphql
query GetBlogPosts {
  blogPosts(take: 10, status: "published", isFeatured: true) {
    id
    title
    slug
    excerpt
    featuredImage
    publishedAt
    views
    likes
    author {
      id
      name
    }
    category {
      id
      name
      slug
    }
    tags {
      id
      name
      color
    }
    commentsCount
  }
}
```

#### Get Single Blog Post
```graphql
query GetBlogPost($slug: String!) {
  blogPost(slug: $slug) {
    id
    title
    content
    featuredImage
    publishedAt
    views
    likes
    metaTitle
    metaDescription
    author {
      id
      name
    }
    category {
      name
      slug
    }
    tags {
      name
      color
    }
    comments {
      id
      content
      authorName
      createdAt
      replies {
        id
        content
        authorName
        createdAt
      }
    }
  }
}
```

#### Create Blog Post
```graphql
mutation CreateBlogPost {
  createBlogPost(input: {
    title: "How to Use GraphQL"
    slug: "how-to-use-graphql"
    excerpt: "A comprehensive guide to GraphQL"
    content: "GraphQL is a query language..."
    featuredImage: "/images/graphql-guide.jpg"
    status: "published"
    categoryId: "blog-category-tech"
    tagIds: ["tag-graphql", "tag-tutorial"]
    isFeatured: true
    allowComments: true
  }) {
    id
    title
    slug
    status
    publishedAt
  }
}
```

### 🛒 E-Commerce Shop

#### Get Products with Filters
```graphql
query GetProducts {
  products(
    take: 20
    search: "laptop"
    categoryId: "electronics"
    minPrice: 500
    maxPrice: 2000
    featured: true
    inStock: true
    sortBy: "price"
    sortOrder: "asc"
  ) {
    id
    name
    slug
    price
    salePrice
    sku
    featuredImage
    stockQuantity
    inStock
    averageRating
    ratingCount
    category {
      name
      slug
    }
    brand {
      name
      logo
    }
  }
}
```

#### Get Product Details
```graphql
query GetProduct($slug: String!) {
  product(slug: $slug) {
    id
    name
    description
    price
    salePrice
    sku
    images
    stockQuantity
    weight
    dimensions
    averageRating
    ratingCount
    category {
      name
      slug
    }
    brand {
      name
      logo
    }
    variants {
      id
      name
      price
      sku
      attributes {
        name
        value
      }
    }
    attributes {
      name
      value
      type
    }
    reviews(take: 5) {
      id
      rating
      title
      content
      customerName
      verified
      createdAt
    }
  }
}
```

#### Create Order
```graphql
mutation CreateOrder {
  createOrder(input: {
    customerEmail: "customer@example.com"
    customerPhone: "+84901234567"
    paymentMethod: "credit_card"
    billingAddress: "123 Main St, Ho Chi Minh City"
    shippingAddress: "123 Main St, Ho Chi Minh City"
    items: [
      {
        productId: "product-1"
        quantity: 2
        attributes: "Color: Red, Size: L"
      },
      {
        productId: "product-2"
        quantity: 1
      }
    ]
  }) {
    id
    orderNumber
    status
    total
    items {
      id
      productName
      quantity
      price
      total
    }
  }
}
```

### 📚 Information Hub

#### Get FAQ Categories and FAQs
```graphql
query GetFAQs {
  faqCategories(isActive: true) {
    id
    name
    description
    icon
    faqsCount
    faqs {
      id
      question
      answer
      views
      helpful
      notHelpful
    }
  }
}
```

#### Search Information Articles
```graphql
query SearchArticles($search: String!) {
  informationArticles(search: $search, status: "published") {
    id
    title
    slug
    excerpt
    featuredImage
    publishedAt
    views
    category {
      name
      icon
    }
    author {
      name
    }
  }
}
```

#### Get Documents
```graphql
query GetDocuments {
  documents(isPublic: true, isActive: true) {
    id
    title
    description
    fileName
    fileType
    fileSize
    downloads
    category {
      name
      icon
    }
    uploader {
      name
    }
    createdAt
  }
}
```

### 📱 Social Media & Marketing

#### Get Social Media Accounts
```graphql
query GetSocialAccounts {
  socialMediaAccounts(isActive: true) {
    id
    platform
    accountName
    profilePicture
    followersCount
    followingCount
    status
    user {
      name
    }
    posts(take: 5) {
      id
      content
      status
      publishedAt
      likes
      comments
      shares
    }
  }
}
```

#### Create Social Media Post
```graphql
mutation CreateSocialPost {
  createSocialMediaPost(input: {
    accountId: "social-account-1"
    content: "Check out our new GraphQL API! 🚀"
    images: ["/images/graphql-announcement.jpg"]
    scheduledAt: "2024-02-01T10:00:00Z"
    hashtags: "#GraphQL #API #TazaGroup"
  }) {
    id
    content
    status
    scheduledAt
    account {
      platform
      accountName
    }
  }
}
```

#### Get Marketing Campaigns
```graphql
query GetCampaigns {
  campaigns(status: "active") {
    id
    name
    type
    status
    startDate
    endDate
    budget
    spent
    manager {
      name
    }
    ads {
      id
      name
      impressions
      clicks
      ctr
      cpc
    }
  }
}
```

## 🔄 React Hooks Usage

### Using Apollo Client Hooks
```typescript
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS, CREATE_USER } from './graphql/queries';

// In your React component
function UsersList() {
  const { data, loading, error } = useQuery(GET_USERS, {
    variables: { take: 20 }
  });
  
  const [createUser] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS }]
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.users?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Custom GraphQL Hooks
```typescript
import { useUsers, useCreateUser } from '@/hooks/graphql';

function UsersManager() {
  const { users, loading, error } = useUsers({ take: 20 });
  const { createUser, loading: creating } = useCreateUser();

  const handleCreate = async (userData) => {
    try {
      await createUser(userData);
      // Users list will auto-refresh
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  return (
    // Your component JSX
  );
}
```

## 🛠️ Development Tools

### GraphQL Playground
```
http://localhost:3000/api/graphql
```

### Schema Introspection
```graphql
query IntrospectionQuery {
  __schema {
    types {
      name
      kind
      description
    }
  }
}
```

### Query Validation
```typescript
// TypeScript will validate your queries at compile time
const GET_USERS = gql`
  query GetUsers($take: Int) {
    users(take: $take) {
      id
      name
      email
      # TypeScript error if field doesn't exist
      invalidField
    }
  }
`;
```

## 🚀 Best Practices

### 1. Use Fragments for Reusable Fields
```graphql
fragment UserBasic on User {
  id
  name
  email
  isActive
}

query GetUsers {
  users {
    ...UserBasic
    roles {
      name
    }
  }
}
```

### 2. Implement Proper Error Handling
```typescript
const { data, loading, error } = useQuery(GET_USERS);

if (error) {
  // Handle GraphQL errors
  error.graphQLErrors.forEach(({ message, locations, path }) => {
    console.error('GraphQL error:', message);
  });
  
  // Handle network errors
  if (error.networkError) {
    console.error('Network error:', error.networkError);
  }
}
```

### 3. Use Variables for Dynamic Queries
```graphql
# Good: Use variables
query GetUser($id: String!) {
  user(id: $id) {
    name
    email
  }
}

# Bad: String interpolation
query GetUser {
  user(id: "hardcoded-id") {
    name
    email
  }
}
```

### 4. Optimize Query Performance
```graphql
# Request only needed fields
query GetProducts {
  products {
    id
    name
    price
    # Don't request heavy fields unless needed
    # description
    # images
  }
}
```

## 📋 Available Operations

### Queries (Read Operations)
- `users`, `user`, `roles`, `permissions`
- `callExtensions`, `callHistory`, `callExtensionUsers`
- `blogPosts`, `blogPost`, `blogCategories`, `blogTags`
- `products`, `product`, `orders`, `productCategories`
- `informationArticles`, `faqs`, `documents`
- `campaigns`, `socialMediaAccounts`, `emailTemplates`

### Mutations (Write Operations)
- `login`, `register`, `logout`, `refreshToken`
- `createUser`, `updateUser`, `deleteUser`
- `createCallExtension`, `assignUserToCallExtension`
- `createBlogPost`, `createBlogCategory`, `likeBlogPost`
- `createProduct`, `createOrder`, `updateOrderStatus`
- `createCampaign`, `createSocialMediaPost`

### Subscriptions (Real-time, Ready for Implementation)
- `userAdded`, `userUpdated`
- `orderCreated`, `orderStatusChanged`
- `newBlogPost`, `newComment`

Hệ thống GraphQL của Taza Group hiện đã hoàn thiện và sẵn sàng cho production use! 🚀
