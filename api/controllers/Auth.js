import AuthService from '../services/Auth.js'
import ErrorsUtils from '../utils/Errors.js'
import { COOKIE_SETTINGS } from '../constants.js'

class AuthController {
  static async signIn(req, res) {
    const { userName, password } = req.body
    const { fingerprint } = req
    try {
      const { accessToken, refreshToken, accessTokenExpiration, user } =
        await AuthService.signIn({ userName, password, fingerprint })
      res.cookie('refreshToken', refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)

      return res.status(200).json({ accessToken, accessTokenExpiration, user })
    } catch (err) {
      return ErrorsUtils.catchError(res, err)
    }
  }
  static async signUp(req, res) {
    const { userName, password, role } = req.body
    const { fingerprint } = req
    try {
      const { accessToken, refreshToken, accessTokenExpiration, user } =
        await AuthService.signUp({ userName, password, role, fingerprint })
      res.cookie('refreshToken', refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)

      return res.status(200).json({ accessToken, accessTokenExpiration, user })
    } catch (err) {
      return ErrorsUtils.catchError(res, err)
    }
  }
  static async logOut(req, res) {
    const refreshToken = req.cookies.refreshToken
    try {
      await AuthService.logOut(refreshToken)

      res.clearCookie('refreshToken')

      return res.sendStatus(200)
    } catch (err) {
      return ErrorsUtils.catchError(res, err)
    }
  }

  static async refresh(req, res) {
    const { fingerprint } = req
    const currentRefreshToken = req.cookies.refreshToken

    try {
      const { accessToken, refreshToken, accessTokenExpiration } =
        await AuthService.refresh({
          currentRefreshToken,
          fingerprint,
        })

      res.cookie('refreshToken', refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)

      return res.status(200).json({ accessToken, accessTokenExpiration })
    } catch (err) {
      return ErrorsUtils.catchError(res, err)
    }
  }

  static async createUsers(req, res) {
    try {
      const { users } = req.body
      const createdUsers = await AuthService.createUsers(users)
      return res.status(201).json(createdUsers)
    } catch (err) {
      console.error('Error creating users:', err)
      return ErrorsUtils.catchError(res, err)
    }
  }

  static async getActiveReservations(req, res) {
    try {
      const reservations = await AuthService.getActiveReservations()
      return res.status(200).json(reservations)
    } catch (err) {
      console.error('Error fetching active reservations:', err)
      return ErrorsUtils.catchError(res, err)
    }
  }

  static async getUser(req, res) {
    try {
      const userId = req.user.id
      const userData = await AuthService.getUserData(userId)
      return res.status(200).json(userData)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  static async updateUser(req, res) {
    const { id } = req.user // предполагается, что id пользователя извлекается из токена
    const { name, phone } = req.body

    try {
      const updatedUser = await UserRepository.updateUser(id, { name, phone })
      res.status(200).json(updatedUser)
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' })
    }
  }
}

export default AuthController
