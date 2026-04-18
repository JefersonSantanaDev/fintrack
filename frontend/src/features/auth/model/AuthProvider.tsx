import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import {
  getSessionUser,
  loginWithEmailAndPassword,
  logoutSession,
  resendSignUpCode,
  startSignUpWithEmailAndPassword,
  verifySignUpWithCode,
  type AuthUser,
  type LoginInput,
  type SignUpChallenge,
  type SignUpInput,
  type SignUpVerifyInput,
} from '@/features/auth/services/auth.service'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isInitializing: boolean
  isSubmitting: boolean
  isPostLoginLoading: boolean
  finishPostLoginLoading: () => void
  login: (input: LoginInput) => Promise<void>
  startSignUp: (input: SignUpInput) => Promise<SignUpChallenge>
  verifySignUp: (input: SignUpVerifyInput) => Promise<void>
  resendSignUpCode: (email: string) => Promise<SignUpChallenge>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPostLoginLoading, setIsPostLoginLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      try {
        const sessionUser = await getSessionUser()
        if (mounted) {
          setUser(sessionUser)
        }
      } finally {
        if (mounted) {
          setIsInitializing(false)
        }
      }
    }

    loadSession()

    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    setIsSubmitting(true)
    setIsPostLoginLoading(false)

    try {
      const loggedUser = await loginWithEmailAndPassword(input)
      setUser(loggedUser)
      setIsPostLoginLoading(true)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const startSignUp = useCallback(async (input: SignUpInput) => {
    setIsSubmitting(true)

    try {
      return await startSignUpWithEmailAndPassword(input)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const verifySignUp = useCallback(async (input: SignUpVerifyInput) => {
    setIsSubmitting(true)
    setIsPostLoginLoading(false)

    try {
      const createdUser = await verifySignUpWithCode(input)
      setUser(createdUser)
      setIsPostLoginLoading(true)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handleResendSignUpCode = useCallback(async (email: string) => {
    setIsSubmitting(true)

    try {
      return await resendSignUpCode(email)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsSubmitting(true)

    try {
      await logoutSession()
      setUser(null)
      setIsPostLoginLoading(false)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const finishPostLoginLoading = useCallback(() => {
    setIsPostLoginLoading(false)
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      isSubmitting,
      isPostLoginLoading,
      finishPostLoginLoading,
      login,
      startSignUp,
      verifySignUp,
      resendSignUpCode: handleResendSignUpCode,
      logout,
    }
  }, [
    user,
    isInitializing,
    isSubmitting,
    isPostLoginLoading,
    finishPostLoginLoading,
    login,
    startSignUp,
    verifySignUp,
    handleResendSignUpCode,
    logout,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.')
  }

  return context
}
