import React, { useState, useContext, useEffect } from 'react'
import { Modal, Button, Input, Form, message, List, Card } from 'antd'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios'
import moment from 'moment'
import 'moment/locale/ru'

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [reservations, setReservations] = useState([])

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      const response = await axios.get(
        `https://941d-37-79-25-23.ngrok-free.app/user-reservations/${user.id}`
      )
      if (response.status === 200) {
        setReservations(response.data)
      } else {
        message.error('Ошибка при загрузке бронирований')
      }
    } catch (error) {
      message.error('Ошибка при загрузке бронирований')
      console.error('Error fetching reservations:', error)
    }
  }

  const cancelReservation = async (reservationId) => {
    try {
      const response = await axios.post(
        `https://941d-37-79-25-23.ngrok-free.app/cancel-reservation`,
        { reservationId }
      )
      if (response.status === 200) {
        message.success('Бронирование успешно отменено')
        fetchReservations()
      } else {
        message.error('Ошибка при отмене бронирования')
      }
    } catch (error) {
      message.error('Ошибка при отмене бронирования')
      console.error('Error cancelling reservation:', error)
    }
  }

  const showModal = () => {
    setIsModalVisible(true)
    form.setFieldsValue({
      name: user.real_name,
      phone: user.phone,
      email: user.email,
    })
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const updatedUserData = {
        ...values,
        user_id: user.id, // Assuming you have the user ID stored in the user object
      }

      const response = await axios.post(
        'https://941d-37-79-25-23.ngrok-free.app/update-user',
        updatedUserData
      )

      if (response.status === 200) {
        updateUser(response.data) // Update user context with new data
        message.success('Данные успешно обновлены')
        setIsModalVisible(false)
      } else {
        message.error('Ошибка при обновлении данных')
      }
    } catch (error) {
      message.error('Ошибка при валидации данных')
      console.error('Error updating user:', error)
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  return (
    <div className="containerCabinet">
      <div className="cabinet">
        <h2>Личный кабинет</h2>
        <div>
          <p>
            <strong>Имя:</strong> {user.real_name}
          </p>
          <p>
            <strong>Номер телефона:</strong> +{user.phone}
          </p>
          <p>
            <strong>Почта:</strong> {user.email}
          </p>
          <Button type="primary" onClick={showModal}>
            Редактировать
          </Button>
        </div>

        <Modal
          title="Редактировать данные"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Имя"
              rules={[
                { required: true, message: 'Пожалуйста, введите ваше имя' },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Номер телефона"
              rules={[
                {
                  required: true,
                  message: 'Пожалуйста, введите ваш номер телефона',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Почта"
              rules={[
                {
                  required: true,
                  message: 'Пожалуйста, введите вашу почту',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </div>

      <div className="broni">
        <h2>Активные бронирования</h2>
        <List
          dataSource={reservations}
          renderItem={(reservation) => (
            <List.Item>
              <Card
                title={`Бронирование на ${moment(reservation.date)
                  .locale('ru')
                  .format('DD.MM.YYYY')}`}
                extra={
                  <Button
                    type="danger"
                    onClick={() => cancelReservation(reservation.id)}
                  >
                    Отменить
                  </Button>
                }
              >
                <p>
                  <strong>Время:</strong> {reservation.time}
                </p>
                <p>
                  <strong>Количество людей:</strong> {reservation.people}
                </p>
                <p>
                  <strong>Стоимость блюд:</strong> {reservation.food_price} руб.
                </p>
              </Card>
            </List.Item>
          )}
        />
      </div>
    </div>
  )
}

export default Profile
