import { prisma } from '../lib/prisma'
import { notificationService } from './notificationService'
import { auditService } from './auditService'
import { ApplicationStatus, JobStatus, NotificationType, InterviewMode } from '@prisma/client'

export class RecruiterService {
  async getProfile(userId: string) {
    return prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { company: true }
    })
  }

  async updateCompany(userId: string, data: any) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { company: true }
    })

    if (!recruiter) {
      const err: any = new Error('Recruiter profile not found.')
      err.statusCode = 404
      throw err
    }

    if (recruiter.company) {
      return prisma.company.update({
        where: { id: recruiter.company.id },
        data
      })
    }

    return prisma.company.create({
      data: {
        recruiterId: recruiter.id,
        ...data,
        status: 'PENDING'
      }
    })
  }

  async getJobs(userId: string) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { company: true }
    })
    if (!recruiter || !recruiter.company) return []

    return prisma.jobPosting.findMany({
      where: { companyId: recruiter.company.id },
      include: {
        eligibility: true,
        skills: { include: { skill: true } },
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async createJob(userId: string, data: any) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { company: true }
    })

    if (!recruiter || !recruiter.company) {
      const err: any = new Error('Recruiter company profile required before posting jobs.')
      err.statusCode = 400
      throw err
    }

    const { minCgpa, maxBacklogs, allowedDepts, allowedGradYears, requiredSkills, skills, ...jobData } = data

    const job = await prisma.jobPosting.create({
      data: {
        ...jobData,
        companyId: recruiter.company.id,
        status: JobStatus.PENDING_APPROVAL, // Admin approval gate
        deadline: new Date(jobData.deadline),
        eligibility: {
          create: {
            minCgpa: minCgpa ? parseFloat(minCgpa) : null,
            maxBacklogs: maxBacklogs !== undefined ? parseInt(maxBacklogs) : null,
            allowedDepts: allowedDepts || [],
            allowedGradYears: (allowedGradYears || []).map((y: any) => parseInt(y)),
            requiredSkills: requiredSkills || []
          }
        }
      },
      include: {
        eligibility: true
      }
    })

    await auditService.log(userId, 'JOB_POSTED', 'JobPosting', job.id, null, { title: job.title })
    return job
  }

  async getJobApplications(userId: string, jobId: string) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { company: true }
    })

    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId }
    })

    if (!job || !recruiter || !recruiter.company || job.companyId !== recruiter.company.id) {
      const err: any = new Error('Job not found or access forbidden (IDOR protection).')
      err.statusCode = 403
      throw err
    }

    return prisma.application.findMany({
      where: { jobPostingId: jobId },
      include: {
        student: {
          include: {
            department: true,
            skills: { include: { skill: true } }
          }
        },
        interviews: true,
        history: { orderBy: { changedAt: 'desc' } }
      },
      orderBy: { appliedAt: 'desc' }
    })
  }

  async updateApplicationStatus(userId: string, applicationId: string, newStatus: ApplicationStatus, note?: string) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { company: true }
    })

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobPosting: true,
        student: { include: { user: true } }
      }
    })

    if (!app || !recruiter || !recruiter.company || app.jobPosting.companyId !== recruiter.company.id) {
      const err: any = new Error('Application not found or unauthorized.')
      err.statusCode = 403
      throw err
    }

    const previousStatus = app.status

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.application.update({
        where: { id: applicationId },
        data: {
          status: newStatus,
          recruiterNote: note || app.recruiterNote
        }
      })

      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          previousStatus,
          newStatus,
          changedById: userId,
          note: note || `Status updated to ${newStatus}`
        }
      })

      return res
    })

    // Notify student of stage progression
    await notificationService.notifyUser(
      app.student.userId,
      NotificationType.STATUS_CHANGED,
      `Application Status Update: ${newStatus}`,
      `Your application for ${app.jobPosting.title} has moved to ${newStatus}.`,
      `/student/applications/${applicationId}`
    )

    await auditService.log(userId, 'APPLICATION_STATUS_UPDATED', 'Application', applicationId, { previousStatus }, { newStatus })

    return updated
  }

  async scheduleInterview(
    userId: string,
    applicationId: string,
    interviewData: {
      roundName: string
      scheduledAt: string
      durationMins?: number
      mode: InterviewMode
      meetingLink?: string
      location?: string
      notes?: string
    }
  ) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { company: true }
    })

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobPosting: true,
        student: { include: { user: true } }
      }
    })

    if (!app || !recruiter || !recruiter.company || app.jobPosting.companyId !== recruiter.company.id) {
      const err: any = new Error('Application not found or unauthorized.')
      err.statusCode = 403
      throw err
    }

    const interview = await prisma.interview.create({
      data: {
        applicationId,
        roundName: interviewData.roundName,
        scheduledAt: new Date(interviewData.scheduledAt),
        durationMins: interviewData.durationMins || 45,
        mode: interviewData.mode,
        meetingLink: interviewData.meetingLink,
        location: interviewData.location,
        notes: interviewData.notes
      }
    })

    // Advance status to INTERVIEW_SCHEDULED if not already further
    if (app.status === ApplicationStatus.APPLIED || app.status === ApplicationStatus.SHORTLISTED) {
      await this.updateApplicationStatus(
        userId,
        applicationId,
        ApplicationStatus.INTERVIEW_SCHEDULED,
        `Interview scheduled: ${interviewData.roundName}`
      )
    }

    await notificationService.notifyUser(
      app.student.userId,
      NotificationType.INTERVIEW_SCHEDULED,
      `Interview Scheduled: ${interviewData.roundName}`,
      `Interview scheduled for ${app.jobPosting.title} on ${new Date(interviewData.scheduledAt).toLocaleString()}`,
      `/student/applications/${applicationId}`
    )

    return interview
  }
}

export const recruiterService = new RecruiterService()
