import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  code?: string
  details?: any
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const code = err.code || 'INTERNAL_SERVER_ERROR'
  const message = err.message || 'An unexpected error occurred.'

  if (process.env.NODE_ENV === 'development' || statusCode === 500) {
    console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.originalUrl}:`, err)
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(err.details ? { details: err.details } : {})
    }
  })
}
