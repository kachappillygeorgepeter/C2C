import { Router } from 'express'
import { z } from 'zod'
import { adminService } from '../services/adminService'
import { authenticate } from '../middleware/authenticate'
import { authorizeRole } from '../middleware/authorizeRole'
import { validate } from '../middleware/validate'
import { Role, CompanyStatus, JobStatus } from '@prisma/client'

export const adminRouter = Router()

adminRouter.use(authenticate, authorizeRole(Role.ADMIN))

adminRouter.get('/dashboard', async (req, res, next) => {
  try {
    const metrics = await adminService.getDashboardMetrics()
    res.json({ success: true, data: metrics })
  } catch (err) {
    next(err)
  }
})

adminRouter.get('/companies/pending', async (req, res, next) => {
  try {
    const pending = await adminService.getPendingCompanies()
    res.json({ success: true, data: pending })
  } catch (err) {
    next(err)
  }
})

const reviewCompanySchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED']),
  adminNote: z.string().optional()
})

adminRouter.patch('/companies/:id/review', validate(reviewCompanySchema), async (req, res, next) => {
  try {
    const reviewed = await adminService.reviewCompany(
      req.user!.userId,
      req.params.id,
      req.body.status as CompanyStatus,
      req.body.adminNote
    )
    res.json({ success: true, data: reviewed })
  } catch (err) {
    next(err)
  }
})

adminRouter.get('/jobs/pending', async (req, res, next) => {
  try {
    const pending = await adminService.getPendingJobs()
    res.json({ success: true, data: pending })
  } catch (err) {
    next(err)
  }
})

const reviewJobSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'PUBLISHED']),
  adminNote: z.string().optional()
})

adminRouter.patch('/jobs/:id/review', validate(reviewJobSchema), async (req, res, next) => {
  try {
    const reviewed = await adminService.reviewJob(
      req.user!.userId,
      req.params.id,
      req.body.status as JobStatus,
      req.body.adminNote
    )
    res.json({ success: true, data: reviewed })
  } catch (err) {
    next(err)
  }
})

adminRouter.get('/students', async (req, res, next) => {
  try {
    const students = await adminService.getStudents()
    res.json({ success: true, data: students })
  } catch (err) {
    next(err)
  }
})

const verifyStudentSchema = z.object({
  cgpa: z.number().min(0).max(10).optional(),
  activeBacklogs: z.number().min(0).optional()
})

adminRouter.patch('/students/:id/verify', validate(verifyStudentSchema), async (req, res, next) => {
  try {
    const updated = await adminService.updateStudentVerification(
      req.user!.userId,
      req.params.id,
      req.body
    )
    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
})

adminRouter.get('/audit-logs', async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100
    const logs = await adminService.getAuditLogs(limit)
    res.json({ success: true, data: logs })
  } catch (err) {
    next(err)
  }
})
