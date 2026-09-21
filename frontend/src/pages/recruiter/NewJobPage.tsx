import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { ArrowLeft, Save } from 'lucide-react'

export const NewJobPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    responsibilities: '',
    jobType: 'FULL_TIME',
    workMode: 'ON_SITE',
    city: 'Bengaluru',
    salaryMin: 1200000,
    salaryMax: 1600000,
    openings: 3,
    deadline: '2026-10-30',
    minCgpa: 8.0,
    maxBacklogs: 0,
    allowedDepts: ['CSE', 'ECE'],
    allowedGradYears: [2025],
    requiredSkills: ['React', 'TypeScript']
  })

  const createJobMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/recruiters/jobs', formData)
      return res.data
    },
    onSuccess: () => {
      navigate('/recruiter/dashboard')
    }
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/recruiter/dashboard')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel & Return
      </button>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Post New Campus Opening</h1>
        <p className="text-xs text-slate-500">Configure job role, compensation, and automated eligibility criteria</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          createJobMutation.mutate()
        }}
        className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Job Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Associate Software Engineer"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Job Type</label>
            <select
              value={formData.jobType}
              onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="INTERNSHIP_PPO">Internship + PPO</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Work Mode</label>
            <select
              value={formData.workMode}
              onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="ON_SITE">On Site</option>
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Min Salary (INR)</label>
            <input
              type="number"
              value={formData.salaryMin}
              onChange={(e) => setFormData({ ...formData, salaryMin: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Max Salary (INR)</label>
            <input
              type="number"
              value={formData.salaryMax}
              onChange={(e) => setFormData({ ...formData, salaryMax: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Deadline Date</label>
            <input
              type="date"
              required
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Role Description</label>
          <textarea
            rows={4}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description of responsibilities and qualifications..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        {/* Eligibility Constraints */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
            Eligibility Engine Rules
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Minimum CGPA Cutoff</label>
              <input
                type="number"
                step="0.1"
                value={formData.minCgpa}
                onChange={(e) => setFormData({ ...formData, minCgpa: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Maximum Active Backlogs</label>
              <input
                type="number"
                value={formData.maxBacklogs}
                onChange={(e) => setFormData({ ...formData, maxBacklogs: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={createJobMutation.isPending}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {createJobMutation.isPending ? 'Publishing Opening...' : 'Submit Job for Admin Approval'}
        </button>
      </form>
    </div>
  )
}
