import { createContext } from 'preact'
import { useState, useEffect, useContext } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import {
  type AuthState,
  type UserInfo,
  signIn as authSignIn,
  signOut as authSignOut,
  getStoredAuthState
} from './authService'

interface AuthContextValue {
  isAuthenticated: boolean
  user: UserInfo | null
  loading: boolean
  error: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ComponentChildren }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadAuthState() {
      try {
        const state = await getStoredAuthState()
        if (isMounted) setAuthState(state)
      } catch (err) {
        console.error('[Auth] Failed to load auth state:', err)
        if (isMounted) setError('Failed to load authentication state')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadAuthState()
    return () => { isMounted = false }
  }, [])

  async function signIn() {
    setLoading(true)
    setError(null)
    try {
      const state = await authSignIn()
      setAuthState(state)
      if (!state.isAuthenticated) {
        setError('Sign in was cancelled or failed')
      }
    } catch (err) {
      console.error('[Auth] Sign in failed:', err)
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    setLoading(true)
    setError(null)
    try {
      await authSignOut()
      setAuthState({ isAuthenticated: false, user: null, token: null })
    } catch (err) {
      console.error('[Auth] Sign out failed:', err)
      setError(err instanceof Error ? err.message : 'Sign out failed')
    } finally {
      setLoading(false)
    }
  }

  function clearError() {
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        loading,
        error,
        signIn,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
