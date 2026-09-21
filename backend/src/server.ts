import { app } from './app'
import { env } from './config/env'
import { prisma } from './lib/prisma'

const PORT = env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log(`🚀 C2C Placement & Internship API Server running on port ${PORT}`)
  console.log(`📡 Environment: ${env.NODE_ENV}`)
  console.log(`🔗 Allowed Client URL: ${env.CLIENT_URL}`)
})

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`)
  server.close(async () => {
    console.log('🔒 Express HTTP server closed.')
    await prisma.$disconnect()
    console.log('💾 Prisma database connections closed.')
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
