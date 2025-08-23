import { Router } from 'express'
import { FormController } from '@/controllers/FormController'

const router = Router()

// Form routes
router.get('/validation/:formType', FormController.getValidationRules)
router.post('/validation/:formType', FormController.validateFormData)
router.get('/template/:formType', FormController.getFormTemplate)

export default router
