import { Router } from 'express'
import { z } from 'zod'
import { authService } from '../services/authService'
import { validate } from '../middleware/validate'
import { authenticate } from '../middleware/authenticate'

export const authRouter = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['STUDENT', 'RECRUITER', 'ADMIN']),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  studentId: z.string().optional(),
  departmentId: z.string().optional(),
  branch: z.string().optional(),
  graduationYear: z.number().optional(),
  cgpa: z.number().min(0).max(10).optional(),
  companyName: z.string().optional(),
  designation: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

const refreshSchema = z.object({
  refreshToken: z.string()
})

authRouter.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.register(req.body, req.ip, req.headers['user-agent'])
    res.status(201).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

authRouter.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body
    const result = await authService.login(email, password, req.ip, req.headers['user-agent'])
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

authRouter.post('/refresh', validate(refreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    const result = await authService.refreshTokens(refreshToken)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

authRouter.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user!.userId)
    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
})
