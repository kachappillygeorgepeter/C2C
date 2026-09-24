import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { Lock, Mail, ArrowRight, Sparkles, GraduationCap, Briefcase, ShieldCheck } from 'lucide-react'

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-600 mx-auto flex items-center justify-center text-white font-bold text-xl shadow-sm mb-4">
          C
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          C2C Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Campus Placement & Recruitment System
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-8">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Email Address
              </label>
              <div className="mt-1.5 relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-150"
                  placeholder="name@campus.edu or company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <div className="mt-1.5 relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-150"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 text-sm transition-all duration-150 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-semibold">Quick Demo Accounts:</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => fillDemo('student')}
                className="py-2.5 px-2 bg-indigo-50/70 hover:bg-indigo-100/90 text-indigo-700 rounded-xl border border-indigo-200/80 text-center transition-all duration-150 active:scale-95 flex flex-col items-center gap-1 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('recruiter')}
                className="py-2.5 px-2 bg-blue-50/70 hover:bg-blue-100/90 text-blue-700 rounded-xl border border-blue-200/80 text-center transition-all duration-150 active:scale-95 flex flex-col items-center gap-1 cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Recruiter</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="py-2.5 px-2 bg-purple-50/70 hover:bg-purple-100/90 text-purple-700 rounded-xl border border-purple-200/80 text-center transition-all duration-150 active:scale-95 flex flex-col items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors duration-150"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

