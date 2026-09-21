import { Request, Response, NextFunction } from 'express'
import { Role } from '@prisma/client'

export const authorizeRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access forbidden for role ${req.user.role}. Required: ${allowedRoles.join(', ')}`
        }
      })
    }

    return next()
  }
}
