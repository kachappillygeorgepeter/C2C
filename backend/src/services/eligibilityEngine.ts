import { prisma } from '../lib/prisma'

export interface EligibilityCheck {
  criterion: string
  required: unknown
  actual: unknown
  passed: boolean
}

export interface EligibilityResult {
  eligible: boolean
  checks: EligibilityCheck[]
  reasons: string[]
}

export class EligibilityService {
  async evaluate(studentUserId: string, jobPostingId: string): Promise<EligibilityResult> {
    const checks: EligibilityCheck[] = []
    const reasons: string[] = []

    const student = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
      include: { skills: { include: { skill: true } } }
    })

    if (!student) {
      return {
        eligible: false,
        checks: [{ criterion: 'Profile Exists', required: true, actual: false, passed: false }],
        reasons: ['Student profile not found. Please complete profile setup.']
      }
    }

    const job = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
      include: {
        eligibility: true,
        company: true,
        skills: { include: { skill: true } }
      }
    })

    if (!job) {
      return {
        eligible: false,
        checks: [{ criterion: 'Job Exists', required: true, actual: false, passed: false }],
        reasons: ['Job posting not found.']
      }
    }

    // 1. Company Approval
    const companyApproved = job.company.status === 'APPROVED'
    checks.push({
      criterion: 'Company Approval',
      required: 'APPROVED',
      actual: job.company.status,
      passed: companyApproved
    })
    if (!companyApproved) reasons.push('Company is not approved for recruitment')

    // 2. Job Status
    const jobPublished = job.status === 'PUBLISHED'
    checks.push({
      criterion: 'Job Status',
      required: 'PUBLISHED',
      actual: job.status,
      passed: jobPublished
    })
    if (!jobPublished) reasons.push('This job is not currently open for applications')

    // 3. Deadline Check
    const now = new Date()
    const deadlinePassed = new Date(job.deadline) < now
    checks.push({
      criterion: 'Application Deadline',
      required: 'Active',
      actual: new Date(job.deadline).toISOString().split('T')[0],
      passed: !deadlinePassed
    })
    if (deadlinePassed) {
      reasons.push(`Application deadline has passed (${new Date(job.deadline).toISOString().split('T')[0]})`)
    }

    // 4. Profile Completeness (>= 70%)
    const profileOk = student.completionPct >= 70
    checks.push({
      criterion: 'Profile Completeness',
      required: '≥70%',
      actual: `${student.completionPct}%`,
      passed: profileOk
    })
    if (!profileOk) {
      reasons.push(`Your profile is only ${student.completionPct}% complete. Minimum 70% required.`)
    }

    // 5. Duplicate Application Check
    const existing = await prisma.application.findUnique({
      where: {
        studentId_jobPostingId: {
          studentId: student.id,
          jobPostingId: job.id
        }
      }
    })
    const notDuplicate = !existing
    checks.push({
      criterion: 'Not Already Applied',
      required: true,
      actual: !existing,
      passed: notDuplicate
    })
    if (!notDuplicate) reasons.push('You have already applied to this position')

    // 6. Eligibility Criteria
    const eligibility = job.eligibility
    if (eligibility) {
      // Min CGPA
      if (eligibility.minCgpa !== null && eligibility.minCgpa !== undefined) {
        const studentCgpa = student.cgpa ?? 0
        const cgpaOk = studentCgpa >= eligibility.minCgpa
        checks.push({
          criterion: 'CGPA',
          required: `≥ ${eligibility.minCgpa}`,
          actual: student.cgpa ?? 'N/A',
          passed: cgpaOk
        })
        if (!cgpaOk) {
          reasons.push(`Your CGPA (${student.cgpa ?? 'N/A'}) is below the minimum required (${eligibility.minCgpa})`)
        }
      }

      // Allowed Departments/Branches
      if (eligibility.allowedDepts && eligibility.allowedDepts.length > 0) {
        const deptOk = student.branch ? eligibility.allowedDepts.includes(student.branch) : false
        checks.push({
          criterion: 'Department/Branch',
          required: eligibility.allowedDepts.join(', '),
          actual: student.branch ?? 'N/A',
          passed: deptOk
        })
        if (!deptOk) {
          reasons.push(`Your department (${student.branch ?? 'N/A'}) is not eligible for this posting`)
        }
      }

      // Allowed Graduation Years
      if (eligibility.allowedGradYears && eligibility.allowedGradYears.length > 0) {
        const gradYearOk = student.graduationYear
          ? eligibility.allowedGradYears.includes(student.graduationYear)
          : false
        checks.push({
          criterion: 'Graduation Year',
          required: eligibility.allowedGradYears.join(', '),
          actual: student.graduationYear ?? 'N/A',
          passed: gradYearOk
        })
        if (!gradYearOk) {
          reasons.push(`Your graduation year (${student.graduationYear ?? 'N/A'}) is not eligible for this position`)
        }
      }

      // Maximum Active Backlogs
      if (eligibility.maxBacklogs !== null && eligibility.maxBacklogs !== undefined) {
        const backlogOk = student.activeBacklogs <= eligibility.maxBacklogs
        checks.push({
          criterion: 'Active Backlogs',
          required: `≤ ${eligibility.maxBacklogs}`,
          actual: student.activeBacklogs,
          passed: backlogOk
        })
        if (!backlogOk) {
          reasons.push(`You have ${student.activeBacklogs} active backlogs; maximum allowed is ${eligibility.maxBacklogs}`)
        }
      }

      // Required Skills Matching
      if (eligibility.requiredSkills && eligibility.requiredSkills.length > 0) {
        const studentSkillNames = new Set(
          student.skills.map((s) => s.skill.name.trim().toLowerCase())
        )
        const missingSkills = eligibility.requiredSkills.filter(
          (req) => !studentSkillNames.has(req.trim().toLowerCase())
        )
        const skillsOk = missingSkills.length === 0
        checks.push({
          criterion: 'Required Skills',
          required: eligibility.requiredSkills.join(', '),
          actual: student.skills.map((s) => s.skill.name).join(', ') || 'None',
          passed: skillsOk
        })
        if (!skillsOk) {
          reasons.push(`Missing required skills: ${missingSkills.join(', ')}`)
        }
      }
    }

    const eligible = checks.every((c) => c.passed)
    return { eligible, checks, reasons }
  }
}

export const eligibilityService = new EligibilityService()
