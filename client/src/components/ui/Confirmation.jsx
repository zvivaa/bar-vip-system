import React from 'react'
import { Row, Col, Button, notification } from 'antd'
import axios from 'axios'
import config from '../../config'

const Confirmation = ({ reservationData, preOrderData, onConfirm, onBack }) => {
  const handleConfirm = async () => {
    try {
      await axios.post(`${config.API_URL}/reserve`, reservationData)
      notification.success({
        message: 'Успешно',
        description: 'Бронь успешно создана',
      })
      onConfirm()
    } catch (error) {
      if (error.response && error.response.status === 409) {
        notification.warning({
          message: 'Ошибка',
          description: 'У вас уже есть бронь на эту дату',
        })
      } else {
        notification.error({
          message: 'Ошибка',
          description: 'Ошибка при бронировании',
        })
      }
    }
  }

  return (
    <Row gutter={16}>
      <Col span={24} style={{ textAlign: 'center', marginTop: '16px' }}>
        <Button type="primary" onClick={handleConfirm}>
          Подтвердить
        </Button>
        <Button type="default" onClick={onBack} style={{ marginLeft: '8px' }}>
          Назад
        </Button>
      </Col>
    </Row>
  )
}

export default Confirmation
