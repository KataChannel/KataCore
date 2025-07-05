# 🔧 KataCore Development Guide

## Development Environment Setup

### Prerequisites
- **Bun.js** >= 1.0.0 ([Install Guide](https://bun.sh/docs/installation))
- **Docker** & **Docker Compose** ([Install Guide](https://docs.docker.com/get-docker/))
- **Node.js** >= 18.0.0 (for compatibility)
- **Git** for version control
- **VS Code** (recommended editor)

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/chikiet/KataCore.git
cd KataCore

# Install all dependencies
bun install:all

# Copy environment files
cp site/.env.example site/.env.local
cp api/.env.example api/.env

# Generate security keys
bun run security:generate
```

### Environment Configuration

#### Frontend Environment (site/.env.local)
```env
# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret

# External Services
NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:9000
```

#### Backend Environment (api/.env)
```env
# Database
DATABASE_URL=postgresql://katacore:katacore@localhost:5432/katacore

# Authentication
JWT_SECRET=your-generated-jwt-secret
JWT_EXPIRES_IN=24h

# Redis Cache
REDIS_URL=redis://localhost:6379

# MinIO Object Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

## Development Workflow

### 1. Start Development Environment
```bash
# Start database services
bun run docker:up

# Start development servers
bun run dev

# Or start services individually
bun run dev:site  # Frontend on http://localhost:3000
bun run dev:api   # Backend on http://localhost:3001
```

### 2. Database Development
```bash
# Navigate to API directory
cd api

# Create new migration
bun run prisma:migrate

# Reset database (development only)
bun run prisma:reset

# Seed database with sample data
bun run prisma:seed

# Open Prisma Studio
bun run prisma:studio
```

### 3. Code Quality & Testing
```bash
# Lint code
bun run lint

# Run tests
bun run test

# Type checking
bun run type-check

# Format code
bun run format
```

## Project Structure Deep Dive

### Frontend Structure (site/)
```
site/
├── src/app/                    # Next.js App Router
│   ├── (auth)/                # Authentication routes
│   │   ├── login/page.tsx     # Login page
│   │   └── register/page.tsx  # Registration page
│   ├── dashboard/             # Dashboard pages
│   │   ├── page.tsx           # Main dashboard
│   │   └── layout.tsx         # Dashboard layout
│   ├── employees/             # Employee management
│   │   ├── page.tsx           # Employee list
│   │   ├── [id]/page.tsx      # Employee details
│   │   ├── new/page.tsx       # Create employee
│   │   └── components/        # Employee-specific components
│   ├── departments/           # Department management
│   │   ├── page.tsx           # Department list
│   │   ├── [id]/page.tsx      # Department details
│   │   └── components/        # Department-specific components
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
│
├── src/components/            # Reusable components
│   ├── ui/                    # Basic UI components
│   │   ├── Button.tsx         # Button component
│   │   ├── Input.tsx          # Input component
│   │   ├── Modal.tsx          # Modal component
│   │   └── Table.tsx          # Table component
│   ├── forms/                 # Form components
│   │   ├── EmployeeForm.tsx   # Employee form
│   │   ├── DepartmentForm.tsx # Department form
│   │   └── LoginForm.tsx      # Login form
│   ├── layouts/               # Layout components
│   │   ├── Header.tsx         # Header component
│   │   ├── Sidebar.tsx        # Sidebar component
│   │   └── Footer.tsx         # Footer component
│   └── features/              # Feature-specific components
│       ├── auth/              # Authentication components
│       ├── employees/         # Employee components
│       └── departments/       # Department components
│
├── src/lib/                   # Utilities and configurations
│   ├── auth.ts                # Authentication utilities
│   ├── api.ts                 # API client
│   ├── utils.ts               # Helper functions
│   ├── validations.ts         # Form validations
│   └── constants.ts           # Application constants
│
└── src/hooks/                 # Custom React hooks
    ├── useAuth.ts             # Authentication hook
    ├── useEmployees.ts        # Employee management hook
    └── useDepartments.ts      # Department management hook
```

### Backend Structure (api/)
```
api/
├── src/                       # NestJS source code
│   ├── auth/                  # Authentication module
│   │   ├── auth.controller.ts # Auth endpoints
│   │   ├── auth.service.ts    # Auth business logic
│   │   ├── auth.module.ts     # Auth module
│   │   ├── dto/               # Data Transfer Objects
│   │   │   ├── login.dto.ts   # Login DTO
│   │   │   └── register.dto.ts # Register DTO
│   │   └── strategies/        # Authentication strategies
│   │       └── jwt.strategy.ts # JWT strategy
│   │
│   ├── employees/             # Employee management module
│   │   ├── employees.controller.ts # Employee endpoints
│   │   ├── employees.service.ts    # Employee business logic
│   │   ├── employees.module.ts     # Employee module
│   │   ├── dto/               # Employee DTOs
│   │   │   ├── create-employee.dto.ts
│   │   │   └── update-employee.dto.ts
│   │   └── entities/          # Employee entities
│   │       └── employee.entity.ts
│   │
│   ├── departments/           # Department management module
│   │   ├── departments.controller.ts
│   │   ├── departments.service.ts
│   │   ├── departments.module.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── users/                 # User management module
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── common/                # Shared utilities
│   │   ├── guards/            # Authentication guards
│   │   │   ├── auth.guard.ts  # JWT auth guard
│   │   │   └── roles.guard.ts # Role-based guard
│   │   ├── decorators/        # Custom decorators
│   │   │   ├── roles.decorator.ts
│   │   │   └── user.decorator.ts
│   │   ├── filters/           # Exception filters
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/      # Response interceptors
│   │   │   └── transform.interceptor.ts
│   │   └── enums/             # Enums and constants
│   │       ├── role.enum.ts
│   │       └── status.enum.ts
│   │
│   ├── app.module.ts          # Root application module
│   ├── app.controller.ts      # Root controller
│   ├── app.service.ts         # Root service
│   └── main.ts                # Application entry point
│
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   │   └── 20240101000000_init/
│   └── seed.ts                # Database seeding script
│
└── test/                      # Test files
    ├── app.e2e-spec.ts        # End-to-end tests
    └── jest-e2e.json          # Jest E2E configuration
```

## Development Best Practices

### Code Style & Standards

#### TypeScript Configuration
- Use strict TypeScript configuration
- Enable all strict mode flags
- Use proper type definitions
- Avoid `any` type usage

#### Naming Conventions
```typescript
// Files: kebab-case
employee-form.tsx
user-service.ts

// Components: PascalCase
const EmployeeForm = () => { /* ... */ }

// Functions/Variables: camelCase
const getUserById = (id: string) => { /* ... */ }
const employeeData = { /* ... */ }

// Constants: SCREAMING_SNAKE_CASE
const API_BASE_URL = 'http://localhost:3001'
const MAX_RETRY_ATTEMPTS = 3

// Interfaces/Types: PascalCase with descriptive names
interface UserProfile {
  id: string
  name: string
  email: string
}

type EmployeeStatus = 'active' | 'inactive' | 'pending'
```

#### Code Organization
```typescript
// Import order: external libraries, internal modules, relative imports
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateEmployeeDto } from './dto/create-employee.dto'

// Export at the end of the file
export { EmployeeService }
```

### Frontend Development

#### Component Development
```typescript
// Use functional components with TypeScript
interface Props {
  employee: Employee
  onUpdate: (employee: Employee) => void
  onDelete: (id: string) => void
}

const EmployeeCard: React.FC<Props> = ({ employee, onUpdate, onDelete }) => {
  // Component logic here
  return (
    <div className="employee-card">
      {/* Component JSX */}
    </div>
  )
}
```

#### State Management
```typescript
// Use React hooks for state management
const [employees, setEmployees] = useState<Employee[]>([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

// Custom hooks for complex logic
const useEmployees = () => {
  const [state, setState] = useState(initialState)
  
  const fetchEmployees = async () => {
    // Fetch logic
  }
  
  return { ...state, fetchEmployees }
}
```

#### Form Handling
```typescript
// Use React Hook Form with Zod validation
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  department: z.string().min(1, 'Department is required')
})

type EmployeeFormData = z.infer<typeof employeeSchema>

const EmployeeForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema)
  })
  
  const onSubmit = (data: EmployeeFormData) => {
    // Submit logic
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

### Backend Development

#### Controller Development
```typescript
@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'List of employees' })
  async findAll(@Query() query: GetEmployeesDto): Promise<Employee[]> {
    return this.employeesService.findAll(query)
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new employee' })
  async create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    return this.employeesService.create(createEmployeeDto)
  }
}
```

#### Service Development
```typescript
@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: GetEmployeesDto): Promise<Employee[]> {
    const { page = 1, limit = 10, search } = query
    
    return this.prisma.employee.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      } : {},
      skip: (page - 1) * limit,
      take: limit,
      include: {
        department: true
      }
    })
  }

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    try {
      return await this.prisma.employee.create({
        data: createEmployeeDto,
        include: {
          department: true
        }
      })
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Employee with this email already exists')
      }
      throw error
    }
  }
}
```

### Database Development

#### Schema Design
```prisma
// Define clear relationships
model Employee {
  id           String      @id @default(cuid())
  name         String
  email        String      @unique
  departmentId String?
  status       Status      @default(ACTIVE)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  department   Department? @relation(fields: [departmentId], references: [id])

  @@map("employees")
}

model Department {
  id        String     @id @default(cuid())
  name      String     @unique
  budget    Decimal?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  employees Employee[]

  @@map("departments")
}

enum Status {
  ACTIVE
  INACTIVE
  PENDING
}
```

#### Migration Best Practices
```bash
# Always review migrations before applying
cd api
bun run prisma:migrate dev --name add_employee_status

# Use descriptive migration names
bun run prisma:migrate dev --name add_department_budget_field

# Backup database before major migrations
bun run prisma:migrate deploy
```

## Testing

### Frontend Testing
```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react'
import { EmployeeForm } from './EmployeeForm'

describe('EmployeeForm', () => {
  test('should submit form with valid data', async () => {
    const onSubmit = jest.fn()
    render(<EmployeeForm onSubmit={onSubmit} />)
    
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John Doe'
    })
  })
})
```

### Backend Testing
```typescript
// Service testing
import { Test, TestingModule } from '@nestjs/testing'
import { EmployeesService } from './employees.service'
import { PrismaService } from '../prisma/prisma.service'

describe('EmployeesService', () => {
  let service: EmployeesService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeesService, PrismaService],
    }).compile()

    service = module.get<EmployeesService>(EmployeesService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  test('should create an employee', async () => {
    const employee = { name: 'John Doe', email: 'john@example.com' }
    const expectedResult = { id: '1', ...employee }
    
    jest.spyOn(prisma.employee, 'create').mockResolvedValue(expectedResult)
    
    const result = await service.create(employee)
    expect(result).toEqual(expectedResult)
  })
})
```

## Debugging

### Frontend Debugging
```typescript
// Use React DevTools for component debugging
// Use browser DevTools for network debugging
// Use console.log strategically (remove before commit)

// Debug API calls
const fetchEmployees = async () => {
  try {
    console.log('Fetching employees...')
    const response = await api.get('/employees')
    console.log('Employees fetched:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching employees:', error)
    throw error
  }
}
```

### Backend Debugging
```typescript
// Use NestJS Logger
import { Logger } from '@nestjs/common'

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name)

  async findAll(): Promise<Employee[]> {
    this.logger.log('Fetching all employees')
    
    try {
      const employees = await this.prisma.employee.findMany()
      this.logger.log(`Found ${employees.length} employees`)
      return employees
    } catch (error) {
      this.logger.error('Error fetching employees', error.stack)
      throw error
    }
  }
}
```

## Performance Optimization

### Frontend Performance
```typescript
// Use React.memo for expensive components
const EmployeeList = React.memo(({ employees }) => {
  return (
    <div>
      {employees.map(employee => (
        <EmployeeCard key={employee.id} employee={employee} />
      ))}
    </div>
  )
})

// Use useMemo for expensive calculations
const sortedEmployees = useMemo(() => {
  return employees.sort((a, b) => a.name.localeCompare(b.name))
}, [employees])

// Use lazy loading for routes
const EmployeePage = lazy(() => import('./pages/EmployeePage'))
```

### Backend Performance
```typescript
// Use database indexes
// @@index([email], name: "employee_email_idx")

// Use pagination
async findAll(query: GetEmployeesDto): Promise<PaginatedResult<Employee>> {
  const { page = 1, limit = 10 } = query
  const skip = (page - 1) * limit

  const [employees, total] = await Promise.all([
    this.prisma.employee.findMany({
      skip,
      take: limit,
      include: { department: true }
    }),
    this.prisma.employee.count()
  ])

  return {
    data: employees,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}
```

## Git Workflow

### Branch Naming
```bash
# Feature branches
git checkout -b feature/employee-management
git checkout -b feature/department-crud

# Bug fixes
git checkout -b fix/employee-form-validation
git checkout -b fix/auth-redirect-issue

# Hotfixes
git checkout -b hotfix/security-vulnerability
```

### Commit Messages
```bash
# Use conventional commits
git commit -m "feat: add employee management system"
git commit -m "fix: resolve authentication redirect issue"
git commit -m "docs: update deployment guide"
git commit -m "refactor: optimize database queries"
git commit -m "test: add employee service unit tests"
```

### Pre-commit Hooks
```bash
# Install husky for git hooks
bun add --dev husky lint-staged

# Configure pre-commit hooks
echo 'bun run lint && bun run test' > .husky/pre-commit
```

This development guide provides comprehensive instructions for contributing to the KataCore project while maintaining code quality and consistency.
