import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import config from '../config'
import showErrorMessage from '../utils/showErrorMessage'
import inMemoryJWT from '../services/inMemoryJWT'

// Создание клиента для аутентификации
export const AuthClient = axios.create({
  baseURL: `${config.API_URL}/auth`,
  withCredentials: true,
})

// Создание контекста
export const AuthContext = createContext()

const AuthProvider = ({ children }) => {
  const [isUserLogged, setIsUserLogged] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = inMemoryJWT.getToken()
    if (token) {
      AuthClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    // Логика обновления токена
    AuthClient.post('/refresh')
      .then((res) => {
        const { accessToken, accessTokenExpiration, user } = res.data
        inMemoryJWT.setToken(accessToken, accessTokenExpiration)
        AuthClient.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${accessToken}`
        setIsUserLogged(true)
        setUser(user)
      })
      .catch(() => {
        setIsUserLogged(false)
        setUser(null)
      })
  }, [])

  const handleSignIn = async (data) => {
    try {
      const response = await AuthClient.post('/sign-in', data)
      const { accessToken, accessTokenExpiration, user } = response.data
      inMemoryJWT.setToken(accessToken, accessTokenExpiration)
      AuthClient.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${accessToken}`
      setIsUserLogged(true)
      setUser(user)
    } catch (error) {
      showErrorMessage(error)
    }
  }

  const handleSignUp = async (data) => {
    try {
      const response = await AuthClient.post('/sign-up', data)
      const { accessToken, accessTokenExpiration, user } = response.data
      inMemoryJWT.setToken(accessToken, accessTokenExpiration)
      AuthClient.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${accessToken}`
      setIsUserLogged(true)
      setUser(user)
    } catch (error) {
      showErrorMessage(error)
    }
  }

  const handleLogOut = async () => {
    try {
      await AuthClient.post('/logout')
      inMemoryJWT.deleteToken()
      delete AuthClient.defaults.headers.common['Authorization']
      setIsUserLogged(false)
      setUser(null)
    } catch (error) {
      showErrorMessage(error)
    }
  }

  const updateUserInfo = async (data) => {
    try {
      const response = await AuthClient.put('/user', data)
      setUser(response.data.user)
    } catch (error) {
      showErrorMessage(error)
    }
  }

  const getUserReservations = async () => {
    try {
      const response = await AuthClient.get('/reservations/user')
      return response.data.reservations
    } catch (error) {
      showErrorMessage(error)
    }
  }

  const cancelReservation = async (id) => {
    try {
      await AuthClient.delete(`/reservations/${id}`)
    } catch (error) {
      showErrorMessage(error)
    }
  }

  const createUsers = async (users) => {
    try {
      const response = await AuthClient.post('/create-users', { users })
      return response.data
    } catch (error) {
      showErrorMessage(error)
      return []
    }
  }

  const getActiveReservations = async () => {
    try {
      const response = await AuthClient.get('/active-reservations')
      return response.data
    } catch (error) {
      showErrorMessage(error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isUserLogged,
        user,
        handleSignIn,
        handleSignUp,
        handleLogOut,
        updateUserInfo,
        getUserReservations,
        cancelReservation,
        createUsers,
        getActiveReservations,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
