import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { ArrowLeft, Calendar, Mail, FileText, CheckCircle2 } from 'lucide-react'

export const JobApplicationsPipelinePage: React.FC = () => {
  const { id: jobId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Interview modal state
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [interviewModalOpen, setInterviewModalOpen] = useState(false)
  const [roundName, setRoundName] = useState('Technical Round 1')
  const [scheduledAt, setScheduledAt] = useState('')
  const [meetingLink, setMeetingLink] = useState('')

  const { data: applications, isLoading } = useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: async () => {
      const res = await api.get(`/recruiters/jobs/${jobId}/applications`)
      return res.data.data
    }
  })

  const statusMutation = useMutation({
    mutationFn: async ({ appId, status, note }: { appId: string; status: string; note?: string }) => {
      await api.patch(`/recruiters/applications/${appId}/status`, { status, note })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] })
    }
  })

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/recruiters/applications/${selectedApp.id}/interview`, {
        roundName,
        scheduledAt,
        mode: 'ONLINE',
        meetingLink
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] })
      setInterviewModalOpen(false)
    }
  })

  if (isLoading) return <div className="text-center py-12 text-slate-400 text-sm">Loading applicants pipeline...</div>

  // Group applications into stages
  const stages = [
    { key: 'APPLIED', title: 'Applied', color: 'border-blue-400' },
    { key: 'SHORTLISTED', title: 'Shortlisted', color: 'border-indigo-400' },
    { key: 'INTERVIEW_SCHEDULED', title: 'Interview Scheduled', color: 'border-amber-400' },
    { key: 'SELECTED', title: 'Selected / Offered', color: 'border-emerald-400' },
    { key: 'REJECTED', title: 'Rejected', color: 'border-rose-400' }
  ]

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/recruiter/dashboard')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Candidate Recruitment Funnel</h1>
        <p className="text-xs text-slate-500">Visual pipeline board — drag or progress candidates across stages</p>
      </div>

      {/* Kanban Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageApps = applications?.filter((a: any) => a.status === stage.key) || []
          return (
            <div key={stage.key} className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/60 flex flex-col min-w-[240px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {stage.title}
                </span>
                <span className="text-xs font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                  {stageApps.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {stageApps.map((app: any) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{app.student?.fullName}</h4>
                        <p className="text-[11px] text-slate-400">{app.student?.branch} • CGPA: {app.student?.cgpa}</p>
                      </div>
                    </div>

                    {app.student?.skills && app.student.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {app.student.skills.slice(0, 3).map((s: any, idx: number) => (
                          <span key={idx} className="text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                            {s.skill.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Controls */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-xs">
                      {stage.key === 'APPLIED' && (
                        <button
                          onClick={() => statusMutation.mutate({ appId: app.id, status: 'SHORTLISTED' })}
                          className="w-full py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          Shortlist Candidate →
                        </button>
                      )}

                      {stage.key === 'SHORTLISTED' && (
                        <button
                          onClick={() => {
                            setSelectedApp(app)
                            setInterviewModalOpen(true)
                          }}
                          className="w-full py-1 bg-amber-50 text-amber-800 font-bold rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <Calendar className="w-3.5 h-3.5" /> Schedule Interview
                        </button>
                      )}

                      {stage.key === 'INTERVIEW_SCHEDULED' && (
                        <button
                          onClick={() => statusMutation.mutate({ appId: app.id, status: 'SELECTED' })}
                          className="w-full py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          Select & Offer Job ✓
                        </button>
                      )}

                      {stage.key !== 'REJECTED' && stage.key !== 'SELECTED' && (
                        <button
                          onClick={() => statusMutation.mutate({ appId: app.id, status: 'REJECTED' })}
                          className="w-full py-0.5 text-[11px] text-rose-500 hover:underline"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Schedule Interview Modal */}
      {interviewModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Schedule Interview Round</h3>
            <p className="text-xs text-slate-500">
              Candidate: <strong>{selectedApp.student?.fullName}</strong> ({selectedApp.student?.studentId})
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Round Name</label>
              <input
                type="text"
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Date & Time</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Video Meeting Link (Google Meet / Zoom)</label>
              <input
                type="url"
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setInterviewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={scheduleMutation.isPending || !scheduledAt}
                onClick={() => scheduleMutation.mutate()}
                className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-500 transition-all disabled:opacity-50"
              >
                {scheduleMutation.isPending ? 'Scheduling...' : 'Confirm Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
