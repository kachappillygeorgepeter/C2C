import React, { useState } from 'react'
import { EligibilityResult } from '../../types'
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'

export const EligibilityPanel: React.FC<{ eligibility?: EligibilityResult }> = ({ eligibility }) => {
  const [expanded, setExpanded] = useState(false)

  if (!eligibility) return null

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        eligibility.eligible
          ? 'bg-emerald-50/50 border-emerald-200'
          : 'bg-rose-50/50 border-rose-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {eligibility.eligible ? (
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 bg-rose-100 rounded-lg text-rose-700">
              <XCircle className="w-5 h-5" />
            </div>
          )}
          <div>
            <h4 className="font-semibold text-sm text-slate-900">
              {eligibility.eligible
                ? 'You are Eligible to Apply'
                : 'You do not meet the criteria for this role'}
            </h4>
            <p className="text-xs text-slate-500">
              {eligibility.eligible
                ? 'Your academic profile and skill qualifications match all employer criteria.'
                : `${eligibility.reasons.length} criteria mismatch detected.`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          {expanded ? 'Hide criteria' : 'View criteria breakdown'}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-2">
          {eligibility.checks.map((check, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-white/60"
            >
              <div className="flex items-center gap-2">
                {check.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <span className="font-medium text-slate-700">{check.criterion}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                <span>Required: <strong className="text-slate-700">{String(check.required)}</strong></span>
                <span>Yours: <strong className={check.passed ? 'text-emerald-700' : 'text-rose-600'}>{String(check.actual)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
