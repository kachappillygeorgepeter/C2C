# 07 — Server-Side Eligibility Engine

> This is one of the most critical components of the system.  
> The backend is the **only** authoritative decision-maker on eligibility.  
> Frontend may display results but never overrides the backend.

---

## When the Engine Runs

The engine is invoked at **every** eligibility-sensitive moment:

1. `GET /students/opportunities/:id/eligibility` — student checks before applying
2. `POST /students/opportunities/:id/apply` — re-verified before application is created
3. Internal re-check if job eligibility criteria are updated by recruiter

---

## Eligibility Checks (in order)

| # | Check | Fail Reason |
|---|-------|-------------|
| 1 | Job exists | `Job not found` |
| 2 | Company is APPROVED | `Company is not approved for recruitment` |
| 3 | Job is PUBLISHED | `This job is not currently open for applications` |
| 4 | Deadline has not passed | `Application deadline has passed (YYYY-MM-DD)` |
| 5 | Student profile is complete (≥ 70%) | `Your profile must be at least 70% complete to apply` |
| 6 | Not already applied | `You have already applied to this position` |
| 7 | CGPA ≥ minimum (if set) | `Your CGPA ({actual}) is below the minimum required ({required})` |
| 8 | Department is in allowed list (if set) | `Your department ({actual}) is not eligible for this posting` |
| 9 | Graduation year is in allowed list (if set) | `Your graduation year ({actual}) is not eligible for this position` |
| 10 | Active backlogs ≤ maximum (if set) | `You have {actual} active backlogs; maximum allowed is {required}` |
| 11 | Required skills match (if configured) | `Missing required skills: {skillList}` |

Checks run in order. **All must pass** for `eligible: true`.

---

## Service Implementation

```ts
// server/src/services/eligibility.service.ts

import { prisma } from '../lib/prisma'
import type { StudentProfile, JobPosting, JobEligibility } from '@prisma/client'

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

  async evaluate(
    studentUserId: string,
    jobPostingId: string
  ): Promise<EligibilityResult> {
    const checks: EligibilityCheck[] = []
    const reasons: string[] = []

    // Fetch student profile
    const student = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
      include: { skills: { include: { skill: true } } }
    })

    if (!student) {
      return this.hardFail('Student profile not found')
    }

    // Fetch job with eligibility and company
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
      include: {
        eligibility: true,
        company: true
      }
    })

    if (!job) {
      return this.hardFail('Job posting not found')
    }

    // ── CHECK 1: Company approved ─────────────────────────
    const companyApproved = job.company.status === 'APPROVED'
    checks.push({
      criterion: 'Company Approval',
      required: 'APPROVED',
      actual: job.company.status,
      passed: companyApproved
    })
    if (!companyApproved) reasons.push('Company is not approved for recruitment')

    // ── CHECK 2: Job published ────────────────────────────
    const jobPublished = job.status === 'PUBLISHED'
    checks.push({
      criterion: 'Job Status',
      required: 'PUBLISHED',
      actual: job.status,
      passed: jobPublished
    })
    if (!jobPublished) reasons.push('This job is not currently open for applications')

    // ── CHECK 3: Deadline ─────────────────────────────────
    const now = new Date()
    const deadlinePassed = job.deadline < now
    checks.push({
      criterion: 'Application Deadline',
      required: 'Not expired',
      actual: job.deadline.toISOString().split('T')[0],
      passed: !deadlinePassed
    })
    if (deadlinePassed) {
      reasons.push(`Application deadline has passed (${job.deadline.toISOString().split('T')[0]})`)
    }

    // ── CHECK 4: Profile completeness ─────────────────────
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

    // ── CHECK 5: Duplicate application ───────────────────
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

    const eligibility = job.eligibility

    if (eligibility) {
      // ── CHECK 6: Minimum CGPA ─────────────────────────
      if (eligibility.minCgpa !== null) {
        const cgpaOk = (student.cgpa ?? 0) >= eligibility.minCgpa
        checks.push({
          criterion: 'CGPA',
          required: eligibility.minCgpa,
          actual: student.cgpa,
          passed: cgpaOk
        })
        if (!cgpaOk) {
          reasons.push(
            `Your CGPA (${student.cgpa ?? 'N/A'}) is below the minimum required (${eligibility.minCgpa})`
          )
        }
      }

      // ── CHECK 7: Department ───────────────────────────
      if (eligibility.allowedDepts.length > 0) {
        const deptOk = student.branch
          ? eligibility.allowedDepts.includes(student.branch)
          : false
        checks.push({
          criterion: 'Department',
          required: eligibility.allowedDepts,
          actual: student.branch,
          passed: deptOk
        })
        if (!deptOk) {
          reasons.push(
            `Your department (${student.branch ?? 'N/A'}) is not eligible for this posting`
          )
        }
      }

      // ── CHECK 8: Graduation Year ──────────────────────
      if (eligibility.allowedGradYears.length > 0) {
        const gradYearOk = student.graduationYear
          ? eligibility.allowedGradYears.includes(student.graduationYear)
          : false
        checks.push({
          criterion: 'Graduation Year',
          required: eligibility.allowedGradYears,
          actual: student.graduationYear,
          passed: gradYearOk
        })
        if (!gradYearOk) {
          reasons.push(
            `Your graduation year (${student.graduationYear ?? 'N/A'}) is not eligible for this position`
          )
        }
      }

      // ── CHECK 9: Backlogs ─────────────────────────────
      if (eligibility.maxBacklogs !== null) {
        const backlogOk = student.activeBacklogs <= eligibility.maxBacklogs
        checks.push({
          criterion: 'Active Backlogs',
          required: `≤ ${eligibility.maxBacklogs}`,
          actual: student.activeBacklogs,
          passed: backlogOk
        })
        if (!backlogOk) {
          reasons.push(
            `You have ${student.activeBacklogs} active backlog(s); maximum allowed is ${eligibility.maxBacklogs}`
          )
        }
      }

      // ── CHECK 10: Required Skills ─────────────────────
      if (eligibility.requiredSkills.length > 0) {
        const studentSkillNames = student.skills.map(s => s.skill.name.toLowerCase())
        const missing = eligibility.requiredSkills.filter(
          req => !studentSkillNames.includes(req.toLowerCase())
        )
        const skillsOk = missing.length === 0
        checks.push({
          criterion: 'Required Skills',
          required: eligibility.requiredSkills,
          actual: studentSkillNames,
          passed: skillsOk
        })
        if (!skillsOk) {
          reasons.push(`Missing required skills: ${missing.join(', ')}`)
        }
      }
    }

    const eligible = reasons.length === 0

    return { eligible, checks, reasons }
  }

  // ─── Used for hard early exits (no student/job found) ──────────────
  private hardFail(message: string): EligibilityResult {
    return {
      eligible: false,
      checks: [],
      reasons: [message]
    }
  }
}

export const eligibilityService = new EligibilityService()
```

---

## Usage in Apply Controller

```ts
// server/src/controllers/student.controller.ts

export const applyToJob = async (req: Request, res: Response) => {
  const { id: jobPostingId } = req.params
  const userId = req.user.id

  // ⚠️ Server re-verifies eligibility regardless of frontend state
  const result = await eligibilityService.evaluate(userId, jobPostingId)

  if (!result.eligible) {
    return res.status(422).json({
      error: 'You are not eligible for this position',
      reasons: result.reasons,
      checks: result.checks
    })
  }

  // Only now create the application
  const student = await prisma.studentProfile.findUnique({ where: { userId } })

  const application = await prisma.$transaction(async tx => {
    const app = await tx.application.create({
      data: {
        studentId: student!.id,
        jobPostingId,
        resumeSnapshot: req.body.resumeUrl ?? student!.resumeUrl,
        coverLetter: req.body.coverLetter,
        status: 'APPLIED'
      }
    })

    // Create first history entry
    await tx.applicationStatusHistory.create({
      data: {
        applicationId: app.id,
        previousStatus: null,
        newStatus: 'APPLIED',
        changedById: userId,
        note: 'Application submitted by student'
      }
    })

    return app
  })

  // Fire notification (non-blocking)
  notificationService.notifyStudentApplicationSubmitted(userId, jobPostingId)
  notificationService.notifyRecruiterNewApplicant(jobPostingId)

  return res.status(201).json({ application })
}
```

---

## UI Display Component (React)

```tsx
// client/src/features/student/components/EligibilityPanel.tsx

const EligibilityPanel = ({ checks, eligible, reasons }: EligibilityResult) => (
  <div className="rounded-lg border p-4 space-y-3">
    <h3 className="font-semibold text-base">Eligibility Check</h3>

    {checks.map(check => (
      <div key={check.criterion} className="flex items-start gap-2">
        {check.passed
          ? <CheckCircle className="text-green-500 mt-0.5 shrink-0" size={16} />
          : <XCircle className="text-red-500 mt-0.5 shrink-0" size={16} />
        }
        <div>
          <span className="font-medium text-sm">{check.criterion}</span>
          {!check.passed && (
            <p className="text-xs text-red-600 mt-0.5">
              Required: {JSON.stringify(check.required)} · Yours: {JSON.stringify(check.actual)}
            </p>
          )}
        </div>
      </div>
    ))}

    {!eligible && (
      <div className="bg-red-50 border border-red-200 rounded p-3 mt-2">
        <p className="text-sm font-medium text-red-700">Application blocked because:</p>
        <ul className="mt-1 list-disc list-inside text-sm text-red-600 space-y-0.5">
          {reasons.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>
    )}

    {eligible && (
      <div className="bg-green-50 border border-green-200 rounded p-3 mt-2">
        <p className="text-sm text-green-700 font-medium">
          ✓ You meet all requirements for this position
        </p>
      </div>
    )}
  </div>
)
```
