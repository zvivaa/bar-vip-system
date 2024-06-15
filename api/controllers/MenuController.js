export const getMenu = async (req, res) => {
  try {
    const menu = await MenuRepository.getMenu()
    res.status(200).json(menu)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get menu' })
  }
}
