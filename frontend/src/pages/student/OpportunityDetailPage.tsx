import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { EligibilityPanel } from '../../components/ui/EligibilityPanel'
import { Building2, MapPin, DollarSign, Calendar, ArrowLeft, Send } from 'lucide-react'

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [coverLetter, setCoverLetter] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const { data: job, isLoading } = useQuery({
    queryKey: ['opportunity-detail', id],
    queryFn: async () => {
      const res = await api.get(`/students/opportunities/${id}`)
      return res.data.data
    }
  })

  const applyMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/students/opportunities/${id}/apply`, { coverLetter })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunity-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['student-applications'] })
      setSubmitSuccess(true)
      setIsApplying(false)
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to submit application.')
    }
  })

  if (isLoading) return <div className="text-center py-12 text-slate-400 text-sm">Loading opening details...</div>
  if (!job) return <div className="text-center py-12 text-slate-500">Opening not found.</div>

  const isEligible = job.eligibilityResult?.eligible

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Opportunities
      </button>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
              <Building2 className="w-4 h-4" /> {job.company?.name}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.city || 'Anywhere'} ({job.workMode})</span>
              <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {job.salaryMax ? `₹${(job.salaryMax / 100000).toFixed(1)} LPA` : `Stipend: ₹${job.stipend}/mo`}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
            </div>
          </div>

          <div>
            {submitSuccess ? (
              <div className="px-5 py-2.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200 text-xs">
                ✓ Application Submitted
              </div>
            ) : (
              <button
                disabled={!isEligible}
                onClick={() => setIsApplying(true)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-sm shadow-md transition-all"
              >
                {isEligible ? 'Apply Now' : 'Not Eligible'}
              </button>
            )}
          </div>
        </div>

        {/* Server-Side Eligibility Breakdown */}
        <EligibilityPanel eligibility={job.eligibilityResult} />
      </div>

      {/* Job Description & Specs */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">About the Role</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        {job.responsibilities && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Key Responsibilities</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
          </div>
        )}
      </div>

      {/* Application Modal */}
      {isApplying && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Confirm Your Application</h3>
            <p className="text-xs text-slate-500">
              Applying for <strong>{job.title}</strong> at {job.company?.name}. Your institutional profile data will be submitted.
            </p>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Statement of Interest / Cover Letter (Optional)
              </label>
              <textarea
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Share relevant projects, accomplishments or why you are a fit..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsApplying(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={applyMutation.isPending}
                onClick={() => applyMutation.mutate()}
                className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-indigo-500 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {applyMutation.isPending ? 'Submitting...' : 'Confirm & Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
