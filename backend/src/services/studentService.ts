import { prisma } from '../lib/prisma'
import { eligibilityService } from './eligibilityEngine'
import { notificationService } from './notificationService'
import { auditService } from './auditService'
import { ApplicationStatus, NotificationType } from '@prisma/client'

export class StudentService {
  async getProfile(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        department: true,
        skills: { include: { skill: true } },
        certifications: true,
        projects: true
      }
    })
    if (!profile) {
      const err: any = new Error('Student profile not found.')
      err.statusCode = 404
      throw err
    }
    return profile
  }

  async updateProfile(userId: string, data: any) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } })
    if (!profile) {
      const err: any = new Error('Student profile not found.')
      err.statusCode = 404
      throw err
    }

    // Calculate completeness
    let filledFields = 0
    const fieldsToCheck = [
      profile.fullName,
      profile.phone || data.phone,
      profile.branch || data.branch,
      profile.cgpa !== null ? profile.cgpa : data.cgpa,
      profile.graduationYear || data.graduationYear,
      profile.tenthPercent || data.tenthPercent,
      profile.twelfthPercent || data.twelfthPercent,
      profile.resumeUrl || data.resumeUrl
    ]
    fieldsToCheck.forEach((val) => {
      if (val !== undefined && val !== null && val !== '') filledFields++
    })
    const completionPct = Math.min(100, Math.round((filledFields / fieldsToCheck.length) * 100))

    return prisma.studentProfile.update({
      where: { userId },
      data: {
        ...data,
        completionPct,
        profileComplete: completionPct >= 70
      }
    })
  }

  async getOpportunities(userId: string, query: { search?: string; type?: string; location?: string }) {
    const jobs = await prisma.jobPosting.findMany({
      where: {
        status: 'PUBLISHED',
        company: { status: 'APPROVED' },
        ...(query.type ? { jobType: query.type as any } : {}),
        ...(query.location ? { city: { contains: query.location, mode: 'insensitive' } } : {}),
        ...(query.search
          ? {
              OR: [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
                { company: { name: { contains: query.search, mode: 'insensitive' } } }
              ]
            }
          : {})
      },
      include: {
        company: true,
        eligibility: true,
        skills: { include: { skill: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Map each opportunity with real-time eligibility evaluation
    const results = await Promise.all(
      jobs.map(async (job) => {
        const evalResult = await eligibilityService.evaluate(userId, job.id)
        return {
          ...job,
          eligibilityResult: evalResult
        }
      })
    )

    return results
  }

  async getOpportunityById(userId: string, jobId: string) {
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: {
        company: true,
        eligibility: true,
        skills: { include: { skill: true } }
      }
    })
    if (!job) {
      const err: any = new Error('Job not found.')
      err.statusCode = 404
      throw err
    }

    const eligibilityResult = await eligibilityService.evaluate(userId, jobId)
    return { ...job, eligibilityResult }
  }

  async apply(userId: string, jobId: string, coverLetter?: string, resumeUrl?: string) {
    // 1. Mandatory server-side eligibility check
    const evalResult = await eligibilityService.evaluate(userId, jobId)
    if (!evalResult.eligible) {
      const err: any = new Error('Ineligible to apply: ' + evalResult.reasons.join('; '))
      err.statusCode = 400
      err.code = 'ELIGIBILITY_FAILED'
      err.details = evalResult.checks
      throw err
    }

    const student = await prisma.studentProfile.findUnique({ where: { userId } })
    if (!student) {
      const err: any = new Error('Student profile missing.')
      err.statusCode = 404
      throw err
    }

    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: { company: { include: { recruiter: true } } }
    })
    if (!job) {
      const err: any = new Error('Job not found.')
      err.statusCode = 404
      throw err
    }

    // 2. Create Application in transaction with initial status history
    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          studentId: student.id,
          jobPostingId: jobId,
          coverLetter,
          resumeSnapshot: resumeUrl || student.resumeUrl,
          status: ApplicationStatus.APPLIED
        }
      })

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: app.id,
          newStatus: ApplicationStatus.APPLIED,
          changedById: userId,
          note: 'Application submitted by candidate'
        }
      })

      return app
    })

    // 3. Notify recruiter
    const recruiterUserId = job.company.recruiter.userId
    await notificationService.notifyUser(
      recruiterUserId,
      NotificationType.NEW_APPLICANT,
      'New Applicant Received',
      `${student.fullName} applied for ${job.title}`,
      `/recruiter/jobs/${jobId}/applications`
    )

    // 4. Notify student
    await notificationService.notifyUser(
      userId,
      NotificationType.APPLICATION_SUBMITTED,
      'Application Submitted',
      `Your application for ${job.title} at ${job.company.name} was successfully submitted.`
    )

    await auditService.log(userId, 'APPLICATION_SUBMITTED', 'Application', application.id)

    return application
  }

  async getApplications(userId: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } })
    if (!student) return []

    return prisma.application.findMany({
      where: { studentId: student.id },
      include: {
        jobPosting: {
          include: {
            company: true
          }
        },
        interviews: {
          orderBy: { scheduledAt: 'asc' }
        },
        history: {
          orderBy: { changedAt: 'desc' }
        }
      },
      orderBy: { appliedAt: 'desc' }
    })
  }

  async withdrawApplication(userId: string, applicationId: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } })
    if (!student) {
      const err: any = new Error('Student profile not found.')
      err.statusCode = 404
      throw err
    }

    const app = await prisma.application.findUnique({
      where: { id: applicationId }
    })

    if (!app || app.studentId !== student.id) {
      const err: any = new Error('Application not found or unauthorized.')
      err.statusCode = 404
      throw err
    }

    if (app.status === ApplicationStatus.SELECTED || app.status === ApplicationStatus.REJECTED) {
      const err: any = new Error('Cannot withdraw an application that has completed the recruitment cycle.')
      err.statusCode = 400
      throw err
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.application.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.WITHDRAWN }
      })

      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          previousStatus: app.status,
          newStatus: ApplicationStatus.WITHDRAWN,
          changedById: userId,
          note: 'Withdrawn by student'
        }
      })

      return res
    })

    await auditService.log(userId, 'APPLICATION_WITHDRAWN', 'Application', applicationId)
    return updated
  }
}

export const studentService = new StudentService()
