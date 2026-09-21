import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { env } from './config/env'
import { authRouter } from './routes/authRouter'
import { studentRouter } from './routes/studentRouter'
import { recruiterRouter } from './routes/recruiterRouter'
import { adminRouter } from './routes/adminRouter'
import { notificationRouter } from './routes/notificationRouter'
import { errorHandler } from './middleware/errorHandler'

export const app = express()

// 1. Security Headers
app.use(helmet())

// 2. CORS setup
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
)

// 3. Body parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 4. Rate Limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  }
})
app.use('/api', limiter)

// 5. Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// 6. Application Routes
app.use('/api/auth', authRouter)
app.use('/api/students', studentRouter)
app.use('/api/recruiters', recruiterRouter)
app.use('/api/admin', adminRouter)
app.use('/api/notifications', notificationRouter)

// 7. 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} not found.`
    }
  })
})

// 8. Global Error Handler
app.use(errorHandler)
