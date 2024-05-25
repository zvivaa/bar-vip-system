// middlewares/Auth.js
import jwt from 'jsonwebtoken'
import { Unauthorized, Forbidden } from '../utils/Errors.js'
import dotenv from 'dotenv'

dotenv.config()

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return next(new Unauthorized('Токен отсутствует'))
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return next(new Forbidden('Недействительный токен'))
    }

    req.user = user
    next()
  })
}

export const checkAdmin = (req, res, next) => {
  if (req.user.role !== 1) {
    return next(new Forbidden('Доступ запрещен'))
  }

  next()
}
