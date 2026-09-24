# 📋 Tasks Checklist & Runbook

This document tracks all tasks for the **C2C Campus Placement & Internship Portal**, detailing what has been automated and the specific remaining actions required on your machine.

---

## ⚡ Current Status Overview

| Task / Component                          | Status                 | Handled By | Details                                                                                                      |
| ----------------------------------------- | ---------------------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| **Node.js & npm Path Detection**          | ✅ **Done**            | Assistant  | Discovered in `D:\Code Software\node.js` (v24.19.0 / npm 11.17.0) and permanently registered to User `PATH`. |
| **Backend Dependencies (`npm install`)**  | ✅ **Done**            | Assistant  | 224 packages installed in `backend/node_modules`.                                                            |
| **Frontend Dependencies (`npm install`)** | ✅ **Done**            | Assistant  | 209 packages installed in `frontend/node_modules`.                                                           |
| **TypeScript & Build Bug Fixes**          | ✅ **Done**            | Assistant  | Fixed `AppLayout.tsx` import path, `authService.ts` JWT typing, and added `vite-env.d.ts`.                   |
| **Prisma Client Generation**              | ✅ **Done**            | Assistant  | Generated Prisma Client v5.22.0.                                                                             |
| **Database Migration (`migrate dev`)**    | ✅ **Done**            | Assistant  | Applied migration `20260924161232_init` to PostgreSQL `C2C` database.                                        |
| **Database Seeding (`seed.ts`)**          | ✅ **Done**            | Assistant  | Seeded Admin, Students, Recruiters, Companies, and Job Openings.                                             |
| **Start Development Servers & Demo**      | ⏳ **Ready to Launch** | **You**    | Start the backend and frontend servers to view and test the application.                                     |

---

## 🚀 How to Launch the Application

Open two terminal windows:

### Terminal 1 — Backend API

```powershell
cd c:\Users\dell\.vscode\Works\C2C\backend
npm run dev
```

_Backend API will run on `http://localhost:5000`._

### Terminal 2 — Frontend UI

```powershell
cd c:\Users\dell\.vscode\Works\C2C\frontend
npm run dev
```

_Frontend will run on `http://localhost:5173`._
