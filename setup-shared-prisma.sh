#!/bin/bash

# TazaCore Shared Prisma Setup Script
# This script sets up shared Prisma configuration for Next.js and NestJS

set -e

echo "� Setting up shared Prisma configuration..."

# Create shared directory structure
echo "📁 Creating shared directory structure..."
mkdir -p shared/prisma
mkdir -p shared/lib
mkdir -p shared/types

# Copy existing Prisma schema from site to shared
echo "� Moving Prisma schema to shared location..."
if [ -f "site/prisma/schema.prisma" ]; then
    cp site/prisma/schema.prisma shared/prisma/
    echo "✅ Schema copied from site/prisma/"
fi

# Copy migrations if they exist
if [ -d "site/prisma/migrations" ]; then
    cp -r site/prisma/migrations shared/prisma/
    echo "✅ Migrations copied"
fi

# Create shared Prisma client
echo "🔧 Creating shared Prisma client..."
cat > shared/lib/prisma.ts << 'EOF'
import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;
EOF

# Create shared types
echo "📝 Creating shared types..."
cat > shared/types/database.ts << 'EOF'
import { User, Role, Employee, Department, Position, Attendance, LeaveRequest, Payroll, PerformanceReview } from '@prisma/client';

// Extended types with relations
export type UserWithRole = User & {
  role: Role;
};

export type EmployeeWithRelations = Employee & {
  user?: User;
  position?: Position & {
    department: Department;
  };
  department?: Department;
};

export type DepartmentWithManager = Department & {
  manager?: User;
  _count?: {
    employees: number;
    positions: number;
  };
};

export type PositionWithDepartment = Position & {
  department: Department;
  _count?: {
    employees: number;
  };
};

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Filter types
export interface EmployeeFilters {
  search?: string;
  status?: string;
  departmentId?: string;
  positionId?: string;
  page?: number;
  limit?: number;
}

export interface DepartmentFilters {
  search?: string;
  isActive?: boolean;
  managerId?: string;
  page?: number;
  limit?: number;
}
EOF

# Create shared package.json
echo "📦 Creating shared package.json..."
cat > shared/package.json << 'EOF'
{
  "name": "@tazacore/shared",
  "version": "1.0.0",
  "description": "Shared Prisma configuration for TazaCore",
  "main": "lib/prisma.ts",
  "dependencies": {
    "@prisma/client": "^6.11.1",
    "prisma": "^6.11.1"
  },
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset",
    "db:studio": "prisma studio"
  }
}
EOF

# Remove old Prisma directories and create symlinks
echo "🔗 Creating symlinks..."

# For site (Next.js)
if [ -d "site/prisma" ]; then
    cd site
    rm -rf prisma
    ln -sf ../shared/prisma ./prisma
    cd ..
fi

# For api (NestJS)
if [ -d "api/prisma" ]; then
    cd api
    rm -rf prisma
    ln -sf ../shared/prisma ./prisma
    cd ..
fi

# Install shared dependencies
echo "📦 Installing shared dependencies..."
cd shared
npm install
cd ..

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd shared
npx prisma generate
cd ..
npm run db:generate

# Update environment files
echo "🌍 Creating environment configuration..."
if [ ! -f ".env" ]; then
cat > .env << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://tazacore:tazacore123@localhost:5432/tazacore_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# App Configuration
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3001"
EOF
fi

# Copy env to both projects
cp .env site/.env.local 2>/dev/null || true
cp .env api/.env 2>/dev/null || true

# Update package.json scripts in root
echo "📝 Updating root package.json scripts..."
if [ -f "package.json" ]; then
    # Add shared scripts if they don't exist
    npm pkg set scripts.db:generate="cd shared && bun run db:generate"
    npm pkg set scripts.db:migrate="cd shared && bun run db:migrate"
    npm pkg set scripts.db:seed="cd shared && bun run db:seed"
    npm pkg set scripts.db:studio="cd shared && bun run db:studio"
    npm pkg set scripts.db:reset="cd shared && bun run db:reset"
fi

echo "✅ Shared Prisma setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update your DATABASE_URL in .env file"
echo "2. Run: bun run db:migrate to apply migrations"
echo "3. Run: bun run db:seed to seed initial data"
echo "4. Run: bun run dev to start both applications"
echo "5. Access Prisma Studio: bun run db:studio"
echo ""
echo "🚀 Your Next.js and NestJS applications now share the same Prisma database!"
echo ""
echo "📚 For detailed guide, see: docs/SHARED-PRISMA-SETUP.md"
