import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { Role } from '../types'
import { ArrowRight } from 'lucide-react'

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<Role>('STUDENT')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [branch, setBranch] = useState('CSE')
  const [graduationYear, setGraduationYear] = useState(2025)
  const [cgpa, setCgpa] = useState<number>(8.5)
  const [companyName, setCompanyName] = useState('')
  const [designation, setDesignation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload: any = {
        email,
        password,
        role,
        fullName
      }

      if (role === 'STUDENT') {
        payload.studentId = studentId
        payload.branch = branch
        payload.graduationYear = Number(graduationYear)
        payload.cgpa = Number(cgpa)
      } else if (role === 'RECRUITER') {
        payload.companyName = companyName
        payload.designation = designation
      }

      const res = await api.post('/auth/register', payload)
      const { user, accessToken } = res.data.data
      setAuth(user, accessToken)

      if (user.role === 'STUDENT') navigate('/student/dashboard')
      else if (user.role === 'RECRUITER') navigate('/recruiter/dashboard')
      else navigate('/admin/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Create an Account</h2>
        <p className="mt-2 text-sm text-slate-400">Join the institutional placement & recruitment network</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-6 shadow-2xl border border-slate-700/60 rounded-3xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Role Selector Tabs */}
          <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-700/60 mb-6">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                role === 'STUDENT' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => setRole('RECRUITER')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                role === 'RECRUITER' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              💼 Recruiter
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm"
                placeholder="e.g. Rahul Verma"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm"
                placeholder="name@domain.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm"
                placeholder="At least 8 characters"
              />
            </div>

            {role === 'STUDENT' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Student ID</label>
                    <input
                      type="text"
                      required
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="mt-1 w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm"
                      placeholder="e.g. CS2021088"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Branch</label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="mt-1 w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm"
                    >
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="MECH">MECH</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={cgpa}
                      onChange={(e) => setCgpa(parseFloat(e.target.value))}
                      className="mt-1 w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Batch Year</label>
                    <input
                      type="number"
                      required
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(parseInt(e.target.value))}
                      className="mt-1 w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {role === 'RECRUITER' && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1 w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm"
                    placeholder="e.g. Acme Innovations"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="mt-1 w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm"
                    placeholder="e.g. Campus Talent Recruiter"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
