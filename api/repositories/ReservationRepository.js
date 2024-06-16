import pool from '../db.js'

class ReservationRepository {
  static async getActiveReservations() {
    try {
      const result = await pool.query('SELECT * FROM reservations')
      return result.rows
    } catch (error) {
      console.error('Error fetching active reservations:', error)
      throw error
    }
  }
}

export default ReservationRepository
