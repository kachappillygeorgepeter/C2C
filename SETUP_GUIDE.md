# C2C — Campus Placement & Internship Portal: Quickstart Runbook

This guide contains everything you need to run the full-stack system locally.

---

## 📋 System Prerequisites

Ensure you have installed:
1. **Node.js**: Version `>= 20.x LTS` ([nodejs.org](https://nodejs.org))
2. **PostgreSQL**: Version `>= 16.x` (or Docker Desktop to spin it up automatically)

---

## 🚀 Step 1: Start PostgreSQL

### Option A: Using Docker (Fastest & Recommended)
From the project root:
```bash
docker compose up -d
```
*This starts a PostgreSQL 16 container on `localhost:5432` with username `c2c_user`, password `c2c_password`, and database `c2c_portal`.*

### Option B: Local PostgreSQL Installation
Ensure PostgreSQL is running locally and set your connection URL in `backend/.env`:
```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/c2c_portal?schema=public"
```

---

## 🛠️ Step 2: Set Up & Run the Backend

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run Prisma Migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed the database with test accounts & live data**:
   ```bash
   npm run seed
   ```
   *(This populates Admin, 2 Students, 2 Recruiters/Companies, Job Postings, and seeded Applications).*

5. **Start the Express API development server**:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`.*

---

## 💻 Step 3: Set Up & Run the Frontend

Open a second terminal window:

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   *The frontend will start at `http://localhost:5173`.*

---

## 🔑 Step 4: Access & Test the Application

Open your browser to: **`http://localhost:5173`**

### Pre-configured Demo Accounts (Password: `Password123!`)
On the login screen, you can click the instant demo buttons or use these credentials:

| Role | Email | Features to test |
|---|---|---|
| **🎓 Student (High CGPA)** | `arjun.sharma@student.campus.edu` | View eligible jobs, breakdown panel, submit applications, track interviews |
| **🎓 Student (With Backlog)** | `priya.nair@student.campus.edu` | Test eligibility rejection engine with backlogs and CGPA cutoffs |
| **💼 Recruiter** | `recruiter@nexustech.io` | Post new job openings, drag/move applicants through hiring stages, schedule interviews |
| **🛡️ Admin** | `admin@campus.edu` | View institutional placement rate charts, approve pending partner companies & jobs, inspect audit logs |

---

## 🔍 Step 5: Prisma Studio (Optional)
To inspect and manage database tables with a graphical UI:
```bash
cd backend
npx prisma studio
```
Visit `http://localhost:5555`.
