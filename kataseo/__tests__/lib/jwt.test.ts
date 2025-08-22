import { signJWT, verifyJWT, extractTokenFromHeader } from '@/lib/jwt'

describe('JWT Utilities', () => {
  const testPayload = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'ADMIN'
  }

  describe('signJWT', () => {
    it('should create a valid JWT token', () => {
      const token = signJWT(testPayload)
      expect(token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
    })

    it('should create different tokens for different payloads', () => {
      const token1 = signJWT(testPayload)
      const token2 = signJWT({ ...testPayload, userId: 'different-id' })
      expect(token1).not.toBe(token2)
    })
  })

  describe('verifyJWT', () => {
    it('should verify a valid token', () => {
      const token = signJWT(testPayload)
      const decoded = verifyJWT(token)
      
      expect(decoded).toMatchObject(testPayload)
      expect(decoded?.userId).toBe(testPayload.userId)
      expect(decoded?.email).toBe(testPayload.email)
      expect(decoded?.role).toBe(testPayload.role)
    })

    it('should return null for invalid token', () => {
      const decoded = verifyJWT('invalid-token')
      expect(decoded).toBeNull()
    })

    it('should return null for empty token', () => {
      const decoded = verifyJWT('')
      expect(decoded).toBeNull()
    })
  })

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const token = 'test-token-123'
      const header = `Bearer ${token}`
      const extracted = extractTokenFromHeader(header)
      expect(extracted).toBe(token)
    })

    it('should return null for invalid header format', () => {
      const extracted = extractTokenFromHeader('Invalid header')
      expect(extracted).toBeNull()
    })

    it('should return null for null header', () => {
      const extracted = extractTokenFromHeader(null)
      expect(extracted).toBeNull()
    })

    it('should return null for empty header', () => {
      const extracted = extractTokenFromHeader('')
      expect(extracted).toBeNull()
    })

    it('should handle header without Bearer prefix', () => {
      const extracted = extractTokenFromHeader('just-token')
      expect(extracted).toBeNull()
    })
  })

  describe('Integration: sign and verify', () => {
    it('should create and verify token successfully', () => {
      const token = signJWT(testPayload)
      const decoded = verifyJWT(token)
      
      expect(decoded).toMatchObject(testPayload)
    })

    it('should handle complete auth flow', () => {
      // Sign token
      const token = signJWT(testPayload)
      
      // Simulate HTTP header
      const authHeader = `Bearer ${token}`
      
      // Extract token
      const extractedToken = extractTokenFromHeader(authHeader)
      expect(extractedToken).toBe(token)
      
      // Verify token
      const decoded = verifyJWT(extractedToken!)
      expect(decoded).toMatchObject(testPayload)
    })
  })
})
