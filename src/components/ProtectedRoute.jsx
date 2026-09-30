import { Navigate, useLocation } from 'react-router-dom'
import { isLoggedIn } from '../api/client'

export default function ProtectedRoute({ children }) {
  const location = useLocation()

  if (!isLoggedIn()) {
    // remember where they were trying to go
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}