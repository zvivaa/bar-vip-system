import { useContext } from 'react'
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Demo from './pages/Demo'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import { AuthContext } from './context/AuthContext'
import BookingProvider from './context/BookingContext'
import Navbar from './components/Navbar/Navbar'

const App = () => {
  const { isUserLogged, user } = useContext(AuthContext)

  return (
    <SnackbarProvider>
      <BrowserRouter>
        {isUserLogged && <Navbar />}
        <BookingProvider>
          <Routes>
            {isUserLogged ? (
              <>
                <Route path="demo" element={<Demo />} />
                <Route path="profile" element={<Profile />} />
                <Route
                  path="admin"
                  element={
                    user?.role === 1 ? <Admin /> : <Navigate to="/demo" />
                  }
                />
              </>
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
        </BookingProvider>
      </BrowserRouter>
    </SnackbarProvider>
  )
}

export default App
