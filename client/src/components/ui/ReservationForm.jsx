import React, { useEffect, useContext } from 'react'
import { Form, Input, Button, DatePicker, InputNumber, TimePicker } from 'antd'
import '../../antd/dist/antd.css'
import { ResourceContext } from '../../context/ResourceContext'

const ReservationForm = ({ selectedTable, onClose }) => {
  const { handleReservation } = useContext(ResourceContext)
  const [form] = Form.useForm()

  const onFinish = async (values) => {
    const reservationData = {
      name: values.name,
      date: `${values.date.format('YYYY-MM-DD')}T${values.time.format(
        'HH:mm'
      )}`,
      people: values.people,
      table: selectedTable,
    }

    await handleReservation(reservationData)
    onClose()
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
