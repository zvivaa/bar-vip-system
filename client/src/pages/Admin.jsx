import React, { useState, useEffect, useContext } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Radio,
  Flex,
} from 'antd'
import { AuthContext } from '../context/AuthContext'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import axios from 'axios'
import moment from 'moment'
import config from '../config'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts'
import style from './admin.module.css'

const Admin = () => {
  const [users, setUsers] = useState([])
  const [reservations, setReservations] = useState([])
  const [foodItems, setFoodItems] = useState([])
  const [preOrderItems, setPreOrderItems] = useState([])
  const [chartType, setChartType] = useState('reservations')
  const [isUserModalVisible, setIsUserModalVisible] = useState(false)
  const [isReservationModalVisible, setIsReservationModalVisible] =
    useState(false)
  const [isFoodModalVisible, setIsFoodModalVisible] = useState(false)
  const [isPreOrderModalVisible, setIsPreOrderModalVisible] = useState(false)
  const [form] = Form.useForm()
  const { createUsers, getActiveReservations } = useContext(AuthContext)

  useEffect(() => {
    fetchReservations()
    fetchFoodItems()
    fetchAllPreOrderItems()
  }, [])

  const fetchReservations = async () => {
    try {
      const reservations = await getActiveReservations()
      setReservations(reservations)
    } catch (error) {
      console.error('Error fetching reservations:', error)
    }
  }

  const fetchFoodItems = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/food`)
      setFoodItems(response.data)
    } catch (error) {
      console.error('Error fetching food items:', error)
    }
  }

  const fetchPreOrderItems = async (reservationId) => {
    try {
      const response = await axios.get(
        `${config.API_URL}/reservations/${reservationId}/preorders`
      )
      setPreOrderItems(response.data)
    } catch (error) {
      console.error('Error fetching pre-order items:', error)
    }
  }

  const fetchAllPreOrderItems = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/all-preorders`)
      setPreOrderItems(response.data)
    } catch (error) {
      console.error('Error fetching all pre-order items:', error)
    }
  }

  const handleCreateUsers = async () => {
    form.validateFields().then(async (values) => {
      const createdUsers = await createUsers(values.users)
      if (createdUsers) {
        setUsers(createdUsers.slice(-5))
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
        setUsers(createdUsers.slice(-5))
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

  const cancelReservation = async (reservationId) => {
    try {
      const response = await axios.post(
        `https://b769-94-51-211-23.ngrok-free.app/cancel-reservation`,
        { reservationId }
      )
      if (response.status === 200) {
        message.success('Бронирование успешно отменено')
        fetchReservations()
      } else {
        message.error('Ошибка при отмене бронирования')
      }
    } catch (error) {
      message.error('Ошибка при отмене бронирования')
      console.error('Error cancelling reservation:', error)
    }
  }

  const handleCreateFoodItem = async (values) => {
    try {
      await axios.post(`${config.API_URL}/food`, values)
      fetchFoodItems()
    } catch (error) {
      console.error('Error creating food item:', error)
    }
  }

  const handleShowPreOrder = (reservationId) => {
    fetchPreOrderItems(reservationId)
    setIsPreOrderModalVisible(true)
  }

  const userColumns = [
    { title: 'Имя пользователя', dataIndex: 'name', key: 'name' },
    { title: 'Пароль', dataIndex: 'password', key: 'password' },
  ]

  const reservationColumns = [
    { title: 'Имя', dataIndex: 'name', key: 'name' },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Время',
      dataIndex: 'time',
      key: 'time',
      render: (time) => moment(time, 'HH:mm').format('HH:mm'),
    },
    {
      title: 'Количество человек',
      dataIndex: 'people',
      key: 'people',
    },
    { title: 'Сумма предзаказа', dataIndex: 'food_price', key: 'food_price' },
    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (createdAt) => moment(createdAt).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Действие',
      key: 'action',
      render: (_, record) => (
        <>
          <Button onClick={() => cancelReservation(record.id)}>Отменить</Button>
          <Button onClick={() => handleShowPreOrder(record.id)}>
            Предзаказ
          </Button>
        </>
      ),
    },
  ]

  const foodColumns = [
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'Цена', dataIndex: 'price', key: 'price' },
    { title: 'Описание', dataIndex: 'description', key: 'description' },
  ]

  const preOrderColumns = [
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'Количество', dataIndex: 'amount', key: 'amount' },
    { title: 'Цена', dataIndex: 'price', key: 'price' },
  ]

  // Data for charts
  const reservationData = reservations.reduce((acc, res) => {
    const date = moment(res.date).format('YYYY-MM-DD')
    const existing = acc.find((item) => item.date === date)
    if (existing) {
      existing.count += 1
    } else {
      acc.push({ date, count: 1 })
    }
    return acc
  }, [])

  const foodData = preOrderItems.reduce((acc, item) => {
    const existing = acc.find((f) => f.name === item.name)
    if (existing) {
      existing.count += parseInt(item.total_amount, 10)
    } else {
      acc.push({ name: item.name, count: parseInt(item.total_amount, 10) })
    }
    return acc
  }, [])

  return (
    <div className="container">
      <div className={style.buttonContainer}>
        <Button type="primary" onClick={() => setIsUserModalVisible(true)}>
          Создать пользователей
        </Button>
        <Button onClick={() => setIsReservationModalVisible(true)}>
          Список броней
        </Button>
        <Button type="primary" onClick={() => setIsFoodModalVisible(true)}>
          Управление меню еды
        </Button>
      </div>
      <div style={{ padding: '25px' }}>
        <Radio.Group
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          style={{ marginBottom: 20 }}
        >
          <Radio.Button value="reservations">Даты бронирования</Radio.Button>
          <Radio.Button value="food">Заказанная еда</Radio.Button>
        </Radio.Group>
      </div>
      <div
        style={{
          width: '100%',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {chartType === 'reservations' ? (
          <LineChart
            width={800}
            height={400}
            data={reservationData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        ) : (
          <BarChart
            width={800}
            height={400}
            data={foodData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        )}
      </div>
      <Modal
        title="Создать пользователей"
        visible={isUserModalVisible}
        onCancel={() => setIsUserModalVisible(false)}
        onOk={handleCreateUsers}
      >
        <div className={style.insideButton}>
          <Button onClick={handleCreateRandomUsers}>
            Создать 5 пользователей
          </Button>
          <Button onClick={handleDownloadExcel}>Выгрузить в Excel</Button>
        </div>
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
              </>
            )}
          </Form.List>
        </Form>
        <h3>Последние созданные пользователи</h3>
        <Table dataSource={users} columns={userColumns} rowKey="id" />
      </Modal>
      <Modal
        title="Список броней"
        visible={isReservationModalVisible}
        onCancel={() => setIsReservationModalVisible(false)}
        footer={null}
        width={'100%'}
      >
        <Table
          dataSource={reservations}
          columns={reservationColumns}
          rowKey="id"
        />
      </Modal>
      <Modal
        title="Управление меню еды"
        visible={isFoodModalVisible}
        onCancel={() => setIsFoodModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleCreateFoodItem} layout="vertical">
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="Цена"
            rules={[{ required: true, message: 'Введите цену' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Добавить
            </Button>
          </Form.Item>
        </Form>
        <Table dataSource={foodItems} columns={foodColumns} rowKey="id" />
      </Modal>
      <Modal
        title="Предзаказ"
        visible={isPreOrderModalVisible}
        onCancel={() => setIsPreOrderModalVisible(false)}
        footer={null}
      >
        <Table
          dataSource={preOrderItems}
          columns={preOrderColumns}
          rowKey="id"
        />
      </Modal>
    </div>
  )
}

export default Admin
