import { useState } from 'react'
import { Link } from 'react-router-dom'
import { KanbanSquare, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const inputClasses =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'

export default function RegisterPage() {
  const { signUp, user } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('employee')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    const { error: signUpError } = await signUp(email, password, fullName, role)
    setSubmitting(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    // If email confirmation is disabled a session exists immediately and the
    // user is redirected to the board. Otherwise show a confirmation hint.
    if (!user) {
      setMessage('Account created. Check your inbox to confirm your email, then sign in.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <KanbanSquare className="size-5.5" />
          </span>
          <div>
            <p className="text-lg font-semibold text-slate-900">TaskFlow</p>
            <p className="text-xs text-slate-500">Task Management</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Create your account</h1>
          <p className="mb-5 text-sm text-slate-500">Join your team&apos;s workspace.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Jane Doe"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@company.com"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClasses}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Create account
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
