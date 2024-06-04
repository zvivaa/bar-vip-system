import React, { useState } from 'react'
import ReservationForm from '../components/ui/ReservationForm'
import PreOrderForm from '../components/ui/PreOrderForm'
import Confirmation from '../components/ui/Confirmation'
import '../antd/dist/antd.css'

const Demo = () => {
  const [step, setStep] = useState(1)
  const [reservationData, setReservationData] = useState(null)
  const [preOrderData, setPreOrderData] = useState(null)

  const handleReservationNext = (data) => {
    setReservationData(data)
    setStep(2)
  }

  const handlePreOrderNext = (data) => {
    setPreOrderData(data)
    setStep(3)
  }

  const handlePreOrderSkip = () => {
    setStep(3)
  }

  const handleConfirm = () => {
    setStep(1)
    setReservationData(null)
    setPreOrderData(null)
  }

  const handleBack = () => {
    setStep(1)
  }

  return (
    <div className="container">
      <div className="reservBlock">
        <h1>Бронирование</h1>
        {step === 1 && <ReservationForm onNext={handleReservationNext} />}
        {step === 2 && (
          <PreOrderForm
            onNext={handlePreOrderNext}
            onSkip={handlePreOrderSkip}
          />
        )}
        {step === 3 && (
          <Confirmation
            reservationData={reservationData}
            preOrderData={preOrderData}
            onConfirm={handleConfirm}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  )
}

export default Demo
