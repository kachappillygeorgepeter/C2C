import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Briefcase, FileText, CheckCircle, Clock, ArrowRight } from 'lucide-react'

export const StudentDashboard: React.FC = () => {
  const { data: profile } = useQuery({
    queryKey: ['student-profile'],
    queryFn: async () => {
      const res = await api.get('/students/profile')
      return res.data.data
    }
  })

  const { data: applications } = useQuery({
    queryKey: ['student-applications'],
    queryFn: async () => {
      const res = await api.get('/students/applications')
      return res.data.data
    }
  })

  const { data: opportunities } = useQuery({
    queryKey: ['student-opportunities'],
    queryFn: async () => {
      const res = await api.get('/students/opportunities')
      return res.data.data
    }
  })

  const eligibleJobs = opportunities?.filter((j: any) => j.eligibilityResult?.eligible) || []

  return (
    <div className="space-y-8">
      {/* Welcome & Profile Ring Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-semibold px-3 py-1 bg-white/20 rounded-full text-indigo-100 uppercase tracking-wider">
            Student Portal
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {profile?.fullName || 'Student'}!
          </h1>
          <p className="text-indigo-200 text-sm max-w-xl">
            Track your ongoing recruitment drives, view real-time eligibility status, and attend scheduled interviews.
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs text-indigo-200">
            <span>Roll No: <strong>{profile?.studentId || 'N/A'}</strong></span>
            <span>Branch: <strong>{profile?.branch || 'N/A'}</strong></span>
            <span>CGPA: <strong>{profile?.cgpa || 'N/A'}</strong></span>
          </div>
        </div>

        {/* Profile Completion Dial */}
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-center shrink-0 w-48">
          <p className="text-xs text-indigo-200 font-semibold mb-1">Profile Strength</p>
          <div className="text-3xl font-extrabold text-white">
            {profile?.completionPct || 0}%
          </div>
          <p className="text-[11px] text-indigo-200 mt-1">
            {profile?.profileComplete ? '✅ Eligibility Verified' : '⚠️ Complete to apply'}
          </p>
          <Link
            to="/student/profile"
            className="mt-3 block text-xs bg-white text-indigo-900 font-bold py-1.5 px-3 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Openings</p>
            <h3 className="text-2xl font-bold text-slate-900">{opportunities?.length || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">You're Eligible For</p>
            <h3 className="text-2xl font-bold text-emerald-600">{eligibleJobs.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Applied Jobs</p>
            <h3 className="text-2xl font-bold text-slate-900">{applications?.length || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Backlogs</p>
            <h3 className="text-2xl font-bold text-slate-900">{profile?.activeBacklogs || 0}</h3>
          </div>
        </div>
      </div>

      {/* Featured Opportunities Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Recommended Opportunities</h3>
            <p className="text-xs text-slate-500">Live positions matched to your academic record</p>
          </div>
          <Link
            to="/student/opportunities"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Explore All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities?.slice(0, 4).map((job: any) => (
            <div
              key={job.id}
              className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-white transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {job.title}
                  </h4>
                  <p className="text-xs text-slate-500">{job.company?.name} • {job.city || 'Remote'}</p>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    job.eligibilityResult?.eligible
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {job.eligibilityResult?.eligible ? 'Eligible' : 'Not Eligible'}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                <span>CTC: <strong>₹{(job.salaryMax / 100000).toFixed(1)} LPA</strong></span>
                <Link
                  to={`/student/opportunities/${job.id}`}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  View Details & Apply →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
