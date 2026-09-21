import { Router } from 'express'
import { z } from 'zod'
import { studentService } from '../services/studentService'
import { authenticate } from '../middleware/authenticate'
import { authorizeRole } from '../middleware/authorizeRole'
import { validate } from '../middleware/validate'
import { Role } from '@prisma/client'

export const studentRouter = Router()

studentRouter.use(authenticate, authorizeRole(Role.STUDENT))

studentRouter.get('/profile', async (req, res, next) => {
  try {
    const profile = await studentService.getProfile(req.user!.userId)
    res.json({ success: true, data: profile })
  } catch (err) {
    next(err)
  }
})

studentRouter.put('/profile', async (req, res, next) => {
  try {
    const updated = await studentService.updateProfile(req.user!.userId, req.body)
    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
})

studentRouter.get('/opportunities', async (req, res, next) => {
  try {
    const { search, type, location } = req.query as any
    const opportunities = await studentService.getOpportunities(req.user!.userId, { search, type, location })
    res.json({ success: true, data: opportunities })
  } catch (err) {
    next(err)
  }
})

studentRouter.get('/opportunities/:id', async (req, res, next) => {
  try {
    const opportunity = await studentService.getOpportunityById(req.user!.userId, req.params.id)
    res.json({ success: true, data: opportunity })
  } catch (err) {
    next(err)
  }
})

const applySchema = z.object({
  coverLetter: z.string().optional(),
  resumeUrl: z.string().optional()
})

studentRouter.post('/opportunities/:id/apply', validate(applySchema), async (req, res, next) => {
  try {
    const application = await studentService.apply(
      req.user!.userId,
      req.params.id,
      req.body.coverLetter,
      req.body.resumeUrl
    )
    res.status(201).json({ success: true, data: application })
  } catch (err) {
    next(err)
  }
})

studentRouter.get('/applications', async (req, res, next) => {
  try {
    const applications = await studentService.getApplications(req.user!.userId)
    res.json({ success: true, data: applications })
  } catch (err) {
    next(err)
  }
})

studentRouter.post('/applications/:id/withdraw', async (req, res, next) => {
  try {
    const withdrawn = await studentService.withdrawApplication(req.user!.userId, req.params.id)
    res.json({ success: true, data: withdrawn })
  } catch (err) {
    next(err)
  }
})
