import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Fingerprint from 'express-fingerprint'
import AuthRouter from './routers/Auth.js'
import TokenService from './services/Token.js'
import cookieParser from 'cookie-parser'
import pool from './db.js'

dotenv.config()

const PORT = process.env.PORT || 5000
const app = express()

app.use(cookieParser())
app.use(express.json())

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
  const { name, date, time, people, table, user_id } = req.body
  const reservation_date = `${date} ${time}`

  try {
    const exists = await pool.query(
      'SELECT * FROM reservations WHERE reservation_date = $1 AND table_id = $2',
      [reservation_date, table]
    )

    if (exists.rowCount > 0) {
      return res
        .status(409)
        .json({ error: 'Данный стол на это время уже занят' })
    }

    const result = await pool.query(
      'INSERT INTO reservations (name, reservation_date, number_of_people, table_id, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, reservation_date, people, table, user_id]
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
    res
      .status(201)
      .json({
        message: 'Food item created successfully',
        foodItem: result.rows[0],
      })
  } catch (error) {
    console.error('Error creating food item:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.put('/food/:id', async (req, res) => {
  const { id } = req.params
  const { name, price, description } = req.body
  try {
    const result = await pool.query(
      'UPDATE food SET name = $1, price = $2, description = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, price, description, id]
    )
    res.json({
      message: 'Food item updated successfully',
      foodItem: result.rows[0],
    })
  } catch (error) {
    console.error('Error updating food item:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.delete('/food/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      'DELETE FROM food WHERE id = $1 RETURNING *',
      [id]
    )
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Food item not found' })
    }
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting food item:', error)
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

// New routes for user profile and reservations management
app.get('/user/profile', TokenService.checkAccess, async (req, res) => {
  const userId = req.user.id
  try {
    const result = await pool.query(
      'SELECT name, phone FROM users WHERE id = $1',
      [userId]
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.put('/user/profile', TokenService.checkAccess, async (req, res) => {
  const userId = req.user.id
  const { name, phone } = req.body
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, phone = $2 WHERE id = $3 RETURNING *',
      [name, phone, userId]
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/user/reservation', TokenService.checkAccess, async (req, res) => {
  const userId = req.user.id
  try {
    const result = await pool.query(
      'SELECT * FROM reservations WHERE user_id = $1',
      [userId]
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching user reservation:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.put('/user/reservation/:id', TokenService.checkAccess, async (req, res) => {
  const userId = req.user.id
  const { id } = req.params
  const { name, date, time, people, table } = req.body
  const reservation_date = `${date} ${time}`

  try {
    const result = await pool.query(
      'UPDATE reservations SET name = $1, reservation_date = $2, number_of_people = $3, table_id = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [name, reservation_date, people, table, id, userId]
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating reservation:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.delete(
  '/user/reservation/:id',
  TokenService.checkAccess,
  async (req, res) => {
    const userId = req.user.id
    const { id } = req.params
    try {
      const result = await pool.query(
        'DELETE FROM reservations WHERE id = $1 AND user_id = $2',
        [id, userId]
      )
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Reservation not found' })
      }
      res.status(204).send()
    } catch (error) {
      console.error('Error deleting reservation:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)
