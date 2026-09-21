import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Briefcase, Users, PlusCircle, Clock, Building2, CheckCircle2 } from 'lucide-react'

export const RecruiterDashboard: React.FC = () => {
  const { data: profile } = useQuery({
    queryKey: ['recruiter-profile'],
    queryFn: async () => {
      const res = await api.get('/recruiter/profile')
      return res.data.data
    }
  })

  const { data: jobs } = useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: async () => {
      const res = await api.get('/recruiter/jobs')
      return res.data.data
    }
  })

  const company = profile?.company
  const totalApplicants = jobs?.reduce((acc: number, j: any) => acc + (j._count?.applications || 0), 0) || 0

  return (
    <div className="space-y-8">
      {/* Recruiter Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold px-3 py-1 bg-white/20 rounded-full text-indigo-100 uppercase tracking-wider">
            Recruiter Workspace
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">
            {company?.name || 'Your Company Workspace'}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Logged in as {profile?.fullName} ({profile?.designation || 'Hiring Lead'})
          </p>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-slate-400">Institutional Approval Status:</span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                company?.status === 'APPROVED'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {company?.status || 'PENDING APPROVAL'}
            </span>
          </div>
        </div>

        <Link
          to="/recruiter/jobs/new"
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Post New Opening
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Your Active Postings</p>
            <h3 className="text-2xl font-bold text-slate-900">{jobs?.length || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Received Applicants</p>
            <h3 className="text-2xl font-bold text-emerald-600">{totalApplicants}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Headquarters</p>
            <h3 className="text-sm font-bold text-slate-900">{company?.headquarters || 'Bengaluru, India'}</h3>
          </div>
        </div>
      </div>

      {/* Job Postings List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Your Job Postings & Candidate Funnel</h3>

        {jobs?.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No job postings created yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {jobs?.map((job: any) => (
              <div key={job.id} className="py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{job.title}</h4>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {job.jobType}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        job.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Deadline: {new Date(job.deadline).toLocaleDateString()} • Openings: {job.openings}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{job._count?.applications || 0}</p>
                    <p className="text-[11px] text-slate-400">Applicants</p>
                  </div>
                  <Link
                    to={`/recruiter/jobs/${job.id}/applications`}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    View Pipeline Funnel →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
