import React, { createContext, useState } from 'react'

export const BookingContext = createContext()

const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    date: null,
    time: null,
    people: 1,
    foodItems: [],
  })
  const [availableFoodItems, setAvailableFoodItems] = useState([])
  const [selectedFoodItems, setSelectedFoodItems] = useState([])

  return (
    <BookingContext.Provider
      value={{
        bookingData,
        setBookingData,
        availableFoodItems,
        setAvailableFoodItems,
        selectedFoodItems,
        setSelectedFoodItems,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export default BookingProvider
