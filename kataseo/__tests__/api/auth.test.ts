import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/login/route'
import { POST as POST_REGISTER } from '@/app/api/auth/register/route'

// Mock the entire Prisma module
const mockPrismaUser = {
  findUnique: jest.fn(),
  create: jest.fn(),
  findMany: jest.fn(),
}

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: mockPrismaUser,
  },
}))

// Mock bcrypt
const mockBcrypt = {
  compare: jest.fn(),
  hash: jest.fn(),
}

jest.mock('bcryptjs', () => mockBcrypt)

// Mock JWT
jest.mock('@/lib/jwt', () => ({
  signJWT: jest.fn(() => 'mock-jwt-token'),
}))

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'EDITOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaUser.findUnique.mockResolvedValue(mockUser)
      ;(mockBcrypt.compare as jest.Mock).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('token')
      expect(data).toHaveProperty('user')
      expect(data.user.email).toBe('test@example.com')
      expect(data.user).not.toHaveProperty('password')
    })

    it('should return 400 for invalid email format', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalidemail',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid email format')
    })

    it('should return 401 for user not found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'notfound@example.com',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid credentials')
    })

    it('should return 401 for incorrect password', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'EDITOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaUser.findUnique.mockResolvedValue(mockUser)
      ;(mockBcrypt.compare as jest.Mock).mockResolvedValue(false)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid credentials')
    })

    it('should return 400 for missing fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          // password missing
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email and password are required')
    })

    it('should handle database errors', async () => {
      mockPrismaUser.findUnique.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })
})

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/register', () => {
    it('should register new user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'newuser@example.com',
        password: 'hashedpassword',
        role: 'EDITOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaUser.findUnique.mockResolvedValue(null) // User doesn't exist
      mockPrismaUser.create.mockResolvedValue(mockUser)
      ;(mockBcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword')

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'password123',
          role: 'EDITOR',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST_REGISTER(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('token')
      expect(data).toHaveProperty('user')
      expect(data.user.email).toBe('newuser@example.com')
      expect(data.user).not.toHaveProperty('password')
    })

    it('should return 400 for existing user', async () => {
      const existingUser = {
        id: '1',
        email: 'existing@example.com',
        password: 'hashedpassword',
        role: 'EDITOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaUser.findUnique.mockResolvedValue(existingUser)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'password123',
          role: 'EDITOR',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST_REGISTER(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('User already exists')
    })

    it('should return 400 for invalid role', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          role: 'INVALID_ROLE',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST_REGISTER(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid role')
    })

    it('should return 400 for short password', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: '123',
          role: 'EDITOR',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST_REGISTER(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Password must be at least 6 characters')
    })

    it('should return 400 for invalid email format', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalidemail',
          password: 'password123',
          role: 'EDITOR',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST_REGISTER(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid email format')
    })
  })
})
