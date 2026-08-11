import { Link } from 'react-router-dom'
import { Bell, CalendarOff, KanbanSquare, Wallet } from 'lucide-react'

const HIGHLIGHTS = [
  {
    icon: KanbanSquare,
    title: 'Live kanban board',
    body: 'Drag tasks forward and keep the whole team in sync.',
  },
  {
    icon: CalendarOff,
    title: 'Leave & salary payments',
    body: 'Request time off and track payments in one place.',
  },
  {
    icon: Bell,
    title: 'Realtime notifications',
    body: 'Know instantly when work moves, gets approved or is paid.',
  },
]

// Split-screen shell for auth pages: brand panel on the left (desktop) and the
// form card on the right. The two pages only provide the form itself.
export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white lg:block">
        <div className="animate-float-slow pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="animate-float pointer-events-none absolute -bottom-32 -right-20 size-96 rounded-full bg-violet-400/20 blur-3xl" aria-hidden="true" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex w-fit items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white text-indigo-700 shadow-lg">
              <KanbanSquare className="size-5.5" />
            </span>
            <span className="text-xl font-bold tracking-tight">TaskFlow</span>
          </Link>

          <div>
            <h2 className="max-w-md text-balance text-3xl font-extrabold leading-tight">
              Keep your team&apos;s work flowing
            </h2>
            <p className="mt-3 max-w-md text-pretty text-indigo-100">
              Sign in to your workspace and pick up right where you left off.
            </p>

            <ul className="mt-8 space-y-4">
              {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex items-center gap-3.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/20">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-indigo-200">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 text-xs text-indigo-200">
            <Wallet className="size-4" />
            Used by small teams that ship faster
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="animate-float-slow pointer-events-none absolute right-0 top-0 size-64 rounded-full bg-indigo-200/40 blur-3xl lg:hidden" aria-hidden="true" />

        <div className="relative w-full max-w-sm">
          {/* Mobile brand */}
          <Link to="/" className="mb-6 flex items-center justify-center gap-2.5 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
              <KanbanSquare className="size-5.5" />
            </span>
            <span className="text-lg font-bold tracking-tight">TaskFlow</span>
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
