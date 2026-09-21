# 10 — Implementation Plan

## Build Order (most impactful first)

Phase work is ordered so that at **any** stopping point, you have a demo-able system.

---

## Phase 1 — Foundation (Day 1)

**Goal:** Server running, DB connected, auth working for all three roles.

### Backend
- [ ] `docker compose up` — PostgreSQL running
- [ ] Prisma schema written and migrated (`npx prisma migrate dev --name init`)
- [ ] `prisma/seed.ts` — creates admin, 3 students, 2 recruiters, 2 companies, 3 jobs
- [ ] `app.ts` — Express + Helmet + CORS + rate limiter bootstrapped
- [ ] `authenticate.ts`, `authorizeRole.ts` middleware
- [ ] `POST /auth/register` — all 3 roles
- [ ] `POST /auth/login` — JWT issued
- [ ] `POST /auth/refresh` — refresh rotation
- [ ] `GET /auth/me`
- [ ] Centralized error handler

### Frontend
- [ ] Vite + React + TS + Tailwind + shadcn/ui scaffolded
- [ ] React Router with protected route guards
- [ ] Zustand auth store
- [ ] Axios instance with interceptors (token injection + 401 refresh)
- [ ] `/login` and `/register` pages (all 3 roles)
- [ ] Role-based redirect after login
- [ ] App shell with sidebar (stubs for all routes)

**Checkpoint:** Can register as student/recruiter/admin, login, be redirected to the correct portal.

---

## Phase 2 — Student Core (Day 1–2)

**Goal:** Student can browse real jobs and apply.

### Backend
- [ ] `GET /students/opportunities` with filters + pagination
- [ ] `GET /students/opportunities/:id`
- [ ] `EligibilityService` — all 10 checks
- [ ] `GET /students/opportunities/:id/eligibility`
- [ ] `POST /students/opportunities/:id/apply` — eligibility re-check inside
- [ ] `ApplicationStatusHistory` — first entry on apply
- [ ] `GET /students/applications`
- [ ] `GET /students/applications/:id` (with history)
- [ ] `POST /students/applications/:id/withdraw`

### Frontend
- [ ] `/student/opportunities` — job cards with filters, search, sort
- [ ] `/student/opportunities/:id` — detail + EligibilityPanel
- [ ] Apply modal (cover letter + resume URL)
- [ ] `/student/applications` — table with status badges
- [ ] `/student/applications/:id` — StatusTimeline component
- [ ] Profile completion ring on dashboard

**Checkpoint:** Full student application flow works end-to-end.

---

## Phase 3 — Recruiter Core (Day 2)

**Goal:** Recruiter can create and manage jobs, review applicants.

### Backend
- [ ] `POST /recruiters/company` + `GET` + `PUT`
- [ ] `POST /recruiters/company/submit`
- [ ] `POST /recruiters/jobs` (DRAFT)
- [ ] `GET/PUT/DELETE /recruiters/jobs/:id` with ownership check
- [ ] `POST /recruiters/jobs/:id/submit` (→ PENDING_APPROVAL)
- [ ] `GET /recruiters/jobs/:id/applicants` — only own job's applicants
- [ ] `PATCH /recruiters/applicants/:appId/status` — transition engine
- [ ] `POST /recruiters/applicants/:appId/interview`

### Frontend
- [ ] `/recruiter/company` — profile form + status badge + submit
- [ ] `/recruiter/jobs` — table + status chips
- [ ] `/recruiter/jobs/new` — multi-step wizard
- [ ] `/recruiter/jobs/:id/applicants` — table + quick actions
- [ ] `/recruiter/applicants/:appId` — full candidate view + status controls
- [ ] Interview scheduling modal

**Checkpoint:** Recruiter can submit company, create jobs, and manage candidates.

---

## Phase 4 — Admin Core (Day 2–3)

**Goal:** Admin approval center fully functional.

### Backend
- [ ] `GET /admin/companies/pending` + `PATCH approve/reject`
- [ ] `GET /admin/jobs/pending` + `PATCH approve/reject`
- [ ] `GET /admin/dashboard` — KPI aggregations
- [ ] `GET /admin/users` + `PATCH suspend`
- [ ] `GET /admin/audit-logs`
- [ ] `POST /admin/announcements`

### Frontend
- [ ] `/admin/dashboard` — KPI cards + Recharts charts
- [ ] `/admin/approvals` — tabbed Companies/Jobs with Approve/Reject UI
- [ ] Rejection modal (required reason)
- [ ] `/admin/users` — table + suspend toggle
- [ ] `/admin/audit-logs` — paginated log view

**Checkpoint:** Full approval workflow: recruiter submits → admin approves → student sees job.

---

## Phase 5 — Notifications & Polish (Day 3)

- [ ] `NotificationService` + `InAppNotificationProvider`
- [ ] Notification triggers on: apply, status change, company approval, interview scheduled
- [ ] `GET /notifications` + `PATCH read`
- [ ] NotificationBell + panel component (frontend)
- [ ] Student `/student/profile` with completion percentage
- [ ] `/admin/analytics` — richer charts
- [ ] Announcements creation + display on dashboards
- [ ] Recruiter dashboard charts (funnel, dept distribution)
- [ ] Mobile responsiveness pass on all pages
- [ ] Toast feedback on all mutations
- [ ] Loading skeletons
- [ ] Empty states

---

## Phase 6 — Competition Polish (Final hours)

These are the things that impress judges and differentiate your project:

- [ ] **Landing page** — clean marketing-style page with role selection
- [ ] **Seed a rich demo dataset** — at least 20 students, 5 companies, 10 jobs, 50+ applications across all statuses
- [ ] **Status timeline visual** — make this look great; judges will click on an application
- [ ] **Eligibility panel** — show green ✓ / red ✗ breakdown clearly
- [ ] **Admin dashboard charts** — at least 3 real Recharts charts with real data
- [ ] **Responsive on phone** — judges test on mobile
- [ ] **Error states** — nothing should crash or show blank page
- [ ] **Profile completion percentage** — visible on dashboard
- [ ] **Audit log** — shows judges you thought about accountability

---

## Demo Script for Judges

Walk judges through this exact flow:

```
1. LOGIN as STUDENT (Aryan Mehta)
   → Show dashboard with KPI cards
   → Browse opportunities (show filters working)
   → Click a job → show EligibilityPanel with ✓/✗ breakdown
   → Apply → see application in My Applications
   → Show status timeline (APPLIED state)

2. LOGIN as RECRUITER (TechCorp)
   → Show company status: PENDING
   → Submit company for review
   → Switch to admin tab (keep in different browser tab)

3. LOGIN as ADMIN
   → Show Approval Center → Company pending
   → Approve company
   → Show job approval tab → Approve a job

4. Back to RECRUITER
   → Company now APPROVED
   → Create a new job → fill wizard → submit for approval
   → (Pre-seeded: already has applicants)
   → View applicants → open Aryan's profile
   → Move from APPLIED → UNDER_REVIEW → SHORTLISTED
   → Schedule Interview → fill form

5. Back to STUDENT (Aryan)
   → Show notification: "Interview Scheduled"
   → Open application → show full status timeline with all stages
   → Show interview card with date/time/join link

6. ADMIN DASHBOARD
   → Show KPI cards (real numbers from seed)
   → Walk through charts (funnel, applications by dept)
   → Show audit logs (every action recorded)
```

This flow demonstrates:
- Auth ✅
- RBAC ✅  
- Approval workflow ✅
- Eligibility engine (explain it checks server-side) ✅
- Application pipeline ✅
- Interview scheduling ✅
- Notifications ✅
- Admin oversight ✅
- Audit trail ✅

---

## What NOT to Skip

Even if time is short, these are non-negotiable:

| Feature | Why |
|---------|-----|
| Server-side eligibility re-check on apply | Explicitly required in spec; judges will look for it |
| RBAC middleware | Must reject unauthorized API calls, not just hide buttons |
| IDOR check on recruiter job access | Prevents one recruiter seeing another's candidates |
| Status transition validation | Prevents invalid moves like REJECTED → SELECTED |
| Application history table | Every status change must be recorded |
| Profile completion percentage | Shown in spec, judges expect it |
| Admin rejection with reason | Spec explicitly says not to silently delete |

---

## Time Estimate

| Phase | Estimated Time |
|-------|---------------|
| Phase 1 — Foundation | 3–4 hours |
| Phase 2 — Student Core | 4–5 hours |
| Phase 3 — Recruiter Core | 3–4 hours |
| Phase 4 — Admin Core | 3–4 hours |
| Phase 5 — Notifications & Polish | 2–3 hours |
| Phase 6 — Demo Polish | 2 hours |
| **Total** | **~20 hours** |
