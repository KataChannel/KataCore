import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthForm } from '@/components/auth/AuthForm'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock the AuthContext
const mockLogin = jest.fn()
const mockRegister = jest.fn()

jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    user: null,
    token: null,
    loading: false,
    logout: jest.fn(),
    hasRole: jest.fn(),
    hasPermission: jest.fn(),
  }),
}))

const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>
}

describe('AuthForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLogin.mockResolvedValue({ success: true })
    mockRegister.mockResolvedValue({ success: true })
  })

  describe('Login Mode', () => {
    it('renders login form correctly', () => {
      render(
        <MockAuthProvider>
          <AuthForm mode="login" />
        </MockAuthProvider>
      )

      expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
    })

    it('validates required fields', async () => {
      const user = userEvent.setup()
      render(
        <MockAuthProvider>
          <AuthForm mode="login" />
        </MockAuthProvider>
      )

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // HTML5 validation should prevent submission with empty fields
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      expect(emailInput).toBeRequired()
      expect(passwordInput).toBeRequired()
    })

    it('handles successful login', async () => {
      const user = userEvent.setup()
      render(
        <MockAuthProvider>
          <AuthForm mode="login" />
        </MockAuthProvider>
      )

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('handles login error', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' })

      render(
        <MockAuthProvider>
          <AuthForm mode="login" />
        </MockAuthProvider>
      )

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })

    it('toggles password visibility', async () => {
      const user = userEvent.setup()
      render(
        <MockAuthProvider>
          <AuthForm mode="login" />
        </MockAuthProvider>
      )

      const passwordInput = screen.getByLabelText(/password/i)
      const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button

      expect(passwordInput).toHaveAttribute('type', 'password')

      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')

      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Register Mode', () => {
    it('renders register form correctly', () => {
      render(
        <MockAuthProvider>
          <AuthForm mode="register" />
        </MockAuthProvider>
      )

      expect(screen.getByText('Create new account')).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/account type/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
    })

    it('validates password confirmation', async () => {
      const user = userEvent.setup()
      render(
        <MockAuthProvider>
          <AuthForm mode="register" />
        </MockAuthProvider>
      )

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'differentpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })

      expect(mockRegister).not.toHaveBeenCalled()
    })

    it('validates minimum password length', async () => {
      const user = userEvent.setup()
      render(
        <MockAuthProvider>
          <AuthForm mode="register" />
        </MockAuthProvider>
      )

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, '123')
      await user.type(confirmPasswordInput, '123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
      })

      expect(mockRegister).not.toHaveBeenCalled()
    })

    it('handles successful registration', async () => {
      const user = userEvent.setup()
      render(
        <MockAuthProvider>
          <AuthForm mode="register" />
        </MockAuthProvider>
      )

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const roleSelect = screen.getByLabelText(/account type/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.selectOptions(roleSelect, 'EDITOR')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123', 'EDITOR')
      })
    })

    it('shows role descriptions', () => {
      render(
        <MockAuthProvider>
          <AuthForm mode="register" />
        </MockAuthProvider>
      )

      expect(screen.getByText('Can view content only')).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('shows loading state during login', async () => {
      const user = userEvent.setup()
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(
        <MockAuthProvider>
          <AuthForm mode="login" />
        </MockAuthProvider>
      )

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('shows loading state during registration', async () => {
      const user = userEvent.setup()
      mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(
        <MockAuthProvider>
          <AuthForm mode="register" />
        </MockAuthProvider>
      )

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      expect(screen.getByText(/creating account/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })
})
