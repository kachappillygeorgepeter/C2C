import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'
import { JwtPayload } from '../types/express'
import { prisma } from '../lib/prisma'

// Optional Supabase admin client if environment variables are provided
const supabase = (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  : null

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required. Missing or malformed Bearer token.' }
    })
  }

  const token = authHeader.split(' ')[1]

  // 1. Try custom local JWT first (fast synchronous check)
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    req.user = decoded
    return next()
  } catch (customJwtErr: any) {
    // If not a local JWT and Supabase is not configured, return standard error
    if (!supabase) {
      if (customJwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: { code: 'TOKEN_EXPIRED', message: 'Token has expired. Please refresh your session.' }
        })
      }
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid authentication token.' }
      })
    }

    // 2. Fallback: Verify via Supabase Auth
    try {
      const { data, error } = await supabase.auth.getUser(token)
      if (error || !data?.user || !data.user.email) {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_TOKEN', message: error?.message || 'Invalid authentication token.' }
        })
      }

      const email = data.user.email.toLowerCase().trim()

      // Look up user in local database
      let dbUser = await prisma.user.findUnique({
        where: { email }
      })

      // If user does not exist yet (e.g. initial Google OAuth / Supabase login), auto-provision
      if (!dbUser) {
        const role = (data.user.user_metadata?.role as any) || 'STUDENT'
        const fullName = data.user.user_metadata?.full_name || email.split('@')[0]

        dbUser = await prisma.user.create({
          data: {
            email,
            passwordHash: 'SUPABASE_EXTERNAL_MANAGED',
            role,
            ...(role === 'STUDENT'
              ? {
                  studentProfile: {
                    create: {
                      studentId: `STU-${Date.now().toString().slice(-6)}`,
                      fullName,
                      profileComplete: false,
                      completionPct: 50
                    }
                  }
                }
              : role === 'RECRUITER'
              ? {
                  recruiterProfile: {
                    create: {
                      fullName,
                      designation: 'Talent Acquisition'
                    }
                  }
                }
              : {})
          }
        })
      }

      req.user = {
        userId: dbUser.id,
        email: dbUser.email,
        role: dbUser.role
      }

      return next()
    } catch (supabaseErr: any) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_FAILED', message: supabaseErr.message || 'Authentication failed.' }
      })
    }
  }
}
