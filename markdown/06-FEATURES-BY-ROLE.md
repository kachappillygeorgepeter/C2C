# 06 — Features by Role

## ROLE 1 — Student Applicant

### Pages & Features

#### `/student/dashboard`
- Welcome banner with name + profile completion percentage ring
- KPI cards: Eligible Jobs | Applied | Shortlisted | Interviews | Selected
- Visual application pipeline (horizontal stepper):
  `Applied → Under Review → Shortlisted → Interview → Selected`
- Upcoming interview cards (date, time, mode, join link)
- Recent applications list (last 5, with status badge)
- Deadline alerts (jobs closing in ≤ 3 days)
- Unread notification badge in header

#### `/student/profile`
- Edit all profile fields across tabs: Personal | Academic | Skills | Links
- Certifications list (add/remove)
- Projects list (add/remove)
- Profile completion percentage ring + checklist of what's missing
- Preview mode (how recruiters see your profile)

Profile completion scoring:
```
Full name:         +10%
Phone:             +5%
Department:        +10%
CGPA:              +10%
Graduation year:   +10%
Resume URL:        +15%
LinkedIn:          +5%
GitHub:            +5%
Skills (≥3):       +10%
Bio:               +5%
Project (≥1):      +10%
Certification:     +5%
─────────────────────
Total:             100%
```

#### `/student/opportunities`
- Responsive grid of job cards
- Each card: company logo, job title, type badge, location, stipend/salary, deadline, eligible departments
- Sticky filter sidebar (desktop) / bottom sheet (mobile):
  - Search bar
  - Job type (Full-time, Internship, PPO)
  - Work mode
  - Department
  - Min CGPA
  - Graduation year
  - Sort: Newest / Deadline / Stipend
- "Eligible" green badge overlay if student qualifies
- "Already Applied" badge if application exists
- Pagination

#### `/student/opportunities/:id`
- Full job detail: description, responsibilities, skills required
- Company section: logo, name, industry, website link
- Compensation section
- Location + work mode
- Eligibility section — live check result:
  ```
  ✓ CGPA (8.1 ≥ 7.5)
  ✓ Department (CSE — eligible)
  ✓ Graduation Year (2027 — eligible)
  ✗ Backlogs (you have 2, maximum allowed: 0)
  ```
- If eligible: Apply button → opens modal (cover letter, resume confirm)
- If ineligible: disabled button + clear reason message
- If applied: shows current application status

#### `/student/applications`
- Table/list of all applications with status badge
- Filter by status
- Click to view detail

#### `/student/applications/:id`
- Application detail: job info, company, applied date, resume snapshot
- Visual status timeline:
  ```
  ● June 10  Application Submitted
  ● June 12  Under Review
  ● June 15  Shortlisted — "Strong profile selected for next round"
  ○ June 18  Interview Scheduled (upcoming)
  ```
- Interview detail if scheduled (date, time, link)
- Withdraw button (only if status is APPLIED or UNDER_REVIEW)

#### `/student/notifications`
- Paginated list
- Category icons (application, interview, announcement, system)
- Click to mark read + navigate to relevant page
- Mark all as read

---

## ROLE 2 — Company Recruiter

### Pages & Features

#### `/recruiter/dashboard`
- KPI cards: Active Jobs | Total Applicants | Shortlisted | Interviews | Selected
- Applicant funnel chart (Recharts FunnelChart or BarChart):
  `Applications → Under Review → Shortlisted → Interview → Selected`
- Department distribution of applicants (pie or horizontal bar)
- Active job postings list with quick stats
- Pending approval jobs (with status badges)
- Recent applications (last 5, newest first)

#### `/recruiter/company`
- Company profile form (all fields)
- Status badge: PENDING / APPROVED / REJECTED / SUSPENDED
- If REJECTED: show admin rejection reason + "Edit and Resubmit" button
- Submit for review button
- Document upload section

#### `/recruiter/jobs`
- Table of all own jobs with status badge, applicant count, deadline
- Filters: status, job type
- Create New Job button (disabled if company not APPROVED)

#### `/recruiter/jobs/new` + `/recruiter/jobs/:id/edit`
Multi-step form wizard:
1. **Basic Info** — title, description, responsibilities, job type
2. **Compensation** — salary range / stipend / PPO / benefits
3. **Location** — city, state, work mode
4. **Eligibility** — CGPA, backlogs, departments (multi-select), grad years (multi-select), skills
5. **Recruitment** — openings, deadline, rounds, joining date
6. **Preview** — read-only review before submit

Save as Draft or Submit for Approval.

If job was REJECTED: show admin note + allow edit and resubmit.

#### `/recruiter/jobs/:id`
- Job detail (own view, sees all statuses including DRAFT)
- Status chip + admin note if rejected
- "Submit for Approval" button (from DRAFT)
- Applicant count quick link

#### `/recruiter/jobs/:id/applicants`
- Table/grid of all applicants with:
  - Name, Dept, CGPA, Grad Year, Applied Date, Status badge
  - Quick actions: View Profile, Shortlist, Reject
- Filter by status, department, CGPA range
- Sort by CGPA, applied date
- Bulk action: shortlist selected

#### `/recruiter/applicants/:appId`
- Full candidate profile (read-only):
  - Academic details
  - Skills list
  - Projects
  - Certifications
  - Resume link, LinkedIn, GitHub, Portfolio
- Application info: cover letter, applied date
- Application timeline (read-only)
- Status controls: dropdown with valid next statuses
- Recruiter notes input
- Schedule Interview button (if SHORTLISTED or INTERVIEW_SCHEDULED)

#### `/recruiter/interviews`
- Calendar or list view of all upcoming interviews
- Interview cards with candidate name, round, date/time, mode

---

## ROLE 3 — Placement Cell Admin

### Pages & Features

#### `/admin/dashboard`
- Full KPI grid (9 cards)
- Charts:
  - Applications over time (line chart)
  - Placement funnel (bar chart)
  - Applications by department (horizontal bar)
  - Job type distribution (pie chart)
  - Company participation trends
- Quick-action buttons: Pending Companies (N) | Pending Jobs (N)
- Recent audit events

#### `/admin/approvals`
Three tabs: **Companies** | **Jobs** | **Recruiters**

Companies tab:
- Card for each PENDING company:
  - Company name, industry, recruiter name/email, submitted date
  - Expand for full details (description, website, documents)
  - APPROVE | REJECT | REQUEST CHANGES buttons
  - Rejection modal with required reason field

Jobs tab:
- Card for each PENDING_APPROVAL job:
  - Job title, company name, type, deadline, openings
  - Expand for full eligibility criteria
  - APPROVE | REJECT buttons
  - Rejection modal with required reason

#### `/admin/companies`
- Full searchable/filterable table of all companies
- Filter by status
- Click to view detail + approval history

#### `/admin/jobs`
- Full table of all job postings
- Filter by status, type, company
- Click to view full detail + audit log

#### `/admin/users`
- Tabs: Students | Recruiters | Admins
- Table with name, email, join date, status, actions
- Search by name/email
- SUSPEND / UNSUSPEND actions
- View profile detail

#### `/admin/applications`
- All applications across the system
- Filter by company, job, status, department
- Export to CSV button

#### `/admin/announcements`
- Create announcement (modal):
  - Title, Content, Target (All Students / All Recruiters / Everyone / Department)
  - Priority level
  - Publish date, expiry date
- List view of past announcements

#### `/admin/analytics`
- Dedicated analytics page with richer charts:
  - Placement rate over semesters/years
  - CGPA distribution of selected vs. rejected candidates
  - Top hiring companies
  - Department-wise placement rates
  - Internship vs. full-time ratio

#### `/admin/audit-logs`
- Paginated log table:
  - Timestamp, Actor, Action, Entity, Changes (diff view)
- Filter by action type, date range, user

---

## Shared — Feature Parity Across Roles

| Feature | Student | Recruiter | Admin |
|---------|---------|-----------|-------|
| Notification bell + panel | ✅ | ✅ | ✅ |
| Responsive layout | ✅ | ✅ | ✅ |
| Dark mode (optional bonus) | ✅ | ✅ | ✅ |
| Password change | ✅ | ✅ | ✅ |
| Toast feedback on actions | ✅ | ✅ | ✅ |
| Loading skeletons | ✅ | ✅ | ✅ |
| Empty state illustrations | ✅ | ✅ | ✅ |
