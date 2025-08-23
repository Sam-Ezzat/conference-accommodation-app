import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'
import { createErrorResponse } from '@/utils/helpers'
import { CustomError } from '@/types'

export function errorHandler(
  error: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logger.error(`Error in ${req.method} ${req.path}:`, {
    error: error.message,
    stack: error.stack,
    body: req.body,
    params: req.params,
    query: req.query,
    headers: req.headers
  })

  // Handle different types of errors
  if (error instanceof CustomError) {
    res.status(error.status).json(createErrorResponse(error.message))
    return
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any
    
    switch (prismaError.code) {
      case 'P2002':
        res.status(409).json(createErrorResponse('A record with this information already exists'))
        return
      case 'P2025':
        res.status(404).json(createErrorResponse('Record not found'))
        return
      case 'P2003':
        res.status(400).json(createErrorResponse('Foreign key constraint failed'))
        return
      default:
        res.status(400).json(createErrorResponse('Database operation failed'))
        return
    }
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json(createErrorResponse(error.message))
    return
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json(createErrorResponse('Invalid token'))
    return
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json(createErrorResponse('Token expired'))
    return
  }

  // Handle multer errors (file upload)
  if (error.name === 'MulterError') {
    const multerError = error as any
    switch (multerError.code) {
      case 'LIMIT_FILE_SIZE':
        res.status(400).json(createErrorResponse('File too large'))
        return
      case 'LIMIT_FILE_COUNT':
        res.status(400).json(createErrorResponse('Too many files'))
        return
      case 'LIMIT_UNEXPECTED_FILE':
        res.status(400).json(createErrorResponse('Unexpected file field'))
        return
      default:
        res.status(400).json(createErrorResponse('File upload error'))
        return
    }
  }

  // Default error response
  const statusCode = process.env.NODE_ENV === 'production' ? 500 : 500
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message || 'Internal server error'

  res.status(statusCode).json(createErrorResponse(message))
}

// Async error wrapper
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
