# TazaCore HR Management System

A comprehensive HR management system built with Next.js 14, TypeScript, and modern web technologies.

## 🚀 Features

- **Employee Management**: Complete employee lifecycle management
- **Department Organization**: Hierarchical department structure
- **Attendance Tracking**: Time tracking and attendance management
- **Leave Management**: Leave request and approval workflow
- **Payroll Processing**: Automated payroll calculations
- **Performance Management**: Employee performance tracking
- **Admin Dashboard**: Comprehensive administrative interface
- **Authentication**: Secure login and role-based access

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: Zustand
- **UI Components**: Custom components with Headless UI
- **Testing**: Jest + React Testing Library
- **Deployment**: Docker support

## 📁 Project Structure

```
my-nextjs-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (dashboard)/       # Dashboard routes
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components
│   │   ├── forms/            # Form components
│   │   ├── layout/           # Layout components
│   │   └── features/         # Feature-specific components
│   ├── lib/                  # Utility libraries
│   │   ├── auth/             # Authentication logic
│   │   ├── database/         # Database configuration
│   │   ├── validators/       # Validation schemas
│   │   ├── utils/            # Helper functions
│   │   └── services/         # External services
│   ├── hooks/                # Custom React hooks
│   ├── store/                # State management
│   ├── styles/               # Styling files
│   ├── types/                # TypeScript definitions
│   └── middleware.ts         # Next.js middleware
├── tests/                    # Test files
├── docs/                     # Documentation
├── scripts/                  # Build/deployment scripts
└── .github/                  # GitHub workflows
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-nextjs-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your database connection in `.env.local`

5. Run database migrations:
```bash
pnpm db:migrate
```

6. Seed the database (optional):
```bash
pnpm db:seed
```

7. Start the development server:
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with sample data

### Code Style

This project uses ESLint and Prettier for code formatting. The configuration follows Next.js and TypeScript best practices.

### Testing

Run tests with:
```bash
pnpm test
```

## 🚀 Deployment

### Docker

Build and run with Docker:
```bash
docker build -t my-nextjs-app .
docker run -p 3000:3000 my-nextjs-app
```

### Vercel

Deploy to Vercel:
```bash
npx vercel
```

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
