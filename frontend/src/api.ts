// ============================================================================
// C2C Frontend API Service Client & Storage
// Supports real backend integration with automatic fallback to local memory state
// ============================================================================

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface UserSession {
  id: string
  email: string
  role: 'STUDENT' | 'RECRUITER' | 'ADMIN'
  name: string
  token?: string
}

// Storage helpers
export const tokenStorage = {
  get: (): string | null => localStorage.getItem('c2c_token'),
  set: (token: string) => localStorage.setItem('c2c_token', token),
  remove: () => localStorage.removeItem('c2c_token'),
  getUser: (): UserSession | null => {
    const raw = localStorage.getItem('c2c_user')
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },
  setUser: (user: UserSession) => localStorage.setItem('c2c_user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('c2c_user')
}

// Universal fetch wrapper with timeout and JWT injection
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const token = tokenStorage.get()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 4000)

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    const json = await res.json().catch(() => null)
    if (!res.ok) {
      return {
        success: false,
        error: json?.error?.message || json?.message || `HTTP ${res.status}: ${res.statusText}`
      }
    }

    return {
      success: true,
      data: json?.data !== undefined ? json.data : (json as T)
    }
  } catch (err: any) {
    clearTimeout(timeoutId)
    return {
      success: false,
      error: err.name === 'AbortError' ? 'Network request timed out' : (err.message || 'Network error')
    }
  }
}
