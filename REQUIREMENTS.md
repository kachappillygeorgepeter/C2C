# System Requirements Specification (SRS)
## WEB-03: Campus Placement & Internship Portal (C2C)

> **Document Type:** Comprehensive System Requirements Specification  
> **Status:** Active / Engineering Baseline  
> **Target Architecture:** Three-tier Enterprise Web Application (React + Node.js/Express + PostgreSQL)

---

## 1. Executive Summary & Objective

The **Campus Placement & Internship Portal (C2C)** is a competition-grade, enterprise recruitment SaaS platform engineered to replace ad-hoc spreadsheet and manual placement operations in higher education institutions.

The system enforces strict **three-tier separation**, guaranteed **server-side eligibility verification**, **role-based access control (RBAC)** across three distinct personas (Student, Recruiter, Admin/Placement Cell), complete **audit logging**, and a **visual recruitment funnel**.

---

## 2. Environment & System Prerequisites

### 2.1 Hardware Requirements
- **Development Workstation:**
  - CPU: Minimum 4 cores (x86_64 or ARM64)
  - RAM: 8 GB minimum (16 GB recommended for concurrent database, backend, and Vite dev servers)
  - Disk: 10 GB free SSD storage
- **Target Deployment / Production Server:**
  - CPU: 2 vCPU minimum
  - RAM: 4 GB minimum
  - Storage: 20 GB SSD with automated PostgreSQL backup volumes

### 2.2 Software & Runtime Requirements
| Component | Requirement / Specification | Purpose |
|---|---|---|
| **Operating System** | Windows 10/11, macOS 12+, or Ubuntu 22.04 LTS / Linux | Development & hosting |
| **Node.js** | `>= 20.x LTS` | Server & build runtime |
| **Package Manager** | `npm >= 10.x` or `pnpm >= 9.x` | Dependency lifecycle |
| **Database Engine** | PostgreSQL `>= 16.x` | Relational storage & ACID compliance |
| **TypeScript** | `>= 5.x` | Static typing throughout frontend and backend |
| **Browser Support** | Modern evergreen browsers (Chrome, Edge, Firefox, Safari) | Responsive UI client |

---

## 3. Technology Stack & Dependencies

### 3.1 Frontend (`frontend/`)
- **Core Framework:** React 18.x with TypeScript
- **Bundler & Tooling:** Vite 5.x (`@vitejs/plugin-react`)
- **Routing:** React Router v6 (`react-router-dom`)
- **Styling & Design System:**
  - Tailwind CSS 3.x
  - `@tailwindcss/forms`
  - Autoprefixer & PostCSS
  - `shadcn/ui` (Radix UI primitives)
  - Lucide React (Icons)
  - `class-variance-authority`, `clsx`, `tailwind-merge`
- **State Management & Data Fetching:**
  - TanStack Query (React Query) v5
  - Zustand v4 (Auth and active state)
  - Axios v1.x (with JWT request/response interceptors)
- **Forms & Validation:**
  - React Hook Form v7
  - Zod v3
  - `@hookform/resolvers`
- **Visualization & UI Feedback:**
  - Recharts v2 (Analytics funnels & KPI charts)
  - Sonner (Toast notifications)
  - `date-fns` (Date calculations)

### 3.2 Backend (`backend/` or `server/`)
- **Runtime & Server:** Node.js 20 LTS + Express.js 4.x
- **Language / Transpiler:** TypeScript 5.x (`ts-node`, `@types/node`, `@types/express`)
- **Database ORM:** Prisma ORM 5.x (`@prisma/client`, `prisma`)
- **Authentication & Security:**
  - `jsonwebtoken` (Stateless JWT authentication)
  - `bcryptjs` (Password hashing with salt rounds)
  - `helmet` (HTTP security headers)
  - `cors` (Configurable CORS whitelist)
  - `express-rate-limit` (API brute-force & DDoS mitigation)
- **Validation & Utilities:**
  - `zod` (Request schema validation)
  - `dotenv` (Environment configuration)
  - `uuid` (Unique ID generators)
  - `date-fns` (Schedule manipulation)

---

## 4. User Personas & Functional Requirements

The system defines three core roles with strict boundaries:

```
[ Student ]              [ Recruiter ]             [ Admin / Placement Cell ]
    │                          │                                │
    ├─ Profile & Resume        ├─ Company Registration          ├─ Company & Job Approval
    ├─ Real-time Eligibility   ├─ Job Posting Management        ├─ Student Eligibility Rules
    ├─ Application Pipeline    ├─ Candidate Screening Pipeline  ├─ Institution Placement Analytics
    └─ Interview Tracking      └─ Interview Scheduling          └─ Audit Log Monitoring
```

### 4.1 Student Portal
- **FR-STU-01 (Profile Management):** Maintain personal details, department, batch, CGPA, active backlogs, cleared backlogs, 10th/12th percentages, skill tags, and resume links.
- **FR-STU-02 (Eligibility Assessment):** Instant server-side calculation for each job posting showing whether the student is eligible (`isEligible: boolean`) and explicit reason codes if ineligible (e.g., `CGPA_BELOW_MINIMUM`, `ACTIVE_BACKLOGS_EXCEEDED`, `DEPARTMENT_NOT_ALLOWED`).
- **FR-STU-03 (Job Applications):** Apply for eligible jobs with a single click. Prevent multiple active applications to the same opening.
- **FR-STU-04 (Application Tracking):** Real-time status tracker (`APPLIED` → `SHORTLISTED` → `TECHNICAL_ROUND` → `HR_ROUND` → `OFFERED` / `REJECTED`).
- **FR-STU-05 (Offer Response):** Accept or decline job offers. Acceptance triggers institution offer-holding rules.

### 4.2 Recruiter Portal
- **FR-REC-01 (Company Profile):** Register company information, industry domain, website, and verification documentation.
- **FR-REC-02 (Job Management):** Create internship and full-time job openings with fine-grained criteria:
  - Minimum CGPA
  - Maximum allowed active backlogs
  - Eligible departments/branches
  - Passing-out batch years
  - Compensation (CTC / Stipend) and location
- **FR-REC-03 (Applicant Screening Pipeline):** Visual hiring board (Kanban / funnel) to move applicants across stages (`SHORTLISTED`, `INTERVIEW_SCHEDULED`, `REJECTED`, `OFFERED`).
- **FR-REC-04 (Interview Scheduling):** Schedule technical/HR rounds with meeting links, dates, and instructions.
- **FR-REC-05 (Analytics):** Track applicant volume, pass-through conversion rates, and offer acceptance ratios.

### 4.3 Admin (Placement Cell) Portal
- **FR-ADM-01 (Verification & Approvals):** Review and approve/reject new recruiter company accounts and job postings before they appear publicly.
- **FR-ADM-02 (Student Data Management):** Batch upload/verify student academic records (CGPA, backlog counts) to prevent student self-tampering.
- **FR-ADM-03 (Policy & Policy Enforcement):** Define institute-level rules (e.g., maximum offers allowed per student, unfreeze policies).
- **FR-ADM-04 (Institutional Analytics):** Comprehensive dashboards displaying:
  - Overall placement percentage across departments
  - Average, median, and highest CTC
  - Top recruiters and hiring trends
- **FR-ADM-05 (System Auditing):** Full searchable audit trail of every critical status change, approval, and user action.

---

## 5. Non-Functional & Security Requirements

### 5.1 Security
- **NFR-SEC-01 (Stateless Authentication):** JWT-based authentication with expiration and secure HTTP headers.
- **NFR-SEC-02 (RBAC Middleware):** Role-based access control guarding every backend route; unauthorized access must return HTTP `403 Forbidden`.
- **NFR-SEC-03 (IDOR Prevention):** Object-level authorization checks on all operations (e.g., students cannot access another student's applications; recruiters cannot view applicants of another company's jobs).
- **NFR-SEC-04 (Password Security):** Salted and hashed passwords using `bcryptjs` (cost factor >= 10).
- **NFR-SEC-05 (Input Sanitization & Validation):** Strict schema validation using Zod for all incoming request payloads before reaching controllers.
- **NFR-SEC-06 (Rate Limiting):** API-wide and auth-specific rate limits to defend against brute force attempts.

### 5.2 Performance & Reliability
- **NFR-PERF-01:** Sub-200ms latency on core API read endpoints under normal concurrent load.
- **NFR-PERF-02:** Database indexed on foreign keys, status columns, and search fields (`userId`, `companyId`, `jobId`, `department`, `status`).
- **NFR-PERF-03:** Frontend client-side caching and optimistic UI updates powered by TanStack Query.

### 5.3 Maintainability & Code Quality
- **NFR-CODE-01:** 100% TypeScript across frontend and backend with shared type definitions and validation schemas.
- **NFR-CODE-02:** Complete separation of business services, route controllers, and database access logic.

---

## 6. Environment Variables & Configuration Requirements

### 6.1 Backend (`.env`)
```bash
# Server configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/placement_portal?schema=public"

# Authentication
JWT_SECRET=super_secret_jwt_key_at_least_32_characters
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 6.2 Frontend (`.env`)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_APP_TITLE="Campus Placement & Internship Portal"
```

---

## 7. Verification & Acceptance Criteria

| ID | Test Scenario | Acceptance Criteria |
|---|---|---|
| **AC-01** | Student applies for job with insufficient CGPA | Server returns `400 Bad Request` with `isEligible: false` and reason `CGPA_BELOW_MINIMUM`. Database insertion is blocked. |
| **AC-02** | Student attempts to view another student's application | Server returns `403 Forbidden` via IDOR protection middleware. |
| **AC-03** | Recruiter posts a job | Job enters `PENDING_APPROVAL` status and is invisible to students until Admin approves. |
| **AC-04** | Admin approves job | Status becomes `ACTIVE`; job immediately displays on eligible students' opportunity feed. |
| **AC-05** | Recruiter schedules interview | Notification is created for the applicant and status moves to `INTERVIEW_SCHEDULED`. |
| **AC-06** | Student accepts job offer | Status becomes `OFFER_ACCEPTED`; audit log records event with timestamp and actor ID. |
