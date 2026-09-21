import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add Bearer token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('c2c_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-handle 401 redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('c2c_token')
      localStorage.removeItem('c2c_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
