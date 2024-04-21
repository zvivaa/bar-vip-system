import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Fingerprint from 'express-fingerprint'
import AuthRootRouter from './routers/Auth.js'
import TokenService from './services/Token.js'
import cookieParser from 'cookie-parser'
import pool from './db.js'
dotenv.config()

const PORT = process.env.PORT || 5000

const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }))

app.use(
  Fingerprint({
    parameters: [Fingerprint.useragent, Fingerprint.acceptHeaders],
  })
)

app.use('/auth', AuthRootRouter)

app.get('/resource/protected', TokenService.checkAccess, (req, res) => {
  return res.status(200).json('Добро пожаловать!' + Date.now())
})

app.listen(PORT, () => {
  console.log('Сервер успешно запущен')
})

app.post('/reserve', async (req, res) => {
  const { name, date, people, table } = req.body

  try {
    // Проверяем, занят ли стол на данное время
    const exists = await pool.query(
      'SELECT * FROM reservations WHERE reservation_date = $1 AND table_id = $2',
      [date, table]
    )

    // Если запись существует, стол уже занят
    if (exists.rowCount > 0) {
      return res
        .status(409)
        .json({ error: 'Данный стол на это время уже занят' })
    }

    // Вставка новой записи, если стол свободен
    const result = await pool.query(
      'INSERT INTO reservations (name, reservation_date, number_of_people, table_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, date, people, table]
    )

    res
      .status(201)
      .json({ message: 'Бронь успешно создана', reservation: result.rows[0] })
  } catch (error) {
    console.error('Error saving reservation:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/reservations/:tableId', async (req, res) => {
  const { tableId } = req.params
  try {
    const results = await pool.query(
      'SELECT reservation_date FROM reservations WHERE table_id = $1 ORDER BY reservation_date ASC',
      [tableId]
    )
    res.json(results.rows)
  } catch (error) {
    console.error('Error fetching reservations:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})
