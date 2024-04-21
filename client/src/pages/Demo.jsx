import React, { useState } from 'react'
import { Row, Col, Button, Modal } from 'antd'
import ReservationForm from '../components/ui/ReservationForm'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import axios from 'axios'

import '../antd/dist/antd.css'

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return format(date, 'dd.MM, HH:mm', { locale: ru })
}

const Demo = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedTable, setSelectedTable] = useState(null)
  const [reservations, setReservations] = useState([])

  const fetchReservations = async (tableId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/reservations/${tableId}`
      )
      setReservations(response.data)
    } catch (error) {
      console.error('Failed to fetch reservations:', error)
      setReservations([])
    }
  }

  const showReservationModal = () => {
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setSelectedTable(null)
  }

  const handleFinish = () => {
    setIsModalVisible(false)
    setSelectedTable(null)
  }

  const handleTableSelect = (tableId) => {
    setSelectedTable(tableId)
    fetchReservations(tableId)
    console.log('Выбранный стол:', tableId)
  }

  return (
    <div className="container">
      <div className="leftMenu">
        <div className="table-list">
          {/* Пример статического списка. Вы можете сделать его динамическим, исходя из данных. */}
          {Array.from({ length: 8 }, (_, i) => i + 1).map((tableId) => (
            <Button
              key={tableId}
              style={{ margin: '8px' }}
              onClick={() => handleTableSelect(tableId)}
            >
              Столик {tableId}
            </Button>
          ))}
        </div>
      </div>
      <div className="rightMenu">
        <p className="mb-6">Информация:</p>
        <p className="mb-6">Стол №{selectedTable}</p>
        <div className="reservInfo">
          {reservations.length > 0 ? (
            <ul>
              {reservations.map((res, index) => (
                <li key={index}>
                  Бронь на: {formatDate(res.reservation_date)}
                </li>
              ))}
            </ul>
          ) : (
            <p>Нет активных броней.</p>
          )}
        </div>
        <Button
          type="primary"
          onClick={showReservationModal}
          disabled={!selectedTable}
        >
          Забронировать столик
        </Button>
      </div>

      <Modal
        title="Форма бронирования столика"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <ReservationForm selectedTable={selectedTable} onClose={handleFinish} />
      </Modal>
    </div>
  )
}

export default Demo
