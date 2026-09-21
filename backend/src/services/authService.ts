import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Role } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { env } from '../config/env'
import { JwtPayload } from '../types/express'
import { auditService } from './auditService'

export interface RegisterInput {
  email: string
  password: string
  role: Role
  fullName: string
  phone?: string
  studentId?: string
  departmentId?: string
  branch?: string
  graduationYear?: number
  cgpa?: number
  companyName?: string
  designation?: string
}

export class AuthService {
  async register(input: RegisterInput, ipAddress?: string, userAgent?: string) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() }
    })

    if (existing) {
      const err: any = new Error('An account with this email address already exists.')
      err.statusCode = 409
      err.code = 'USER_ALREADY_EXISTS'
      throw err
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email.toLowerCase().trim(),
          passwordHash,
          role: input.role
        }
      })

      if (input.role === Role.STUDENT) {
        if (!input.studentId) {
          const err: any = new Error('studentId is required for student registration.')
          err.statusCode = 400
          throw err
        }
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            studentId: input.studentId,
            fullName: input.fullName,
            phone: input.phone,
            branch: input.branch,
            departmentId: input.departmentId,
            graduationYear: input.graduationYear,
            cgpa: input.cgpa,
            profileComplete: false,
            completionPct: 60
          }
        })
      } else if (input.role === Role.RECRUITER) {
        const recruiter = await tx.recruiterProfile.create({
          data: {
            userId: user.id,
            fullName: input.fullName,
            phone: input.phone,
            designation: input.designation || 'Hiring Manager'
          }
        })

        if (input.companyName) {
          await tx.company.create({
            data: {
              recruiterId: recruiter.id,
              name: input.companyName,
              status: 'PENDING'
            }
          })
        }
      }

      return user
    })

    await auditService.log(result.id, 'USER_REGISTERED', 'User', result.id, null, { email: result.email, role: result.role }, ipAddress, userAgent)

    return this.generateTokens(result)
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        studentProfile: true,
        recruiterProfile: { include: { company: true } }
      }
    })

    if (!user || !user.isActive) {
      const err: any = new Error('Invalid email or password.')
      err.statusCode = 401
      err.code = 'INVALID_CREDENTIALS'
      throw err
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      const err: any = new Error('Invalid email or password.')
      err.statusCode = 401
      err.code = 'INVALID_CREDENTIALS'
      throw err
    }

    await auditService.log(user.id, 'USER_LOGIN', 'User', user.id, null, null, ipAddress, userAgent)

    return this.generateTokens(user)
  }

  async refreshTokens(refreshToken: string) {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    })

    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
      const err: any = new Error('Invalid or expired refresh token.')
      err.statusCode = 401
      err.code = 'INVALID_REFRESH_TOKEN'
      throw err
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revoked: true }
    })

    return this.generateTokens(tokenRecord.user)
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        studentProfile: {
          include: {
            department: true,
            skills: { include: { skill: true } }
          }
        },
        recruiterProfile: {
          include: { company: true }
        }
      }
    })

    if (!user) {
      const err: any = new Error('User not found.')
      err.statusCode = 404
      throw err
    }

    return user
  }

  private async generateTokens(user: { id: string; email: string; role: Role }) {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    }

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN
    })

    const refreshTokenString = `${jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' })}_${Date.now()}`
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshTokenString,
        expiresAt
      }
    })

    return {
      accessToken,
      refreshToken: refreshTokenString,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }
  }
}

export const authService = new AuthService()
