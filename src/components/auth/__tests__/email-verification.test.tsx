import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import EmailVerification from '../email-verification'
import { useAuthContext } from '@/context/auth-context'
import { useEmailVerification } from '@/firebase/auth/email-verification-link'

// Mock the dependencies
vi.mock('@/context/auth-context')
vi.mock('@/firebase/auth/email-verification-link')

const mockUseAuthContext = vi.mocked(useAuthContext)
const mockUseEmailVerification = vi.mocked(useEmailVerification)

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

// Mock Shell icon
vi.mock('lucide-react', () => ({
  Shell: () => <div data-testid="loading-spinner">Loading</div>,
}))

describe('EmailVerification Component - Security Tests', () => {
  const mockSendEmailVerificationLink = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseEmailVerification.mockReturnValue({
      isEmailVerificationSent: false,
      isEmailVerificationPending: false,
      errorVerificationLink: null,
      sendEmailVerificationLink: mockSendEmailVerificationLink,
    })
  })

  describe('Unverified User Handling', () => {
    it('should display email verification screen for unverified users', () => {
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'unverified@example.com',
          emailVerified: false,
        } as any,
        loading: false,
      })

      render(<EmailVerification />)

      expect(screen.getByText('Email Verification Required')).toBeInTheDocument()
      expect(screen.getByText('unverified@example.com')).toBeInTheDocument()
      expect(screen.getByText('Your email is not verified.')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle send verification email for unverified users', async () => {
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: false,
        } as any,
        loading: false,
      })

      render(<EmailVerification />)

      const sendButton = screen.getByRole('button')
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(mockSendEmailVerificationLink).toHaveBeenCalledTimes(1)
      })
    })

    it('should show loading state when sending verification email', () => {
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: false,
        } as any,
        loading: false,
      })

      mockUseEmailVerification.mockReturnValue({
        isEmailVerificationSent: false,
        isEmailVerificationPending: true, // Currently sending
        errorVerificationLink: null,
        sendEmailVerificationLink: mockSendEmailVerificationLink,
      })

      render(<EmailVerification />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should show success message when verification email is sent', () => {
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: false,
        } as any,
        loading: false,
      })

      mockUseEmailVerification.mockReturnValue({
        isEmailVerificationSent: true, // Email was sent
        isEmailVerificationPending: false,
        errorVerificationLink: null,
        sendEmailVerificationLink: mockSendEmailVerificationLink,
      })

      render(<EmailVerification />)

      expect(screen.getByText(/The email was successfully sent/)).toBeInTheDocument()
      expect(screen.getByText(/check your email box to confirm/)).toBeInTheDocument()
    })

    it('should show error message when verification fails', () => {
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: false,
        } as any,
        loading: false,
      })

      const errorMessage = 'Failed to send verification email'
      mockUseEmailVerification.mockReturnValue({
        isEmailVerificationSent: false,
        isEmailVerificationPending: false,
        errorVerificationLink: errorMessage,
        sendEmailVerificationLink: mockSendEmailVerificationLink,
      })

      render(<EmailVerification />)

      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  describe('Security and Edge Cases', () => {
    it('should return null for users that do not exist', () => {
      mockUseAuthContext.mockReturnValue({
        user: null, // No user
        loading: false,
      })

      const { container } = render(<EmailVerification />)

      expect(container.firstChild).toBeNull()
    })

    it('should handle user with missing email gracefully', () => {
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          // email is undefined
          emailVerified: false,
        } as any,
        loading: false,
      })

      render(<EmailVerification />)

      expect(screen.getByText('Email Verification Required')).toBeInTheDocument()
      expect(screen.getByText('Your email is not verified.')).toBeInTheDocument()
      // Should still show verification UI even without email
    })

    it('should disable button during pending login/registration operations', () => {
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: false,
        } as any,
        loading: false,
      })

      render(<EmailVerification isPendingLogin={true} />)

      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should disable button during pending registration operations', () => {
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: false,
        } as any,
        loading: false,
      })

      render(<EmailVerification isPendingRegistration={true} />)

      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should handle async verification errors gracefully', async () => {
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: false,
        } as any,
        loading: false,
      })

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Network error')
      mockSendEmailVerificationLink.mockRejectedValue(error)

      render(<EmailVerification />)

      const sendButton = screen.getByRole('button')
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(error)
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Component Props and State Management', () => {
    it('should handle default prop values correctly', () => {
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: false,
        } as any,
        loading: false,
      })

      render(<EmailVerification />)

      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled() // Should not be disabled by default
    })

    it('should respect all prop combinations for disabled state', () => {
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: false,
        } as any,
        loading: false,
      })

      mockUseEmailVerification.mockReturnValue({
        isEmailVerificationSent: false,
        isEmailVerificationPending: true, // Verification pending
        errorVerificationLink: null,
        sendEmailVerificationLink: mockSendEmailVerificationLink,
      })

      render(<EmailVerification isPendingLogin={true} isPendingRegistration={true} />)

      // Should be disabled due to multiple pending states
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('User Experience and Accessibility', () => {
    it('should display user email in a prominent way', () => {
      const testEmail = 'user@example.com'
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: testEmail,
          emailVerified: false,
        } as any,
        loading: false,
      })

      render(<EmailVerification />)

      const emailElement = screen.getByText(testEmail)
      expect(emailElement).toBeInTheDocument()
      expect(emailElement.closest('b')).toBeInTheDocument() // Should be bold
    })

    it('should have proper heading hierarchy', () => {
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: false,
        } as any,
        loading: false,
      })

      render(<EmailVerification />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Email Verification Required')
    })

    it('should provide clear call-to-action', () => {
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: false,
        } as any,
        loading: false,
      })

      render(<EmailVerification />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // Button should have clear text (from the component)
    })
  })
})
