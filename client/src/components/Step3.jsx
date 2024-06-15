import React, { useContext } from 'react'
import { Button, Card, List } from 'antd'
import { BookingContext } from '../context/BookingContext'

const Step3 = ({ prevStep, confirmBooking }) => {
  const { bookingData } = useContext(BookingContext)

  return (
    <div className="lastReserv">
      <h2>Подтверждение бронирования</h2>
      <p>
        <strong>Имя:</strong> {bookingData.name}
      </p>
      <p>
        <strong>Телефон:</strong> {bookingData.phone}
      </p>
      <p>
        <strong>Почта:</strong> {bookingData.email}
      </p>
      <p>
        <strong>Дата:</strong> {bookingData.date.format('YYYY-MM-DD')}
      </p>
      <p>
        <strong>Время:</strong> {bookingData.time.format('HH:mm')}
      </p>
      <p>
        <strong>Количество людей:</strong> {bookingData.people}
      </p>
      <p>
        <strong>Выбранные блюда:</strong>
        <Card title="Выбранные блюда" style={{ width: '100%' }}>
          <List
            dataSource={bookingData.foodItems}
            renderItem={(item) => (
              <List.Item key={item.id}>
                <List.Item.Meta
                  title={`${item.name} x${item.amount}`}
                  description={`Цена: ${(item.price * item.amount).toFixed(
                    2
                  )} ₽`}
                />
              </List.Item>
            )}
          />
        </Card>
      </p>
      <p>
        <strong>Суммарная стоимость блюд:</strong>{' '}
        {bookingData.totalFoodCost.toFixed(2)} руб.
      </p>
      <div style={{ marginTop: '20px' }}>
        <Button onClick={prevStep}>Назад</Button>
        <Button
          type="primary"
          onClick={confirmBooking}
          style={{ marginLeft: '10px' }}
        >
          Подтвердить
        </Button>
      </div>
    </div>
  )
}

export default Step3
