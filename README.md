# WEB-03 — Campus Placement & Internship Portal

### Competition-Grade Full-Stack Web Application

> **Goal:** Win the round. Build a production-quality, role-based placement portal that looks and behaves like a real SaaS recruitment platform — not a college CRUD project.

---

## 📁 Documentation Index

| File                                                       | What's inside                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [`01-ARCHITECTURE.md`](./01-ARCHITECTURE.md)               | Three-tier architecture, system design, data flow, component map                     |
| [`02-TECH-STACK.md`](./02-TECH-STACK.md)                   | Full tech stack with justifications, versions, and setup commands                    |
| [`03-DATABASE.md`](./03-DATABASE.md)                       | Prisma schema, entity relationships, indexes, constraints                            |
| [`04-AUTH-SECURITY.md`](./04-AUTH-SECURITY.md)             | Auth flow, JWT strategy, RBAC middleware, IDOR protection, security checklist        |
| [`05-API-REFERENCE.md`](./05-API-REFERENCE.md)             | Complete REST API — every endpoint, method, auth requirement, request/response shape |
| [`06-FEATURES-BY-ROLE.md`](./06-FEATURES-BY-ROLE.md)       | Detailed feature spec per role: Student, Recruiter, Admin                            |
| [`07-ELIGIBILITY-ENGINE.md`](./07-ELIGIBILITY-ENGINE.md)   | Server-side eligibility engine design, rules, response format, edge cases            |
| [`08-WORKFLOWS.md`](./08-WORKFLOWS.md)                     | Approval workflows, application lifecycle, status machines, interview flow           |
| [`REQUIREMENTS.md`](./REQUIREMENTS.md)                     | Comprehensive System Requirements Specification (SRS) for the complete system        |
| [`09-a-FRONTEND.md`](./markdown/09-a-FRONTEND.md)                     | Component map, pages per role, UI/UX guidelines, responsive strategy                 |
| [`09-b-UI_DESIGN_SYSTEM.md`](./markdown/09-b-UI_DESIGN_SYSTEM.md)     | Design system reference, brand identity, color palette, components                   |
| [`10-IMPLEMENTATION-PLAN.md`](./markdown/10-IMPLEMENTATION-PLAN.md) | Phased build plan, task breakdown, what to demo first to judges                      |

---

## 🏆 Winning Edge — What Makes This Stand Out

1. **True three-tier separation** — business logic never leaks into the frontend
2. **Server-side eligibility engine** — the backend always has final say, no frontend override possible
3. **IDOR protection** — object-level authorization on every resource
4. **Full audit trail** — every status change is timestamped and stored
5. **Realistic approval workflows** — companies and jobs go through admin review before becoming visible
6. **Visual application pipeline** — judges see a polished hiring funnel, not just a table
7. **Analytics dashboards** — Recharts-powered KPI cards and funnel charts for all three roles
8. **Notification architecture** — in-app now, email-ready by design
