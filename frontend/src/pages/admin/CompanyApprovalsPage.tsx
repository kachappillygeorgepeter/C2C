import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Check, X, Building2, Globe, FileText } from 'lucide-react'

export const CompanyApprovalsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [note, setNote] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: companies, isLoading } = useQuery({
    queryKey: ['pending-companies'],
    queryFn: async () => {
      const res = await api.get('/admin/companies/pending')
      return res.data.data
    }
  })

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) => {
      await api.patch(`/admin/companies/${id}/review`, { status, adminNote: note || undefined })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-companies'] })
      setSelectedId(null)
      setNote('')
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Partner Company Verifications</h1>
        <p className="text-xs text-slate-500">Placement Cell approval workflow for new recruiter organizations</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading approval queue...</div>
      ) : companies?.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
          <p className="text-sm text-slate-500">No pending company applications in the queue.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {companies?.map((company: any) => (
            <div
              key={company.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-bold text-slate-900">{company.name}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
                    PENDING REVIEW
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-xl">{company.description || 'No description provided.'}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Recruiter: <strong>{company.recruiter?.fullName}</strong> ({company.recruiter?.user?.email})</span>
                  <span>•</span>
                  <span>HQ: {company.headquarters || 'India'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => reviewMutation.mutate({ id: company.id, status: 'APPROVED' })}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Check className="w-4 h-4" /> Approve Company
                </button>
                <button
                  onClick={() => reviewMutation.mutate({ id: company.id, status: 'REJECTED' })}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
