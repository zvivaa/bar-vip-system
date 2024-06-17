import React, { useState, useContext } from 'react'
import Step1 from '../components/Step1'
import Step2 from '../components/Step2'
import Step3 from '../components/Step3'
import { BookingContext } from '../context/BookingContext'
import { message } from 'antd'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'

const Demo = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const {
    bookingData,
    setBookingData,
    setAvailableFoodItems,
    setSelectedFoodItems,
  } = useContext(BookingContext)
  const { user } = useContext(AuthContext)

  const nextStep = () => {
    setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const confirmBooking = async () => {
    const totalFoodCost = bookingData.foodItems.reduce((total, foodItem) => {
      return total + foodItem.price * (foodItem.amount || 1)
    }, 0)

    const reservationData = {
      ...bookingData,
      user_id: user.id,
      totalFoodCost, // добавляем общую стоимость блюд
      foodItems: bookingData.foodItems.map((item) => ({
        id: item.id,
        amount: item.amount,
      })),
    }

    try {
      await axios.post(
        'https://941d-37-79-25-23.ngrok-free.app/reserve',
        reservationData
      )
      message.success('Бронирование успешно подтверждено')

      // Clear booking data after successful reservation
      setBookingData({
        name: '',
        phone: '',
        date: null,
        time: null,
        people: 1,
        foodItems: [],
      })
      setAvailableFoodItems([])
      setSelectedFoodItems([])
    } catch (error) {
      message.error('Ошибка при подтверждении бронирования')
    }

    setCurrentStep(0)
  }

  return (
    <div className="reservForm">
      {currentStep === 0 && <Step1 nextStep={nextStep} />}
      {currentStep === 1 && <Step2 nextStep={nextStep} prevStep={prevStep} />}
      {currentStep === 2 && (
        <Step3 prevStep={prevStep} confirmBooking={confirmBooking} />
      )}
    </div>
  )
}

export default Demo
