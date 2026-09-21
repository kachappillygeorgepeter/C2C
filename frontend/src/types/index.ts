export type Role = 'STUDENT' | 'RECRUITER' | 'ADMIN'

export type JobType = 'FULL_TIME' | 'INTERNSHIP' | 'INTERNSHIP_PPO' | 'PART_TIME'

export type WorkMode = 'REMOTE' | 'HYBRID' | 'ON_SITE'

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'SELECTED'
  | 'REJECTED'
  | 'WITHDRAWN'

export interface User {
  id: string
  email: string
  role: Role
  isActive: boolean
  studentProfile?: StudentProfile
  recruiterProfile?: RecruiterProfile
}

export interface StudentProfile {
  id: string
  userId: string
  studentId: string
  fullName: string
  phone?: string
  branch?: string
  cgpa?: number
  graduationYear?: number
  semester?: number
  resumeUrl?: string
  portfolioUrl?: string
  githubUrl?: string
  activeBacklogs: number
  totalBacklogs: number
  completionPct: number
  profileComplete: boolean
  skills?: { skill: { name: string } }[]
}

export interface RecruiterProfile {
  id: string
  userId: string
  fullName: string
  designation?: string
  phone?: string
  company?: Company
}

export interface Company {
  id: string
  name: string
  website?: string
  industry?: string
  description?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  headquarters?: string
  companySize?: string
}

export interface EligibilityCriterion {
  criterion: string
  required: any
  actual: any
  passed: boolean
}

export interface EligibilityResult {
  eligible: boolean
  checks: EligibilityCriterion[]
  reasons: string[]
}

export interface JobPosting {
  id: string
  companyId: string
  title: string
  description: string
  responsibilities?: string
  jobType: JobType
  workMode: WorkMode
  city?: string
  state?: string
  country?: string
  salaryMin?: number
  salaryMax?: number
  stipend?: number
  ppoCTC?: number
  openings: number
  deadline: string
  status: string
  createdAt: string
  company: Company
  eligibility?: {
    minCgpa?: number
    maxBacklogs?: number
    allowedDepts: string[]
    allowedGradYears: number[]
    requiredSkills: string[]
  }
  skills?: { skill: { name: string } }[]
  eligibilityResult?: EligibilityResult
}

export interface Application {
  id: string
  studentId: string
  jobPostingId: string
  status: ApplicationStatus
  coverLetter?: string
  resumeSnapshot?: string
  recruiterNote?: string
  appliedAt: string
  jobPosting: JobPosting
  student?: StudentProfile
  interviews?: Interview[]
  history?: {
    id: string
    previousStatus: ApplicationStatus | null
    newStatus: ApplicationStatus
    note?: string
    changedAt: string
  }[]
}

export interface Interview {
  id: string
  roundName: string
  scheduledAt: string
  durationMins?: number
  mode: 'ONLINE' | 'IN_PERSON' | 'PHONE'
  meetingLink?: string
  location?: string
  notes?: string
}

export interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
}
