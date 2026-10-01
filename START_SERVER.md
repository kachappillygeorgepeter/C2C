# 🚀 How to Start the Server (Quick Run Instructions)

This document shows you **exact commands** and **where (which folder/terminal)** to run them to get both the Backend and Frontend servers running.

---

## 📌 Summary: At a Glance

| Service | Terminal / Directory | Commands to Run | Running URL |
| :--- | :--- | :--- | :--- |
| **Database** | Root (`C2C`) | `docker compose up -d` | `localhost:5432` |
| **Backend API** | `backend/` | `npm install`<br>`npx prisma migrate dev --name init`<br>`npm run seed`<br>`npm run dev` | `http://localhost:5000` |
| **Frontend UI** | `frontend/` | `npm install`<br>`npm run dev` | `http://localhost:5173` |

---

## 🛠️ Step-by-Step Instructions

### Step 1: Start the Database

> **Where:** In your root project directory (`c:\Users\dell\.vscode\Works\C2C`)

```bash
docker compose up -d
```

*(If you already have PostgreSQL installed locally without Docker, make sure PostgreSQL service is running on port `5432` and credentials match `backend/.env`)*.

---

### Step 2: Start the Backend Server

Open a **new terminal** window:

1. **Change directory to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies** (first time only):
   ```bash
   npm install
   ```

3. **Set up database schema & demo data** (first time only):
   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```

4. **Start the backend development server:**
   ```bash
   npm run dev
   ```

> ✅ **Backend will be live at:** `http://localhost:5000`

---

### Step 3: Start the Frontend Client

Open a **second terminal** window:

1. **Change directory to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies** (first time only):
   ```bash
   npm install
   ```

3. **Start the Vite frontend development server:**
   ```bash
   npm run dev
   ```

> ✅ **Frontend will be live at:** `http://localhost:5173`

---

## 🌐 Opening the App & Demo Logins

Open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

### Pre-seeded Demo Accounts
All pre-seeded demo accounts use the password: `Password123!`

- **Admin Account:** `admin@campus.edu`
- **Recruiter Account:** `recruiter@nexustech.io`
- **Student (Eligible/High CGPA):** `arjun.sharma@student.campus.edu`
- **Student (With Backlog):** `priya.nair@student.campus.edu`
