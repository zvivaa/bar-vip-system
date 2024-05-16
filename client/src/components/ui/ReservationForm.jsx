import React, { useContext } from 'react'
import { Form, Input, Button, DatePicker, InputNumber, TimePicker } from 'antd'
import axios from 'axios'
import { AuthContext } from '../../context/AuthContext'
import config from '../../config'

const ReservationForm = ({ selectedTable, onClose }) => {
  const { user } = useContext(AuthContext)
  const [form] = Form.useForm()

  const onFinish = async (values) => {
    try {
      const reservationData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'),
        table: selectedTable,
        user_id: user.id,
      }

      await axios.post(`${config.API_URL}/reserve`, reservationData)
      onClose()
    } catch (error) {
      console.error('Ошибка при бронировании:', error)
    }
  }

  const getDisabledHours = () => {
    const hours = []
    for (let i = 3; i < 16; i++) {
      hours.push(i)
    }
    return hours
  }

  const getDisabledMinutes = (hour) => {
    if (hour === 2) {
      return Array.from(Array(60).keys()).slice(1)
    }
    return []
  }

  return (
    <>
      <Form
        form={form}
        name="reservation_form"
        onFinish={onFinish}
        layout="vertical"
        initialValues={{
          people: 1,
        }}
      >
        <Form.Item
          label="Выбранный стол"
          name="table"
          initialValue={selectedTable}
        >
          <Input disabled value={`Выбран стол: ${selectedTable}`} />
        </Form.Item>

        <Form.Item
          name="name"
          label="Ваше имя"
          rules={[{ required: true, message: 'Пожалуйста, введите ваше имя' }]}
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
          rules={[{ required: true, message: 'Пожалуйста, выберите время' }]}
        >
          <TimePicker
            format="HH:mm"
            minuteStep={15}
            disabledHours={getDisabledHours}
            disabledMinutes={getDisabledMinutes}
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
            Забронировать
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

export default ReservationForm
