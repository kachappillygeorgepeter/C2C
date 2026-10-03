import React, { useState, useEffect, useMemo, useRef } from 'react'
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

interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
}

interface AdminDashboardMetrics {
  totalStudents: number
  totalRecruiters: number
  totalCompanies: number
  totalJobs: number
  totalApplications: number
  placedStudents: number
  placementRate: number
  avgSalary?: number | null
  highestSalary?: number | null
}

interface AuditLogItem {
  id: string
  action: string
  entityType: string
  entityId: string
  createdAt: string
  user?: {
    name: string
    email: string
    role: string
  }
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
    allowedDepts: ['CSE'],
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
    allowedDepts: ['ISE'],
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
    allowedDepts: ['ECE'],
    description: 'Develop next-generation routing telemetry, SDN fabrics, and resilient enterprise cloud networks.',
    applicantsCount: 65
  },
  {
    id: 'job-4',
    title: 'Cloud Infrastructure & SRE Engineer',
    company: 'Google Cloud India',
    jobType: 'FULL_TIME',
    location: 'Bengaluru / Hyderabad',
    salary: '₹26 - 36 LPA',
    deadline: '2026-11-05',
    openings: 10,
    minCgpa: 8.2,
    maxBacklogs: 0,
    allowedDepts: ['CSE'],
    description: 'Scale planet-scale distributed storage and Kubernetes infrastructure with extreme reliability guarantees.',
    applicantsCount: 54
  },
  {
    id: 'job-5',
    title: 'Quantitative Systems & FinTech Developer',
    company: 'Goldman Sachs',
    jobType: 'INTERNSHIP_PPO',
    location: 'Bengaluru, KA',
    salary: '₹1.25L/mo + 30 LPA PPO',
    deadline: '2026-10-25',
    openings: 6,
    minCgpa: 8.5,
    maxBacklogs: 0,
    allowedDepts: ['ISE'],
    description: 'Engineer ultra-low latency trading algorithms, quantitative risk models, and streaming transaction engines.',
    applicantsCount: 41
  },
  {
    id: 'job-6',
    title: 'Embedded Firmware & Hardware Engineer',
    company: 'Texas Instruments',
    jobType: 'FULL_TIME',
    location: 'Bengaluru, KA',
    salary: '₹18 - 24 LPA',
    deadline: '2026-11-10',
    openings: 14,
    minCgpa: 7.2,
    maxBacklogs: 1,
    allowedDepts: ['ECE'],
    description: 'Architect silicon board bring-up, RTOS driver stacks, and micro-controller peripherals for edge devices.',
    applicantsCount: 38
  },
  {
    id: 'job-7',
    title: 'EV Powertrain & Autonomous Systems Engineer',
    company: 'Tata Motors EV Tech',
    jobType: 'FULL_TIME',
    location: 'Pune / Bengaluru',
    salary: '₹14 - 18 LPA',
    deadline: '2026-11-12',
    openings: 20,
    minCgpa: 7.0,
    maxBacklogs: 1,
    allowedDepts: ['MECH'],
    description: 'Develop regenerative braking, battery thermal dynamics, and CAN-bus telemetry for next-gen electric vehicles.',
    applicantsCount: 49
  },
  {
    id: 'job-8',
    title: 'Distributed Database Systems Intern',
    company: 'Oracle Cloud Infrastructure',
    jobType: 'INTERNSHIP',
    location: 'Hyderabad, TS',
    salary: '₹95,000/mo Internship',
    deadline: '2026-11-15',
    openings: 12,
    minCgpa: 7.5,
    maxBacklogs: 0,
    allowedDepts: ['ISE'],
    description: 'Contribute to distributed query optimizers, transaction consensus protocols, and NVMe-backed storage engines.',
    applicantsCount: 29
  },
  {
    id: 'job-9',
    title: 'Industrial Automation & Robotics Specialist',
    company: 'Siemens Digital Industries',
    jobType: 'FULL_TIME',
    location: 'Bengaluru, KA',
    salary: '₹15 - 21 LPA',
    deadline: '2026-11-20',
    openings: 10,
    minCgpa: 7.0,
    maxBacklogs: 0,
    allowedDepts: ['MECH'],
    description: 'Build industrial cyber-physical automation frameworks, digital twins, and PLC telemetry communication meshes.',
    applicantsCount: 23
  },
  {
    id: 'job-10',
    title: 'Applied Generative Media & Vision Engineer',
    company: 'Adobe Systems',
    jobType: 'FULL_TIME',
    location: 'Bengaluru / Noida',
    salary: '₹24 - 34 LPA',
    deadline: '2026-11-25',
    openings: 8,
    minCgpa: 8.0,
    maxBacklogs: 0,
    allowedDepts: ['CSE'],
    description: 'Develop real-time neural rendering pipelines, diffusion models, and next-generation creative cloud web apps.',
    applicantsCount: 67
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
  const [adminTab, setAdminTab] = useState<'overview' | 'approvals' | 'students-audit' | 'audit-logs'>('overview')

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
  const [adminMetrics, setAdminMetrics] = useState<AdminDashboardMetrics | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([])
  const [applicationIdMap, setApplicationIdMap] = useState<Record<string, string>>({}) // jobId -> backend application.id
  
  // Notification State
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const toastTimerRef = useRef<any>(null)

  // Banner / Toast helper
  const showToast = (msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }
    setToastMessage(msg)
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null)
      toastTimerRef.current = null
    }, 3500)
  }

  // Attempt to fetch real jobs & applications from backend on initial mount
  useEffect(() => {
    let isMounted = true
    async function fetchBackendData() {
      if (!currentUser) return

      // 1. Fetch user notifications for all roles
      try {
        const notifRes = await apiFetch<any[]>('/notifications')
        if (isMounted && notifRes.success && notifRes.data) {
          setNotifications(notifRes.data.map((n: any) => ({
            id: n.id,
            type: n.type || 'SYSTEM',
            title: n.title,
            message: n.message,
            link: n.link,
            isRead: n.isRead,
            createdAt: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent'
          })))
        }
      } catch (err) {
        console.warn('Notifications fetch fallback:', err)
      }

      // 2. Role-specific backend data fetching
      if (currentUser.role === 'STUDENT') {
        // Fetch opportunities
        const res = await apiFetch<any[]>('/students/opportunities')
        if (isMounted && res.success && res.data && res.data.length > 0) {
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

        // Fetch student profile (to sync studentCgpa, studentBacklogs, studentDept)
        const profileRes = await apiFetch<any>('/students/profile')
        if (isMounted && profileRes.success && profileRes.data) {
          if (profileRes.data.cgpa != null) setStudentCgpa(profileRes.data.cgpa)
          if (profileRes.data.activeBacklogs != null) setStudentBacklogs(profileRes.data.activeBacklogs)
          if (profileRes.data.department?.code) setStudentDept(profileRes.data.department.code)
        }

        // Fetch student applications
        const appsRes = await apiFetch<any[]>('/students/applications')
        if (isMounted && appsRes.success && appsRes.data && appsRes.data.length > 0) {
          const jobIds = appsRes.data.map((a: any) => a.jobId)
          setAppliedJobs(jobIds)
          const idMap: Record<string, string> = {}
          appsRes.data.forEach((a: any) => {
            idMap[a.jobId] = a.id
          })
          setApplicationIdMap(idMap)
        }
      } else if (currentUser.role === 'RECRUITER') {
        // Fetch recruiter jobs
        const jobsRes = await apiFetch<any[]>('/recruiters/jobs')
        if (isMounted && jobsRes.success && jobsRes.data && jobsRes.data.length > 0) {
          const mappedJobs: JobItem[] = jobsRes.data.map((j: any) => ({
            id: j.id,
            title: j.title,
            company: j.company?.name || (currentUser.name.includes('(') ? currentUser.name.split('(')[1].replace(')', '') : 'Enterprise Partner'),
            jobType: j.jobType || 'FULL_TIME',
            location: j.city ? `${j.city}, ${j.country || 'India'}` : 'Bengaluru, KA',
            salary: j.salaryMin && j.salaryMax ? `₹${j.salaryMin} - ${j.salaryMax} LPA` : (j.salaryMin ? `₹${j.salaryMin} LPA` : '₹18 - 24 LPA'),
            deadline: j.deadline ? new Date(j.deadline).toISOString().split('T')[0] : '2026-11-30',
            openings: j.openings || 5,
            minCgpa: j.eligibility?.minCgpa ?? 7.0,
            maxBacklogs: j.eligibility?.maxBacklogs ?? 0,
            allowedDepts: j.eligibility?.allowedDepts?.length ? j.eligibility.allowedDepts : ['CSE', 'ISE'],
            description: j.description || '',
            applicantsCount: j._count?.applications || 0
          }))
          setJobs(mappedJobs)

          // Fetch applications for recruiter's first job if available
          const firstJobId = jobsRes.data[0]?.id
          if (firstJobId) {
            const appsRes = await apiFetch<any[]>(`/recruiters/jobs/${firstJobId}/applications`)
            if (isMounted && appsRes.success && appsRes.data && appsRes.data.length > 0) {
              const mappedApps: ApplicationItem[] = appsRes.data.map((a: any) => ({
                id: a.id,
                jobId: a.jobId,
                studentName: a.student?.user?.name || 'Applicant',
                studentDept: a.student?.department?.code || 'CSE',
                studentCgpa: a.student?.cgpa || 8.0,
                studentBacklogs: a.student?.activeBacklogs || 0,
                appliedAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Recent',
                status: a.status || 'APPLIED'
              }))
              setApplicants(mappedApps)
            }
          }
        }
      } else if (currentUser.role === 'ADMIN') {
        // Fetch dashboard metrics
        const dashRes = await apiFetch<AdminDashboardMetrics>('/admin/dashboard')
        if (isMounted && dashRes.success && dashRes.data) {
          setAdminMetrics(dashRes.data)
        }

        // Fetch pending companies
        const penCompRes = await apiFetch<any[]>('/admin/companies/pending')
        const penJobsRes = await apiFetch<any[]>('/admin/jobs/pending')
        if (isMounted) {
          const list: PendingReview[] = []
          if (penCompRes.success && penCompRes.data) {
            penCompRes.data.forEach((c: any) => {
              list.push({
                id: c.id,
                type: 'COMPANY',
                name: c.name,
                subtitle: c.industry || 'Corporate Partner',
                submittedBy: c.website || 'External Submission',
                status: 'PENDING',
                date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent'
              })
            })
          }
          if (penJobsRes.success && penJobsRes.data) {
            penJobsRes.data.forEach((j: any) => {
              list.push({
                id: j.id,
                type: 'JOB',
                name: j.title,
                subtitle: j.company?.name || 'Company Opening',
                submittedBy: j.jobType || 'CAMPUS_DRIVE',
                status: 'PENDING',
                date: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : 'Recent'
              })
            })
          }
          if (list.length > 0) {
            setPendingList(list)
          }
        }

        // Fetch students for audit
        const studentsRes = await apiFetch<any[]>('/admin/students')
        if (isMounted && studentsRes.success && studentsRes.data && studentsRes.data.length > 0) {
          const mappedAudit: StudentAuditItem[] = studentsRes.data.map((s: any) => ({
            id: s.id,
            name: s.user?.name || 'Student',
            usn: s.usn || 'N/A',
            dept: s.department?.code || 'CSE',
            cgpa: s.cgpa || 0,
            backlogs: s.activeBacklogs || 0,
            isVerified: s.cgpa != null
          }))
          setStudentsAudit(mappedAudit)
        }

        // Fetch audit logs
        const logsRes = await apiFetch<AuditLogItem[]>('/admin/audit-logs')
        if (isMounted && logsRes.success && logsRes.data) {
          setAuditLogs(logsRes.data)
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

  // Sign out handler - Full browser navigation to '/'
  const handleSignOut = () => {
    setCurrentUser(null)
    tokenStorage.remove()
    tokenStorage.removeUser()
    setMobileMenuOpen(false)
    window.location.href = '/'
  }

  // Notification handlers
  const handleMarkAsRead = async (notifId: string) => {
    setNotifications(notifications.map(n => n.id === notifId ? { ...n, isRead: true } : n))
    await apiFetch(`/notifications/${notifId}/read`, { method: 'PATCH' })
  }

  const handleMarkAllRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    await apiFetch('/notifications/read-all', { method: 'PATCH' })
    showToast('All notifications marked as read.')
  }

  // Save student profile parameters to backend
  const handleSaveStudentProfile = async () => {
    setIsSavingProfile(true)
    const res = await apiFetch('/students/profile', {
      method: 'PUT',
      body: JSON.stringify({
        cgpa: studentCgpa,
        activeBacklogs: studentBacklogs
      })
    })
    setIsSavingProfile(false)
    if (res.success) {
      showToast('Profile parameters saved & synced with placement registry!')
    } else {
      showToast('Profile updated in simulator mode.')
    }
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
    const res = await apiFetch<any>(`/students/opportunities/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ coverLetter: 'Interested in this opening' })
    })

    if (res.success && res.data?.id) {
      setApplicationIdMap(prev => ({ ...prev, [jobId]: res.data.id }))
    }

    setAppliedJobs([...appliedJobs, jobId])
    setJobs(jobs.map((j) => (j.id === jobId ? { ...j, applicantsCount: j.applicantsCount + 1 } : j)))
    showToast('Application successfully submitted!')
  }

  // Student Withdraw Application
  const handleWithdrawApplication = async (jobId: string) => {
    setAppliedJobs(appliedJobs.filter((id) => id !== jobId))
    const appId = applicationIdMap[jobId] || jobId
    await apiFetch(`/students/applications/${appId}/withdraw`, {
      method: 'POST'
    })
    showToast('Application withdrawn.')
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
  const handleConfirmSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scheduleModalApplicant) return

    const matchedJob = jobs.find((j) => j.id === scheduleModalApplicant.jobId)
    const assignedJobTitle = matchedJob ? matchedJob.title : 'Software Development Engineer'
    const assignedCompany = matchedJob ? matchedJob.company : (currentUser.name.includes('(') ? currentUser.name.split('(')[1].replace(')', '') : 'Enterprise Partner')

    const newInterview: InterviewItem = {
      id: `int-${Date.now()}`,
      studentName: scheduleModalApplicant.studentName,
      jobTitle: assignedJobTitle,
      company: assignedCompany,
      roundName: interviewRoundName,
      date: interviewDate.replace('T', ' '),
      mode: 'ONLINE',
      linkOrLocation: interviewLink
    }

    // Call backend schedule interview endpoint
    await apiFetch(`/recruiters/applications/${scheduleModalApplicant.id}/interview`, {
      method: 'POST',
      body: JSON.stringify({
        roundName: interviewRoundName,
        scheduledAt: new Date(interviewDate).toISOString(),
        mode: 'ONLINE',
        meetingLink: interviewLink
      })
    })

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
  const handleToggleAudit = async (studentId: string) => {
    const student = studentsAudit.find((st) => st.id === studentId)
    const nextVerified = student ? !student.isVerified : true

    setStudentsAudit(
      studentsAudit.map((st) => (st.id === studentId ? { ...st, isVerified: nextVerified } : st))
    )

    // Call backend verify endpoint
    if (student) {
      await apiFetch(`/admin/students/${studentId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({
          cgpa: student.cgpa,
          activeBacklogs: student.backlogs
        })
      })
    }
    showToast('Student academic verification status updated.')
  }

  // Department availability counts for Course / Branch selection
  const deptJobCounts = useMemo(() => {
    return {
      ALL: jobs.length,
      CSE: jobs.filter(j => j.allowedDepts.includes('CSE')).length,
      ISE: jobs.filter(j => j.allowedDepts.includes('ISE')).length,
      ECE: jobs.filter(j => j.allowedDepts.includes('ECE')).length,
      MECH: jobs.filter(j => j.allowedDepts.includes('MECH')).length
    }
  }, [jobs])

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
        * { box-sizing: border-box; }
        
        .light-card {
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02);
          transition: border-color 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .light-card-interactive {
          cursor: pointer;
        }
        .light-card-interactive:hover {
          border-color: #CBD5E1;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.03);
          transform: translateY(-1px);
        }
        
        .solid-btn {
          background-color: #0F172A;
          color: #FFFFFF;
          border: 1px solid #0F172A;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.12);
          transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.12s ease, opacity 0.15s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .solid-btn:hover:not(:disabled) {
          background-color: #1E293B;
          border-color: #1E293B;
          box-shadow: 0 3px 8px rgba(15, 23, 42, 0.18);
          transform: translateY(-1px);
        }
        .solid-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.15);
        }
        .solid-btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #0F172A;
        }
        .solid-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }
        
        .outline-btn {
          background-color: #FFFFFF;
          color: #0F172A;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
          transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, transform 0.12s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .outline-btn:hover:not(:disabled) {
          background-color: #F8FAFC;
          border-color: #94A3B8;
          color: #0F172A;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.06);
          transform: translateY(-1px);
        }
        .outline-btn:active:not(:disabled) {
          transform: translateY(0);
          background-color: #F1F5F9;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
        }
        .outline-btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #64748B;
        }
        .outline-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }
        
        .light-input {
          background-color: #FFFFFF;
          border: 1px solid #CBD5E1;
          color: #0F172A;
          outline: none;
          border-radius: 8px;
          font-family: inherit;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02) inset;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
        }
        .light-input:hover {
          border-color: #94A3B8;
        }
        .light-input:focus {
          border-color: #0F172A;
          box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08);
        }
        
        /* Modal Backdrop & Dialog Container */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 16px;
          animation: modalFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-dialog-panel {
          box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1);
          animation: modalScaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes modalScaleUp {
          from { transform: scale(0.97) translateY(8px); }
          to { transform: scale(1) translateY(0); }
        }

        /* Modernized SaaS Sidebar Base & Interactive Hover Expansion */
        .c2c-sidebar {
          background-color: #FFFFFF;
          border-right: 1px solid #E2E8F0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex-shrink: 0;
          z-index: 20;
          overflow-x: hidden;
          overflow-y: auto;
          white-space: nowrap;
          box-shadow: 1px 0 2px rgba(15, 23, 42, 0.02);
          transition: width 0.26s cubic-bezier(0.16, 1, 0.3, 1), padding 0.26s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.26s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .c2c-sidebar-text {
          opacity: 1;
          transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .c2c-nav-item {
          display: flex;
          align-items: center;
          width: 100%;
          border-radius: 9px;
          font-size: 13px;
          border: 1px solid transparent;
          cursor: pointer;
          text-align: left;
          position: relative;
          transition: background-color 0.16s ease, color 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease, transform 0.12s ease;
          gap: 12px;
          padding: 9px 12px;
          user-select: none;
        }

        .c2c-nav-item:hover:not(.c2c-nav-active) {
          background-color: #F8FAFC !important;
          color: #0F172A !important;
          border-color: #E2E8F0;
        }

        .c2c-nav-item:active {
          transform: scale(0.985);
        }

        .c2c-nav-item.c2c-nav-active {
          background-color: #0F172A !important;
          color: #FFFFFF !important;
          border-color: #0F172A;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.16);
        }

        .c2c-nav-item.c2c-nav-active .c2c-nav-icon {
          color: #FFFFFF;
        }

        .c2c-nav-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.16s ease, color 0.16s ease;
        }

        .c2c-nav-item:hover .c2c-nav-icon {
          transform: scale(1.05);
        }

        .c2c-user-card {
          background-color: #F8FAFC;
          border-radius: 12px;
          padding: 12px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
          overflow: hidden;
        }

        .c2c-user-card:hover {
          border-color: #CBD5E1;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05);
        }

        .c2c-brand-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          overflow: hidden;
          padding: 4px;
          border-radius: 10px;
          transition: opacity 0.15s ease;
        }
        .c2c-brand-chip:hover {
          opacity: 0.88;
        }

        .c2c-logo-badge {
          width: 38px;
          height: 38px;
          min-width: 38px;
          border-radius: 10px;
          background-color: #0F172A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 15px;
          color: #FFFFFF;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.2);
          letter-spacing: -0.02em;
        }

        @media (min-width: 769px) {
          .c2c-hamburger-btn {
            display: none !important;
          }
          .c2c-close-btn {
            display: none !important;
          }
          .c2c-sidebar {
            width: 72px;
            padding: 22px 12px;
            transition: width 0.26s cubic-bezier(0.16, 1, 0.3, 1), padding 0.26s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.26s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .c2c-sidebar:hover {
            width: 260px;
            padding: 22px 16px;
            box-shadow: 4px 0 24px rgba(15, 23, 42, 0.07);
          }
          .c2c-sidebar:not(:hover) .c2c-sidebar-text {
            opacity: 0;
            transform: translateX(-6px);
            pointer-events: none;
            display: none;
          }
          .c2c-sidebar:not(:hover) .c2c-sidebar-user-details {
            display: none;
          }
          .c2c-sidebar:not(:hover) .c2c-nav-item {
            justify-content: center;
            padding: 10px 0;
          }
          .c2c-sidebar:not(:hover) .c2c-user-card {
            padding: 8px 6px;
            display: flex;
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .c2c-sidebar {
            position: fixed !important;
            top: 0;
            bottom: 0;
            left: 0;
            width: 264px !important;
            padding: 22px 16px !important;
            z-index: 40 !important;
            transform: translateX(-100%);
            transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 2px 0 16px rgba(15, 23, 42, 0.12);
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
      >
        <div>
          {/* Logo & Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0', marginBottom: '18px' }}>
            <div
              className="c2c-brand-chip"
              title="Return to Home"
              onClick={() => { window.location.href = '/' }}
            >
              <div className="c2c-logo-badge">
                C2C
              </div>
              <div className="c2c-sidebar-text">
                <div style={{ fontWeight: '800', fontSize: '15px', color: '#0F172A', letterSpacing: '-0.02em', fontFamily: 'Outfit, Inter, sans-serif' }}>
                  C2C Portal
                </div>
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
                {
                  id: 'drives',
                  label: `Active Drives (${jobs.length})`,
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                  )
                },
                {
                  id: 'my-applications',
                  label: `My Applications (${appliedJobs.length})`,
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                  )
                },
                {
                  id: 'eligibility',
                  label: 'Eligibility Calculator',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="2" width="16" height="20" rx="2"/>
                      <line x1="8" y1="6" x2="16" y2="6"/>
                      <line x1="16" y1="14" x2="16" y2="14"/>
                      <line x1="8" y1="14" x2="8" y2="14"/>
                      <line x1="12" y1="14" x2="12" y2="14"/>
                      <line x1="8" y1="18" x2="8" y2="18"/>
                      <line x1="12" y1="18" x2="12" y2="18"/>
                      <line x1="16" y1="18" x2="16" y2="18"/>
                    </svg>
                  )
                }
              ].map((tab) => {
                const isActive = studentTab === tab.id
                return (
                  <button
                    key={tab.id}
                    title={tab.label}
                    onClick={() => {
                      setStudentTab(tab.id as any)
                      setMobileMenuOpen(false)
                    }}
                    className={`c2c-nav-item ${isActive ? 'c2c-nav-active' : ''}`}
                    style={{
                      fontWeight: isActive ? '700' : '600',
                      color: isActive ? '#FFFFFF' : '#475569'
                    }}
                  >
                    <span className="c2c-nav-icon">{tab.icon}</span>
                    <span className="c2c-sidebar-text">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          )}

          {/* 2. RECRUITER ROUTER LINKS */}
          {currentUser.role === 'RECRUITER' && (
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                {
                  id: 'pipeline',
                  label: `Applicant Funnel (${applicants.length})`,
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                    </svg>
                  )
                },
                {
                  id: 'post-job',
                  label: '+ Post New Opening',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="16"/>
                      <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                  )
                },
                {
                  id: 'schedule',
                  label: `Interview Schedules (${interviews.length})`,
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  )
                }
              ].map((tab) => {
                const isActive = recruiterTab === tab.id
                return (
                  <button
                    key={tab.id}
                    title={tab.label}
                    onClick={() => {
                      setRecruiterTab(tab.id as any)
                      setMobileMenuOpen(false)
                    }}
                    className={`c2c-nav-item ${isActive ? 'c2c-nav-active' : ''}`}
                    style={{
                      fontWeight: isActive ? '700' : '600',
                      color: isActive ? '#FFFFFF' : '#475569'
                    }}
                  >
                    <span className="c2c-nav-icon">{tab.icon}</span>
                    <span className="c2c-sidebar-text">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          )}

          {/* 3. ADMIN ROUTER LINKS */}
          {currentUser.role === 'ADMIN' && (
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                {
                  id: 'overview',
                  label: 'Placement Cell Overview',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/>
                    </svg>
                  )
                },
                {
                  id: 'approvals',
                  label: `Pending Approvals (${pendingList.length})`,
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  )
                },
                {
                  id: 'students-audit',
                  label: `Student Academic Audit (${studentsAudit.length})`,
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  )
                },
                {
                  id: 'audit-logs',
                  label: `Institutional Audit Logs (${auditLogs.length})`,
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                  )
                }
              ].map((tab) => {
                const isActive = adminTab === tab.id
                return (
                  <button
                    key={tab.id}
                    title={tab.label}
                    onClick={() => {
                      setAdminTab(tab.id as any)
                      setMobileMenuOpen(false)
                    }}
                    className={`c2c-nav-item ${isActive ? 'c2c-nav-active' : ''}`}
                    style={{
                      fontWeight: isActive ? '700' : '600',
                      color: isActive ? '#FFFFFF' : '#475569'
                    }}
                  >
                    <span className="c2c-nav-icon">{tab.icon}</span>
                    <span className="c2c-sidebar-text">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          )}
        </div>

        {/* Current User Snapshot & Sign Out */}
        <div className="c2c-user-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', minWidth: '34px', borderRadius: '50%', backgroundColor: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: 0, boxShadow: '0 1px 3px rgba(15, 23, 42, 0.2)' }}>
              {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
            </div>
            <div className="c2c-sidebar-text c2c-sidebar-user-details" style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{currentUser.name}</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', wordBreak: 'break-all' }}>{currentUser.email}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="outline-btn c2c-sidebar-text"
            title="Sign Out"
            style={{ marginTop: '10px', width: '100%', padding: '7px', fontSize: '11px', fontWeight: '700' }}
          >
            Sign Out
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Notification Bell with Badge */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="outline-btn"
                style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', position: 'relative' }}
                title="Notifications"
                aria-label="View notifications"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#EF4444', color: '#FFFFFF', fontSize: '10px', fontWeight: '800', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFFFFF' }}>
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notificationsOpen && (
                <div
                  className="light-card"
                  style={{ position: 'absolute', right: 0, top: '44px', width: '320px', zIndex: 50, padding: '14px', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)', display: 'flex', flexDirection: 'column', gap: '10px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#0F172A' }}>
                      Notifications ({notifications.filter(n => !n.isRead).length} unread)
                    </div>
                    {notifications.some(n => !n.isRead) && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '11px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
                      No notifications at this time.
                    </div>
                  ) : (
                    <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleMarkAsRead(notif.id)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '6px',
                            backgroundColor: notif.isRead ? '#F8FAFC' : '#EFF6FF',
                            border: `1px solid ${notif.isRead ? '#E2E8F0' : '#BFDBFE'}`,
                            cursor: 'pointer',
                            fontSize: '12px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: '#0F172A' }}>{notif.title}</strong>
                            <span style={{ fontSize: '10px', color: '#64748B' }}>{notif.createdAt}</span>
                          </div>
                          <p style={{ margin: '4px 0 0 0', color: '#475569', fontSize: '11px', lineHeight: 1.4 }}>
                            {notif.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        value={selectedDeptFilter}
                        onChange={(e) => setSelectedDeptFilter(e.target.value)}
                        className="light-input"
                        style={{ padding: '9px 12px', fontSize: '12px', fontWeight: '600' }}
                        aria-label="Filter by course / department"
                      >
                        <option value="ALL">All Departments ({deptJobCounts.ALL} available)</option>
                        <option value="CSE">Computer Science (CSE) ({deptJobCounts.CSE} available)</option>
                        <option value="ISE">Information Science (ISE) ({deptJobCounts.ISE} available)</option>
                        <option value="ECE">Electronics (ECE) ({deptJobCounts.ECE} available)</option>
                        <option value="MECH">Mechanical (MECH) ({deptJobCounts.MECH} available)</option>
                      </select>
                      <span style={{ fontSize: '11px', fontWeight: '700', padding: '6px 10px', borderRadius: '6px', backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>
                        {filteredJobs.length} {filteredJobs.length === 1 ? 'drive' : 'drives'} available
                      </span>
                    </div>
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
                          <div key={job.id} className="light-card light-card-interactive" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                                onClick={() => handleWithdrawApplication(jId)}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0', fontFamily: 'Outfit, Inter, sans-serif' }}>
                        Live Academic Parameter Simulator &amp; Profile Sync
                      </h3>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                        Adjust your profile metrics to preview eligibility across all campus drives in real time.
                      </p>
                    </div>
                    <button
                      onClick={handleSaveStudentProfile}
                      disabled={isSavingProfile}
                      className="solid-btn"
                      style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {isSavingProfile ? 'Saving...' : 'Save & Sync Profile'}
                    </button>
                  </div>
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
                            Link: <a href={iv.linkOrLocation.startsWith('http://') || iv.linkOrLocation.startsWith('https://') ? iv.linkOrLocation : `https://${iv.linkOrLocation}`} target="_blank" rel="noreferrer" style={{ color: '#0F172A', fontWeight: '600' }}>{iv.linkOrLocation}</a>
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
                      {
                        label: 'TOTAL PLACED',
                        val: adminMetrics?.placementRate != null ? `${adminMetrics.placementRate.toFixed(1)}%` : '86.4%',
                        tag: adminMetrics?.placedStudents != null ? `${adminMetrics.placedStudents} / ${adminMetrics.totalStudents} Students` : '384 Registered Students',
                        color: '#16A34A'
                      },
                      {
                        label: 'ACTIVE CORPORATES',
                        val: adminMetrics?.totalCompanies != null ? `${adminMetrics.totalCompanies} Companies` : '64 Companies',
                        tag: adminMetrics?.totalRecruiters != null ? `${adminMetrics.totalRecruiters} Verified Recruiters` : 'Verified Recruiters',
                        color: '#0F172A'
                      },
                      {
                        label: 'PENDING REVIEWS',
                        val: `${pendingList.length} Items`,
                        tag: pendingList.length > 0 ? 'Action Required' : 'All Clear',
                        color: pendingList.length > 0 ? '#D97706' : '#16A34A'
                      },
                      {
                        label: 'AVERAGE CTC',
                        val: adminMetrics?.avgSalary != null ? `₹${adminMetrics.avgSalary} LPA` : '12.8 LPA',
                        tag: adminMetrics?.highestSalary != null ? `Highest: ₹${adminMetrics.highestSalary} LPA` : 'Campus Benchmark',
                        color: '#0F172A'
                      }
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
                      &bull; <strong>Pre-Placement Verification:</strong> Recruiter company accreditation and tax documents must be reviewed and approved prior to publishing drives.<br />
                      &bull; <strong>System Audit Trail:</strong> All administrative verifications, approval overrides, and interview events are logged in the tamper-evident audit ledger.
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

              {adminTab === 'audit-logs' && (
                <div className="light-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, fontFamily: 'Outfit, Inter, sans-serif' }}>Institutional Audit Trail</h3>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>Immutable ledger tracking approvals, reviews, and platform activities.</p>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                      {auditLogs.length} events logged
                    </span>
                  </div>

                  {auditLogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '28px 0', color: '#64748B', fontSize: '13px' }}>
                      No audit events recorded yet. Platform actions will appear here automatically.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {auditLogs.map((log) => (
                        <div
                          key={log.id}
                          style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#F8FAFC',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '12px',
                            flexWrap: 'wrap',
                            gap: '8px'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#0F172A', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px' }}>
                                {log.action}
                              </span>
                              <strong style={{ color: '#0F172A' }}>{log.entityType}</strong>
                              <span style={{ color: '#64748B', fontSize: '11px' }}>ID: {log.entityId}</span>
                            </div>
                            <div style={{ color: '#64748B', marginTop: '3px', fontSize: '11px' }}>
                              Triggered by: <strong style={{ color: '#334155' }}>{log.user?.name || 'System Operator'}</strong> ({log.user?.role || 'SYSTEM'})
                            </div>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Recent'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
          <div className="light-card modal-dialog-panel" style={{ width: '100%', maxWidth: '440px', padding: '24px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
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
