import React, { useState } from 'react'
import { Row, Col, Button, Modal } from 'antd'
import ReservationForm from '../components/ui/ReservationForm'
import '../antd/dist/antd.css'

const Demo = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedTable, setSelectedTable] = useState(null)

  const showReservationModal = () => {
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setSelectedTable(null) // Сброс выбранного столика при закрытии модального окна
  }

  // Эта функция вызывается из ReservationForm при успешной отправке формы
  const handleFinish = () => {
    setIsModalVisible(false)
    setSelectedTable(null)
  }

  const handleTableSelect = (tableId) => {
    setSelectedTable(tableId) // Сохранить выбранный номер столика
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
        <p className="mb-6">Выбранный стол: {selectedTable}</p>
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
