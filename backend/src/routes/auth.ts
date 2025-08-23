import { Router } from 'express'
import { AuthController } from '@/controllers/AuthController'
import { validateBody } from '@/middleware/validation'
import { schemas } from '@/middleware/validation'
import { asyncHandler } from '@/middleware/errorHandler'

const router = Router()
const authController = new AuthController()

// Add explicit OPTIONS handling for all auth routes
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.sendStatus(200)
})

// Authentication routes
router.post('/login', 
  validateBody(schemas.loginCredentials),
  asyncHandler(authController.login.bind(authController))
)

router.post('/register',
  validateBody(schemas.registerUser),
  asyncHandler(authController.register.bind(authController))
)

router.post('/logout',
  asyncHandler(authController.logout.bind(authController))
)

router.post('/refresh',
  asyncHandler(authController.refreshToken.bind(authController))
)

router.get('/me',
  asyncHandler(authController.getCurrentUser.bind(authController))
)

export default router
