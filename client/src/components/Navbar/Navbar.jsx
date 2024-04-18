// Navbar.js

import React, { useContext } from 'react'
import styles from './navbar.module.css'
import Button from '../../components/Button/Button'
import { AuthContext } from '../../context/AuthContext'

export default function Navbar() {
  const { handleLogOut } = useContext(AuthContext)

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
        <Button>Admin</Button>
        <Button onClick={handleLogOut}>Выйти</Button>
      </div>
    </nav>
  )
}
