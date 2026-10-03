# 🎓 C2C — Campus Placement & Internship Portal

An enterprise-grade, role-based full-stack web application designed for university placement cells, student applicants, and recruiting corporate partners.

Built for high-stakes campus recruitment with server-enforced eligibility criteria, role-based access control, interactive visual recruitment pipelines, and real-time placement analytics.

---

## ⚡ Tech Stack

| Layer | Technology | Highlights |
| :--- | :--- | :--- |
| **Frontend** | React 18 + TypeScript + Vite | Tailwind CSS, Lucide Icons, Recharts, Custom UI components |
| **Backend** | Node.js + Express + TypeScript | Modular routing, JWT Authentication, RBAC, Helmet, Rate Limiting |
| **Database & ORM** | PostgreSQL 16 + Prisma ORM | Relational schema, transactions, migrations, automated seeders |
| **Containerization** | Docker Compose | One-command local database orchestration |

---

## ✨ Key Features & Winning Edge

1. **Role-Based Workflows (RBAC)**:
   - **Student Portal**: Browse eligible job & internship postings with instant eligibility checks, track applications, view interview schedules, and inspect application status logs.
   - **Recruiter Portal**: Post openings, manage applicant stages (Applied, Shortlisted, Interview Scheduled, Offered, Rejected), schedule interview rounds with Google Meet/location links, and track recruitment metrics.
   - **Admin / Placement Officer Portal**: Manage student verification, review & approve partner companies and job postings, inspect system audit logs, and analyze institutional placement trends.
2. **Server-Enforced Eligibility Engine**:
   - Backend evaluates CGPA cutoff, maximum allowed backlogs, and departmental eligibility before allowing applications.
   - Transparent feedback explains exactly why a candidate is eligible or ineligible.
3. **Approval Workflows & IDOR Protection**:
   - Strict company and job review workflow prior to public student listing.
   - Resource-level authorization prevents unauthorized access across user boundaries.
4. **Interactive Dashboard & Pipeline**:
   - Visual recruitment funnel cards, status badges, and dynamic KPI metric dashboards.
   - In-app notification center for application updates and interview notices.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `>= 20.x LTS`
- **Docker Desktop** (or local PostgreSQL on port `5432`)

### 1. Start Database (PostgreSQL via Docker)
From the project root:
```bash
docker compose up -d
```

### 2. Set Up & Launch Backend API
In a new terminal:
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```
> ✅ **Backend runs at:** `http://localhost:5000`

### 3. Set Up & Launch Frontend Client
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
> ✅ **Frontend runs at:** `http://localhost:5173`

---

## 🔑 Pre-seeded Demo Accounts

All pre-seeded demo accounts use the password: **`Password123!`**

| Role | Email | Features to Test |
| :--- | :--- | :--- |
| **🛡️ Admin** | `admin@campus.edu` | Company & job approvals, student verification, placement metrics, audit logs |
| **💼 Recruiter** | `recruiter@nexustech.io` | Create job postings, candidate screening, interview scheduling, applicant pipeline |
| **🎓 Student (High CGPA)** | `arjun.sharma@student.campus.edu` | Explore eligible openings, 1-click apply, track application status & interview calls |
| **🎓 Student (With Backlogs)** | `priya.nair@student.campus.edu` | Verify server-side eligibility rejection feedback and restrictions |

---

## 📁 Repository Structure

```
C2C/
├── backend/
│   ├── prisma/             # Schema definitions, migrations, and seed scripts
│   ├── src/
│   │   ├── controllers/    # Request handlers (auth, jobs, applications, admin, etc.)
│   │   ├── middleware/     # Auth, RBAC, error handling, rate limiting
│   │   ├── routes/         # Express API route declarations
│   │   ├── services/       # Business logic & eligibility calculation
│   │   └── server.ts       # Express app initialization
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # Core application components & role dashboards
│   │   ├── KexsioSignInCard.tsx  # Dynamic interactive authentication screen
│   │   ├── Hyperspeed.tsx  # Interactive visual canvas component
│   │   └── api.ts          # Axios / fetch client with auth token management
├── markdown/               # Detailed system design & architecture documentation
├── docker-compose.yml      # PostgreSQL 16 container setup
├── START_SERVER.md         # Fast launch cheat sheet
└── REQUIREMENTS.md         # Comprehensive System Requirements Specification
```

---

## 📚 Detailed Documentation

Detailed architectural and engineering documentation is available in the [`markdown/`](./markdown) folder:

- [`01-ARCHITECTURE.md`](./markdown/01-ARCHITECTURE.md) — Three-tier architecture, system design, and data flows.
- [`02-TECH-STACK.md`](./markdown/02-TECH-STACK.md) — Technical choices, libraries, and justification.
- [`03-DATABASE.md`](./markdown/03-DATABASE.md) — Schema definitions, ERD, indexes, and constraints.
- [`04-AUTH-SECURITY.md`](./markdown/04-AUTH-SECURITY.md) — Auth strategy, JWT, RBAC, and IDOR prevention.
- [`05-API-REFERENCE.md`](./markdown/05-API-REFERENCE.md) — Complete REST endpoint documentation.
- [`06-FEATURES-BY-ROLE.md`](./markdown/06-FEATURES-BY-ROLE.md) — Detailed feature specs per role.
- [`07-ELIGIBILITY-ENGINE.md`](./markdown/07-ELIGIBILITY-ENGINE.md) — Eligibility engine rules and logic.
- [`08-WORKFLOWS.md`](./markdown/08-WORKFLOWS.md) — Company/job review & application lifecycle state machines.
- [`09-a-FRONTEND.md`](./markdown/09-a-FRONTEND.md) & [`09-b-UI_DESIGN_SYSTEM.md`](./markdown/09-b-UI_DESIGN_SYSTEM.md) — Design system and UI structure.
- [`10-IMPLEMENTATION-PLAN.md`](./markdown/10-IMPLEMENTATION-PLAN.md) — Phased implementation breakdown.
