import React, { useEffect } from 'react'
import { Form, Input, Button, DatePicker, InputNumber, TimePicker } from 'antd'
import '../../antd/dist/antd.css'

const ReservationForm = ({ selectedTable, onClose }) => {
  const [form] = Form.useForm()

  const onFinish = async (values) => {
    if (!values.date || !values.time) {
      console.error('Date or time is missing!')
      return // Прекратить выполнение, если дата или время отсутствуют
    }

    const reservationDateTime = `${values.date.format(
      'YYYY-MM-DD'
    )}T${values.time.format('HH:mm')}`

    try {
      const response = await fetch('http://localhost:5000/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          date: reservationDateTime,
          people: values.people,
          table: selectedTable,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      console.log('Data successfully saved to the database:', responseData)

      onClose()
    } catch (error) {
      console.error('Failed to save the reservation:', error)
    }
  }

  useEffect(() => {
    form.setFieldsValue({ table: selectedTable })
  }, [selectedTable, form])

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
          <Input disabled value="Выбран стол:" />
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
