import { Router } from 'express'
import { createBooking } from '../controllers/BookingController'

const router = Router()

router.post('/booking', createBooking)

export default router
