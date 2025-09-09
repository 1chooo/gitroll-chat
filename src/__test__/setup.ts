import { beforeEach, vi } from 'vitest'
import '@testing-library/jest-dom'
import React from 'react'

// Mock Firebase
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: vi.fn(),
}

const mockFirebaseApp = {}

vi.mock('@/firebase/config', () => ({
  default: mockFirebaseApp,
  auth: mockAuth,
  app: mockFirebaseApp,
}))

// Mock Firebase Auth functions
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendEmailVerification: vi.fn(),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
  __esModule: true,
  default: vi.fn(({ children, href, ...props }) => 
    React.createElement('a', { href, ...props }, children)
  ),
}))

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})
