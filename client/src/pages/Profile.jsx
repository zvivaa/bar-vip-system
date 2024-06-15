import React, { useState, useContext } from 'react'
import { Modal, Button, Input, Form, message } from 'antd'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios'

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  const showModal = () => {
    setIsModalVisible(true)
    form.setFieldsValue({ name: user.real_name, phone: user.phone })
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const updatedUserData = {
        ...values,
        user_id: user.id, // Assuming you have the user ID stored in the user object
      }

      const response = await axios.post(
        'http://localhost:5000/update-user',
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
    <div style={{ padding: '20px' }}>
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
  )
}

export default Profile
