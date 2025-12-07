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
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ComponentChildren }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load stored auth state on mount
    loadAuthState()
  }, [])

  async function loadAuthState() {
    try {
      const state = await getStoredAuthState()
      setAuthState(state)
    } catch (error) {
      console.error('[Auth] Failed to load auth state:', error)
    } finally {
      setLoading(false)
    }
  }

  async function signIn() {
    setLoading(true)
    try {
      const state = await authSignIn()
      setAuthState(state)
    } catch (error) {
      console.error('[Auth] Sign in failed:', error)
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    setLoading(true)
    try {
      await authSignOut()
      setAuthState({ isAuthenticated: false, user: null, token: null })
    } catch (error) {
      console.error('[Auth] Sign out failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        loading,
        signIn,
        signOut,
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
