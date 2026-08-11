import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
        <p className="text-sm">Loading…</p>
      </div>
    </div>
  )
}

// Wraps routes that require an authenticated user.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace />

  return children
}
