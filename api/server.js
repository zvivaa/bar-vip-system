import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Fingerprint from 'express-fingerprint'
import bodyParser from 'body-parser'
import AuthRouter from './routers/Auth.js'
import TokenService from './services/Token.js'
import cookieParser from 'cookie-parser'
import pool from './db.js'

dotenv.config()

const PORT = process.env.PORT || 5000
const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(bodyParser.json())

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173']
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
  })
)

app.use(
  Fingerprint({
    parameters: [Fingerprint.useragent, Fingerprint.acceptHeaders],
  })
)

app.use('/auth', AuthRouter)

app.get('/resource/protected', TokenService.checkAccess, (req, res) => {
  return res.status(200).json('Добро пожаловать!' + Date.now())
})

app.listen(PORT, () => {
  console.log(`Сервер успешно запущен на порту ${PORT}`)
})

app.post('/reserve', async (req, res) => {
  const { name, date, people, phone, user_id } = req.body
  const reservation_date = `${date} 00:00:00` // Set time to midnight as we are only concerned with the date

  try {
    const exists = await pool.query(
      'SELECT * FROM reservations WHERE reservation_date = $1 AND user_id = $2',
      [reservation_date, user_id]
    )

    if (exists.rowCount > 0) {
      return res.status(409).json({ error: 'У вас уже есть бронь на эту дату' })
    }

    const result = await pool.query(
      'INSERT INTO reservations (name, reservation_date, number_of_people, phone, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, reservation_date, people, phone, user_id]
    )

    res
      .status(201)
      .json({ message: 'Бронь успешно создана', reservation: result.rows[0] })
  } catch (error) {
    console.error('Error saving reservation:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/users/last', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT 5'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching last users:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/food', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food')
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching food items:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.post('/food', async (req, res) => {
  const { name, price, description } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO food (name, price, description) VALUES ($1, $2, $3) RETURNING *',
      [name, price, description]
    )
    res.status(201).json({
      message: 'Food item created successfully',
      foodItem: result.rows[0],
    })
  } catch (error) {
    console.error('Error creating food item:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.delete('/reservations/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM reservations WHERE id = $1', [id])
    res.status(204).send()
  } catch (error) {
    console.error('Error cancelling reservation:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})
