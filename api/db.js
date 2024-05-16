import pg from 'pg'

const pool = new pg.Pool({
  user: 'postgres',
  password: '123',
  host: 'localhost',
  port: '5432',
  database: 'postgres',
})

export default pool
