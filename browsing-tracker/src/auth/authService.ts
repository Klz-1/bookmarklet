/**
 * Authentication service using chrome.identity API
 */

export interface UserInfo {
  id: string
  email: string
  name: string
  picture?: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: UserInfo | null
  token: string | null
}

const AUTH_STORAGE_KEY = 'authState'

/**
 * Get OAuth token using chrome.identity
 */
export async function getAuthToken(interactive: boolean = true): Promise<string | null> {
  try {
    const token = await chrome.identity.getAuthToken({ interactive })
    return token?.token || null
  } catch (error) {
    console.error('[Auth] Failed to get token:', error)
    return null
  }
}

/**
 * Fetch user info from Google API
 */
export async function fetchUserInfo(token: string): Promise<UserInfo | null> {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.status}`)
    }

    const data = await response.json()
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
    }
  } catch (error) {
    console.error('[Auth] Failed to fetch user info:', error)
    return null
  }
}

/**
 * Sign in with Google
 */
export async function signIn(): Promise<AuthState> {
  const token = await getAuthToken(true)

  if (!token) {
    return { isAuthenticated: false, user: null, token: null }
  }

  const user = await fetchUserInfo(token)

  if (!user) {
    return { isAuthenticated: false, user: null, token: null }
  }

  const authState: AuthState = {
    isAuthenticated: true,
    user,
    token,
  }

  // Persist auth state
  await chrome.storage.local.set({ [AUTH_STORAGE_KEY]: authState })

  return authState
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  try {
    // Get current token to revoke
    const token = await getAuthToken(false)

    if (token) {
      // Revoke the token
      await chrome.identity.removeCachedAuthToken({ token })

      // Also revoke on Google's side
      await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
    }
  } catch (error) {
    console.error('[Auth] Error during sign out:', error)
  }

  // Clear stored auth state
  await chrome.storage.local.remove(AUTH_STORAGE_KEY)
}

/**
 * Get stored auth state
 */
export async function getStoredAuthState(): Promise<AuthState> {
  const result = await chrome.storage.local.get(AUTH_STORAGE_KEY)

  if (result[AUTH_STORAGE_KEY]) {
    // Verify token is still valid
    const storedState = result[AUTH_STORAGE_KEY] as AuthState

    if (storedState.token) {
      const user = await fetchUserInfo(storedState.token)

      if (user) {
        return storedState
      }
    }
  }

  return { isAuthenticated: false, user: null, token: null }
}

/**
 * Refresh token if needed
 */
export async function refreshToken(): Promise<string | null> {
  // Remove cached token first
  const oldToken = await getAuthToken(false)
  if (oldToken) {
    await chrome.identity.removeCachedAuthToken({ token: oldToken })
  }

  // Get fresh token (non-interactive)
  return getAuthToken(false)
}
