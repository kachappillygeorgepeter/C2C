import React, { useState, useEffect, useMemo } from 'react'
import KexsioSignInCard, { UserRole } from './KexsioSignInCard'
import { apiFetch, tokenStorage, UserSession } from './api'

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

interface InterviewItem {
  id: string
  studentName: string
  jobTitle: string
  company: string
  roundName: string
  date: string
  mode: 'ONLINE' | 'IN_PERSON' | 'PHONE'
  linkOrLocation: string
}

interface StudentAuditItem {
  id: string
  name: string
  usn: string
  dept: string
  cgpa: number
  backlogs: number
  isVerified: boolean
}

interface PendingReview {
  id: string
  type: 'COMPANY' | 'JOB'
  name: string
  subtitle: string
  submittedBy: string
  status: 'PENDING'
  date: string
}

const initialJobs: JobItem[] = [
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
    description: 'Design and build enterprise cloud systems and distributed microservices with high availability.',
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
    description: 'Develop next-generation routing telemetry, SDN fabrics, and resilient enterprise cloud networks.',
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

const initialInterviews: InterviewItem[] = [
  {
    id: 'int-1',
    studentName: 'Rohan Deshmukh',
    jobTitle: 'Data & ML Intern',
    company: 'Amazon AWS',
    roundName: 'Technical Round 1 (System Design & Python)',
    date: '28 Sep 2026, 10:30 AM',
    mode: 'ONLINE',
    linkOrLocation: 'meet.google.com/c2c-interview-tech1'
  }
]

const initialStudentsAudit: StudentAuditItem[] = [
  { id: 'st-1', name: 'Aarav Patel', usn: '1MS22CS004', dept: 'CSE', cgpa: 8.9, backlogs: 0, isVerified: true },
  { id: 'st-2', name: 'Priya Sharma', usn: '1MS22IS042', dept: 'ISE', cgpa: 8.4, backlogs: 0, isVerified: true },
  { id: 'st-3', name: 'Rohan Deshmukh', usn: '1MS22CS088', dept: 'CSE', cgpa: 7.8, backlogs: 0, isVerified: true }
]

const initialPending: PendingReview[] = [
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
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    return tokenStorage.getUser()
  })

  // Responsive mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
  const [jobs, setJobs] = useState<JobItem[]>(initialJobs)
  const [interviews, setInterviews] = useState<InterviewItem[]>(initialInterviews)

  // Recruiter Post Job Form State
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newJobType, setNewJobType] = useState<'FULL_TIME' | 'INTERNSHIP' | 'INTERNSHIP_PPO'>('FULL_TIME')
  const [newJobSalary, setNewJobSalary] = useState('')
  const [newJobMinCgpa, setNewJobMinCgpa] = useState('7.0')
  const [newJobMaxBacklogs, setNewJobMaxBacklogs] = useState('0')
  const [newJobLocation, setNewJobLocation] = useState('Bengaluru, KA')
  const [newJobDescription, setNewJobDescription] = useState('')
  const [selectedBranches, setSelectedBranches] = useState<string[]>(['CSE', 'ISE'])

  // Interview Schedule Modal State
  const [scheduleModalApplicant, setScheduleModalApplicant] = useState<ApplicationItem | null>(null)
  const [interviewRoundName, setInterviewRoundName] = useState('Technical Round 1')
  const [interviewDate, setInterviewDate] = useState('2026-10-05T10:00')
  const [interviewLink, setInterviewLink] = useState('https://meet.google.com/c2c-drive')

  // Admin State
  const [pendingList, setPendingList] = useState<PendingReview[]>(initialPending)
  const [studentsAudit, setStudentsAudit] = useState<StudentAuditItem[]>(initialStudentsAudit)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Banner / Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Attempt to fetch real jobs & applications from backend on initial mount
  useEffect(() => {
    let isMounted = true
    async function fetchBackendData() {
      if (!currentUser) return
      if (currentUser.role === 'STUDENT') {
        const res = await apiFetch<any[]>('/students/opportunities')
        if (isMounted && res.success && res.data && res.data.length > 0) {
          // Map backend JobPosting records to JobItem interface
          const mappedJobs: JobItem[] = res.data.map((j: any) => ({
            id: j.id,
            title: j.title,
            company: j.company?.name || 'Recruiter Company',
            jobType: j.jobType || 'FULL_TIME',
            location: j.city ? `${j.city}, ${j.country || 'India'}` : 'Bengaluru, KA',
            salary: j.salaryMin && j.salaryMax ? `₹${j.salaryMin} - ${j.salaryMax} LPA` : (j.salaryMin ? `₹${j.salaryMin} LPA` : '₹18 - 24 LPA'),
            deadline: j.deadline ? new Date(j.deadline).toISOString().split('T')[0] : '2026-11-15',
            openings: j.openings || 5,
            minCgpa: j.eligibility?.minCgpa ?? 7.0,
            maxBacklogs: j.eligibility?.maxBacklogs ?? 0,
            allowedDepts: j.eligibility?.allowedDepts?.length ? j.eligibility.allowedDepts : ['CSE', 'ISE', 'ECE'],
            description: j.description || '',
            applicantsCount: j._count?.applications || 0
          }))
          setJobs(mappedJobs)
        }
      }
    }
    fetchBackendData()
    return () => {
      isMounted = false
    }
  }, [currentUser])

  // Login handler
  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user)
    tokenStorage.setUser(user)
    showToast(`Welcome back, ${user.name}!`)
  }

  // Sign out handler
  const handleSignOut = () => {
    setCurrentUser(null)
    tokenStorage.remove()
    tokenStorage.removeUser()
    setMobileMenuOpen(false)
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
      reasons.push(`Branch ${studentDept} is not eligible for this role`)
    }
    return {
      eligible: reasons.length === 0,
      reasons
    }
  }

  // Apply to Job
  const handleApply = async (jobId: string) => {
    if (appliedJobs.includes(jobId)) return

    // Attempt backend apply API call
    await apiFetch(`/students/opportunities/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ coverLetter: 'Interested in this opening' })
    })

    setAppliedJobs([...appliedJobs, jobId])
    setJobs(jobs.map((j) => (j.id === jobId ? { ...j, applicantsCount: j.applicantsCount + 1 } : j)))
    showToast('Application successfully submitted!')
  }

  // Recruiter Post Job
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newJobTitle.trim()) return

    const newJob: JobItem = {
      id: `job-${Date.now()}`,
      title: newJobTitle.trim(),
      company: currentUser.name.includes('(') ? currentUser.name.split('(')[1].replace(')', '') : 'Enterprise Partner',
      jobType: newJobType,
      location: newJobLocation.trim() || 'Bengaluru, KA',
      salary: newJobSalary.trim() || '₹18 - 24 LPA',
      deadline: '2026-11-30',
      openings: 5,
      minCgpa: parseFloat(newJobMinCgpa) || 7.0,
      maxBacklogs: parseInt(newJobMaxBacklogs, 10) || 0,
      allowedDepts: selectedBranches.length ? selectedBranches : ['CSE', 'ISE'],
      description: newJobDescription.trim() || 'Campus recruitment drive targeting eligible final-year candidates.',
      applicantsCount: 0
    }

    // Call backend API if connected
    await apiFetch('/recruiters/jobs', {
      method: 'POST',
      body: JSON.stringify({
        title: newJob.title,
        description: newJob.description,
        jobType: newJob.jobType,
        workMode: 'ON_SITE',
        city: 'Bengaluru',
        salaryMin: 18,
        salaryMax: 24,
        openings: newJob.openings,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        minCgpa: newJob.minCgpa,
        maxBacklogs: newJob.maxBacklogs,
        allowedDepts: newJob.allowedDepts
      })
    })

    setJobs([newJob, ...jobs])
    setNewJobTitle('')
    setNewJobSalary('')
    setNewJobDescription('')
    showToast('Job opening published and added to active drives.')
    setRecruiterTab('pipeline')
  }

  // Recruiter Update Candidate Status
  const handleUpdateStatus = async (appId: string, newStatus: ApplicationItem['status']) => {
    setApplicants(applicants.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)))
    await apiFetch(`/recruiters/applications/${appId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    })
    showToast(`Applicant status updated to ${newStatus}`)
  }

  // Schedule Interview
  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!scheduleModalApplicant) return

    const newInterview: InterviewItem = {
      id: `int-${Date.now()}`,
      studentName: scheduleModalApplicant.studentName,
      jobTitle: 'Software Development Engineer',
      company: 'Microsoft India',
      roundName: interviewRoundName,
      date: interviewDate.replace('T', ' '),
      mode: 'ONLINE',
      linkOrLocation: interviewLink
    }

    setInterviews([newInterview, ...interviews])
    handleUpdateStatus(scheduleModalApplicant.id, 'INTERVIEW_SCHEDULED')
    setScheduleModalApplicant(null)
    showToast(`Interview scheduled with ${scheduleModalApplicant.studentName}!`)
    setRecruiterTab('schedule')
  }

  // Admin Actions
  const handleAdminApprove = async (id: string, isJob = false) => {
    setPendingList(pendingList.filter((item) => item.id !== id))
    const endpoint = isJob ? `/admin/jobs/${id}/review` : `/admin/companies/${id}/review`
    await apiFetch(endpoint, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'APPROVED' })
    })
    showToast('Item approved and verified.')
  }

  const handleAdminReject = async (id: string, isJob = false) => {
    setPendingList(pendingList.filter((item) => item.id !== id))
    const endpoint = isJob ? `/admin/jobs/${id}/review` : `/admin/companies/${id}/review`
    await apiFetch(endpoint, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'REJECTED' })
    })
    showToast('Item rejected.')
  }

  // Admin Student Audit Toggle
  const handleToggleAudit = (studentId: string) => {
    setStudentsAudit(
      studentsAudit.map((st) => (st.id === studentId ? { ...st, isVerified: !st.isVerified } : st))
    )
    showToast('Student academic verification status updated.')
  }

  // Filtered Job List for Search & Department
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        searchQuery === '' ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDept =
        selectedDeptFilter === 'ALL' || job.allowedDepts.includes(selectedDeptFilter)
      return matchesSearch && matchesDept
    })
  }, [jobs, searchQuery, selectedDeptFilter])

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap');
        * { box-sizing: border-box; }
        
        .light-card {
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          transition: border-color 0.15s ease;
        }
        
        .solid-btn {
          background-color: #0F172A;
          color: #FFFFFF;
          border: 1px solid #0F172A;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.15s ease, opacity 0.15s ease;
        }
        .solid-btn:hover:not(:disabled) {
          background-color: #1E293B;
          border-color: #1E293B;
        }
        .solid-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        
        .outline-btn {
          background-color: #FFFFFF;
          color: #0F172A;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.15s ease, border-color 0.15s ease;
        }
        .outline-btn:hover {
          background-color: #F8FAFC;
          border-color: #94A3B8;
        }
        
        .light-input {
          background-color: #FFFFFF;
          border: 1px solid #CBD5E1;
          color: #0F172A;
          outline: none;
          border-radius: 8px;
          font-family: inherit;
          transition: border-color 0.15s ease;
        }
        .light-input:focus {
          border-color: #0F172A;
        }
        
        /* Modal Backdrop */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 16px;
        }
        
        @media (min-width: 769px) {
          .c2c-hamburger-btn {
            display: none !important;
          }
          .c2c-close-btn {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .c2c-sidebar {
            position: fixed !important;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 40 !important;
            transform: translateX(-100%);
            transition: transform 0.2s ease-in-out;
            box-shadow: 2px 0 12px rgba(15, 23, 42, 0.1);
          }
          .c2c-sidebar.mobile-open {
            transform: translateX(0);
          }
          .c2c-close-btn {
            display: inline-flex !important;
          }
          .c2c-main-header {
            padding: 0 16px !important;
          }
          .c2c-main-content {
            padding: 20px 16px !important;
          }
        }
      `}</style>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 60, backgroundColor: '#0F172A', color: '#FFFFFF', padding: '12px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.3)', zIndex: 35 }}
          aria-hidden="true"
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          SIDEBAR WITH SOLID ACCENTS & RESPONSIVE DRAWER
         ───────────────────────────────────────────────────────────── */}
      <aside
        className={`c2c-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}
        style={{ width: '260px', backgroundColor: '#FFFFFF', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 16px', flexShrink: 0, zIndex: 10 }}
      >
        <div>
          {/* Logo & Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '18px', borderBottom: '1px solid #E2E8F0', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '15px', color: '#FFFFFF' }}>
                C2C
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '15px', color: '#0F172A', letterSpacing: '-0.02em', fontFamily: 'Outfit, Inter, sans-serif' }}>
                  C2C Portal
                </div>
                <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: '#F1F5F9', color: '#334155', padding: '2px 6px', borderRadius: '4px' }}>
                  {currentUser.role} ROUTE
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="outline-btn c2c-close-btn"
              style={{ padding: '4px 8px', fontSize: '12px' }}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* 1. STUDENT ROUTER LINKS */}
          {currentUser.role === 'STUDENT' && (
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { id: 'drives', label: `Active Drives (${jobs.length})` },
                { id: 'my-applications', label: `My Applications (${appliedJobs.length})` },
                { id: 'eligibility', label: 'Eligibility Calculator' }
              ].map((tab) => {
                const isActive = studentTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStudentTab(tab.id as any)
                      setMobileMenuOpen(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: isActive ? '700' : '600',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      backgroundColor: isActive ? '#0F172A' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#475569',
                      transition: 'background-color 0.15s ease, color 0.15s ease'
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
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { id: 'pipeline', label: `Applicant Funnel (${applicants.length})` },
                { id: 'post-job', label: '+ Post New Opening' },
                { id: 'schedule', label: `Interview Schedules (${interviews.length})` }
              ].map((tab) => {
                const isActive = recruiterTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setRecruiterTab(tab.id as any)
                      setMobileMenuOpen(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: isActive ? '700' : '600',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      backgroundColor: isActive ? '#0F172A' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#475569',
                      transition: 'background-color 0.15s ease, color 0.15s ease'
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
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { id: 'overview', label: 'Placement Cell Overview' },
                { id: 'approvals', label: `Pending Approvals (${pendingList.length})` },
                { id: 'students-audit', label: `Student Academic Audit (${studentsAudit.length})` }
              ].map((tab) => {
                const isActive = adminTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setAdminTab(tab.id as any)
                      setMobileMenuOpen(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: isActive ? '700' : '600',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      backgroundColor: isActive ? '#0F172A' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#475569',
                      transition: 'background-color 0.15s ease, color 0.15s ease'
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
        <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '14px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{currentUser.name}</div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', wordBreak: 'break-all' }}>{currentUser.email}</div>
          <button
            onClick={handleSignOut}
            className="outline-btn"
            style={{ marginTop: '12px', width: '100%', padding: '7px', fontSize: '11px', fontWeight: '700' }}
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
        <header className="c2c-main-header" style={{ height: '70px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Hamburger Button on Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="outline-btn c2c-hamburger-btn"
              style={{ padding: '6px 10px', fontSize: '14px', alignItems: 'center' }}
              aria-label="Open navigation menu"
            >
              ☰
            </button>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#0F172A', margin: 0, fontFamily: 'Outfit, Inter, sans-serif' }}>
                {currentUser.role === 'STUDENT' && 'Student Portal • Opportunities'}
                {currentUser.role === 'RECRUITER' && 'Recruiter Pipeline • Candidate Screening'}
                {currentUser.role === 'ADMIN' && 'Placement Cell Governance • Institutional Control'}
              </h2>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                Verified Session: <strong style={{ color: '#0F172A' }}>{currentUser.role} Authenticated</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569', backgroundColor: '#F8FAFC', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
            <span>API Status: <strong>Live</strong></span>
          </div>
        </header>

        {/* ─────────────────────────────────────────────────────────────
            BODY VIEWS
           ───────────────────────────────────────────────────────────── */}
        <div className="c2c-main-content" style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {/* =========================================================
              A. STUDENT ROUTE CONTENT
             ========================================================= */}
          {currentUser.role === 'STUDENT' && (
            <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {studentTab === 'drives' && (
                <>
                  {/* Search and Department Filter Toolbar */}
                  <div className="light-card" style={{ padding: '14px 18px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Search openings by role, company, or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="light-input"
                        style={{ width: '100%', padding: '9px 14px', fontSize: '13px' }}
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: '12px' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <select
                      value={selectedDeptFilter}
                      onChange={(e) => setSelectedDeptFilter(e.target.value)}
                      className="light-input"
                      style={{ padding: '9px 12px', fontSize: '12px', fontWeight: '600' }}
                    >
                      <option value="ALL">All Engineering Departments</option>
                      <option value="CSE">Computer Science (CSE)</option>
                      <option value="ISE">Information Science (ISE)</option>
                      <option value="ECE">Electronics (ECE)</option>
                      <option value="MECH">Mechanical (MECH)</option>
                    </select>
                  </div>

                  {/* Opportunities List */}
                  {filteredJobs.length === 0 ? (
                    <div className="light-card" style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: '#0F172A', marginBottom: '4px' }}>No matching opportunities found</div>
                      <div style={{ fontSize: '13px' }}>Try clearing your search query or department filter.</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {filteredJobs.map((job) => {
                        const evalRes = checkJobEligibility(job)
                        const isApplied = appliedJobs.includes(job.id)

                        return (
                          <div key={job.id} className="light-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                              <div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1' }}>
                                    {job.jobType.replace('_', ' ')}
                                  </span>
                                  <span style={{ fontSize: '11px', color: '#64748B' }}>Deadline: {job.deadline}</span>
                                </div>
                                <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0, color: '#0F172A', fontFamily: 'Outfit, Inter, sans-serif' }}>
                                  {job.title}
                                </h3>
                                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                                  {job.company} &bull; {job.location}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A' }}>{job.salary}</div>
                                <div style={{ fontSize: '11px', color: '#64748B' }}>{job.openings} Openings &bull; {job.applicantsCount} Applicants</div>
                              </div>
                            </div>

                            <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.5 }}>{job.description}</p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '12px', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                              <span>Min CGPA: <strong style={{ color: '#0F172A' }}>{job.minCgpa}</strong></span>
                              <span>Max Backlogs: <strong style={{ color: '#0F172A' }}>{job.maxBacklogs}</strong></span>
                              <span>Eligible Branches: <strong style={{ color: '#0F172A' }}>{job.allowedDepts.join(', ')}</strong></span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
                              <div style={{ fontSize: '12px' }}>
                                {evalRes.eligible ? (
                                  <span style={{ color: '#16A34A', fontWeight: '600' }}>&bull; You are ELIGIBLE to apply</span>
                                ) : (
                                  <span style={{ color: '#64748B', fontWeight: '600' }}>&bull; Ineligible: {evalRes.reasons[0]}</span>
                                )}
                              </div>
                              <div>
                                {isApplied ? (
                                  <span style={{ padding: '6px 14px', borderRadius: '6px', backgroundColor: '#F1F5F9', color: '#475569', fontSize: '12px', fontWeight: '700', border: '1px solid #CBD5E1' }}>
                                    Application Submitted
                                  </span>
                                ) : (
                                  <button
                                    disabled={!evalRes.eligible}
                                    onClick={() => handleApply(job.id)}
                                    className="solid-btn"
                                    style={{ padding: '8px 18px', fontSize: '12px' }}
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
                  )}
                </>
              )}

              {studentTab === 'my-applications' && (
                <div className="light-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, fontFamily: 'Outfit, Inter, sans-serif' }}>Your Active Applications</h3>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>Track recruitment stages for submitted drives.</p>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                      {appliedJobs.length} active
                    </span>
                  </div>

                  {appliedJobs.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                      You haven't submitted any applications yet. Explore active drives to apply.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {appliedJobs.map((jId) => {
                        const j = jobs.find((item) => item.id === jId)
                        if (!j) return null
                        return (
                          <div key={jId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>{j.title}</div>
                              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{j.company} &bull; {j.salary}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: '#0F172A', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '4px 10px', borderRadius: '6px' }}>
                                SHORTLISTED
                              </span>
                              <button
                                onClick={() => {
                                  setAppliedJobs(appliedJobs.filter((id) => id !== jId))
                                  showToast('Application withdrawn.')
                                }}
                                className="outline-btn"
                                style={{ padding: '4px 8px', fontSize: '11px', color: '#64748B' }}
                              >
                                Withdraw
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {studentTab === 'eligibility' && (
                <div className="light-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0', fontFamily: 'Outfit, Inter, sans-serif' }}>
                    Live Academic Parameter Simulator
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 20px 0' }}>
                    Adjust your profile metrics to preview eligibility across all campus drives in real time.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        <span>Current CGPA</span>
                        <span style={{ color: '#0F172A', fontSize: '14px' }}>{studentCgpa.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="5.0"
                        max="10.0"
                        step="0.1"
                        value={studentCgpa}
                        onChange={(e) => setStudentCgpa(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#0F172A', cursor: 'pointer' }}
                      />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>Active Backlogs</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[0, 1, 2].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setStudentBacklogs(n)}
                            style={{
                              flex: 1,
                              padding: '7px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              backgroundColor: studentBacklogs === n ? '#0F172A' : '#FFFFFF',
                              color: studentBacklogs === n ? '#FFFFFF' : '#0F172A',
                              fontWeight: '700',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>Branch</span>
                      <select
                        value={studentDept}
                        onChange={(e) => setStudentDept(e.target.value)}
                        className="light-input"
                        style={{ width: '100%', padding: '7px 10px', fontSize: '12px', fontWeight: '600' }}
                      >
                        <option value="CSE">CSE (Computer Science)</option>
                        <option value="ISE">ISE (Information Science)</option>
                        <option value="ECE">ECE (Electronics &amp; Comm)</option>
                        <option value="MECH">MECH (Mechanical)</option>
                      </select>
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
            <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {recruiterTab === 'pipeline' && (
                <div className="light-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, fontFamily: 'Outfit, Inter, sans-serif' }}>Candidate Screening Pipeline</h3>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>Review candidates, advance hiring rounds, or schedule interviews.</p>
                    </div>
                    <button onClick={() => setRecruiterTab('post-job')} className="solid-btn" style={{ padding: '7px 14px', fontSize: '12px' }}>
                      + Post Job
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {applicants.map((cand) => (
                      <div key={cand.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>{cand.studentName}</div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                            {cand.studentDept} &bull; CGPA: <strong>{cand.studentCgpa}</strong> &bull; Backlogs: <strong>{cand.studentBacklogs}</strong> &bull; Applied: {cand.appliedAt}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <select
                            value={cand.status}
                            onChange={(e) => handleUpdateStatus(cand.id, e.target.value as any)}
                            className="light-input"
                            style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '700' }}
                          >
                            <option value="APPLIED">APPLIED</option>
                            <option value="SHORTLISTED">SHORTLISTED</option>
                            <option value="INTERVIEW_SCHEDULED">INTERVIEW SCHEDULED</option>
                            <option value="OFFERED">OFFERED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>

                          <button
                            onClick={() => setScheduleModalApplicant(cand)}
                            className="outline-btn"
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                          >
                            Schedule Interview
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recruiterTab === 'post-job' && (
                <div className="light-card" style={{ padding: '24px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0', fontFamily: 'Outfit, Inter, sans-serif' }}>
                    Create New Campus Drive
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 18px 0' }}>
                    Define compensation, eligibility criteria, and eligible engineering departments.
                  </p>
                  <form onSubmit={handlePostJob} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Job Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Associate Cloud Engineer"
                        value={newJobTitle}
                        onChange={(e) => setNewJobTitle(e.target.value)}
                        className="light-input"
                        style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Job Type</label>
                        <select
                          value={newJobType}
                          onChange={(e) => setNewJobType(e.target.value as any)}
                          className="light-input"
                          style={{ width: '100%', padding: '9px 12px', fontSize: '12px' }}
                        >
                          <option value="FULL_TIME">Full Time</option>
                          <option value="INTERNSHIP">Internship</option>
                          <option value="INTERNSHIP_PPO">Internship + PPO</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Compensation / CTC</label>
                        <input
                          type="text"
                          placeholder="e.g. ₹18 - 24 LPA"
                          value={newJobSalary}
                          onChange={(e) => setNewJobSalary(e.target.value)}
                          className="light-input"
                          style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Minimum CGPA Cutoff</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newJobMinCgpa}
                          onChange={(e) => setNewJobMinCgpa(e.target.value)}
                          className="light-input"
                          style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Max Backlogs Allowed</label>
                        <input
                          type="number"
                          value={newJobMaxBacklogs}
                          onChange={(e) => setNewJobMaxBacklogs(e.target.value)}
                          className="light-input"
                          style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Bengaluru, KA"
                        value={newJobLocation}
                        onChange={(e) => setNewJobLocation(e.target.value)}
                        className="light-input"
                        style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Eligible Departments</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['CSE', 'ISE', 'ECE', 'MECH'].map((dept) => {
                          const isSel = selectedBranches.includes(dept)
                          return (
                            <button
                              key={dept}
                              type="button"
                              onClick={() => {
                                if (isSel) {
                                  setSelectedBranches(selectedBranches.filter((d) => d !== dept))
                                } else {
                                  setSelectedBranches([...selectedBranches, dept])
                                }
                              }}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                backgroundColor: isSel ? '#0F172A' : '#FFFFFF',
                                color: isSel ? '#FFFFFF' : '#0F172A',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              {dept}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Job Description</label>
                      <textarea
                        rows={3}
                        placeholder="Describe key responsibilities and expectations..."
                        value={newJobDescription}
                        onChange={(e) => setNewJobDescription(e.target.value)}
                        className="light-input"
                        style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
                      />
                    </div>
                    <button type="submit" className="solid-btn" style={{ padding: '10px', fontSize: '13px', marginTop: '6px' }}>
                      Publish Job Opening
                    </button>
                  </form>
                </div>
              )}

              {recruiterTab === 'schedule' && (
                <div className="light-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, fontFamily: 'Outfit, Inter, sans-serif' }}>Scheduled Candidate Interviews</h3>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>Manage upcoming technical evaluation calls.</p>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                      {interviews.length} scheduled
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {interviews.map((iv) => (
                      <div key={iv.id} style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                            {iv.studentName} &bull; {iv.roundName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                            {iv.company} &bull; {iv.date} ({iv.mode})
                          </div>
                          <div style={{ fontSize: '11px', color: '#334155', marginTop: '2px' }}>
                            Link: <a href={`https://${iv.linkOrLocation.replace('https://', '')}`} target="_blank" rel="noreferrer" style={{ color: '#0F172A', fontWeight: '600' }}>{iv.linkOrLocation}</a>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#16A34A', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '4px 10px', borderRadius: '6px' }}>
                            CONFIRMED
                          </span>
                          <button
                            onClick={() => {
                              setInterviews(interviews.filter((i) => i.id !== iv.id))
                              showToast('Interview schedule removed.')
                            }}
                            className="outline-btn"
                            style={{ padding: '4px 8px', fontSize: '11px', color: '#64748B' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              C. ADMIN ROUTE CONTENT
             ========================================================= */}
          {currentUser.role === 'ADMIN' && (
            <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {adminTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    {[
                      { label: 'TOTAL PLACED', val: '86.4%', tag: '384 Registered Students', color: '#16A34A' },
                      { label: 'ACTIVE CORPORATES', val: '64 Companies', tag: 'Verified Recruiters', color: '#0F172A' },
                      { label: 'PENDING REVIEWS', val: `${pendingList.length} Items`, tag: 'Action Required', color: '#D97706' },
                      { label: 'AVERAGE CTC', val: '12.8 LPA', tag: 'Campus Benchmark', color: '#0F172A' }
                    ].map((s, i) => (
                      <div key={i} className="light-card" style={{ padding: '18px 20px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B' }}>{s.label}</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: s.color, margin: '4px 0 2px 0', fontFamily: 'Outfit, Inter, sans-serif' }}>
                          {s.val}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{s.tag}</div>
                      </div>
                    ))}
                  </div>

                  <div className="light-card" style={{ padding: '20px 24px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 10px 0', fontFamily: 'Outfit, Inter, sans-serif' }}>
                      Institutional Placement Policy Enforcement
                    </h3>
                    <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                      &bull; <strong>Single Offer Freeze:</strong> Once a student accepts an offer &ge; 15 LPA, access to lower tiers is automatically disabled.<br />
                      &bull; <strong>Pre-Placement Verification:</strong> Recruiter company accreditation and tax documents must be reviewed and approved prior to publishing drives.
                    </p>
                  </div>
                </div>
              )}

              {adminTab === 'approvals' && (
                <div className="light-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0', fontFamily: 'Outfit, Inter, sans-serif' }}>
                    Placement Cell Approval Queue
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0' }}>
                    Verify corporate accreditation and incoming job post submissions.
                  </p>
                  {pendingList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748B', fontSize: '13px' }}>
                      All pending items have been reviewed!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {pendingList.map((item) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <span style={{ fontSize: '10px', fontWeight: '700', color: '#0F172A', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '2px 6px', borderRadius: '4px' }}>
                              PENDING {item.type}
                            </span>
                            <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '4px', color: '#0F172A' }}>{item.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>{item.subtitle} &bull; {item.submittedBy} &bull; {item.date}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleAdminApprove(item.id, item.type === 'JOB')} className="solid-btn" style={{ padding: '6px 14px', fontSize: '12px' }}>
                              Approve
                            </button>
                            <button onClick={() => handleAdminReject(item.id, item.type === 'JOB')} className="outline-btn" style={{ padding: '6px 14px', fontSize: '12px' }}>
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
                <div className="light-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, fontFamily: 'Outfit, Inter, sans-serif' }}>Verified Student Academic Registry</h3>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>Audit student CGPA, backlogs, and academic credentials.</p>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                      {studentsAudit.length} candidates
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {studentsAudit.map((st) => (
                      <div key={st.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '12px', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <strong style={{ color: '#0F172A' }}>{st.name}</strong> ({st.usn}) &bull; {st.dept}
                          <div style={{ color: '#64748B', marginTop: '2px' }}>
                            CGPA: <strong style={{ color: '#0F172A' }}>{st.cgpa}</strong> &bull; Backlogs: <strong style={{ color: '#0F172A' }}>{st.backlogs}</strong>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: st.isVerified ? '#16A34A' : '#D97706', fontWeight: '700' }}>
                            {st.isVerified ? 'VERIFIED' : 'PENDING'}
                          </span>
                          <button
                            onClick={() => handleToggleAudit(st.id)}
                            className="outline-btn"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                          >
                            {st.isVerified ? 'Revoke' : 'Verify'}
                          </button>
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

      {/* ─────────────────────────────────────────────────────────────
          SCHEDULE INTERVIEW MODAL
         ───────────────────────────────────────────────────────────── */}
      {scheduleModalApplicant && (
        <div className="modal-overlay" onClick={() => setScheduleModalApplicant(null)}>
          <div className="light-card" style={{ width: '100%', maxWidth: '440px', padding: '24px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0', fontFamily: 'Outfit, Inter, sans-serif' }}>
              Schedule Candidate Interview
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0' }}>
              Candidate: <strong>{scheduleModalApplicant.studentName}</strong> ({scheduleModalApplicant.studentDept})
            </p>

            <form onSubmit={handleConfirmSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Interview Round</label>
                <input
                  type="text"
                  required
                  value={interviewRoundName}
                  onChange={(e) => setInterviewRoundName(e.target.value)}
                  className="light-input"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Date &amp; Time</label>
                <input
                  type="datetime-local"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="light-input"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Meeting Link / Room</label>
                <input
                  type="text"
                  required
                  value={interviewLink}
                  onChange={(e) => setInterviewLink(e.target.value)}
                  className="light-input"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setScheduleModalApplicant(null)}
                  className="outline-btn"
                  style={{ padding: '8px 14px', fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="solid-btn"
                  style={{ padding: '8px 16px', fontSize: '12px' }}
                >
                  Confirm &amp; Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
