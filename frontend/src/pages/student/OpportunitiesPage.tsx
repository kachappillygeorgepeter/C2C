import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Search, MapPin, DollarSign, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'

export const OpportunitiesPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [filterEligibleOnly, setFilterEligibleOnly] = useState(false)

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['student-opportunities', search],
    queryFn: async () => {
      const res = await api.get('/students/opportunities', {
        params: { search: search || undefined }
      })
      return res.data.data
    }
  })

  const filteredJobs = opportunities?.filter((job: any) => {
    if (filterEligibleOnly && !job.eligibilityResult?.eligible) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Job & Internship Opportunities
          </h1>
          <p className="text-xs text-slate-500">
            Real-time server-verified eligibility calculations for every posting
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, skills, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={() => setFilterEligibleOnly(!filterEligibleOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              filterEligibleOnly
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {filterEligibleOnly ? '✓ Showing Eligible Only' : 'Show Eligible Only'}
          </button>
        </div>
      </div>

      {/* Grid of opportunities */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading verified openings...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs?.map((job: any) => {
            const isEligible = job.eligibilityResult?.eligible
            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm interactive-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                        {job.company?.name}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">{job.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.city || 'Remote'} ({job.workMode})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {job.salaryMax ? `₹${(job.salaryMax / 100000).toFixed(1)} LPA` : `Stipend: ₹${job.stipend}/mo`}
                        </span>
                      </div>
                    </div>

                    {/* Eligibility Badge */}
                    <div
                      className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 ${
                        isEligible
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isEligible ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Ineligible
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Criteria Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.eligibility?.minCgpa && (
                      <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                        Min CGPA: {job.eligibility.minCgpa}
                      </span>
                    )}
                    {job.eligibility?.maxBacklogs !== null && (
                      <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                        Max Backlogs: {job.eligibility.maxBacklogs}
                      </span>
                    )}
                    {job.eligibility?.allowedDepts?.map((dept: string) => (
                      <span key={dept} className="text-[11px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-medium border border-indigo-200/50">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/student/opportunities/${job.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 group-hover:translate-x-0.5 transition-transform"
                  >
                    View Evaluation & Apply <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
