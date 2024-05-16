import React, { useState, useEffect, useContext } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  List,
  Dropdown,
  Menu,
  message,
} from 'antd'
import { AuthContext } from '../context/AuthContext'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import axios from 'axios'
import config from '../config'
import style from './admin.module.css'

const Admin = () => {
  const [users, setUsers] = useState([])
  const [reservations, setReservations] = useState([])
  const [foodItems, setFoodItems] = useState([])
  const [isUserModalVisible, setIsUserModalVisible] = useState(false)
  const [isReservationModalVisible, setIsReservationModalVisible] =
    useState(false)
  const [isEmployeeModalVisible, setIsEmployeeModalVisible] = useState(false)
  const [isFoodModalVisible, setIsFoodModalVisible] = useState(false)
  const [isFoodEditModalVisible, setIsFoodEditModalVisible] = useState(false)
  const [editingFoodItem, setEditingFoodItem] = useState(null)
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const { createUsers, getActiveReservations } = useContext(AuthContext)

  useEffect(() => {
    getActiveReservations().then(setReservations)
    fetchFoodItems()
  }, [])

  const fetchFoodItems = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/food`)
      setFoodItems(response.data)
    } catch (error) {
      console.error('Error fetching food items:', error)
    }
  }

  const handleCreateUsers = async () => {
    form.validateFields().then(async (values) => {
      const createdUsers = await createUsers(values.users)
      if (createdUsers) {
        setUsers(createdUsers.slice(-5)) // Сохраняем только последние 5 созданных пользователей
      }
      form.resetFields()
      setIsUserModalVisible(false)
    })
  }

  const handleCreateRandomUsers = async () => {
    const randomUsers = Array.from({ length: 5 }, () => ({
      userName: `user${Math.random().toString(36).substring(7)}`,
      password: Math.random().toString(36).substring(7),
      role: 3,
    }))

    try {
      const createdUsers = await createUsers(randomUsers)
      if (createdUsers) {
        setUsers(createdUsers.slice(-5)) // Сохраняем только последние 5 созданных пользователей
      }
    } catch (error) {
      console.error('Error creating random users:', error)
    }
  }

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(users)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(data, 'users.xlsx')
  }

  const handleCancelReservation = async (id) => {
    try {
      await axios.delete(`${config.API_URL}/reservations/${id}`)
      setReservations((prev) =>
        prev.filter((reservation) => reservation.id !== id)
      )
    } catch (error) {
      console.error('Error cancelling reservation:', error)
    }
  }

  const handleCreateFoodItem = async (values) => {
    try {
      await axios.post(`${config.API_URL}/food`, values)
      fetchFoodItems()
      setIsFoodModalVisible(false)
    } catch (error) {
      console.error('Error creating food item:', error)
    }
  }

  const handleDeleteFoodItem = async (id) => {
    try {
      await axios.delete(`${config.API_URL}/food/${id}`)
      fetchFoodItems()
      message.success('Удаление прошло успешно')
    } catch (error) {
      console.error('Error deleting food item:', error)
      message.error('Failed to delete food item')
    }
  }

  const handleEditFoodItem = (foodItem) => {
    setEditingFoodItem(foodItem)
    editForm.setFieldsValue(foodItem)
    setIsFoodEditModalVisible(true)
  }

  const handleUpdateFoodItem = async (values) => {
    try {
      await axios.put(`${config.API_URL}/food/${editingFoodItem.id}`, values)
      fetchFoodItems()
      setIsFoodEditModalVisible(false)
      message.success('Информация о еде была обновлена')
    } catch (error) {
      console.error('Error updating food item:', error)
      message.error('Failed to update food item')
    }
  }

  const foodColumns = [
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'Цена', dataIndex: 'price', key: 'price' },
    { title: 'Описание', dataIndex: 'description', key: 'description' },
    {
      title: 'Действие',
      key: 'action',
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item onClick={() => handleEditFoodItem(record)}>
                Обновить
              </Menu.Item>
              <Menu.Item onClick={() => handleDeleteFoodItem(record.id)}>
                Удалить
              </Menu.Item>
            </Menu>
          }
        >
          <Button>Действие</Button>
        </Dropdown>
      ),
    },
  ]

  const userColumns = [
    { title: 'Имя пользователя', dataIndex: 'userName', key: 'userName' },
    { title: 'Пароль', dataIndex: 'password', key: 'password' },
  ]

  const reservationColumns = [
    { title: 'Имя', dataIndex: 'name', key: 'name' },
    { title: 'Дата', dataIndex: 'reservation_date', key: 'reservation_date' },
    {
      title: 'Количество человек',
      dataIndex: 'number_of_people',
      key: 'number_of_people',
    },
    { title: 'Столик', dataIndex: 'table_id', key: 'table_id' },
    {
      title: 'Действие',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => handleCancelReservation(record.id)}>
          Отменить
        </Button>
      ),
    },
  ]

  return (
    <div className={style.container}>
      <Button type="primary" onClick={() => setIsUserModalVisible(true)}>
        Создать пользователей
      </Button>
      <Button type="primary" onClick={() => setIsFoodModalVisible(true)}>
        Управление меню еды
      </Button>
      <Button onClick={() => setIsReservationModalVisible(true)}>
        Список броней
      </Button>

      <Modal
        title="Создать пользователей"
        visible={isUserModalVisible}
        onCancel={() => setIsUserModalVisible(false)}
        onOk={handleCreateUsers}
      >
        <Button onClick={handleCreateRandomUsers}>
          Создать 5 пользователей
        </Button>
        <Button className="ml-3" onClick={handleDownloadExcel}>
          Выгрузить в Excel
        </Button>
        <Form form={form} layout="vertical">
          <Form.List name="users">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <div key={key}>
                    <Form.Item
                      {...restField}
                      name={[name, 'userName']}
                      fieldKey={[fieldKey, 'userName']}
                      label="Имя пользователя"
                      rules={[
                        { required: true, message: 'Введите имя пользователя' },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'password']}
                      fieldKey={[fieldKey, 'password']}
                      label="Пароль"
                      rules={[{ required: true, message: 'Введите пароль' }]}
                    >
                      <Input.Password />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'role']}
                      fieldKey={[fieldKey, 'role']}
                      label="Роль"
                      rules={[{ required: true, message: 'Выберите роль' }]}
                    >
                      <Select>
                        <Select.Option value="1">Администратор</Select.Option>
                        <Select.Option value="2">Менеджер</Select.Option>
                        <Select.Option value="3">Пользователь</Select.Option>
                      </Select>
                    </Form.Item>
                    <Button type="dashed" onClick={() => remove(name)}>
                      Удалить
                    </Button>
                  </div>
                ))}
              </>
            )}
          </Form.List>
        </Form>
        <h3>Последние созданные пользователи</h3>
        <Table columns={userColumns} dataSource={users} rowKey="id" />
      </Modal>

      <Modal
        title="Список броней"
        visible={isReservationModalVisible}
        onCancel={() => setIsReservationModalVisible(false)}
        footer={null}
      >
        <Table
          columns={reservationColumns}
          dataSource={reservations}
          rowKey="id"
        />
      </Modal>

      <Modal
        title="Управление меню еды"
        visible={isFoodModalVisible}
        onCancel={() => setIsFoodModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleCreateFoodItem}>
          <Form.Item
            name="name"
            label="Название"
            rules={[
              { required: true, message: 'Пожалуйста, введите название' },
            ]}
          >
            <Input placeholder="Введите название" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Цена"
            rules={[{ required: true, message: 'Пожалуйста, введите цену' }]}
          >
            <Input placeholder="Введите цену" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Описание"
            rules={[
              { required: true, message: 'Пожалуйста, введите описание' },
            ]}
          >
            <Input placeholder="Введите описание" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Добавить
            </Button>
          </Form.Item>
        </Form>
        <h3>Меню еды</h3>
        <Table columns={foodColumns} dataSource={foodItems} rowKey="id" />
      </Modal>

      <Modal
        title="Обновить еду"
        visible={isFoodEditModalVisible}
        onCancel={() => setIsFoodEditModalVisible(false)}
        onOk={editForm.submit}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateFoodItem}>
          <Form.Item
            name="name"
            label="Название"
            rules={[
              { required: true, message: 'Пожалуйста, введите название' },
            ]}
          >
            <Input placeholder="Введите название" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Цена"
            rules={[{ required: true, message: 'Пожалуйста, введите цену' }]}
          >
            <Input placeholder="Введите цену" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Описание"
            rules={[
              { required: true, message: 'Пожалуйста, введите описание' },
            ]}
          >
            <Input placeholder="Введите описание" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Admin
