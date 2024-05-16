// routers/Auth.js
import { Router } from 'express'
import AuthController from '../controllers/Auth.js'
import AuthValidator from '../validators/Auth.js'
import { authenticateToken, checkAdmin } from '../middlewares/Auth.js'

const router = Router()

router.post('/sign-in', AuthValidator.signIn, AuthController.signIn)
router.post('/sign-up', AuthValidator.signUp, AuthController.signUp)
router.post('/logout', AuthValidator.logOut, AuthController.logOut)
router.post('/refresh', AuthValidator.refresh, AuthController.refresh)

router.post(
  '/create-users',
  authenticateToken,
  checkAdmin,
  AuthController.createUsers
)
router.get(
  '/active-reservations',
  authenticateToken,
  checkAdmin,
  AuthController.getActiveReservations
)

export default router
