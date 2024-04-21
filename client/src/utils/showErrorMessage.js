import { enqueueSnackbar } from 'notistack'

export default (error) => {
  // Проверяем, есть ли объект ответа и его данные
  if (error.response && error.response.data && error.response.data.error) {
    enqueueSnackbar(error.response.data.error, { variant: 'error' })
  } else if (error.response && error.response.statusText) {
    // Если ошибка сервера, но без конкретных данных об ошибке
    enqueueSnackbar(`Error: ${error.response.statusText}`, { variant: 'error' })
  } else {
    // Для ошибок сети или других случаев, когда ответ от сервера отсутствует
    enqueueSnackbar('An unexpected error occurred', { variant: 'error' })
  }
}
