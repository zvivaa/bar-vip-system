import React, { useContext, useState } from 'react'
import {
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  notification,
} from 'antd'
import moment from 'moment'

const ReservationForm = ({ onNext }) => {
  const [form] = Form.useForm()

  const disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < moment().startOf('day')
  }

  const onFinish = (values) => {
    onNext(values)
  }

  return (
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
        name="name"
        label="Ваше имя"
        rules={[{ required: true, message: 'Пожалуйста, введите ваше имя' }]}
      >
        <Input placeholder="Введите ваше имя" />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Номер телефона"
        rules={[
          { required: true, message: 'Пожалуйста, введите номер телефона' },
        ]}
      >
        <Input placeholder="Введите номер телефона" />
      </Form.Item>

      <Form.Item
        name="date"
        label="Дата бронирования"
        rules={[{ required: true, message: 'Пожалуйста, выберите дату' }]}
      >
        <DatePicker
          className="w-[100%]"
          placeholder="Выберите дату"
          disabledDate={disabledDate}
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
  )
}

export default ReservationForm
