import { Router } from 'express'
import { z } from 'zod'
import { recruiterService } from '../services/recruiterService'
import { authenticate } from '../middleware/authenticate'
import { authorizeRole } from '../middleware/authorizeRole'
import { validate } from '../middleware/validate'
import { Role } from '@prisma/client'

export const recruiterRouter = Router()

recruiterRouter.use(authenticate, authorizeRole(Role.RECRUITER))

recruiterRouter.get('/profile', async (req, res, next) => {
  try {
    const profile = await recruiterService.getProfile(req.user!.userId)
    res.json({ success: true, data: profile })
  } catch (err) {
    next(err)
  }
})

recruiterRouter.put('/company', async (req, res, next) => {
  try {
    const company = await recruiterService.updateCompany(req.user!.userId, req.body)
    res.json({ success: true, data: company })
  } catch (err) {
    next(err)
  }
})

recruiterRouter.get('/jobs', async (req, res, next) => {
  try {
    const jobs = await recruiterService.getJobs(req.user!.userId)
    res.json({ success: true, data: jobs })
  } catch (err) {
    next(err)
  }
})

const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  responsibilities: z.string().optional(),
  jobType: z.enum(['FULL_TIME', 'INTERNSHIP', 'INTERNSHIP_PPO', 'PART_TIME']),
  workMode: z.enum(['REMOTE', 'HYBRID', 'ON_SITE']).default('ON_SITE'),
  city: z.string().optional(),
  state: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  stipend: z.number().optional(),
  ppoCTC: z.number().optional(),
  openings: z.number().default(1),
  deadline: z.string(),
  minCgpa: z.number().optional(),
  maxBacklogs: z.number().optional(),
  allowedDepts: z.array(z.string()).optional(),
  allowedGradYears: z.array(z.number()).optional(),
  requiredSkills: z.array(z.string()).optional()
})

recruiterRouter.post('/jobs', validate(createJobSchema), async (req, res, next) => {
  try {
    const job = await recruiterService.createJob(req.user!.userId, req.body)
    res.status(201).json({ success: true, data: job })
  } catch (err) {
    next(err)
  }
})

recruiterRouter.get('/jobs/:id/applications', async (req, res, next) => {
  try {
    const applications = await recruiterService.getJobApplications(req.user!.userId, req.params.id)
    res.json({ success: true, data: applications })
  } catch (err) {
    next(err)
  }
})

const updateStatusSchema = z.object({
  status: z.enum(['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED', 'WITHDRAWN']),
  note: z.string().optional()
})

recruiterRouter.patch('/applications/:id/status', validate(updateStatusSchema), async (req, res, next) => {
  try {
    const updated = await recruiterService.updateApplicationStatus(
      req.user!.userId,
      req.params.id,
      req.body.status,
      req.body.note
    )
    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
})

const scheduleInterviewSchema = z.object({
  roundName: z.string().min(2),
  scheduledAt: z.string(),
  durationMins: z.number().optional(),
  mode: z.enum(['ONLINE', 'IN_PERSON', 'PHONE']),
  meetingLink: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional()
})

recruiterRouter.post('/applications/:id/interview', validate(scheduleInterviewSchema), async (req, res, next) => {
  try {
    const interview = await recruiterService.scheduleInterview(
      req.user!.userId,
      req.params.id,
      req.body
    )
    res.status(201).json({ success: true, data: interview })
  } catch (err) {
    next(err)
  }
})
