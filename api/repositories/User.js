import pool from '../db.js'

class UserRepository {
  static async createUser({ userName, password, role }) {
    try {
      const result = await pool.query(
        'INSERT INTO users (name, password, role) VALUES ($1, $2, $3) RETURNING *',
        [userName, password, role]
      )
      return result.rows[0]
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
      return result.rows[0]
    } catch (error) {
      console.error('Error finding user by ID:', error)
      throw error
    }
  }

  static async getUserData(userName) {
    const response = await pool.query('SELECT * FROM users WHERE name = $1', [
      userName,
    ])

    if (!response.rows.length) {
      return null
    }

    return response.rows[0]
  }
}

export default UserRepository
