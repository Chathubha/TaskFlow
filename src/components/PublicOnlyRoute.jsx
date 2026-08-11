import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wraps auth pages (login / register) — already signed-in users go to the board.
export default function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null
  if (user) return <Navigate to="/board" replace />

  return children
}
