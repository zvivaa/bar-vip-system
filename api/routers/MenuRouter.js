import { Router } from 'express'
import { getMenu } from '../controllers/MenuController'

const router = Router()

router.get('/menu', getMenu)

export default router
