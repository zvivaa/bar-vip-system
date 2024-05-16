import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import TokenService from './Token.js'
import { NotFound, Forbidden, Conflict, Unauthorized } from '../utils/Errors.js'
import RefreshSessionsRepository from '../repositories/RefreshSession.js'
import UserRepository from '../repositories/User.js'
import ReservationRepository from '../repositories/ReservationRepository.js'
import { ACCESS_TOKEN_EXPIRATION } from '../constants.js'

dotenv.config()

class AuthService {
  static async signIn({ userName, password, fingerprint }) {
    const userData = await UserRepository.getUserData(userName)

    if (!userData) {
      throw new NotFound('Пользователь не найден')
    }

    const isPasswordValid = bcrypt.compareSync(password, userData.password)

    if (!isPasswordValid) {
      throw new Unauthorized('Неверный логин или пароль')
    }

    const payload = { id: userData.id, role: userData.role, userName }

    const accessToken = await TokenService.generateAccessToken(payload)
    const refreshToken = await TokenService.generateRefreshToken(payload)

    await RefreshSessionsRepository.createRefreshSession({
      id: userData.id,
      refreshToken,
      fingerprint,
    })
    return {
      accessToken,
      refreshToken,
      accessTokenExpiration: ACCESS_TOKEN_EXPIRATION,
      user: {
        id: userData.id,
        role: userData.role,
        userName: userData.userName,
        real_name: userData.real_name,
        phone: userData.phone,
      },
    }
  }

  static async signUp(user) {
    const { userName, password, role } = user
    const hashedPassword = bcrypt.hashSync(password, 8)
    return await UserRepository.createUser({
      userName,
      password: hashedPassword,
      role,
    })
  }

  static async logOut(refreshToken) {
    await RefreshSessionsRepository.deleteRefreshSession(refreshToken)
  }

  static async refresh({ fingerprint, currentRefreshToken }) {
    if (!currentRefreshToken) {
      throw new Unauthorized('No refresh token provided')
    }

    const refreshSession = await RefreshSessionsRepository.getRefreshSession(
      currentRefreshToken
    )

    if (!refreshSession) {
      throw new Unauthorized('Refresh session not found')
    }

    if (refreshSession.finger_print !== fingerprint.hash) {
      console.log('Attempted unauthorized token refresh!')
      throw new Forbidden('Fingerprint mismatch')
    }

    await RefreshSessionsRepository.deleteRefreshSession(currentRefreshToken)

    let payload
    try {
      payload = await TokenService.verifyRefreshToken(currentRefreshToken)
    } catch (error) {
      throw new Forbidden('Invalid refresh token')
    }

    const user = await UserRepository.getUserData(payload.user)
    if (!user) {
      throw new Unauthorized('User not found')
    }

    const { id, role, name: userName } = user

    const actualPayload = { id, user: userName, role }

    const accessToken = await TokenService.generateAccessToken(actualPayload)
    const refreshToken = await TokenService.generateRefreshToken(actualPayload)

    await RefreshSessionsRepository.createRefreshSession({
      id,
      refreshToken,
      fingerprint,
    })

    return {
      accessToken,
      refreshToken,
      accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION,
    }
  }

  static async createUsers(users) {
    const createdUsers = []
    for (const user of users) {
      const { userName, password, role } = user
      const hashedPassword = bcrypt.hashSync(password, 8)
      const createdUser = await UserRepository.createUser({
        userName,
        password: hashedPassword,
        role,
      })
      createdUsers.push({ ...createdUser, password }) // Возвращаем оригинальный пароль вместе с остальными данными
    }
    return createdUsers
  }

  static async getActiveReservations() {
    return await ReservationRepository.getActiveReservations()
  }
}

export default AuthService
