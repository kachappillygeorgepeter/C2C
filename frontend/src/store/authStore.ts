import { create } from 'zustand'
import { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

const storedToken = localStorage.getItem('c2c_token')
const storedUser = localStorage.getItem('c2c_user')

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,

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
