# 01 — Architecture

## Three-Tier Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TIER 1 — PRESENTATION                     │
│                                                             │
│   React + TypeScript + Vite + Tailwind CSS + shadcn/ui      │
│                                                             │
│   ┌──────────┐  ┌────────────┐  ┌───────────────────────┐  │
│   │ Student  │  │  Recruiter │  │   Admin (Placement     │  │
│   │  Portal  │  │   Portal   │  │   Cell) Portal         │  │
│   └──────────┘  └────────────┘  └───────────────────────┘  │
│                                                             │
│   Client-side routing · Forms · Charts · Notifications      │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTPS / REST / JSON
                       │  JWT in Authorization header
┌──────────────────────▼──────────────────────────────────────┐
│                  TIER 2 — APPLICATION / API                  │
│                                                             │
│        Node.js + Express.js + TypeScript                    │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Auth Layer │  │  Middleware  │  │  Business Logic   │  │
│  │  JWT / bcrypt│  │  RBAC · IDOR│  │  Eligibility Engine│ │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Route Controllers                        │  │
│  │  /auth  /students  /recruiters  /admin  /notifications│  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services                                            │   │
│  │  AuthService · EligibilityService · NotificationSvc  │   │
│  │  ApplicationService · ApprovalService · AuditService │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │  Prisma ORM
┌──────────────────────▼──────────────────────────────────────┐
│                    TIER 3 — DATA                             │
│                                                             │
│                     PostgreSQL                              │
│                                                             │
│  Users · StudentProfiles · RecruiterProfiles                │
│  Companies · JobPostings · JobEligibility                   │
│  Applications · ApplicationStatusHistory                    │
│  Interviews · Notifications · AuditLogs                     │
│  Announcements · Departments · Skills                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
web03-placement-portal/
├── client/                          # Tier 1 — React Frontend
│   ├── src/
│   │   ├── app/                     # App shell, router, providers
│   │   ├── features/
│   │   │   ├── auth/                # Login, Register, Forgot Password
│   │   │   ├── student/             # Dashboard, Profile, Opportunities, Applications
│   │   │   ├── recruiter/           # Dashboard, Company, Jobs, Candidates
│   │   │   └── admin/               # Dashboard, Approvals, Users, Analytics
│   │   ├── components/              # Shared UI components
│   │   │   ├── ui/                  # shadcn/ui re-exports
│   │   │   ├── layout/              # Sidebar, Navbar, PageWrapper
│   │   │   ├── charts/              # Recharts wrappers
│   │   │   └── notifications/       # NotificationBell, NotificationPanel
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # axios instance, zod schemas, utils
│   │   ├── store/                   # Auth state (Zustand)
│   │   └── types/                   # Shared TypeScript interfaces
│   ├── index.html
│   └── vite.config.ts
│
├── server/                          # Tier 2 — Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── student.routes.ts
│   │   │   ├── recruiter.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   └── notification.routes.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── student.controller.ts
│   │   │   ├── recruiter.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── eligibility.service.ts   # Core engine
│   │   │   ├── application.service.ts
│   │   │   ├── approval.service.ts
│   │   │   ├── notification.service.ts  # Abstraction layer
│   │   │   ├── inapp.notification.ts    # In-app implementation
│   │   │   └── audit.service.ts
│   │   ├── middleware/
│   │   │   ├── authenticate.ts
│   │   │   ├── authorizeRole.ts
│   │   │   ├── authorizeOwner.ts        # IDOR protection
│   │   │   └── validate.ts
│   │   ├── validators/                  # Zod schemas
│   │   ├── lib/
│   │   │   ├── prisma.ts
│   │   │   ├── jwt.ts
│   │   │   └── errors.ts
│   │   └── app.ts
│   └── tsconfig.json
│
├── prisma/
│   ├── schema.prisma                # Tier 3 — Full DB schema
│   ├── seed.ts                      # Dev seed data
│   └── migrations/
│
├── shared/                          # Types shared between client and server
│   └── types/
│
└── docker-compose.yml               # PostgreSQL + Redis (optional)
```

---

## Request Lifecycle

```
Browser Request
      │
      ▼
React Router (client routing, protected by auth guard)
      │
      ▼
Axios (attaches JWT Authorization header)
      │
      ▼
Express Router
      │
      ├─► authenticate()     — verifies JWT, attaches req.user
      │
      ├─► authorizeRole()    — checks role: STUDENT | RECRUITER | ADMIN
      │
      ├─► authorizeOwner()   — checks resource belongs to this user (IDOR)
      │
      ├─► validate()         — Zod schema validates request body
      │
      ▼
Controller → Service → Prisma → PostgreSQL
      │
      ▼
JSON Response (200 / 201 / 400 / 401 / 403 / 404 / 409 / 500)
      │
      ▼
TanStack Query cache updated → UI re-renders
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| JWT in `Authorization` header (not cookies) | Stateless, works cross-origin, simpler for competition scope |
| Refresh token in HttpOnly cookie | Access token short-lived (15 min), refresh token rotates on use |
| Prisma ORM | Type-safe queries, prevents SQL injection, migration support |
| Zod on both client and server | Single source of truth for validation schemas in shared/ |
| TanStack Query | Automatic cache invalidation, loading/error states, refetch on window focus |
| Zustand for auth state | Lightweight, no boilerplate, persists to localStorage via middleware |
| Server-side pagination | Never load unbounded record sets into browser memory |
| Audit log on every status change | Judges love traceable, accountable systems |

---

## Security Boundaries

```
Frontend                Backend
─────────               ─────────
UI shows/hides          API accepts/rejects
role-specific menus  ≠  based on verified JWT role

Client-side             Server-side
eligibility display  ≠  eligibility engine (authoritative)

URL guard in React      Middleware guard on API
Router (UX only)     +  (actual security)
```

> **Rule:** The frontend is decoration. The backend is truth.
