import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { ShieldCheck, User, Clock } from 'lucide-react'

export const AuditTrailPage: React.FC = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const res = await api.get('/admin/audit-logs')
      return res.data.data
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Audit Trail</h1>
        <p className="text-xs text-slate-500">Immutable ledger of state transitions, user logins, and administrative actions</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading security audit records...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Actor / Email</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Target Entity</th>
                  <th className="px-6 py-3">Target ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap font-semibold text-slate-900">
                      {log.user?.email || 'System / Anonymous'}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap font-medium text-slate-700">
                      {log.entity}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                      {log.entityId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
