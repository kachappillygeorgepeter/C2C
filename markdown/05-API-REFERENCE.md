# 05 — API Reference

## Conventions

- All endpoints prefixed with `/api`
- All requests/responses are `application/json`
- Auth required endpoints need `Authorization: Bearer <accessToken>`
- Pagination: `?page=1&limit=20`
- Sorting: `?sortBy=createdAt&order=desc`

---

## Auth Endpoints

| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| `POST` | `/auth/register` | ❌ | `{ email, password, role, fullName, ...}` | Register new user |
| `POST` | `/auth/login` | ❌ | `{ email, password }` | Login |
| `POST` | `/auth/logout` | ✅ | — | Revoke refresh token |
| `POST` | `/auth/refresh` | Cookie | — | Rotate access token |
| `GET`  | `/auth/me` | ✅ | — | Get current user + profile |

### POST `/auth/register`

Request:
```json
{
  "email": "student@college.edu",
  "password": "SecurePass123!",
  "role": "STUDENT",
  "fullName": "Aryan Mehta",
  "studentId": "CS2021001"   // if STUDENT
}
```

Response `201`:
```json
{
  "user": { "id": "...", "email": "...", "role": "STUDENT" },
  "accessToken": "eyJ...",
  "profile": { "id": "...", "fullName": "Aryan Mehta", "completionPct": 20 }
}
```

---

## Student Endpoints

All require `authenticate + requireStudent`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/students/profile` | Get own profile |
| `PUT`  | `/students/profile` | Update profile |
| `GET`  | `/students/opportunities` | Browse approved+published jobs |
| `GET`  | `/students/opportunities/:id` | Job detail |
| `GET`  | `/students/opportunities/:id/eligibility` | Server eligibility check |
| `POST` | `/students/opportunities/:id/apply` | Submit application |
| `GET`  | `/students/applications` | List own applications |
| `GET`  | `/students/applications/:id` | Application detail + timeline |
| `POST` | `/students/applications/:id/withdraw` | Withdraw (if permitted) |
| `GET`  | `/students/dashboard` | Dashboard summary |
| `GET`  | `/students/notifications` | Notification list |
| `PATCH`| `/students/notifications/:id/read` | Mark as read |

### GET `/students/opportunities`

Query params:
```
?search=software
&department=CSE
&jobType=INTERNSHIP
&workMode=REMOTE
&minCgpa=7.5
&gradYear=2026
&city=Bangalore
&sortBy=deadline
&order=asc
&page=1&limit=20
```

Response `200`:
```json
{
  "data": [
    {
      "id": "...",
      "title": "Software Engineer Intern",
      "company": {
        "name": "TechCorp",
        "logoUrl": "...",
        "industry": "Software"
      },
      "jobType": "INTERNSHIP",
      "workMode": "HYBRID",
      "city": "Bangalore",
      "stipend": 25000,
      "deadline": "2026-08-01T00:00:00Z",
      "openings": 5,
      "minCgpa": 7.5,
      "allowedDepts": ["CSE", "IT"],
      "allowedGradYears": [2026, 2027],
      "publishedAt": "2026-06-01T00:00:00Z",
      "studentApplicationStatus": null  // or current status if applied
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 143, "pages": 8 }
}
```

### GET `/students/opportunities/:id/eligibility`

Response `200`:
```json
{
  "eligible": true,
  "checks": [
    { "criterion": "CGPA", "required": 7.5, "actual": 8.1, "passed": true },
    { "criterion": "Department", "required": ["CSE","IT"], "actual": "CSE", "passed": true },
    { "criterion": "Graduation Year", "required": [2026,2027], "actual": 2027, "passed": true },
    { "criterion": "Backlogs", "required": 0, "actual": 0, "passed": true },
    { "criterion": "Profile Complete", "required": true, "actual": true, "passed": true },
    { "criterion": "Not Already Applied", "required": true, "actual": true, "passed": true }
  ],
  "reasons": []
}
```

Response when ineligible:
```json
{
  "eligible": false,
  "checks": [
    { "criterion": "CGPA", "required": 7.5, "actual": 6.8, "passed": false },
    { "criterion": "Department", "required": ["CSE","IT"], "actual": "MECH", "passed": false }
  ],
  "reasons": [
    "Your CGPA (6.8) is below the minimum required (7.5)",
    "Your department (MECH) is not eligible for this posting"
  ]
}
```

### POST `/students/opportunities/:id/apply`

Request:
```json
{
  "coverLetter": "I am excited to apply...",
  "resumeUrl": "https://drive.google.com/..."
}
```

Response `201`:
```json
{
  "application": {
    "id": "...",
    "status": "APPLIED",
    "appliedAt": "2026-06-15T10:30:00Z"
  },
  "message": "Application submitted successfully"
}
```

Response `422` (ineligible attempt):
```json
{
  "error": "You are not eligible for this position",
  "reasons": ["Your CGPA (6.8) is below the minimum required (7.5)"]
}
```

---

## Recruiter Endpoints

All require `authenticate + requireRecruiter`

| Method | Endpoint | Auth extras | Description |
|--------|----------|-------------|-------------|
| `POST` | `/recruiters/company` | — | Register company |
| `GET`  | `/recruiters/company` | — | Get own company |
| `PUT`  | `/recruiters/company` | — | Update company |
| `POST` | `/recruiters/company/submit` | — | Submit company for admin review |
| `POST` | `/recruiters/jobs` | company approved | Create job (DRAFT) |
| `GET`  | `/recruiters/jobs` | — | List own jobs |
| `GET`  | `/recruiters/jobs/:id` | owner | Job detail |
| `PUT`  | `/recruiters/jobs/:id` | owner | Update job |
| `POST` | `/recruiters/jobs/:id/submit` | owner | Submit for admin approval |
| `GET`  | `/recruiters/jobs/:id/applicants` | owner | List applicants |
| `GET`  | `/recruiters/applicants/:appId` | owner | Applicant detail |
| `PATCH`| `/recruiters/applicants/:appId/status` | owner | Move application stage |
| `POST` | `/recruiters/applicants/:appId/interview` | owner | Schedule interview |
| `GET`  | `/recruiters/dashboard` | — | Recruiter analytics |

### PATCH `/recruiters/applicants/:appId/status`

Request:
```json
{
  "status": "SHORTLISTED",
  "note": "Strong profile, inviting for technical round"
}
```

Valid transitions:
```
APPLIED        → UNDER_REVIEW, REJECTED
UNDER_REVIEW   → SHORTLISTED, REJECTED
SHORTLISTED    → INTERVIEW_SCHEDULED, REJECTED
INTERVIEW_SCHEDULED → SELECTED, REJECTED
```

Response `200`:
```json
{
  "application": { "id": "...", "status": "SHORTLISTED" },
  "historyEntry": {
    "previousStatus": "UNDER_REVIEW",
    "newStatus": "SHORTLISTED",
    "changedAt": "2026-06-20T14:00:00Z"
  }
}
```

Response `400` (invalid transition):
```json
{
  "error": "Invalid status transition",
  "code": "INVALID_TRANSITION",
  "message": "Cannot move from REJECTED to SELECTED"
}
```

### POST `/recruiters/applicants/:appId/interview`

Request:
```json
{
  "roundName": "Technical Interview",
  "scheduledAt": "2026-06-28T10:30:00Z",
  "durationMins": 60,
  "mode": "ONLINE",
  "meetingLink": "https://meet.google.com/...",
  "notes": "Focus on DSA and system design"
}
```

---

## Admin Endpoints

All require `authenticate + requireAdmin`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/admin/dashboard` | KPI summary + chart data |
| `GET`  | `/admin/companies` | All companies (filterable) |
| `GET`  | `/admin/companies/pending` | Pending approvals |
| `GET`  | `/admin/companies/:id` | Company detail |
| `PATCH`| `/admin/companies/:id/approve` | Approve company |
| `PATCH`| `/admin/companies/:id/reject` | Reject with reason |
| `PATCH`| `/admin/companies/:id/suspend` | Suspend company |
| `GET`  | `/admin/jobs` | All jobs (filterable) |
| `GET`  | `/admin/jobs/pending` | Pending job approvals |
| `GET`  | `/admin/jobs/:id` | Job detail |
| `PATCH`| `/admin/jobs/:id/approve` | Approve job |
| `PATCH`| `/admin/jobs/:id/reject` | Reject with reason |
| `GET`  | `/admin/users` | All users |
| `GET`  | `/admin/users/:id` | User detail |
| `PATCH`| `/admin/users/:id/suspend` | Suspend/unsuspend user |
| `GET`  | `/admin/applications` | All applications |
| `GET`  | `/admin/audit-logs` | Audit log stream |
| `POST` | `/admin/announcements` | Create announcement |
| `GET`  | `/admin/announcements` | List announcements |
| `GET`  | `/admin/analytics` | Placement analytics |

### GET `/admin/dashboard`

Response `200`:
```json
{
  "kpis": {
    "totalStudents": 1240,
    "totalCompanies": 48,
    "approvedCompanies": 35,
    "pendingCompanies": 5,
    "activeJobs": 22,
    "pendingJobApprovals": 8,
    "totalApplications": 3780,
    "studentsPlaced": 312,
    "placementRate": 25.2
  },
  "charts": {
    "applicationsByDept": [
      { "dept": "CSE", "count": 1200 },
      { "dept": "IT",  "count": 850 }
    ],
    "placementsByDept": [...],
    "applicationsOverTime": [
      { "date": "2026-05-01", "count": 45 },
      { "date": "2026-05-02", "count": 72 }
    ],
    "hiringFunnel": [
      { "stage": "Applied", "count": 3780 },
      { "stage": "Under Review", "count": 2100 },
      { "stage": "Shortlisted", "count": 680 },
      { "stage": "Interview", "count": 420 },
      { "stage": "Selected", "count": 312 }
    ],
    "jobTypeDistribution": [
      { "type": "FULL_TIME", "count": 14 },
      { "type": "INTERNSHIP", "count": 8 }
    ]
  }
}
```

### PATCH `/admin/companies/:id/reject`

Request:
```json
{
  "reason": "Company website verification document is missing. Please re-upload with official letterhead."
}
```

Response `200`:
```json
{
  "company": { "id": "...", "status": "REJECTED", "adminNote": "..." },
  "message": "Company rejected. Recruiter notified."
}
```

---

## Notification Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/notifications` | ✅ | Get own notifications |
| `PATCH`| `/notifications/:id/read` | ✅ | Mark single as read |
| `PATCH`| `/notifications/read-all` | ✅ | Mark all as read |
| `GET`  | `/notifications/unread-count` | ✅ | Unread badge count |

---

## Shared Response Shapes

### Paginated List
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 243,
    "pages": 13,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error
```json
{
  "error": "Descriptive message",
  "code": "SNAKE_CASE_CODE",
  "issues": { "field": ["message"] }
}
```
