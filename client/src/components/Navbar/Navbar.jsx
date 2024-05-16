import React, { useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './navbar.module.css'
import Button from '../../components/Button/Button'
import { AuthContext } from '../../context/AuthContext'

export default function Navbar() {
  const { user, handleLogOut } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  const isAdmin = user && user.role === 1
  const onAdminPage = location.pathname === '/admin'

  const handleAdminClick = () => {
    navigate('/admin')
  }

  const handleBackClick = () => {
    navigate('/demo')
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navbarList}>
        <li className={styles.navbarItem}>
          <a href="/" className={styles.navbarLink}>
            Главная
          </a>
        </li>
        <li className={styles.navbarItem}>
          <a href="/about" className={styles.navbarLink}>
            О нас
          </a>
        </li>
        <li className={styles.navbarItem}>
          <a href="/services" className={styles.navbarLink}>
            Службы
          </a>
        </li>
        <li className={styles.navbarItem}>
          <a href="/contact" className={styles.navbarLink}>
            Контакты
          </a>
        </li>
      </ul>
      <div>
        <Button onClick={handleAdminClick}>Панель</Button>
        {isAdmin && onAdminPage && (
          <Button onClick={handleBackClick}>Вернуться</Button>
        )}
        <Button onClick={handleProfileClick}>Личный кабинет</Button>
        <Button onClick={handleLogOut}>Выйти</Button>
      </div>
    </nav>
  )
}
