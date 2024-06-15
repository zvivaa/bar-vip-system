import React, { useContext, useEffect } from 'react'
import { Form, Input, DatePicker, Button, InputNumber, TimePicker } from 'antd'
import moment from 'moment'
import { BookingContext } from '../context/BookingContext'
import { AuthContext } from '../context/AuthContext'

const Step1 = ({ nextStep }) => {
  const { bookingData, setBookingData } = useContext(BookingContext)
  const { user } = useContext(AuthContext)
  const [form] = Form.useForm()

  const format = 'HH:mm'

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.real_name,
        phone: user.phone,
        email: user.email,
      })
    }
  }, [user, form])

  const onFinish = (values) => {
    setBookingData({
      ...bookingData,
      ...values,
    })
    nextStep()
  }

  const getDisabledHours = () => {
    const hours = []
    for (let i = 0; i < moment().hour(); i++) {
      hours.push(i)
    }
    return hours
  }

  const getDisabledMinutes = (selectedHour) => {
    if (selectedHour === moment().hour()) {
      return [...Array(moment().minute()).keys()]
    }
    return []
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={bookingData}
    >
      <Form.Item
        label="Имя"
        name="name"
        rules={[{ required: true, message: 'Введите имя' }]}
      >
        <Input placeholder="Имя" />
      </Form.Item>
      <Form.Item
        label="Телефон"
        name="phone"
        rules={[{ required: true, message: 'Введите телефон' }]}
      >
        <Input placeholder="Номер телефона" />
      </Form.Item>
      <Form.Item
        label="Почта"
        name="email"
        rules={[{ required: true, message: 'Введите почту' }]}
      >
        <Input placeholder="example@yandex.ru" />
      </Form.Item>
      <Form.Item
        label="Дата"
        name="date"
        rules={[{ required: true, message: 'Выберите дату' }]}
      >
        <DatePicker
          disabledDate={(current) =>
            current && current < moment().startOf('day')
          }
          placeholder="Выберите дату"
        />
      </Form.Item>
      <Form.Item
        label="Время"
        name="time"
        rules={[{ required: true, message: 'Выберите время' }]}
      >
        <TimePicker
          format={format}
          minuteStep={15}
          placeholder="Выберите время"
          disabledHours={getDisabledHours}
          disabledMinutes={getDisabledMinutes}
        />
      </Form.Item>
      <Form.Item
        label="Количество людей"
        name="people"
        rules={[{ required: true, message: 'Укажите количество людей' }]}
      >
        <InputNumber min={1} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Далее
        </Button>
      </Form.Item>
    </Form>
  )
}

export default Step1
