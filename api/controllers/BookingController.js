export const createBooking = async (req, res) => {
  const { name, phone, dishes } = req.body

  try {
    const booking = await BookingRepository.createBooking({
      name,
      phone,
      dishes,
    })
    res.status(201).json(booking)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' })
  }
}
