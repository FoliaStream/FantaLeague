import {
  Routes,
  Route,
  NavLink,
  useNavigate,
  Navigate,
  useLocation,
  Outlet,
} from 'react-router-dom'

import PlayersPage from './pages/PlayersPage'
import TeamBuilderPage from './pages/TeamBuilderPage'
import ComparePage from './pages/ComparePage'
import SimulatePage from './pages/SimulatePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

import ProtectedRoute from './components/ProtectedRoute'
import { TeamsProvider } from './context/TeamsProvider'
import { isLoggedIn, getUsername, logout } from './api/client'

export default function App() {
  return (
    <div className="app-shell">
      <nav className="app-nav">
        <span className="app-nav__brand">FantaLeague</span>
        <NavLinks />
        <UserMenu />
      </nav>
      <main className="app-main">
        <Routes>
          {/* -------- public routes (no TeamsProvider) -------- */}
          <Route
            path="/login"
            element={<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>}
          />
          <Route
            path="/register"
            element={<RedirectIfAuthed><RegisterPage /></RedirectIfAuthed>}
          />
          <Route
            path="/forgot-password"
            element={<RedirectIfAuthed><ForgotPasswordPage /></RedirectIfAuthed>}
          />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* -------- protected routes (TeamsProvider only here) -------- */}
          <Route
            element={
              <ProtectedRoute>
                <TeamsProvider>
                  <Outlet />
                </TeamsProvider>
              </ProtectedRoute>
            }
          >
            <Route path="/"         element={<PlayersPage />} />
            <Route path="/teams"    element={<TeamBuilderPage />} />
            <Route path="/compare"  element={<ComparePage />} />
            <Route path="/simulate" element={<SimulatePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function NavLinks() {
  useLocation()
  if (!isLoggedIn()) return null
  return (
    <>
      <NavLink to="/" end className="app-nav__link">Players</NavLink>
      <NavLink to="/teams" className="app-nav__link">Team builder</NavLink>
      <NavLink to="/compare" className="app-nav__link">Compare</NavLink>
      <NavLink to="/simulate" className="app-nav__link">Simulate</NavLink>
    </>
  )
}

function UserMenu() {
  const navigate = useNavigate()
  useLocation()

  if (!isLoggedIn()) {
    return (
      <div className="app-nav__right">
        <NavLink to="/login" className="app-nav__link">Sign in</NavLink>
        <NavLink to="/register" className="app-nav__link">Register</NavLink>
      </div>
    )
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-nav__right">
      <span className="app-nav__user">{getUsername()}</span>
      <button onClick={handleLogout}>Sign out</button>
    </div>
  )
}

function RedirectIfAuthed({ children }) {
  if (isLoggedIn()) return <Navigate to="/" replace />
  return children
}