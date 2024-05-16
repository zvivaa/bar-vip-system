// Profile.jsx
import React, { useContext, useState, useEffect } from 'react'
import { Form, Input, Button, List } from 'antd'
import { AuthContext } from '../context/AuthContext'
import { ResourceContext } from '../context/ResourceContext'

const Profile = () => {
  const { user, updateUserInfo, getUserReservations, cancelReservation } =
    useContext(AuthContext)
  const [reservations, setReservations] = useState([])

  useEffect(() => {
    getUserReservations().then(setReservations)
  }, [])

  const handleCancelReservation = (id) => {
    cancelReservation(id).then(() => {
      setReservations((prev) =>
        prev.filter((reservation) => reservation.id !== id)
      )
    })
  }

  return (
    <div className="container">
      <h2>Личный кабинет</h2>
      <Form
        initialValues={{
          userName: user.userName,
          phoneNumber: user.phoneNumber,
        }}
        onFinish={updateUserInfo}
      >
        <Form.Item label="Имя пользователя" name="userName">
          <Input />
        </Form.Item>
        <Form.Item label="Номер телефона" name="phoneNumber">
          <Input />
        </Form.Item>
        <Form.Item label="Пароль" name="password">
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Обновить
        </Button>
      </Form>
      <h3>Список бронирований</h3>
      <List
        dataSource={reservations}
        renderItem={(reservation) => (
          <List.Item
            actions={[
              <Button onClick={() => handleCancelReservation(reservation.id)}>
                Отменить
              </Button>,
            ]}
          >
            {reservation.date} - Столик {reservation.table}
          </List.Item>
        )}
      />
    </div>
  )
}

export default Profile
