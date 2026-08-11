import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Loader2, Lock, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/auth/AuthLayout'

const inputClasses =
  'w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-3.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'

function Field({ icon: Icon, label, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input {...props} className={inputClasses} />
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const { error: signInError } = await signIn(email, password)
    setSubmitting(false)

    if (signInError) {
      setError(signInError.message)
    }
    // On success the auth listener updates the session and the
    // PublicOnlyRoute redirects to /board automatically.
  }

  return (
    <AuthLayout>
      <h1 className="text-xl font-bold tracking-tight text-slate-900">Welcome back</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">Sign in to your workspace.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          icon={Mail}
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@company.com"
        />
        <Field
          icon={Lock}
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          Sign in
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700">
          Create one
        </Link>
      </p>
    </AuthLayout>
  )
}
