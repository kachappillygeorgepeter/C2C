import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { Role } from '../types'
import { ArrowRight, GraduationCap, Briefcase, ShieldCheck } from 'lucide-react'

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 px-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-600 mx-auto flex items-center justify-center text-white font-bold text-xl shadow-sm mb-4">
          C
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create Account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Campus Recruitment & Placement Network
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-8">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Role Selector Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'STUDENT'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Student
            </button>
            <button
              type="button"
              onClick={() => setRole('RECRUITER')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'RECRUITER'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" /> Recruiter
            </button>
            <button
              type="button"
              onClick={() => setRole('ADMIN')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'ADMIN'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Admin
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="name@campus.edu or company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="At least 8 characters"
              />
            </div>

            {/* Student specific fields */}
            {role === 'STUDENT' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Roll Number / ID
                    </label>
                    <input
                      type="text"
                      required
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="mt-1.5 w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm"
                      placeholder="21CS001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Branch / Dept
                    </label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="mt-1.5 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm"
                    >
                      <option value="CSE">Computer Science (CSE)</option>
                      <option value="IT">Information Tech (IT)</option>
                      <option value="ECE">Electronics (ECE)</option>
                      <option value="MECH">Mechanical (MECH)</option>
                      <option value="CIVIL">Civil Engineering</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      required
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(Number(e.target.value))}
                      className="mt-1.5 w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Current CGPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                      value={cgpa}
                      onChange={(e) => setCgpa(Number(e.target.value))}
                      className="mt-1.5 w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Recruiter specific fields */}
            {role === 'RECRUITER' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1.5 w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="mt-1.5 w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm"
                    placeholder="e.g. Senior Talent Lead"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 text-sm transition-all duration-150 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
