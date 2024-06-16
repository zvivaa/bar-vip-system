import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Fingerprint from 'express-fingerprint'
import bodyParser from 'body-parser'
import AuthRouter from './routers/Auth.js'
import moment from 'moment'
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
  const client = await pool.connect()
  const { name, phone, date, time, people, foodItems, user_id, email } =
    req.body

  try {
    await client.query('BEGIN')

    const formattedDate = moment(date).format('YYYY-MM-DD')

    const formattedTime = moment(time, 'HH:mm')
      .subtract(1, 'hours')
      .format('HH:mm:ss')

    let totalPrice = 0
    if (foodItems && foodItems.length > 0) {
      const foodPricePromises = foodItems.map(async (foodItem) => {
        const foodResult = await client.query(
          `SELECT price FROM food WHERE id = $1`,
          [foodItem.id]
        )
        const foodPrice = parseFloat(foodResult.rows[0].price)
        totalPrice += foodPrice * foodItem.amount
        return { foodId: foodItem.id, foodPrice, amount: foodItem.amount }
      })
      const foodPrices = await Promise.all(foodPricePromises)

      const reservationResult = await client.query(
        `INSERT INTO reservations (name, phone, date, time, people, user_id, created_at, food_price, email) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8) 
         RETURNING id`,
        [
          name,
          phone,
          formattedDate,
          formattedTime,
          people,
          user_id,
          totalPrice,
          email,
        ]
      )
      const reservationId = reservationResult.rows[0].id

      // Insert into food_reserv
      const foodInsertPromises = foodPrices.map(
        ({ foodId, foodPrice, amount }) => {
          return client.query(
            `INSERT INTO food_reserv (reservation_id, food_id, price, amount) 
           VALUES ($1, $2, $3, $4)`,
            [reservationId, foodId, foodPrice, amount]
          )
        }
      )
      await Promise.all(foodInsertPromises)
    } else {
      // Insert into reservations without food price if no food items selected
      const reservationResult = await client.query(
        `INSERT INTO reservations (name, phone, date, time, people, user_id, email) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id`,
        [name, phone, formattedDate, formattedTime, people, user_id, email]
      )
    }

    await client.query('COMMIT')
    res
      .status(201)
      .send({ message: 'Reservation confirmed', totalPrice: totalPrice })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error saving reservation:', error)
    res.status(500).send('Error confirming reservation')
  } finally {
    client.release()
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

app.get('/user-reservations/:userId', async (req, res) => {
  const { userId } = req.params
  const client = await pool.connect()

  try {
    const result = await client.query(
      `SELECT * FROM reservations WHERE user_id = $1 AND date >= CURRENT_DATE ORDER BY date, time`,
      [userId]
    )
    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching reservations:', error)
    res.status(500).send('Error fetching reservations')
  } finally {
    client.release()
  }
})

// Отмена бронирования
app.post('/cancel-reservation', async (req, res) => {
  const client = await pool.connect()
  const { reservationId } = req.body

  try {
    await client.query('BEGIN')
    await client.query(`DELETE FROM food_reserv WHERE reservation_id = $1`, [
      reservationId,
    ])
    await client.query(`DELETE FROM reservations WHERE id = $1`, [
      reservationId,
    ])
    await client.query('COMMIT')
    res.status(200).send({ message: 'Reservation cancelled' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error cancelling reservation:', error)
    res.status(500).send('Error cancelling reservation')
  } finally {
    client.release()
  }
})

app.post('/update-user', async (req, res) => {
  const { name, phone, email, user_id } = req.body

  try {
    const result = await pool.query(
      'UPDATE users SET real_name = $1, phone = $2, email = $3 WHERE id = $4 RETURNING *',
      [name, phone, email, user_id]
    )

    if (result.rows.length === 0) {
      return res.status(404).send('User not found')
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).send('Server error')
  }
})

app.get('/reservations/:id/preorders', async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `SELECT fr.food_id, f.name, f.description, fr.price, fr.amount 
       FROM food_reserv fr 
       JOIN food f ON fr.food_id = f.id 
       WHERE fr.reservation_id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).send('Preorders not found for the reservation')
    }

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching preorders:', error)
    res.status(500).send('Error fetching preorders')
  }
})

app.get('/all-preorders', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.name, SUM(CAST(fr.amount AS INTEGER)) as total_amount
       FROM food_reserv fr
       JOIN food f ON fr.food_id = f.id
       GROUP BY f.name`
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching all preorders:', error)
    res.status(500).send('Error fetching all preorders')
  }
})
