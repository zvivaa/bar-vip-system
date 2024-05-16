import React, { useState, useEffect, useContext } from 'react'
import { Table, Button, Modal, Form, Input, Select, List } from 'antd'
import { AuthContext } from '../context/AuthContext'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import axios from 'axios'
import config from '../config'

const Admin = () => {
  const [users, setUsers] = useState([])
  const [reservations, setReservations] = useState([])
  const [foodItems, setFoodItems] = useState([])
  const [isUserModalVisible, setIsUserModalVisible] = useState(false)
  const [isReservationModalVisible, setIsReservationModalVisible] =
    useState(false)
  const [isEmployeeModalVisible, setIsEmployeeModalVisible] = useState(false)
  const [isFoodModalVisible, setIsFoodModalVisible] = useState(false)
  const [form] = Form.useForm()
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

  const userColumns = [
    { title: 'Имя пользователя', dataIndex: 'name', key: 'name' },
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

  const foodColumns = [
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'Цена', dataIndex: 'price', key: 'price' },
    { title: 'Описание', dataIndex: 'description', key: 'description' },
  ]

  return (
    <div className="container">
      <Button type="primary" onClick={() => setIsUserModalVisible(true)}>
        Создать пользователей
      </Button>
      <Button onClick={() => setIsReservationModalVisible(true)}>
        Список броней
      </Button>
      <Button type="primary" onClick={() => setIsEmployeeModalVisible(true)}>
        Создание работников
      </Button>
      <Button type="primary" onClick={() => setIsFoodModalVisible(true)}>
        Управление меню еды
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
        <Button onClick={handleDownloadExcel}>Выгрузить в Excel</Button>
        <Form form={form} layout="vertical">
          <Form.List name="users">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <div key={key}>
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      fieldKey={[fieldKey, 'name']}
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
                <Button type="dashed" onClick={() => add()}>
                  Добавить пользователя
                </Button>
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
        title="Создание работников"
        visible={isEmployeeModalVisible}
        onCancel={() => setIsEmployeeModalVisible(false)}
        onOk={handleCreateUsers}
      >
        <Form form={form} layout="vertical">
          <Form.List name="employees">
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
                <Button type="dashed" onClick={() => add()}>
                  Добавить работника
                </Button>
              </>
            )}
          </Form.List>
        </Form>
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
    </div>
  )
}

export default Admin
