import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/login', { email, password })
      const { user, accessToken } = res.data.data
      setAuth(user, accessToken)

      // Role-based redirection
      if (user.role === 'STUDENT') navigate('/student/dashboard')
      else if (user.role === 'RECRUITER') navigate('/recruiter/dashboard')
      else if (user.role === 'ADMIN') navigate('/admin/dashboard')
      else navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Quick fill helper for competition demo
  const fillDemo = (role: 'admin' | 'student' | 'recruiter') => {
    if (role === 'admin') {
      setEmail('admin@campus.edu')
      setPassword('Password123!')
    } else if (role === 'student') {
      setEmail('arjun.sharma@student.campus.edu')
      setPassword('Password123!')
    } else if (role === 'recruiter') {
      setEmail('recruiter@nexustech.io')
      setPassword('Password123!')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 mx-auto flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/30 mb-4">
          C
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Welcome to C2C
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Campus Placement & Enterprise Recruitment Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-6 shadow-2xl border border-slate-700/60 rounded-3xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <div className="mt-1.5 relative">
                <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="name@campus.edu or company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="mt-1.5 relative">
                <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Login Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-700/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Instant Demo Accounts:</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => fillDemo('student')}
                className="py-1.5 px-2 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600/60 text-center transition-colors"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => fillDemo('recruiter')}
                className="py-1.5 px-2 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600/60 text-center transition-colors"
              >
                💼 Recruiter
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="py-1.5 px-2 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600/60 text-center transition-colors"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
