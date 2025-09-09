import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import SigninPage from '../(auth)/signin/page'
import ChatPage from '../(app)/chat/page'
import { useAuthContext } from '@/context/auth-context'
import { useRouter } from 'next/navigation'

// Mock all the hooks and components
vi.mock('@/context/auth-context')
vi.mock('next/navigation')
vi.mock('@/firebase/auth/google-login', () => ({
  useGoogleLogin: () => ({
    googleLogin: vi.fn(),
    isPendingGoogleLogin: false,
  }),
}))
vi.mock('@/firebase/auth/email-password-login', () => ({
  useEmailPasswordLogin: () => ({
    emailPasswordLogin: vi.fn(),
    errorEmailPasswordLogin: null,
    isPendingEmailPasswordLogin: false,
  }),
}))
vi.mock('@/firebase/auth/email-password-registration', () => ({
  useEmailPasswordRegistration: () => ({
    errorEmailPasswordRegistration: null,
    isPendingEmailPasswordRegistration: false,
  }),
}))
vi.mock('@/firebase/auth/email-verification-link', () => ({
  useEmailVerification: () => ({
    isEmailVerificationSent: false,
    isEmailVerificationPending: false,
    errorVerificationLink: null,
    sendEmailVerificationLink: vi.fn(),
  }),
}))

// Mock the auth guard to return our test values
vi.mock('@/hooks/use-auth-guard')
import { useAuthGuard } from '@/hooks/use-auth-guard'

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <form>{children}</form>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render }: any) => render({ field: {} }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormMessage: () => <div />,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children }: any) => <label>{children}</label>,
}))

vi.mock('@/components/auth/email-verification', () => ({
  __esModule: true,
  default: () => <div data-testid="email-verification">Email Verification Required</div>,
}))

vi.mock('lucide-react', () => ({
  Shell: () => <div data-testid="shell-icon">Shell</div>,
}))

const mockUseAuthContext = vi.mocked(useAuthContext)
const mockUseRouter = vi.mocked(useRouter)
const mockUseAuthGuard = vi.mocked(useAuthGuard)

describe('Email Verification Security Integration Tests', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    })
  })

  describe('Complete User Journey - Unverified Email Security', () => {
    it('should prevent unverified users from accessing chat after signin', async () => {
      // Step 1: User signs in but is not verified
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'unverified@example.com',
          emailVerified: false, // Critical: NOT verified
        } as any,
        loading: false,
      })

      // Render signin page - should show unverified state
      const { unmount: unmountSignin } = render(<SigninPage />)
      
      expect(screen.getByText('Connected !')).toBeInTheDocument()
      expect(screen.getByText('unverified@example.com')).toBeInTheDocument()
      expect(screen.getByText('Your email is not verified.')).toBeInTheDocument()
      expect(screen.queryByText(/Redirecting to dashboard/)).not.toBeInTheDocument()

      unmountSignin()

      // Step 2: User tries to access chat page
      mockUseAuthGuard.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'unverified@example.com',
          emailVerified: false,
        } as any,
        loading: false,
        isAuthenticated: true,
        isEmailVerified: false, // Still not verified
      })

      render(<ChatPage />)

      // Should be blocked and shown verification screen
      expect(screen.getByTestId('email-verification')).toBeInTheDocument()
      expect(screen.queryByText('Hi')).not.toBeInTheDocument() // Chat content blocked
      expect(screen.queryByText(/Welcome back/)).not.toBeInTheDocument()
    })

    it('should allow verified users full access after email verification', async () => {
      // Step 1: User signs in and is verified
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'verified@example.com',
          emailVerified: true, // Properly verified
        } as any,
        loading: false,
      })

      // Render signin page - should redirect
      const { unmount: unmountSignin } = render(<SigninPage />)
      
      expect(screen.getByText('Connected !')).toBeInTheDocument()
      expect(screen.getByText('Your email is verified. Redirecting to dashboard...')).toBeInTheDocument()
      
      // Should attempt to redirect to chat
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/chat')
      })

      unmountSignin()

      // Step 2: User accesses chat page
      mockUseAuthGuard.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'verified@example.com',
          emailVerified: true,
        } as any,
        loading: false,
        isAuthenticated: true,
        isEmailVerified: true, // Verified user
      })

      render(<ChatPage />)

      // Should have full access to chat
      expect(screen.getByText('Hi')).toBeInTheDocument()
      expect(screen.getByText(/Welcome back/)).toBeInTheDocument()
      expect(screen.getByText('verified@example.com')).toBeInTheDocument()
      expect(screen.queryByTestId('email-verification')).not.toBeInTheDocument()
    })

    it('should handle user verification status change during session', async () => {
      // Start with unverified user on chat page
      mockUseAuthGuard.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'user@example.com',
          emailVerified: false,
        } as any,
        loading: false,
        isAuthenticated: true,
        isEmailVerified: false,
      })

      const { rerender } = render(<ChatPage />)

      // Should be blocked initially
      expect(screen.getByTestId('email-verification')).toBeInTheDocument()
      expect(screen.queryByText('Hi')).not.toBeInTheDocument()

      // Simulate user verifying email (e.g., clicking link in email)
      mockUseAuthGuard.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'user@example.com',
          emailVerified: true, // Now verified
        } as any,
        loading: false,
        isAuthenticated: true,
        isEmailVerified: true,
      })

      rerender(<ChatPage />)

      // Should now have access
      expect(screen.getByText('Hi')).toBeInTheDocument()
      expect(screen.queryByTestId('email-verification')).not.toBeInTheDocument()
    })
  })

  describe('Security Bypass Attempt Scenarios', () => {
    it('should block all bypass attempts for unverified users', async () => {
      // Scenario: Malicious user tries various ways to bypass verification
      const maliciousUser = {
        uid: 'malicious-uid',
        email: 'malicious@example.com',
        emailVerified: false, // Always unverified
      }

      // Attempt 1: Direct navigation to chat
      mockUseAuthGuard.mockReturnValue({
        user: maliciousUser as any,
        loading: false,
        isAuthenticated: true,
        isEmailVerified: false,
      })

      const { unmount: unmount1 } = render(<ChatPage />)
      expect(screen.getByTestId('email-verification')).toBeInTheDocument()
      expect(screen.queryByText('Hi')).not.toBeInTheDocument()
      unmount1()

      // Attempt 2: Try to manipulate loading state
      mockUseAuthGuard.mockReturnValue({
        user: maliciousUser as any,
        loading: true, // Loading state
        isAuthenticated: true,
        isEmailVerified: false,
      })

      const { unmount: unmount2 } = render(<ChatPage />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByText('Hi')).not.toBeInTheDocument()
      unmount2()

      // Attempt 3: Back to normal state, still blocked
      mockUseAuthGuard.mockReturnValue({
        user: maliciousUser as any,
        loading: false,
        isAuthenticated: true,
        isEmailVerified: false,
      })

      render(<ChatPage />)
      expect(screen.getByTestId('email-verification')).toBeInTheDocument()
      expect(screen.queryByText('Hi')).not.toBeInTheDocument()
    })

    it('should maintain security during rapid state changes', async () => {
      const { rerender } = render(<ChatPage />)

      // Rapid state changes that might occur during attacks or edge cases
      const stateSequence = [
        { loading: true, user: null, isAuthenticated: false, isEmailVerified: false },
        { loading: false, user: { emailVerified: false }, isAuthenticated: true, isEmailVerified: false },
        { loading: true, user: { emailVerified: false }, isAuthenticated: true, isEmailVerified: false },
        { loading: false, user: { emailVerified: false }, isAuthenticated: true, isEmailVerified: false },
      ]

      for (const state of stateSequence) {
        mockUseAuthGuard.mockReturnValue({
          user: state.user as any,
          loading: state.loading,
          isAuthenticated: state.isAuthenticated,
          isEmailVerified: state.isEmailVerified,
        })

        rerender(<ChatPage />)

        // Should never show chat content for unverified users
        if (!state.loading && state.user && !state.isEmailVerified) {
          expect(screen.getByTestId('email-verification')).toBeInTheDocument()
          expect(screen.queryByText('Hi')).not.toBeInTheDocument()
        }
      }
    })
  })

  describe('Proper User Flow Scenarios', () => {
    it('should handle complete registration to chat flow', async () => {
      // Step 1: New user (no user yet)
      mockUseAuthContext.mockReturnValue({
        user: null,
        loading: false,
      })

      const { unmount: unmountSignin1 } = render(<SigninPage />)
      expect(screen.getByText(/Welcome back/)).toBeInTheDocument()
      expect(screen.getByText(/Login to your GitRoll Chat account/)).toBeInTheDocument()
      unmountSignin1()

      // Step 2: User registers (now exists but unverified)
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'new-user',
          email: 'newuser@example.com',
          emailVerified: false,
        } as any,
        loading: false,
      })

      const { unmount: unmountSignin2 } = render(<SigninPage />)
      expect(screen.getByText('Your email is not verified.')).toBeInTheDocument()
      unmountSignin2()

      // Step 3: User tries to access chat (should be blocked)
      mockUseAuthGuard.mockReturnValue({
        user: {
          uid: 'new-user',
          email: 'newuser@example.com',
          emailVerified: false,
        } as any,
        loading: false,
        isAuthenticated: true,
        isEmailVerified: false,
      })

      const { unmount: unmountChat1 } = render(<ChatPage />)
      expect(screen.getByTestId('email-verification')).toBeInTheDocument()
      unmountChat1()

      // Step 4: User verifies email
      mockUseAuthGuard.mockReturnValue({
        user: {
          uid: 'new-user',
          email: 'newuser@example.com',
          emailVerified: true, // Finally verified
        } as any,
        loading: false,
        isAuthenticated: true,
        isEmailVerified: true,
      })

      render(<ChatPage />)
      expect(screen.getByText('Hi')).toBeInTheDocument()
      expect(screen.getByText(/Welcome back/)).toBeInTheDocument()
    })
  })
})
