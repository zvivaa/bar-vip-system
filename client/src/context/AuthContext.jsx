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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
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
        setIsAuthenticated(true)
        setIsUserLogged(true)
        setUser(user)
      })
      .catch(() => {
        setIsAuthenticated(false)
        setIsUserLogged(false)
        setUser(null)
      })
  }, [])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await AuthClient.get('/user')
        setUser(response.data)
        setIsAuthenticated(true)
        setIsUserLogged(true)
      } catch (error) {
        console.error('Error fetching user data:', error)
        setIsAuthenticated(false)
      }
    }

    if (isAuthenticated) {
      fetchUserData()
    }
  }, [isAuthenticated])

  const handleSignIn = async (credentials) => {
    try {
      const response = await AuthClient.post('/sign-in', credentials)
      const { accessToken, refreshToken } = response.data

      AuthClient.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${accessToken}`
      document.cookie = `refreshToken=${refreshToken}; path=/`
      console.log('Sign in successful:', response.data.user)
      setIsAuthenticated(true)
      setIsUserLogged(true)
      setUser(user)
    } catch (error) {
      console.error('Error signing in:', error)
      setIsAuthenticated(false)
      setIsUserLogged(false)
      setUser(null)
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

  const updateUser = async (updatedData) => {
    try {
      const response = await AuthClient.put('/update-user', updatedData)
      setUser(response.data)
    } catch (error) {
      console.error('Update user error', error)
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
        getUserReservations,
        cancelReservation,
        createUsers,
        getActiveReservations,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
