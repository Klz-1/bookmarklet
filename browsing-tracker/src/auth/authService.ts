/**
 * Authentication service using chrome.identity API
 * Supports both getAuthToken (Chrome with signed-in user) and
 * launchWebAuthFlow (any Chromium browser)
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
// Web application client (for launchWebAuthFlow - works in all browsers)
const OAUTH_CLIENT_ID_WEB = '655545319264-psjagdc0o0cjkdksmrja4mbeoscm0oqs.apps.googleusercontent.com'
const OAUTH_SCOPES = ['openid', 'email', 'profile']

/**
 * Get OAuth token using chrome.identity.getAuthToken (requires browser sign-in)
 */
async function getAuthTokenDirect(interactive: boolean): Promise<string | null> {
  try {
    if (!chrome.identity?.getAuthToken) {
      return null
    }
    const token = await chrome.identity.getAuthToken({ interactive })
    return token?.token || null
  } catch (error) {
    // This method doesn't work if user isn't signed into browser
    return null
  }
}

/**
 * Get OAuth token using launchWebAuthFlow (works in any Chromium browser)
 */
async function getAuthTokenViaWebFlow(): Promise<string | null> {
  try {
    const redirectUrl = chrome.identity.getRedirectURL()

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', OAUTH_CLIENT_ID_WEB)
    authUrl.searchParams.set('redirect_uri', redirectUrl)
    authUrl.searchParams.set('response_type', 'token')
    authUrl.searchParams.set('scope', OAUTH_SCOPES.join(' '))
    authUrl.searchParams.set('prompt', 'consent')

    const responseUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl.toString(),
      interactive: true,
    })

    if (!responseUrl) {
      return null
    }

    // Parse token from URL fragment (e.g., #access_token=xxx&token_type=Bearer...)
    const hashParams = new URLSearchParams(responseUrl.split('#')[1])
    const token = hashParams.get('access_token')

    return token
  } catch (error) {
    console.error('[Auth] Web auth flow failed:', error)
    return null
  }
}

/**
 * Get OAuth token - tries direct method first, falls back to web flow
 */
export async function getAuthToken(interactive: boolean = true): Promise<string | null> {
  // First try the direct method (works if user is signed into browser)
  const directToken = await getAuthTokenDirect(interactive)
  if (directToken) {
    return directToken
  }

  // Fall back to web auth flow (opens popup, works everywhere)
  if (interactive) {
    return getAuthTokenViaWebFlow()
  }

  return null
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
    // Get stored token to revoke
    const result = await chrome.storage.local.get(AUTH_STORAGE_KEY)
    const storedState = result[AUTH_STORAGE_KEY] as AuthState | undefined

    if (storedState?.token) {
      // Try to remove cached token (may not work for web flow tokens)
      try {
        await chrome.identity.removeCachedAuthToken({ token: storedState.token })
      } catch {
        // Ignore - token may have been obtained via web flow
      }

      // Revoke on Google's side
      await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${storedState.token}`)
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
  try {
    const result = await chrome.storage.local.get(AUTH_STORAGE_KEY)

    if (result[AUTH_STORAGE_KEY]) {
      const storedState = result[AUTH_STORAGE_KEY] as AuthState

      if (storedState.token) {
        // Verify token is still valid
        const user = await fetchUserInfo(storedState.token)

        if (user) {
          return storedState
        }
      }
    }
  } catch (error) {
    // Silently fail - user just won't be logged in
  }

  return { isAuthenticated: false, user: null, token: null }
}

/**
 * Refresh token if needed
 */
export async function refreshToken(): Promise<string | null> {
  // For web flow tokens, we need to re-authenticate
  // Try direct token refresh first
  const oldToken = await getAuthTokenDirect(false)
  if (oldToken) {
    try {
      await chrome.identity.removeCachedAuthToken({ token: oldToken })
    } catch {
      // Ignore
    }
  }

  // Get fresh token (non-interactive won't work for web flow)
  return getAuthTokenDirect(false)
}
