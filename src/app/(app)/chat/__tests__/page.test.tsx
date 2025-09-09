import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import DashboardPage from '../page'
import { useAuthGuard } from '@/hooks/use-auth-guard'

// Mock the useAuthGuard hook
vi.mock('@/hooks/use-auth-guard')
const mockUseAuthGuard = vi.mocked(useAuthGuard)

// Mock the EmailVerification component
vi.mock('@/components/auth/email-verification', () => ({
  __esModule: true,
  default: () => <div data-testid="email-verification">Email Verification Required</div>
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('Chat Page - Email Verification Security', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unverified Email User Security Tests', () => {
    it('should block unverified users and show email verification screen', async () => {
      // Simulate unverified user
      mockUseAuthGuard.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'unverified@example.com',
          emailVerified: false,
        } as any,
        loading: false,
        isAuthenticated: true,
        isEmailVerified: false, // Critical: user is NOT verified
      })

      render(<DashboardPage />)

      // Should show email verification component instead of chat
      expect(screen.getByTestId('email-verification')).toBeInTheDocument()
      expect(screen.queryByText('Hi')).not.toBeInTheDocument() // Chat content should not be visible
      expect(screen.queryByText(/Welcome back/)).not.toBeInTheDocument()
    })

    it('should allow verified users to access chat', async () => {
      // Simulate verified user
      mockUseAuthGuard.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'verified@example.com',
          emailVerified: true,
        } as any,
        loading: false,
        isAuthenticated: true,
        isEmailVerified: true, // User is properly verified
      })

      render(<DashboardPage />)

      // Should show chat content for verified users
      await waitFor(() => {
        expect(screen.getByText('Hi')).toBeInTheDocument()
        expect(screen.getByText(/Welcome back/)).toBeInTheDocument()
        expect(screen.getByText('verified@example.com')).toBeInTheDocument()
      })

      // Should NOT show email verification screen
      expect(screen.queryByTestId('email-verification')).not.toBeInTheDocument()
    })

    it('should show loading state while authentication is in progress', () => {
      // Simulate loading state
      mockUseAuthGuard.mockReturnValue({
        user: null,
        loading: true, // Still loading
        isAuthenticated: false,
        isEmailVerified: false,
      })

      render(<DashboardPage />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByTestId('email-verification')).not.toBeInTheDocument()
      expect(screen.queryByText('Hi')).not.toBeInTheDocument()
    })

    it('should handle user without email gracefully in verification screen', () => {
      // Simulate user without email (edge case)
      mockUseAuthGuard.mockReturnValue({
        user: {
          uid: 'test-uid',
          // No email property
          emailVerified: false,
        } as any,
        loading: false,
        isAuthenticated: true,
        isEmailVerified: false,
      })

      render(<DashboardPage />)

      expect(screen.getByTestId('email-verification')).toBeInTheDocument()
      expect(screen.queryByText('Hi')).not.toBeInTheDocument()
    })
  })

  describe('Authentication Flow Tests', () => {
    it('should show signin link for unauthenticated users', () => {
      // Simulate unauthenticated user (redirected by auth guard)
      mockUseAuthGuard.mockReturnValue({
        user: null,
        loading: false,
        isAuthenticated: false,
        isEmailVerified: false,
      })

      render(<DashboardPage />)

      const signinLink = screen.getByRole('link', { name: /sign in/i })
      expect(signinLink).toBeInTheDocument()
      expect(signinLink).toHaveAttribute('href', '/signin')
      expect(screen.queryByText(/Welcome back/)).not.toBeInTheDocument()
    })

    it('should pass correct parameters to useAuthGuard', () => {
      mockUseAuthGuard.mockReturnValue({
        user: null,
        loading: false,
        isAuthenticated: false,
        isEmailVerified: false,
      })

      render(<DashboardPage />)

      // Verify that useAuthGuard is called with email verification required
      expect(mockUseAuthGuard).toHaveBeenCalledWith('/signin', true)
    })
  })

  describe('Security Edge Cases', () => {
    it('should prioritize email verification over user existence', () => {
      // Test case where user exists but email verification is the blocking factor
      mockUseAuthGuard.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: false,
        } as any,
        loading: false,
        isAuthenticated: true, // User IS authenticated
        isEmailVerified: false, // But NOT email verified
      })

      render(<DashboardPage />)

      // Should block access and show verification screen
      expect(screen.getByTestId('email-verification')).toBeInTheDocument()
      expect(screen.queryByText('Hi')).not.toBeInTheDocument()
      expect(screen.queryByText(/Welcome back/)).not.toBeInTheDocument()
    })

    it('should handle malformed user object during verification check', () => {
      mockUseAuthGuard.mockReturnValue({
        user: {} as any, // Empty user object
        loading: false,
        isAuthenticated: true,
        isEmailVerified: false,
      })

      render(<DashboardPage />)

      // Should still show verification screen for safety
      expect(screen.getByTestId('email-verification')).toBeInTheDocument()
      expect(screen.queryByText('Hi')).not.toBeInTheDocument()
    })

    it('should prevent direct navigation bypass attempts', () => {
      // Simulate scenario where someone tries to bypass verification
      // by directly navigating to /chat
      mockUseAuthGuard.mockReturnValue({
        user: {
          uid: 'malicious-user',
          email: 'malicious@example.com',
          emailVerified: false,
        } as any,
        loading: false,
        isAuthenticated: true,
        isEmailVerified: false,
      })

      render(<DashboardPage />)

      // Even with direct navigation, should be blocked
      expect(screen.getByTestId('email-verification')).toBeInTheDocument()
      expect(screen.queryByText('Hi')).not.toBeInTheDocument()
    })
  })

  describe('User Experience Tests', () => {
    it('should show proper welcome message for verified users', () => {
      mockUseAuthGuard.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'john.doe@example.com',
          emailVerified: true,
        } as any,
        loading: false,
        isAuthenticated: true,
        isEmailVerified: true,
      })

      render(<DashboardPage />)

      expect(screen.getByText(/Welcome back/)).toBeInTheDocument()
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
      expect(screen.getByText('Hi')).toBeInTheDocument()
    })

    it('should maintain security during state transitions', () => {
      // Start with loading state
      const { rerender } = render(<DashboardPage />)
      
      mockUseAuthGuard.mockReturnValue({
        user: null,
        loading: true,
        isAuthenticated: false,
        isEmailVerified: false,
      })
      
      rerender(<DashboardPage />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()

      // Transition to unverified user
      mockUseAuthGuard.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: false,
        } as any,
        loading: false,
        isAuthenticated: true,
        isEmailVerified: false,
      })

      rerender(<DashboardPage />)
      expect(screen.getByTestId('email-verification')).toBeInTheDocument()
      expect(screen.queryByText('Hi')).not.toBeInTheDocument()

      // Transition to verified user
      mockUseAuthGuard.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: true,
        } as any,
        loading: false,
        isAuthenticated: true,
        isEmailVerified: true,
      })

      rerender(<DashboardPage />)
      expect(screen.getByText('Hi')).toBeInTheDocument()
      expect(screen.queryByTestId('email-verification')).not.toBeInTheDocument()
    })
  })
})
