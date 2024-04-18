import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Fingerprint from 'express-fingerprint'
import AuthRootRouter from './routers/Auth.js'
import TokenService from './services/Token.js'
import cookieParser from 'cookie-parser'

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
  const { name, date, time, people, table } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO reservations (name, reservation_date, number_of_people, table_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, date, people, table]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error during reservation:', error.message)
    res.status(500).json({ error: 'Internal server error' })
  }
})
