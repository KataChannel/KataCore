# Website SEO - Next.js CMS

A modern Content Management System built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

- 🚀 **Next.js 15** with App Router and TypeScript
- 🎨 **Tailwind CSS** with custom theme (Inter font, primary color: #2563eb)
- 🗄️ **Prisma ORM** with PostgreSQL database
- 🔐 **JWT Authentication** with role-based access control
- 📁 **MinIO Object Storage** for media files
- 🐳 **Docker Compose** for easy development setup
- 📊 **PgAdmin** for database management

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose (install with: `sudo apt install docker.io docker-compose` on Ubuntu/Debian)
- Git

> **Note**: If Docker is not installed, you can still run the Next.js application locally, but you'll need to set up PostgreSQL and MinIO services manually.

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd websiteseo
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your preferred values
```

4. **Start services with Docker**
```bash
npm run docker:up
```

This will start:
- Next.js app: http://localhost:3000
- PostgreSQL: localhost:5432
- PgAdmin: http://localhost:5050 (admin@websiteseo.com / admin123)
- MinIO API: http://localhost:9000
- MinIO Console: http://localhost:9001 (minioadmin / minioadmin123)

5. **Set up database**
```bash
npm run db:migrate
```

6. **Start development server**
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Posts
- `GET /api/posts` - Get posts (with pagination and filters)
- `POST /api/posts` - Create new post
- `GET /api/posts/[id]` - Get single post
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post

### Media
- `POST /api/media` - Upload file
- `GET /api/media` - Get media files

### Categories & Tags
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create tag

## Database Schema

### User
- id (UUID)
- email (unique)
- password (hashed)
- role (ADMIN, EDITOR, GUEST)

### Post
- id (UUID)
- title
- slug (unique)
- content (JSONB)
- metaTitle, metaDescription
- status (DRAFT, PUBLISHED)
- authorId (FK to User)

### Category & Tag
- Many-to-many relationship with Posts

### Media
- id (UUID)
- url
- altText
- type (image/video)
- size
- postId (FK to Post)

## Development Commands

```bash
# Database
npm run db:migrate        # Run migrations
npm run db:generate       # Generate Prisma client
npm run db:studio         # Open Prisma Studio

# Docker
npm run docker:up         # Start all services
npm run docker:down       # Stop all services
npm run docker:build      # Rebuild and start

# Development
npm run dev               # Start development server
npm run build            # Build for production
npm run start            # Start production server
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/websiteseo"

# MinIO
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin123"
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_BUCKET="websiteseo-media"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
```

## Project Structure

```
websiteseo/
├── app/
│   ├── api/          # API routes
│   ├── globals.css   # Global styles
│   └── ...
├── components/       # React components
├── lib/             # Utility functions
│   ├── prisma.ts    # Prisma client
│   ├── jwt.ts       # JWT utilities
│   └── minio.ts     # MinIO client
├── prisma/
│   └── schema.prisma
├── docker/
│   └── Dockerfile
└── docker-compose.yml
```

## API Usage Examples

### Authentication
```javascript
// Register
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    role: 'EDITOR'
  })
})

// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})
```

### Posts
```javascript
// Create post
const postResponse = await fetch('/api/posts', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'My Blog Post',
    content: { blocks: [{ type: 'paragraph', data: { text: 'Hello world!' } }] },
    metaTitle: 'SEO Title',
    metaDescription: 'SEO Description',
    status: 'PUBLISHED',
    categoryIds: ['category-uuid'],
    tagIds: ['tag-uuid']
  })
})
```

### Media Upload
```javascript
const formData = new FormData()
formData.append('file', file)
formData.append('altText', 'Image description')
formData.append('postId', 'post-uuid')

const mediaResponse = await fetch('/api/media', {
  method: 'POST',
  body: formData
})
```


docker compose docker-compose.yml -f