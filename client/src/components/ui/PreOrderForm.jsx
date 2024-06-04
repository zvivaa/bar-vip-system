import React from 'react'
import { Form, Input, Button, InputNumber } from 'antd'

const PreOrderForm = ({ onNext, onSkip }) => {
  const [form] = Form.useForm()

  const onFinish = (values) => {
    onNext(values)
  }

  return (
    <Form
      form={form}
      name="preorder_form"
      onFinish={onFinish}
      layout="vertical"
    >
      <Form.Item name="dish" label="Предзаказ блюда">
        <Input placeholder="Введите название блюда" />
      </Form.Item>

      <Form.Item name="quantity" label="Количество порций">
        <InputNumber min={1} max={10} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Продолжить
        </Button>
        <Button type="default" onClick={onSkip} style={{ marginLeft: '8px' }}>
          Пропустить
        </Button>
      </Form.Item>
    </Form>
  )
}

export default PreOrderForm
