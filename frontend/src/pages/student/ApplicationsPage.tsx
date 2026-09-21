import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Calendar, Video, Clock } from 'lucide-react'

export const ApplicationsPage: React.FC = () => {
  const queryClient = useQueryClient()

  const { data: applications, isLoading } = useQuery({
    queryKey: ['student-applications'],
    queryFn: async () => {
      const res = await api.get('/students/applications')
      return res.data.data
    }
  })

  const withdrawMutation = useMutation({
    mutationFn: async (appId: string) => {
      await api.post(`/students/applications/${appId}/withdraw`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-applications'] })
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Applications</h1>
        <p className="text-xs text-slate-500">Live timeline & stage progression for all your submissions</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading applications...</div>
      ) : applications?.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
          <p className="text-sm text-slate-500">You haven't submitted any applications yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications?.map((app: any) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    {app.jobPosting?.company?.name}
                  </span>
                  <StatusBadge status={app.status} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{app.jobPosting?.title}</h3>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Applied on: {new Date(app.appliedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Type: {app.jobPosting?.jobType}</span>
                </div>

                {/* Scheduled Interviews Alert */}
                {app.interviews && app.interviews.length > 0 && (
                  <div className="mt-3 p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      Next Round: {app.interviews[0].roundName}
                    </div>
                    <p className="text-xs text-indigo-700">
                      Date: {new Date(app.interviews[0].scheduledAt).toLocaleString()} ({app.interviews[0].mode})
                    </p>
                    {app.interviews[0].meetingLink && (
                      <a
                        href={app.interviews[0].meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline pt-1"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Video Interview Meeting
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Status Action / Timeline View */}
              <div className="flex flex-col items-end gap-3 shrink-0">
                {app.status !== 'WITHDRAWN' && app.status !== 'SELECTED' && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to withdraw this application?')) {
                        withdrawMutation.mutate(app.id)
                      }
                    }}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                  >
                    Withdraw Application
                  </button>
                )}

                {/* Recent Status History Note */}
                {app.history && app.history.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    Last updated: {new Date(app.history[0].changedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
