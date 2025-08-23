import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger'
import { errorHandler } from '@/middleware/errorHandler'
import { authMiddleware } from '@/middleware/auth'

// Import routes
import authRoutes from '@/routes/auth'
import eventRoutes from '@/routes/events'
import attendeeRoutes from '@/routes/attendees'
import accommodationRoutes from '@/routes/accommodations'
import buildingRoutes from '@/routes/buildings'
import roomRoutes from '@/routes/rooms'
import busRoutes from '@/routes/buses'
import assignmentRoutes from '@/routes/assignments'
import formRoutes from '@/routes/forms'
import reportRoutes from '@/routes/reports'
import auditRoutes from '@/routes/audit'
import userRoutes from '@/routes/users'
import communicationRoutes from '@/routes/communications'
import dashboardRoutes from '@/routes/dashboard'

// Initialize Prisma Client
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

const app = express()
const PORT = process.env.PORT || 5000

// CORS configuration - MUST be first middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:5173',
    'http://192.168.100.4:3000'  // Network IP for development
  ]
  const origin = req.headers.origin
  
  if (allowedOrigins.includes(origin!) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*')
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Max-Age', '86400') // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  next()
})

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Conference Accommodation API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API Health check endpoint (for proxy access)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Conference Accommodation API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/events', authMiddleware, eventRoutes)
app.use('/api/attendees', authMiddleware, attendeeRoutes)
app.use('/api/accommodations', authMiddleware, accommodationRoutes)
app.use('/api/buildings', authMiddleware, buildingRoutes)
app.use('/api/rooms', authMiddleware, roomRoutes)
app.use('/api/buses', authMiddleware, busRoutes)
app.use('/api/assignments', authMiddleware, assignmentRoutes)
app.use('/api/forms', authMiddleware, formRoutes)
app.use('/api/reports', authMiddleware, reportRoutes)
app.use('/api/audit', authMiddleware, auditRoutes)
app.use('/api/users', authMiddleware, userRoutes)
app.use('/api/communications', authMiddleware, communicationRoutes)
app.use('/api/dashboard', authMiddleware, dashboardRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  })
})

// Global error handler
app.use(errorHandler)

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

// Start server
async function startServer() {
  try {
    // Connect to database
    await prisma.$connect()
    logger.info('Connected to database successfully')

    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`)
      logger.info(`📊 Health check: http://localhost:${PORT}/health`)
      logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app
