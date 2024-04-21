// ResourceContext.js
import React, { createContext, useContext, useState } from 'react'
import axios from 'axios'
import showErrorMessage from '../utils/showErrorMessage'
import config from '../config'

export const ResourceContext = createContext()

const ResourceProvider = ({ children }) => {
  const [data, setData] = useState(null)

  const ResourseClient = axios.create({
    baseURL: `${config.API_URL}/resource`,
    withCredentials: true,
  })

  ResourseClient.interceptors.request.use(
    (config) => {
      const accessToken = inMemoryJWT.getToken() // Make sure you import inMemoryJWT correctly
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  const handleReservation = async (reservationData) => {
    try {
      const response = await axios.post(
        `${config.API_URL}/reserve`,
        reservationData
      )
      console.log('Reservation successful:', response.data)
      // Можно добавить дополнительную логику по успешному завершению
    } catch (error) {
      console.error(
        'Failed to make a reservation:',
        error.response.data.error || error.message
      )
      showErrorMessage(error)
    }
  }

  return (
    <ResourceContext.Provider value={{ data, handleReservation }}>
      {children}
    </ResourceContext.Provider>
  )
}

export default ResourceProvider
