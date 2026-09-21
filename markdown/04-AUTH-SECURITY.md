# 04 — Auth & Security

## Authentication Flow

```
REGISTRATION
────────────
1. Client sends { email, password, role, ...profileData }
2. Server validates with Zod
3. Check email uniqueness
4. Hash password with bcrypt (rounds: 12)
5. Create User + Profile in a single Prisma transaction
6. Return { user, accessToken, refreshToken }

LOGIN
─────
1. Client sends { email, password }
2. Server finds User by email
3. bcrypt.compare(password, user.passwordHash)
4. If match → generate accessToken (15m) + refreshToken (7d)
5. Store refreshToken hash in RefreshToken table
6. Return { user, accessToken }
   + Set refreshToken in HttpOnly cookie (Secure, SameSite=Strict)

TOKEN REFRESH
─────────────
1. Client sends request with expired accessToken
2. Interceptor catches 401
3. Axios interceptor sends POST /api/auth/refresh
4. Server reads refreshToken from HttpOnly cookie
5. Validates against DB (not revoked, not expired)
6. Issues new accessToken + rotates refreshToken
7. Old refreshToken is revoked immediately (rotation)

LOGOUT
──────
1. Client sends POST /api/auth/logout
2. Server revokes all refreshTokens for this user
3. Client clears local storage / in-memory accessToken
```

---

## JWT Implementation

```ts
// server/src/lib/jwt.ts
import jwt from 'jsonwebtoken'

export interface TokenPayload {
  sub: string      // user ID
  role: Role       // STUDENT | RECRUITER | ADMIN
  iat: number
  exp: number
}

export const signAccessToken = (userId: string, role: Role): string =>
  jwt.sign(
    { sub: userId, role },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  )

export const signRefreshToken = (userId: string): string =>
  jwt.sign(
    { sub: userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  )

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload
```

> **Critical:** The role inside the JWT is set by the server at login — never trust role from the request body.

---

## Middleware Stack

### `authenticate.ts`

```ts
export const authenticate = async (
  req: Request, res: Response, next: NextFunction
) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = verifyAccessToken(token)
    // Fetch fresh user to catch suspended accounts
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Account inactive or not found' })
    }
    req.user = user  // attach to request
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
```

### `authorizeRole.ts`

```ts
export const authorizeRole = (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    // Role comes from req.user (set by authenticate middleware, from DB)
    // NEVER from req.body or req.query
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }

// Convenience shorthands
export const requireStudent   = authorizeRole('STUDENT')
export const requireRecruiter = authorizeRole('RECRUITER')
export const requireAdmin     = authorizeRole('ADMIN')
```

### `authorizeOwner.ts` — IDOR Protection

```ts
// Ensures a recruiter can only modify their own company/job
export const requireJobOwnership = async (
  req: Request, res: Response, next: NextFunction
) => {
  const { id: jobId } = req.params
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    include: { company: true }
  })
  if (!job) return res.status(404).json({ error: 'Job not found' })

  const recruiterProfile = await prisma.recruiterProfile.findUnique({
    where: { userId: req.user.id }
  })
  if (job.company.recruiterId !== recruiterProfile?.id) {
    return res.status(403).json({ error: 'You do not own this resource' })
  }
  req.job = job
  next()
}

// Ensures a student can only see their own application
export const requireApplicationOwnership = async (
  req: Request, res: Response, next: NextFunction
) => {
  const { id: appId } = req.params
  const application = await prisma.application.findUnique({
    where: { id: appId }
  })
  if (!application) return res.status(404).json({ error: 'Not found' })

  const student = await prisma.studentProfile.findUnique({
    where: { userId: req.user.id }
  })
  if (application.studentId !== student?.id) {
    return res.status(403).json({ error: 'Access denied' })
  }
  next()
}
```

### `validate.ts` — Request validation

```ts
export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        issues: result.error.flatten().fieldErrors
      })
    }
    req.body = result.data   // use parsed, typed data
    next()
  }
```

---

## Route Protection Pattern

```ts
// student.routes.ts
router.get(
  '/opportunities/:id/eligibility',
  authenticate,
  requireStudent,
  studentController.checkEligibility
)

router.post(
  '/opportunities/:id/apply',
  authenticate,
  requireStudent,
  validate(applySchema),
  studentController.applyToJob
)

// recruiter.routes.ts
router.put(
  '/jobs/:id',
  authenticate,
  requireRecruiter,
  requireJobOwnership,   // IDOR check
  validate(updateJobSchema),
  recruiterController.updateJob
)

// admin.routes.ts
router.patch(
  '/companies/:id/approve',
  authenticate,
  requireAdmin,
  adminController.approveCompany
)
```

---

## Security Checklist

| Risk | Mitigation |
|------|-----------|
| Password plaintext storage | bcrypt with 12 rounds |
| JWT secret leakage | Environment variables only, never in code |
| Role forgery from client | Role read from DB via JWT `sub`, never from request |
| IDOR attacks | Object-level ownership check on every resource mutation |
| SQL injection | Prisma ORM parameterizes all queries |
| XSS | React escapes by default; no `dangerouslySetInnerHTML` |
| CSRF | JWT in header (not cookie) is immune to CSRF |
| Brute force | Rate limiter on /api/auth: 20 req/15min |
| Mass assignment | Zod schemas whitelist allowed fields |
| Large payloads | `express.json({ limit: '10kb' })` |
| Sensitive data exposure | Password hash never included in API responses |
| Token persistence after logout | RefreshToken revoked in DB on logout |
| Suspended account re-entry | Fresh DB lookup on every request in `authenticate` |
| Clickjacking | Helmet sets `X-Frame-Options: DENY` |
| MIME sniffing | Helmet sets `X-Content-Type-Options: nosniff` |
| Information leakage | Generic error messages in production |

---

## Error Response Standard

All API errors follow this format:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "issues": {
    "cgpa": ["Must be between 0 and 10"]
  }
}
```

HTTP status codes:
- `400` Bad Request — validation failure
- `401` Unauthorized — not authenticated
- `403` Forbidden — authenticated but not permitted
- `404` Not Found — resource missing
- `409` Conflict — duplicate (e.g., already applied)
- `422` Unprocessable — business rule violation (e.g., ineligible)
- `500` Internal Server Error — unexpected

---

## Axios Interceptors (Client)

```ts
// client/src/lib/axios.ts
import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

// Inject token
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — try refresh
let refreshing = false
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry && !refreshing) {
      original._retry = true
      refreshing = true
      try {
        const { data } = await api.post('/auth/refresh')
        useAuthStore.getState().setAccessToken(data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        refreshing = false
        return api(original)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
```
