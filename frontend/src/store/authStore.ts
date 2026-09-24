import { create } from 'zustand'
import { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

let initialUser = null
try {
  const storedUser = localStorage.getItem('c2c_user')
  initialUser = storedUser ? JSON.parse(storedUser) : null
} catch (e) {
  localStorage.removeItem('c2c_user')
}

const storedToken = localStorage.getItem('c2c_token')

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  token: storedToken || null,
  isAuthenticated: !!storedToken && !!initialUser,

  setAuth: (user, token) => {
    localStorage.setItem('c2c_token', token)
    localStorage.setItem('c2c_user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('c2c_token')
    localStorage.removeItem('c2c_user')
    set({ user: null, token: null, isAuthenticated: false })
  }
}))
