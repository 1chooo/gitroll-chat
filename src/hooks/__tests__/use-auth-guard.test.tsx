import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useAuthGuard } from '../use-auth-guard'
import { useAuthContext } from '@/context/auth-context'
import { useRouter } from 'next/navigation'

// Mock the dependencies
vi.mock('@/context/auth-context')
vi.mock('next/navigation')

const mockUseAuthContext = vi.mocked(useAuthContext)
const mockUseRouter = vi.mocked(useRouter)

describe('useAuthGuard', () => {
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

  describe('Email Verification Security Tests', () => {
    it('should redirect unverified users when requireEmailVerification is true', () => {
      // Simulate a user that exists but is not email verified
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: false, // Critical: user is NOT verified
        } as any,
        loading: false,
      })

      const { result } = renderHook(() => useAuthGuard('/signin', true))

      expect(mockPush).toHaveBeenCalledWith('/signup')
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isEmailVerified).toBe(false)
    })

    it('should allow verified users when requireEmailVerification is true', () => {
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: true, // User is properly verified
        } as any,
        loading: false,
      })

      const { result } = renderHook(() => useAuthGuard('/signin', true))

      expect(mockPush).not.toHaveBeenCalled()
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isEmailVerified).toBe(true)
    })

    it('should redirect null users to signin when requireEmailVerification is true', () => {
      mockUseAuthContext.mockReturnValue({
        user: null, // No user at all
        loading: false,
      })

      const { result } = renderHook(() => useAuthGuard('/signin', true))

      expect(mockPush).toHaveBeenCalledWith('/signin')
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isEmailVerified).toBe(false)
    })

    it('should handle custom redirect path for unverified users', () => {
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: false,
        } as any,
        loading: false,
      })

      renderHook(() => useAuthGuard('/custom-signin', true))

      // Even with custom signin path, unverified users go to /signup for verification
      expect(mockPush).toHaveBeenCalledWith('/signup')
    })

    it('should not redirect when loading is true', () => {
      mockUseAuthContext.mockReturnValue({
        user: null,
        loading: true, // Still loading
      })

      renderHook(() => useAuthGuard('/signin', true))

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Basic Authentication Tests', () => {
    it('should allow unverified users when requireEmailVerification is false', () => {
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: false,
        } as any,
        loading: false,
      })

      const { result } = renderHook(() => useAuthGuard('/signin', false))

      expect(mockPush).not.toHaveBeenCalled()
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isEmailVerified).toBe(false)
    })

    it('should use default redirect path when not specified', () => {
      mockUseAuthContext.mockReturnValue({
        user: null,
        loading: false,
      })

      renderHook(() => useAuthGuard()) // No params, should use defaults

      expect(mockPush).toHaveBeenCalledWith('/signin')
    })

    it('should handle user state changes dynamically', () => {
      // Start with no user
      mockUseAuthContext.mockReturnValue({
        user: null,
        loading: false,
      })

      const { rerender } = renderHook(() => useAuthGuard('/signin', true))
      expect(mockPush).toHaveBeenCalledWith('/signin')

      // User logs in but is unverified
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: false,
        } as any,
        loading: false,
      })

      rerender()
      expect(mockPush).toHaveBeenCalledWith('/signup')

      // User verifies email
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: true,
        } as any,
        loading: false,
      })

      const callCount = mockPush.mock.calls.length
      rerender()
      // No additional calls should be made for verified user
      expect(mockPush).toHaveBeenCalledTimes(callCount)
    })
  })

  describe('Edge Cases and Security Scenarios', () => {
    it('should handle user with undefined emailVerified property', () => {
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          // emailVerified is undefined
        } as any,
        loading: false,
      })

      const { result } = renderHook(() => useAuthGuard('/signin', true))

      expect(mockPush).toHaveBeenCalledWith('/signup')
      expect(result.current.isEmailVerified).toBe(false)
    })

    it('should handle malformed user object gracefully', () => {
      mockUseAuthContext.mockReturnValue({
        user: {} as any, // Empty user object
        loading: false,
      })

      const { result } = renderHook(() => useAuthGuard('/signin', true))

      expect(mockPush).toHaveBeenCalledWith('/signup')
      expect(result.current.isAuthenticated).toBe(true) // User exists but is empty
      expect(result.current.isEmailVerified).toBe(false)
    })

    it('should prioritize email verification over user existence', () => {
      // This test ensures that even if user exists, 
      // email verification is still checked when required
      mockUseAuthContext.mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: false,
        } as any,
        loading: false,
      })

      renderHook(() => useAuthGuard('/signin', true))

      // Should redirect to verification, not just allow access
      expect(mockPush).toHaveBeenCalledWith('/signup')
      expect(mockPush).not.toHaveBeenCalledWith('/chat')
    })
  })
})
