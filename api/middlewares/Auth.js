// middlewares/Auth.js
import jwt from 'jsonwebtoken'
import { Unauthorized, Forbidden } from '../utils/Errors.js'
import dotenv from 'dotenv'

dotenv.config()

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
