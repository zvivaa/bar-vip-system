import React, { useState, useEffect, useContext } from 'react'
import { List, Button, message, Card, InputNumber } from 'antd'
import axios from 'axios'
import { BookingContext } from '../context/BookingContext'

const Step2 = ({ nextStep, prevStep }) => {
  const {
    bookingData,
    setBookingData,
    availableFoodItems,
    setAvailableFoodItems,
    selectedFoodItems,
    setSelectedFoodItems,
  } = useContext(BookingContext)

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/food')
        setAvailableFoodItems(response.data)
      } catch (error) {
        message.error('Ошибка при загрузке списка блюд')
      }
    }

    if (availableFoodItems.length === 0 && selectedFoodItems.length === 0) {
      fetchFoodItems()
    }
  }, [availableFoodItems, setAvailableFoodItems, selectedFoodItems.length])

  const calculateTotalPrice = (items) => {
    return items.reduce((total, item) => {
      return total + item.price * (item.amount || 1)
    }, 0)
  }

  const addToSelection = (item) => {
    const updatedSelectedItems = [...selectedFoodItems, { ...item, amount: 1 }]
    setSelectedFoodItems(updatedSelectedItems)
    const newTotalPrice = calculateTotalPrice(updatedSelectedItems)
    setAvailableFoodItems(
      availableFoodItems.filter((food) => food.id !== item.id)
    )

    setBookingData({
      ...bookingData,
      foodItems: updatedSelectedItems,
      totalFoodCost: newTotalPrice,
    })
  }

  const removeFromSelection = (item) => {
    const updatedSelectedItems = selectedFoodItems.filter(
      (food) => food.id !== item.id
    )
    setSelectedFoodItems(updatedSelectedItems)
    const newTotalPrice = calculateTotalPrice(updatedSelectedItems)
    setAvailableFoodItems([...availableFoodItems, item])

    setBookingData({
      ...bookingData,
      foodItems: updatedSelectedItems,
      totalFoodCost: newTotalPrice,
    })
  }

  const updateAmount = (item, amount) => {
    const updatedSelectedItems = selectedFoodItems.map((food) => {
      if (food.id === item.id) {
        return { ...food, amount }
      }
      return food
    })

    setSelectedFoodItems(updatedSelectedItems)
    const newTotalPrice = calculateTotalPrice(updatedSelectedItems)
    setBookingData({
      ...bookingData,
      foodItems: updatedSelectedItems,
      totalFoodCost: newTotalPrice,
    })
  }

  return (
    <div>
      <h2>Предзаказ блюд (необязательно)</h2>
      <div
        className="cardReserv"
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <Card title="Доступные блюда" style={{ width: '100%' }}>
          <List
            dataSource={availableFoodItems}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                actions={[
                  <Button onClick={() => addToSelection(item)}>
                    Добавить
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={item.name}
                  description={`Цена: ${item.price} ₽`}
                />
              </List.Item>
            )}
          />
        </Card>
        <Card title="Выбранные блюда" style={{ width: '100%' }}>
          <List
            dataSource={selectedFoodItems}
            renderItem={(item) => (
              <List.Item key={item.id}>
                <List.Item.Meta
                  title={item.name}
                  description={`Цена за единицу: ${item.price} ₽`}
                />
                <div>
                  <InputNumber
                    min={1}
                    max={10}
                    defaultValue={item.amount}
                    onChange={(value) => updateAmount(item, value)}
                  />
                  <Button type="link" onClick={() => removeFromSelection(item)}>
                    Удалить
                  </Button>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </div>
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <p>
          <strong>Итоговая цена:</strong>{' '}
          {(bookingData.totalFoodCost || 0).toFixed(2)} ₽
        </p>
        <Button onClick={prevStep}>Назад</Button>
        <Button
          type="primary"
          onClick={nextStep}
          style={{ marginLeft: '10px' }}
        >
          Далее
        </Button>
      </div>
    </div>
  )
}

export default Step2
