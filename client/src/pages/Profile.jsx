import React, { useState, useContext } from 'react'
import { Modal, Button, Input, Form } from 'antd'
import { AuthContext } from '../context/AuthContext'

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  const showModal = () => {
    setIsModalVisible(true)
    form.setFieldsValue({ name: user.name, phone: user.phone })
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      updateUser(values)
      setIsModalVisible(false)
    } catch (error) {
      console.error('Validation Failed:', error)
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Личный кабинет</h2>
      <div>
        <p>
          <strong>Имя:</strong> {user.name}
        </p>
        <p>
          <strong>Номер телефона:</strong> {user.phone}
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
        </Form>
      </Modal>
    </div>
  )
}

export default Profile
