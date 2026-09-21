import { prisma } from '../lib/prisma'
import { notificationService } from './notificationService'
import { auditService } from './auditService'
import { CompanyStatus, JobStatus, NotificationType } from '@prisma/client'

export class AdminService {
  async getDashboardMetrics() {
    const [totalStudents, totalRecruiters, totalCompanies, totalJobs, totalApplications, selectedCount] =
      await Promise.all([
        prisma.studentProfile.count(),
        prisma.recruiterProfile.count(),
        prisma.company.count(),
        prisma.jobPosting.count(),
        prisma.application.count(),
        prisma.application.count({ where: { status: 'SELECTED' } })
      ])

    const placementRate = totalStudents > 0 ? Math.round((selectedCount / totalStudents) * 100) : 0

    // Average CTC for full-time jobs
    const salaryAgg = await prisma.jobPosting.aggregate({
      _avg: { salaryMax: true },
      _max: { salaryMax: true }
    })

    return {
      totalStudents,
      totalRecruiters,
      totalCompanies,
      totalJobs,
      totalApplications,
      placedStudents: selectedCount,
      placementRate,
      avgSalary: Math.round(salaryAgg._avg.salaryMax || 0),
      highestSalary: salaryAgg._max.salaryMax || 0
    }
  }

  async getPendingCompanies() {
    return prisma.company.findMany({
      where: { status: CompanyStatus.PENDING },
      include: {
        recruiter: {
          include: {
            user: { select: { email: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async reviewCompany(userId: string, companyId: string, status: CompanyStatus, adminNote?: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { recruiter: true }
    })

    if (!company) {
      const err: any = new Error('Company not found.')
      err.statusCode = 404
      throw err
    }

    const updated = await prisma.company.update({
      where: { id: companyId },
      data: {
        status,
        adminNote,
        reviewedAt: new Date()
      }
    })

    await notificationService.notifyUser(
      company.recruiter.userId,
      status === CompanyStatus.APPROVED ? NotificationType.COMPANY_APPROVED : NotificationType.COMPANY_REJECTED,
      `Company Verification: ${status}`,
      `Your company profile has been ${status.toLowerCase()} by the placement cell.${adminNote ? ' Note: ' + adminNote : ''}`
    )

    await auditService.log(userId, `COMPANY_${status}`, 'Company', companyId, { previousStatus: company.status }, { status, adminNote })

    return updated
  }

  async getPendingJobs() {
    return prisma.jobPosting.findMany({
      where: { status: JobStatus.PENDING_APPROVAL },
      include: {
        company: true,
        eligibility: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async reviewJob(userId: string, jobId: string, status: JobStatus, adminNote?: string) {
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: { company: { include: { recruiter: true } } }
    })

    if (!job) {
      const err: any = new Error('Job not found.')
      err.statusCode = 404
      throw err
    }

    const updated = await prisma.jobPosting.update({
      where: { id: jobId },
      data: {
        status,
        adminNote,
        reviewedAt: new Date(),
        publishedAt: status === JobStatus.PUBLISHED ? new Date() : job.publishedAt
      }
    })

    await notificationService.notifyUser(
      job.company.recruiter.userId,
      status === JobStatus.PUBLISHED ? NotificationType.JOB_APPROVED : NotificationType.JOB_REJECTED,
      `Job Posting Review: ${status}`,
      `Your job posting "${job.title}" was marked as ${status}.${adminNote ? ' Note: ' + adminNote : ''}`
    )

    await auditService.log(userId, `JOB_${status}`, 'JobPosting', jobId, { previousStatus: job.status }, { status, adminNote })

    return updated
  }

  async getStudents() {
    return prisma.studentProfile.findMany({
      include: {
        department: true,
        user: { select: { email: true, isActive: true } },
        _count: { select: { applications: true } }
      },
      orderBy: { studentId: 'asc' }
    })
  }

  async updateStudentVerification(userId: string, studentProfileId: string, data: { cgpa?: number; activeBacklogs?: number }) {
    const prev = await prisma.studentProfile.findUnique({ where: { id: studentProfileId } })
    if (!prev) {
      const err: any = new Error('Student profile not found.')
      err.statusCode = 404
      throw err
    }

    const updated = await prisma.studentProfile.update({
      where: { id: studentProfileId },
      data
    })

    await auditService.log(userId, 'STUDENT_ACADEMIC_VERIFIED', 'StudentProfile', studentProfileId, prev, data)
    return updated
  }

  async getAuditLogs(limit = 100) {
    return auditService.getLogs(limit)
  }
}

export const adminService = new AdminService()
