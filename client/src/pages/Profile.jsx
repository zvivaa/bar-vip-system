import React, { useState, useEffect, useContext } from 'react'
import {
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  TimePicker,
  message,
} from 'antd'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios'
import config from '../config'

const Profile = () => {
  const [form] = Form.useForm()
  const [reservationForm] = Form.useForm()
  const [user, setUser] = useState({})
  const [reservation, setReservation] = useState(null)
  const { user: authUser } = useContext(AuthContext)

  useEffect(() => {
    fetchUserProfile()
    fetchUserReservation()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      setUser(response.data)
      form.setFieldsValue(response.data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchUserReservation = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/user/reservation`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      setReservation(response.data)
      reservationForm.setFieldsValue(response.data)
    } catch (error) {
      console.error('Error fetching user reservation:', error)
    }
  }

  const handleProfileUpdate = async (values) => {
    try {
      const response = await axios.put(
        `${config.API_URL}/user/profile`,
        values,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      setUser(response.data)
      message.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      message.error('Failed to update profile')
    }
  }

  const handleReservationUpdate = async (values) => {
    const { date, time, ...rest } = values
    const reservation_date = `${date.format('YYYY-MM-DD')} ${time.format(
      'HH:mm'
    )}`
    const updatedReservation = { ...rest, date: reservation_date }

    try {
      const response = await axios.put(
        `${config.API_URL}/user/reservation/${reservation.id}`,
        updatedReservation,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      setReservation(response.data)
      message.success('Reservation updated successfully')
    } catch (error) {
      console.error('Error updating reservation:', error)
      message.error('Failed to update reservation')
    }
  }

  const handleReservationCancel = async () => {
    try {
      await axios.delete(
        `${config.API_URL}/user/reservation/${reservation.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      setReservation(null)
      message.success('Reservation cancelled successfully')
    } catch (error) {
      console.error('Error cancelling reservation:', error)
      message.error('Failed to cancel reservation')
    }
  }

  return (
    <div className="container">
      <h2>Личный кабинет</h2>
      <Form form={form} layout="vertical" onFinish={handleProfileUpdate}>
        <Form.Item
          name="name"
          label="Имя"
          rules={[{ required: true, message: 'Пожалуйста, введите ваше имя' }]}
        >
          <Input placeholder="Введите ваше имя" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Телефон"
          rules={[
            {
              required: true,
              message: 'Пожалуйста, введите ваш номер телефона',
            },
          ]}
        >
          <Input placeholder="Введите ваш номер телефона" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Обновить профиль
          </Button>
        </Form.Item>
      </Form>

      {reservation && (
        <>
          <h2>Текущая бронь</h2>
          <Form
            form={reservationForm}
            layout="vertical"
            onFinish={handleReservationUpdate}
          >
            <Form.Item
              name="name"
              label="Ваше имя"
              rules={[
                { required: true, message: 'Пожалуйста, введите ваше имя' },
              ]}
            >
              <Input placeholder="Введите ваше имя" />
            </Form.Item>
            <Form.Item
              name="date"
              label="Дата бронирования"
              rules={[{ required: true, message: 'Пожалуйста, выберите дату' }]}
            >
              <DatePicker placeholder="Выберите дату" />
            </Form.Item>
            <Form.Item
              name="time"
              label="Время бронирования"
              rules={[
                { required: true, message: 'Пожалуйста, выберите время' },
              ]}
            >
              <TimePicker
                format="HH:mm"
                minuteStep={15}
                placeholder="Выберите время"
              />
            </Form.Item>
            <Form.Item
              name="people"
              label="Количество человек"
              rules={[
                {
                  required: true,
                  message: 'Пожалуйста, укажите количество человек',
                },
              ]}
            >
              <InputNumber min={1} max={10} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Обновить бронь
              </Button>
              <Button
                type="danger"
                onClick={handleReservationCancel}
                style={{ marginLeft: '10px' }}
              >
                Отменить бронь
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </div>
  )
}

export default Profile
