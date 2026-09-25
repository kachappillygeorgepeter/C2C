import React, { useState } from 'react'
import KexsioSignInCard, { UserRole } from './KexsioSignInCard'

// ─────────────────────────────────────────────
// DATA TYPES
// ─────────────────────────────────────────────
interface JobItem {
  id: string
  title: string
  company: string
  jobType: 'FULL_TIME' | 'INTERNSHIP' | 'INTERNSHIP_PPO'
  location: string
  salary: string
  deadline: string
  openings: number
  minCgpa: number
  maxBacklogs: number
  allowedDepts: string[]
  description: string
  applicantsCount: number
}

interface ApplicationItem {
  id: string
  jobId: string
  studentName: string
  studentDept: string
  studentCgpa: number
  studentBacklogs: number
  appliedAt: string
  status: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFERED' | 'REJECTED'
}

const mockJobs: JobItem[] = [
  {
    id: 'job-1',
    title: 'Software Development Engineer',
    company: 'Microsoft India',
    jobType: 'FULL_TIME',
    location: 'Bengaluru / Hyderabad',
    salary: '₹22 - 32 LPA',
    deadline: '2026-10-15',
    openings: 12,
    minCgpa: 8.0,
    maxBacklogs: 0,
    allowedDepts: ['CSE', 'ISE', 'ECE'],
    description: 'Design and build enterprise cloud systems and distributed microservices.',
    applicantsCount: 48
  },
  {
    id: 'job-2',
    title: 'Data & Machine Learning Intern',
    company: 'Amazon Web Services',
    jobType: 'INTERNSHIP_PPO',
    location: 'Bengaluru, KA',
    salary: '₹1.1L/mo + 28 LPA PPO',
    deadline: '2026-10-20',
    openings: 8,
    minCgpa: 7.5,
    maxBacklogs: 0,
    allowedDepts: ['CSE', 'ISE'],
    description: 'Work alongside data scientists training LLM pipelines and automated retrieval engines.',
    applicantsCount: 32
  },
  {
    id: 'job-3',
    title: 'Systems & Network Engineer',
    company: 'Cisco Systems',
    jobType: 'FULL_TIME',
    location: 'Bengaluru, KA',
    salary: '₹16 - 20 LPA',
    deadline: '2026-10-30',
    openings: 15,
    minCgpa: 7.0,
    maxBacklogs: 1,
    allowedDepts: ['CSE', 'ISE', 'ECE', 'MECH'],
    description: 'Develop next-generation routing telemetry, SDN fabrics, and resilient cloud networks.',
    applicantsCount: 65
  }
]

const initialApplicants: ApplicationItem[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    studentName: 'Aarav Patel',
    studentDept: 'CSE',
    studentCgpa: 8.9,
    studentBacklogs: 0,
    appliedAt: '24 Sep 2026',
    status: 'SHORTLISTED'
  },
  {
    id: 'app-2',
    jobId: 'job-1',
    studentName: 'Priya Sharma',
    studentDept: 'ISE',
    studentCgpa: 8.4,
    studentBacklogs: 0,
    appliedAt: '25 Sep 2026',
    status: 'APPLIED'
  },
  {
    id: 'app-3',
    jobId: 'job-2',
    studentName: 'Rohan Deshmukh',
    studentDept: 'CSE',
    studentCgpa: 7.8,
    studentBacklogs: 0,
    appliedAt: '25 Sep 2026',
    status: 'INTERVIEW_SCHEDULED'
  }
]

interface PendingReview {
  id: string
  type: 'COMPANY' | 'JOB'
  name: string
  subtitle: string
  submittedBy: string
  status: 'PENDING'
  date: string
}

const mockPending: PendingReview[] = [
  {
    id: 'pen-1',
    type: 'COMPANY',
    name: 'Databricks India',
    subtitle: 'Enterprise Cloud & AI Data Infrastructure',
    submittedBy: 'Ananya Roy (Recruiter)',
    status: 'PENDING',
    date: '24 Sep 2026'
  },
  {
    id: 'pen-2',
    type: 'JOB',
    name: 'Full Stack Engineer - FinTech',
    subtitle: 'Razorpay Software Pvt Ltd',
    submittedBy: 'Rohan Sharma (HR)',
    status: 'PENDING',
    date: '25 Sep 2026'
  }
]

export default function App() {
  const [currentUser, setCurrentUser] = useState<{
    role: UserRole
    name: string
    email: string
  } | null>(null)

  // Router sub-route states
  const [studentTab, setStudentTab] = useState<'drives' | 'my-applications' | 'eligibility'>('drives')
  const [recruiterTab, setRecruiterTab] = useState<'pipeline' | 'post-job' | 'schedule'>('pipeline')
  const [adminTab, setAdminTab] = useState<'overview' | 'approvals' | 'students-audit'>('overview')

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL')

  // Student Evaluation State
  const [studentCgpa, setStudentCgpa] = useState<number>(8.2)
  const [studentBacklogs, setStudentBacklogs] = useState<number>(0)
  const [studentDept, setStudentDept] = useState<string>('CSE')
  const [appliedJobs, setAppliedJobs] = useState<string[]>(['job-1'])

  // Recruiter State
  const [applicants, setApplicants] = useState<ApplicationItem[]>(initialApplicants)
  const [jobs, setJobs] = useState<JobItem[]>(mockJobs)
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newJobType, setNewJobType] = useState<'FULL_TIME' | 'INTERNSHIP'>('FULL_TIME')
  const [newJobSalary, setNewJobSalary] = useState('')
  const [newJobMinCgpa, setNewJobMinCgpa] = useState('7.5')

  // Admin State
  const [pendingList, setPendingList] = useState<PendingReview[]>(mockPending)

  // Handle Login based on role
  const handleLoginSuccess = (role: UserRole) => {
    let name = 'Alex Mercer'
    let email = 'student@campus.edu'
    if (role === 'RECRUITER') {
      name = 'Ananya Roy (Microsoft HR)'
      email = 'recruiter@microsoft.com'
    } else if (role === 'ADMIN') {
      name = 'Dr. R. Kumar (Head TPO)'
      email = 'admin@placement.edu'
    }
    setCurrentUser({ role, name, email })
  }

  // Not logged in -> Render Sign In
  if (!currentUser) {
    return <KexsioSignInCard onSuccess={handleLoginSuccess} />
  }

  // Quick Eligibility Check
  const checkJobEligibility = (job: JobItem) => {
    const reasons: string[] = []
    if (studentCgpa < job.minCgpa) {
      reasons.push(`CGPA ${studentCgpa} is below required ${job.minCgpa}`)
    }
    if (studentBacklogs > job.maxBacklogs) {
      reasons.push(`Active backlogs (${studentBacklogs}) exceed max allowed (${job.maxBacklogs})`)
    }
    if (!job.allowedDepts.includes(studentDept)) {
      reasons.push(`Branch ${studentDept} is not eligible`)
    }
    return {
      eligible: reasons.length === 0,
      reasons
    }
  }

  const handleApply = (jobId: string) => {
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs([...appliedJobs, jobId])
    }
  }

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newJobTitle) return
    const newJob: JobItem = {
      id: `job-${Date.now()}`,
      title: newJobTitle,
      company: 'Microsoft India',
      jobType: newJobType,
      location: 'Bengaluru, KA',
      salary: newJobSalary || '₹18 - 24 LPA',
      deadline: '2026-11-01',
      openings: 5,
      minCgpa: parseFloat(newJobMinCgpa) || 7.0,
      maxBacklogs: 0,
      allowedDepts: ['CSE', 'ISE', 'ECE'],
      description: 'Newly submitted recruitment opening awaiting placement cell verification.',
      applicantsCount: 0
    }
    setJobs([newJob, ...jobs])
    setNewJobTitle('')
    setNewJobSalary('')
    alert('Job opening created! Submitted to Admin for approval.')
    setRecruiterTab('pipeline')
  }

  const handleUpdateStatus = (appId: string, newStatus: ApplicationItem['status']) => {
    setApplicants(
      applicants.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    )
  }

  const handleAdminApprove = (id: string) => {
    setPendingList(pendingList.filter((item) => item.id !== id))
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#FDFBFB', color: '#0F172A', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .light-card {
          background: #FFFFFF;
          border: 1px solid #F1E5E7;
          box-shadow: 0 1px 3px rgba(174, 20, 44, 0.04);
          border-radius: 16px;
        }
        .crimson-btn {
          background: linear-gradient(135deg, #AE142C, #8f0e22);
          color: #FFFFFF;
          border: none;
          box-shadow: 0 2px 8px rgba(174, 20, 44, 0.25);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .crimson-btn:hover {
          background: linear-gradient(135deg, #991025, #7d0a1b);
          box-shadow: 0 4px 12px rgba(174, 20, 44, 0.35);
        }
        .light-input {
          background: #FAF6F6;
          border: 1px solid #EADBDE;
          color: #0F172A;
          outline: none;
        }
        .light-input:focus {
          border-color: #AE142C;
          box-shadow: 0 0 0 3px rgba(174, 20, 44, 0.12);
        }
      `}</style>

      {/* ─────────────────────────────────────────────────────────────
          SIDEBAR WITH #AE142C ACCENTS
         ───────────────────────────────────────────────────────────── */}
      <aside style={{ width: '260px', backgroundColor: '#FFFFFF', borderRight: '1px solid #F1E5E7', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 16px', flexShrink: 0, zIndex: 10 }}>
        <div>
          {/* Logo & Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid #F1E5E7', marginBottom: '20px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #AE142C, #830E20)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', color: '#ffffff', boxShadow: '0 2px 8px rgba(174,20,44,0.3)' }}>
              C2C
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '16px', color: '#0F172A', letterSpacing: '-0.02em' }}>C2C Portal</div>
              <span style={{ fontSize: '10px', fontWeight: '800', background: currentUser.role === 'ADMIN' ? '#fef3c7' : currentUser.role === 'RECRUITER' ? '#e0f2fe' : '#FDF2F4', color: currentUser.role === 'ADMIN' ? '#b45309' : currentUser.role === 'RECRUITER' ? '#0369a1' : '#AE142C', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.04em' }}>
                {currentUser.role} ROUTE
              </span>
            </div>
          </div>

          {/* 1. STUDENT ROUTER LINKS */}
          {currentUser.role === 'STUDENT' && (
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'drives', label: `Active Drives (${jobs.length})` },
                { id: 'my-applications', label: `My Applications (${appliedJobs.length})` },
                { id: 'eligibility', label: 'Eligibility Calculator' }
              ].map((tab) => {
                const isActive = studentTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStudentTab(tab.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: isActive ? '#FDF2F4' : 'transparent',
                      color: isActive ? '#AE142C' : '#64748B',
                      boxShadow: isActive ? 'inset 0 0 0 1px #F9D2D8' : 'none'
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          )}

          {/* 2. RECRUITER ROUTER LINKS */}
          {currentUser.role === 'RECRUITER' && (
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'pipeline', label: `Applicant Funnel (${applicants.length})` },
                { id: 'post-job', label: '+ Post New Opening' },
                { id: 'schedule', label: 'Interview Schedules' }
              ].map((tab) => {
                const isActive = recruiterTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setRecruiterTab(tab.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: isActive ? '#FDF2F4' : 'transparent',
                      color: isActive ? '#AE142C' : '#64748B',
                      boxShadow: isActive ? 'inset 0 0 0 1px #F9D2D8' : 'none'
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          )}

          {/* 3. ADMIN ROUTER LINKS */}
          {currentUser.role === 'ADMIN' && (
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'overview', label: 'Institution Placement Stats' },
                { id: 'approvals', label: `Pending Approvals (${pendingList.length})` },
                { id: 'students-audit', label: 'Student Academic Audit' }
              ].map((tab) => {
                const isActive = adminTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: isActive ? '#FDF2F4' : 'transparent',
                      color: isActive ? '#AE142C' : '#64748B',
                      boxShadow: isActive ? 'inset 0 0 0 1px #F9D2D8' : 'none'
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          )}
        </div>

        {/* Current User Snapshot & Sign Out */}
        <div style={{ background: '#FAF6F6', borderRadius: '14px', padding: '14px', border: '1px solid #F1E5E7' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{currentUser.name}</div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{currentUser.email}</div>
          <button
            onClick={() => setCurrentUser(null)}
            style={{ marginTop: '12px', width: '100%', padding: '8px', background: '#FFFFFF', border: '1px solid #EADBDE', borderRadius: '8px', color: '#AE142C', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
          >
            Switch Role / Sign Out
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT AREA
         ───────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Top Navbar */}
        <header style={{ height: '74px', borderBottom: '1px solid #F1E5E7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 36px', backgroundColor: '#FFFFFF' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
              {currentUser.role === 'STUDENT' && 'Student Portal &bull; Opportunities'}
              {currentUser.role === 'RECRUITER' && 'Recruiter Pipeline &bull; Candidate Screening'}
              {currentUser.role === 'ADMIN' && 'Placement Cell Governance &bull; Institutional Control'}
            </h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
              RBAC Guard: <strong style={{ color: '#AE142C' }}>{currentUser.role} Authenticated</strong> &bull; Backend APIs active
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B', background: '#FAF6F6', padding: '8px 14px', borderRadius: '10px', border: '1px solid #F1E5E7' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
            <span>Active Session: <strong style={{ color: '#0F172A' }}>Verified</strong></span>
          </div>
        </header>

        {/* ─────────────────────────────────────────────────────────────
            BODY VIEWS
           ───────────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '36px' }}>
          {/* =========================================================
              A. STUDENT ROUTE CONTENT
             ========================================================= */}
          {currentUser.role === 'STUDENT' && (
            <div style={{ maxWidth: '1020px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {studentTab === 'drives' && (
                <>
                  <div className="light-card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Search company or job..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="light-input"
                      style={{ flex: 1, padding: '10px 16px', borderRadius: '10px', fontSize: '13px' }}
                    />
                    <select
                      value={selectedDeptFilter}
                      onChange={(e) => setSelectedDeptFilter(e.target.value)}
                      className="light-input"
                      style={{ padding: '10px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '600' }}
                    >
                      <option value="ALL">All Departments</option>
                      <option value="CSE">CSE</option>
                      <option value="ISE">ISE</option>
                      <option value="ECE">ECE</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {jobs.map((job) => {
                      const evalRes = checkJobEligibility(job)
                      const isApplied = appliedJobs.includes(job.id)

                      return (
                        <div key={job.id} className="light-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: '#FDF2F4', color: '#AE142C', border: '1px solid #F9D2D8' }}>
                                  {job.jobType.replace('_', ' ')}
                                </span>
                                <span style={{ fontSize: '11px', color: '#64748B' }}>Deadline: {job.deadline}</span>
                              </div>
                              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#0F172A' }}>{job.title}</h3>
                              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{job.company} &bull; {job.location}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '18px', fontWeight: '800', color: '#AE142C' }}>{job.salary}</div>
                              <div style={{ fontSize: '11px', color: '#64748B' }}>{job.openings} Openings</div>
                            </div>
                          </div>

                          <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5 }}>{job.description}</p>

                          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748B', borderTop: '1px solid #FAF2F3', paddingTop: '12px' }}>
                            <span>Min CGPA: <strong style={{ color: '#0F172A' }}>{job.minCgpa}</strong></span>
                            <span>Max Backlogs: <strong style={{ color: '#0F172A' }}>{job.maxBacklogs}</strong></span>
                            <span>Eligible Branches: <strong style={{ color: '#0F172A' }}>{job.allowedDepts.join(', ')}</strong></span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #FAF2F3', paddingTop: '14px' }}>
                            <div style={{ fontSize: '12px' }}>
                              {evalRes.eligible ? (
                                <span style={{ color: '#16a34a', fontWeight: '600' }}>&bull; You are ELIGIBLE to apply</span>
                              ) : (
                                <span style={{ color: '#AE142C', fontWeight: '600' }}>&bull; Ineligible: {evalRes.reasons[0]}</span>
                              )}
                            </div>
                            <div>
                              {isApplied ? (
                                <span style={{ padding: '8px 18px', borderRadius: '10px', background: '#F1E5E7', color: '#AE142C', fontSize: '12px', fontWeight: '700' }}>
                                  Application Submitted
                                </span>
                              ) : (
                                <button
                                  disabled={!evalRes.eligible}
                                  onClick={() => handleApply(job.id)}
                                  className="crimson-btn"
                                  style={{ padding: '10px 22px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', opacity: evalRes.eligible ? 1 : 0.4 }}
                                >
                                  One-Click Apply
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {studentTab === 'my-applications' && (
                <div className="light-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0' }}>Your Active Applications</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {appliedJobs.map((jId) => {
                      const j = jobs.find((item) => item.id === jId)
                      if (!j) return null
                      return (
                        <div key={jId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid #F1E5E7', background: '#FAF6F6' }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '14px' }}>{j.title}</div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>{j.company} &bull; {j.salary}</div>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: '#AE142C', background: '#FDF2F4', border: '1px solid #F9D2D8', padding: '4px 10px', borderRadius: '6px' }}>
                            SHORTLISTED
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {studentTab === 'eligibility' && (
                <div className="light-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 14px 0' }}>Live Academic Parameters</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700' }}>
                        <span>CGPA</span>
                        <span style={{ color: '#AE142C' }}>{studentCgpa}</span>
                      </div>
                      <input
                        type="range"
                        min="5.0"
                        max="10.0"
                        step="0.1"
                        value={studentCgpa}
                        onChange={(e) => setStudentCgpa(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#AE142C' }}
                      />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Backlogs</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[0, 1, 2].map((n) => (
                          <button
                            key={n}
                            onClick={() => setStudentBacklogs(n)}
                            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #F1E5E7', background: studentBacklogs === n ? '#AE142C' : '#FAF6F6', color: studentBacklogs === n ? '#FFF' : '#0F172A', fontWeight: '700' }}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              B. RECRUITER ROUTE CONTENT
             ========================================================= */}
          {currentUser.role === 'RECRUITER' && (
            <div style={{ maxWidth: '1020px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {recruiterTab === 'pipeline' && (
                <div className="light-card" style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Candidate Screening Pipeline</h3>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>Review and move applicants across hiring stages.</p>
                    </div>
                    <button onClick={() => setRecruiterTab('post-job')} className="crimson-btn" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                      + Post Job
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {applicants.map((cand) => (
                      <div key={cand.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid #F1E5E7', background: '#FAF6F6' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14px' }}>{cand.studentName}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>
                            {cand.studentDept} &bull; CGPA: <strong>{cand.studentCgpa}</strong> &bull; Backlogs: <strong>{cand.studentBacklogs}</strong>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <select
                            value={cand.status}
                            onChange={(e) => handleUpdateStatus(cand.id, e.target.value as any)}
                            className="light-input"
                            style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' }}
                          >
                            <option value="APPLIED">APPLIED</option>
                            <option value="SHORTLISTED">SHORTLISTED</option>
                            <option value="INTERVIEW_SCHEDULED">INTERVIEW SCHEDULED</option>
                            <option value="OFFERED">OFFERED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recruiterTab === 'post-job' && (
                <div className="light-card" style={{ padding: '28px', maxWidth: '600px', margin: '0 auto' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0' }}>Create New Campus Drive</h3>
                  <form onSubmit={handlePostJob} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Job Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Associate Cloud Engineer"
                        value={newJobTitle}
                        onChange={(e) => setNewJobTitle(e.target.value)}
                        className="light-input"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13px' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Job Type</label>
                        <select
                          value={newJobType}
                          onChange={(e) => setNewJobType(e.target.value as any)}
                          className="light-input"
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '12px' }}
                        >
                          <option value="FULL_TIME">Full Time</option>
                          <option value="INTERNSHIP">Internship</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Compensation / CTC</label>
                        <input
                          type="text"
                          placeholder="e.g. ₹18 LPA"
                          value={newJobSalary}
                          onChange={(e) => setNewJobSalary(e.target.value)}
                          className="light-input"
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13px' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Minimum CGPA Cutoff</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newJobMinCgpa}
                        onChange={(e) => setNewJobMinCgpa(e.target.value)}
                        className="light-input"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13px' }}
                      />
                    </div>
                    <button type="submit" className="crimson-btn" style={{ padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', marginTop: '10px' }}>
                      Publish Job Opening
                    </button>
                  </form>
                </div>
              )}

              {recruiterTab === 'schedule' && (
                <div className="light-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 14px 0' }}>Scheduled Candidate Interviews</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #F1E5E7', background: '#FAF6F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>Rohan Deshmukh &bull; Technical Round 1</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>Amazon AWS &bull; 28 Sep 2026, 10:30 AM (Online Google Meet)</div>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: '6px' }}>
                        CONFIRMED
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              C. ADMIN ROUTE CONTENT
             ========================================================= */}
          {currentUser.role === 'ADMIN' && (
            <div style={{ maxWidth: '1020px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {adminTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    {[
                      { label: 'TOTAL PLACED', val: '86.4%', tag: '384 Students', color: '#16a34a' },
                      { label: 'ACTIVE CORPORATES', val: '64 Companies', tag: 'Verified Recruiters', color: '#AE142C' },
                      { label: 'PENDING REVIEWS', val: `${pendingList.length} Items`, tag: 'Action Required', color: '#d97706' },
                      { label: 'AVERAGE CTC', val: '12.8 LPA', tag: 'Campus Benchmark', color: '#AE142C' }
                    ].map((s, i) => (
                      <div key={i} className="light-card" style={{ padding: '24px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B' }}>{s.label}</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: s.color, margin: '6px 0 2px' }}>{s.val}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>{s.tag}</div>
                      </div>
                    ))}
                  </div>

                  <div className="light-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 14px 0' }}>Institutional Placement Rules</h3>
                    <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                      &bull; <strong>Single Offer Freeze:</strong> Once a student accepts an offer &ge; 15 LPA, access to lower tiers is automatically disabled.<br />
                      &bull; <strong>Pre-Placement Verification:</strong> Recruiter company accreditation and tax documents must be approved before job publication.
                    </p>
                  </div>
                </div>
              )}

              {adminTab === 'approvals' && (
                <div className="light-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0' }}>Placement Cell Approval Queue</h3>
                  {pendingList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748B' }}>All pending items reviewed!</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {pendingList.map((item) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid #F1E5E7', background: '#FAF6F6' }}>
                          <div>
                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#AE142C', background: '#FDF2F4', border: '1px solid #F9D2D8', padding: '2px 6px', borderRadius: '4px' }}>
                              PENDING {item.type}
                            </span>
                            <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '4px' }}>{item.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>{item.subtitle} &bull; {item.submittedBy}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleAdminApprove(item.id)} style={{ padding: '8px 14px', borderRadius: '8px', background: '#16a34a', border: 'none', color: '#FFF', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                              Approve
                            </button>
                            <button onClick={() => handleAdminApprove(item.id)} style={{ padding: '8px 14px', borderRadius: '8px', background: '#FFF', border: '1px solid #EADBDE', color: '#AE142C', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {adminTab === 'students-audit' && (
                <div className="light-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 14px 0' }}>Verified Student Academic Registry</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { name: 'Aarav Patel', usn: '1MS22CS004', dept: 'CSE', cgpa: 8.9, backlogs: 0 },
                      { name: 'Priya Sharma', usn: '1MS22IS042', dept: 'ISE', cgpa: 8.4, backlogs: 0 },
                      { name: 'Rohan Deshmukh', usn: '1MS22CS088', dept: 'CSE', cgpa: 7.8, backlogs: 0 }
                    ].map((st, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', borderRadius: '10px', border: '1px solid #F1E5E7', background: '#FAF6F6', fontSize: '12px' }}>
                        <div>
                          <strong>{st.name}</strong> ({st.usn}) &bull; {st.dept}
                        </div>
                        <div>
                          CGPA: <strong>{st.cgpa}</strong> &bull; Backlogs: <strong>{st.backlogs}</strong> &bull; <span style={{ color: '#16a34a', fontWeight: '700' }}>VERIFIED</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
