import React, { useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './navbar.module.css'
import Button from '../../components/Button/Button'
import { AuthContext } from '../../context/AuthContext'
import logo from '../../images/bivo-shop_logo.svg'

export default function Navbar() {
  const { user, handleLogOut } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  const onAdminPage = location.pathname === '/admin'
  const onProfilePage = location.pathname === '/profile'

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
            <img src={logo} width={150} />
          </a>
        </li>
      </ul>
      <div className={styles.buttonsList}>
        {onAdminPage && <Button onClick={handleBackClick}>Вернуться</Button>}
        {onProfilePage && <Button onClick={handleBackClick}>Вернуться</Button>}
        {user?.role === 1 && !onAdminPage && (
          <Button onClick={handleAdminClick}>Администрирование</Button>
        )}

        {!onProfilePage && (
          <Button onClick={handleProfileClick}>Личный кабинет</Button>
        )}
        <Button onClick={handleLogOut}>Выйти</Button>
      </div>
    </nav>
  )
}
