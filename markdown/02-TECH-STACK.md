# 02 — Tech Stack

## Quick Reference

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend framework | React | 18.x | Component-based UI |
| Language | TypeScript | 5.x | Type safety across the stack |
| Build tool | Vite | 5.x | Fast dev server, HMR |
| Routing | React Router v6 | 6.x | Client-side routing, protected routes |
| Styling | Tailwind CSS | 3.x | Utility-first, responsive by default |
| Component library | shadcn/ui | latest | Accessible, headless components |
| Icons | Lucide React | latest | Consistent icon set |
| Forms | React Hook Form + Zod | 7.x / 3.x | Performant forms + schema validation |
| Data fetching | TanStack Query (React Query) | 5.x | Cache, loading/error states, refetch |
| Client state | Zustand | 4.x | Auth state, lightweight |
| Charts | Recharts | 2.x | Analytics dashboards |
| HTTP client | Axios | 1.x | Interceptors for JWT injection |
| Backend runtime | Node.js | 20 LTS | Server runtime |
| Backend framework | Express.js | 4.x | REST API routing, middleware |
| ORM | Prisma | 5.x | Type-safe DB access, migrations |
| Database | PostgreSQL | 16 | Relational DB, ACID transactions |
| Auth | JWT + bcryptjs | — | Stateless auth + password hashing |
| Validation | Zod | 3.x | Shared schemas (client + server) |
| Environment | dotenv | — | Secret management |
| Rate limiting | express-rate-limit | — | Brute force protection |
| Security headers | Helmet.js | — | HTTP security headers |
| CORS | cors | — | Cross-origin configuration |

---

## Frontend Setup

```bash
# Scaffold
npm create vite@latest client -- --template react-ts
cd client

# Core
npm install react-router-dom
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install axios
npm install zustand

# UI
npm install tailwindcss @tailwindcss/forms autoprefixer postcss
npm install lucide-react
npm install class-variance-authority clsx tailwind-merge
npx shadcn-ui@latest init

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Charts
npm install recharts

# Toast notifications
npm install sonner

# Date utilities
npm install date-fns
```

### `vite.config.ts` — API proxy for dev

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

### `tailwind.config.ts`

```ts
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
```

---

## Backend Setup

```bash
mkdir server && cd server
npm init -y
npm install typescript ts-node @types/node --save-dev
npx tsc --init

# Express + types
npm install express
npm install @types/express --save-dev

# Database
npm install prisma @prisma/client
npx prisma init

# Auth
npm install jsonwebtoken bcryptjs
npm install @types/jsonwebtoken @types/bcryptjs --save-dev

# Validation
npm install zod

# Security
npm install helmet cors express-rate-limit
npm install @types/cors --save-dev

# Utilities
npm install dotenv date-fns uuid
npm install @types/uuid --save-dev

# Dev
npm install nodemon --save-dev
```

### `tsconfig.json` (server)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### `package.json` scripts

```json
{
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "ts-node prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

---

## Environment Variables

### `server/.env`

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/placement_portal"

# JWT
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
CLIENT_URL=http://localhost:5173

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### `client/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> **Never commit `.env` files. Add to `.gitignore` immediately.**

---

## Express App Bootstrap (`server/src/app.ts`)

```ts
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { authRoutes } from './routes/auth.routes'
import { studentRoutes } from './routes/student.routes'
import { recruiterRoutes } from './routes/recruiter.routes'
import { adminRoutes } from './routes/admin.routes'
import { errorHandler } from './middleware/errorHandler'

const app = express()

// Security
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))

// Rate limiting
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, slow down.' }
}))

// Body parsing
app.use(express.json({ limit: '10kb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/recruiters', recruiterRoutes)
app.use('/api/admin', adminRoutes)

// Centralized error handler (must be last)
app.use(errorHandler)

export default app
```

---

## Docker Compose (PostgreSQL for local dev)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: placement_portal
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```bash
docker compose up -d
```
