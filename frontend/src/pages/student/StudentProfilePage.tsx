import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { User, GraduationCap, Award, BookOpen, Save } from 'lucide-react'

export const StudentProfilePage: React.FC = () => {
  const queryClient = useQueryClient()
  const [success, setSuccess] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: async () => {
      const res = await api.get('/students/profile')
      return res.data.data
    }
  })

  const [formData, setFormData] = useState<any>({
    phone: '',
    portfolioUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    resumeUrl: '',
    bio: ''
  })

  // Sync state when loaded
  React.useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone || '',
        portfolioUrl: profile.portfolioUrl || '',
        githubUrl: profile.githubUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
        resumeUrl: profile.resumeUrl || '',
        bio: profile.bio || ''
      })
    }
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put('/students/profile', formData)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  })

  if (isLoading) return <div className="text-center py-12 text-slate-400 text-sm">Loading profile...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic & Career Profile</h1>
          <p className="text-xs text-slate-500">Official institutional record & placement credentials</p>
        </div>
        {success && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            ✓ Profile Updated
          </span>
        )}
      </div>

      {/* Verified Institutional Record (Read-only for Student) */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
          <GraduationCap className="w-4 h-4" /> Verified Institutional Record
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/50">
          <div>
            <span className="text-xs text-slate-400 font-medium">Student Roll No</span>
            <p className="text-sm font-bold text-slate-800">{profile?.studentId}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Department / Branch</span>
            <p className="text-sm font-bold text-slate-800">{profile?.branch || 'CSE'}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Current CGPA</span>
            <p className="text-sm font-extrabold text-indigo-600">{profile?.cgpa || 'N/A'}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Graduation Year</span>
            <p className="text-sm font-bold text-slate-800">{profile?.graduationYear || 2025}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Active Backlogs</span>
            <p className="text-sm font-bold text-rose-600">{profile?.activeBacklogs || 0}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Total History Backlogs</span>
            <p className="text-sm font-bold text-slate-800">{profile?.totalBacklogs || 0}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">10th Grade Score</span>
            <p className="text-sm font-bold text-slate-800">{profile?.tenthPercent || '—'}%</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">12th Grade Score</span>
            <p className="text-sm font-bold text-slate-800">{profile?.twelfthPercent || '—'}%</p>
          </div>
        </div>
      </div>

      {/* Editable Student Details */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          updateMutation.mutate()
        }}
        className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
          <User className="w-4 h-4" /> Personal & Links Information
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Resume Link (PDF URL)</label>
            <input
              type="url"
              value={formData.resumeUrl}
              onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
              placeholder="https://drive.google.com/..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">GitHub Profile</label>
            <input
              type="url"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              placeholder="https://github.com/..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">LinkedIn Profile</label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Professional Bio</label>
          <textarea
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Brief introduction of your engineering skills..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-md disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {updateMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  )
}
