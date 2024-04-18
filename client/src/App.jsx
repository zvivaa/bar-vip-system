import { useContext } from 'react'
import { Link, Routes, Route, BrowserRouter, Navigate } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Demo from './pages/Demo'
import style from './app.module.scss'
import { AuthContext } from './context/AuthContext'
import Navbar from './components/Navbar/Navbar'

const App = () => {
  const { isUserLogged } = useContext(AuthContext)
  return (
    <>
      {isUserLogged && <Navbar />}
      <div className={style.wrapper}>
        <SnackbarProvider />
        <BrowserRouter>
          <Routes>
            {isUserLogged ? (
              <Route path="demo" element={<Demo />} />
            ) : (
              <>
                <Route path="sign-in" element={<SignIn />} />
                <Route path="sign-up" element={<SignUp />} />
              </>
            )}
            <Route
              path="*"
              element={<Navigate to={isUserLogged ? 'demo' : 'sign-in'} />}
            />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
