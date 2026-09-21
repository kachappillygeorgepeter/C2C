# 08 — Workflows & State Machines

## 1. Company Registration & Approval Workflow

```
Recruiter Registers
       │
       ▼
 Company Created
 status: PENDING
       │
       ▼
Recruiter fills profile
+ uploads verification docs
       │
       ▼
"Submit for Review"
 status: PENDING ──────────────► Admin sees in Approval Center
                                          │
                             ┌────────────┴────────────┐
                             ▼                         ▼
                         APPROVED                  REJECTED
                             │                         │
                    Recruiter notified         Recruiter notified
                    Can now create jobs        Sees reason in portal
                             │                         │
                             │                  Can edit + resubmit
                             ▼
                     Jobs become possible

Note: APPROVED company can be SUSPENDED by admin (blocks new jobs + hides existing)
```

---

## 2. Job Posting Approval Workflow

```
Recruiter Creates Job
 status: DRAFT
       │
  (Can edit freely)
       │
"Submit for Approval"
 status: PENDING_APPROVAL ─────► Admin sees in Job Approvals tab
                                          │
                             ┌────────────┴────────────┐
                             ▼                         ▼
                         APPROVED                  REJECTED
                             │                         │
                    status: APPROVED          Recruiter notified
                    Recruiter can now         Sees admin note
                    "Publish"                 Can edit + resubmit
                             │
                             ▼
                         PUBLISHED ──────────────────────► Students see it
                             │
                      (deadline passes)
                             │
                             ▼
                          EXPIRED  (auto-transition via cron or on-read check)
                             │
                   OR Recruiter closes early
                             ▼
                          CLOSED
```

**Validation rules:**
- Cannot submit a DRAFT with missing required fields
- Cannot publish if deadline is in the past
- Cannot resubmit APPROVED job (must close and create new)

---

## 3. Application Lifecycle

```
Student Applies
       │
  Server eligibility check runs
       │
  ┌────┴─────────────────────┐
  │ Ineligible               │ Eligible
  ▼                          ▼
422 Rejected          Application created
                       status: APPLIED
                            │
                    Recruiter reviews
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
         UNDER_REVIEW                REJECTED
               │
    ┌──────────┴────────────┐
    ▼                       ▼
SHORTLISTED             REJECTED
    │
INTERVIEW_SCHEDULED
    │
 ┌──┴──┐
 ▼     ▼
SELECTED  REJECTED
```

**Student can:**
- Withdraw (APPLIED or UNDER_REVIEW only)
- Withdrawal creates a history entry with reason

**Forbidden transitions enforced server-side:**
```ts
const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED:              ['UNDER_REVIEW', 'REJECTED'],
  UNDER_REVIEW:         ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED:          ['INTERVIEW_SCHEDULED', 'REJECTED'],
  INTERVIEW_SCHEDULED:  ['SELECTED', 'REJECTED'],
  SELECTED:             [],  // terminal
  REJECTED:             [],  // terminal (no admin override in standard flow)
  WITHDRAWN:            []   // terminal
}
```

---

## 4. Status Change Handler

Every status change goes through one service function:

```ts
// server/src/services/application.service.ts

export const transitionStatus = async (
  applicationId: string,
  newStatus: ApplicationStatus,
  actorId: string,
  note?: string
): Promise<Application> => {

  const app = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId }
  })

  const allowed = VALID_TRANSITIONS[app.status]
  if (!allowed.includes(newStatus)) {
    throw new AppError(
      400,
      `Invalid status transition: ${app.status} → ${newStatus}`,
      'INVALID_TRANSITION'
    )
  }

  const updated = await prisma.$transaction(async tx => {
    const updatedApp = await tx.application.update({
      where: { id: applicationId },
      data: { status: newStatus, updatedAt: new Date() }
    })

    await tx.applicationStatusHistory.create({
      data: {
        applicationId,
        previousStatus: app.status,
        newStatus,
        changedById: actorId,
        note
      }
    })

    return updatedApp
  })

  // Audit log
  await auditService.log({
    userId: actorId,
    action: 'APPLICATION_STATUS_CHANGED',
    entity: 'Application',
    entityId: applicationId,
    oldValue: { status: app.status },
    newValue: { status: newStatus }
  })

  // Notification to student
  await notificationService.notifyStatusChanged(
    app.studentId,
    applicationId,
    newStatus,
    note
  )

  return updated
}
```

---

## 5. Interview Scheduling Flow

```
Recruiter shortlists a candidate
           │
  "Schedule Interview" button
           │
   Modal: round, date, time, mode, link, notes
           │
  POST /recruiters/applicants/:appId/interview
           │
  ┌────────┴────────────────────────────────────┐
  │                                             │
  Create Interview record              Update Application
  in Interview table                   status → INTERVIEW_SCHEDULED
  │                                             │
  └────────┬────────────────────────────────────┘
           │
  Notification sent to student:
  "Interview Scheduled: Technical Round
   June 28 · 10:30 AM · Online
   [Join Link]"
           │
  Student sees in:
  - Dashboard → Upcoming Interviews
  - Application Detail → Timeline
  - Notifications panel
```

---

## 6. Notification Service Architecture

```ts
// server/src/services/notification.service.ts

// Abstraction — business logic calls this, not the providers
export class NotificationService {
  constructor(
    private inApp: InAppNotificationProvider,
    private email: EmailProvider           // pluggable
  ) {}

  async notifyStatusChanged(
    studentUserId: string,
    applicationId: string,
    newStatus: ApplicationStatus,
    note?: string
  ) {
    const title = STATUS_TITLES[newStatus]
    const message = note ?? STATUS_DEFAULT_MESSAGES[newStatus]

    await this.inApp.send({
      userId: studentUserId,
      type: 'STATUS_CHANGED',
      title,
      message,
      link: `/student/applications/${applicationId}`
    })

    // Email: fire-and-forget, do not block API response
    this.email.sendAsync({
      to: studentUserId,       // service resolves to email address
      template: 'STATUS_CHANGED',
      data: { status: newStatus, note }
    }).catch(err => console.error('Email send failed:', err))
  }

  // Other methods: notifyInterviewScheduled, notifyDeadlineApproaching,
  //                notifyCompanyApproved, notifyNewApplicant, etc.
}

// Email provider interface — swap Resend/SendGrid/SES without changing callers
export interface EmailProvider {
  sendAsync(opts: { to: string; template: string; data: object }): Promise<void>
}
```

---

## 7. Audit Log

Every admin action creates an audit entry:

```ts
// Actions tracked:
COMPANY_SUBMITTED
COMPANY_APPROVED
COMPANY_REJECTED
COMPANY_SUSPENDED
JOB_SUBMITTED
JOB_APPROVED
JOB_REJECTED
JOB_PUBLISHED
JOB_CLOSED
APPLICATION_SUBMITTED
APPLICATION_STATUS_CHANGED
APPLICATION_WITHDRAWN
INTERVIEW_SCHEDULED
USER_SUSPENDED
ANNOUNCEMENT_CREATED
```

Stored fields:
- `userId` — who performed the action
- `action` — enum from above
- `entity` — "Company", "JobPosting", "Application", "User"
- `entityId` — the affected record's ID
- `oldValue` / `newValue` — JSON diff
- `ipAddress` — from request headers
- `createdAt` — timestamp

---

## 8. Profile Completion Recalculation

Recalculated server-side on every profile update:

```ts
export const calculateCompletion = (profile: StudentProfile & { skills: any[], projects: any[] }): number => {
  let score = 0
  if (profile.fullName)       score += 10
  if (profile.phone)          score += 5
  if (profile.departmentId)   score += 10
  if (profile.cgpa !== null)  score += 10
  if (profile.graduationYear) score += 10
  if (profile.resumeUrl)      score += 15
  if (profile.linkedinUrl)    score += 5
  if (profile.githubUrl)      score += 5
  if (profile.skills.length >= 3) score += 10
  if (profile.bio)            score += 5
  if (profile.projects.length >= 1) score += 10
  if (profile.certifications?.length >= 1) score += 5
  return Math.min(score, 100)
}
```

Stored in `StudentProfile.completionPct` and checked by eligibility engine at apply time.
