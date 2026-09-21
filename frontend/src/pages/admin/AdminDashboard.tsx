import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  Award,
  DollarSign
} from 'lucide-react'

export const AdminDashboard: React.FC = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin-dashboard-metrics'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard')
      return res.data.data
    }
  })

  if (isLoading) return <div className="text-center py-12 text-slate-400 text-sm">Loading analytics...</div>

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold px-3 py-1 bg-white/20 rounded-full text-indigo-100 uppercase tracking-wider">
            Placement Cell Administration
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">Institutional Analytics & Governance</h1>
          <p className="text-slate-300 text-sm mt-1">Real-time placement ratios, salary statistics, and approval queues</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-center shrink-0">
          <p className="text-xs text-indigo-200 font-semibold mb-1">Institution Placement Rate</p>
          <div className="text-4xl font-extrabold text-white">
            {metrics?.placementRate || 0}%
          </div>
          <p className="text-[11px] text-indigo-200 mt-1">
            {metrics?.placedStudents || 0} of {metrics?.totalStudents || 0} Placed
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Registered Students</p>
            <h3 className="text-2xl font-bold text-slate-900">{metrics?.totalStudents || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Partner Companies</p>
            <h3 className="text-2xl font-bold text-slate-900">{metrics?.totalCompanies || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Average Package (CTC)</p>
            <h3 className="text-xl font-bold text-emerald-600">
              ₹{((metrics?.avgSalary || 0) / 100000).toFixed(1)} LPA
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Highest Package (CTC)</p>
            <h3 className="text-xl font-bold text-purple-600">
              ₹{((metrics?.highestSalary || 0) / 100000).toFixed(1)} LPA
            </h3>
          </div>
        </div>
      </div>

      {/* Quick Action Queue Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Company Verification Queue</h3>
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold">Needs Review</span>
          </div>
          <p className="text-xs text-slate-500">Review onboarding partner recruiters and credential documentation before approving job listings.</p>
          <a
            href="/admin/companies"
            className="inline-block text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-2"
          >
            Review Companies →
          </a>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Job Openings Queue</h3>
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold">Needs Review</span>
          </div>
          <p className="text-xs text-slate-500">Ensure job listings comply with institute CGPA, branch, and eligibility compensation guidelines.</p>
          <a
            href="/admin/jobs"
            className="inline-block text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-2"
          >
            Review Jobs →
          </a>
        </div>
      </div>
    </div>
  )
}
