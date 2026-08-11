import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  CalendarOff,
  CheckCircle2,
  KanbanSquare,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Users,
    title: 'Team management',
    body: 'Invite members, assign roles and see who is who at a glance.',
    accent: 'from-sky-500 to-cyan-400',
  },
  {
    icon: CalendarOff,
    title: 'Leave management',
    body: 'Request time off, approve it and track a fair monthly balance per person.',
    accent: 'from-rose-500 to-orange-400',
  },
  {
    icon: Wallet,
    title: 'Salary payments',
    body: 'Keep a clear monthly payment ledger and mark payments paid instantly.',
    accent: 'from-emerald-500 to-teal-400',
  },
  {
    icon: MessageSquare,
    title: 'Comments & subtasks',
    body: 'Discuss work right on the task and break big jobs into checkable steps.',
    accent: 'from-indigo-500 to-violet-400',
  },
]

const BOARD_COLUMNS = [
  { name: 'To Do', dot: 'bg-slate-400', count: 3 },
  { name: 'In Progress', dot: 'bg-indigo-500', count: 2 },
  { name: 'Done', dot: 'bg-emerald-500', count: 1 },
]

const TASKS = [
  { title: 'Design login screen', tag: 'Design', tagColor: 'bg-pink-100 text-pink-600' },
  { title: 'Fix dashboard bug', tag: 'Bug', tagColor: 'bg-rose-100 text-rose-600' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50 text-slate-900">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
              <KanbanSquare className="size-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">TaskFlow</span>
          </Link>

          <div className="hidden items-center gap-1 sm:flex">
            {[
              { label: 'Features', href: '#features' },
              { label: 'Pricing', href: '#cta' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-700"
            >
              Get started
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative">
        {/* Aurora blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float-slow absolute -top-24 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-300/50 via-violet-300/40 to-fuchsia-300/40 blur-3xl" />
          <div className="animate-float absolute -left-32 top-40 size-80 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="animate-float absolute -right-32 top-64 size-80 rounded-full bg-amber-200/40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:pt-20">
          <p className="animate-fade-up mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white/70 py-1.5 pl-1.5 pr-3.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur">
            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              New
            </span>
            Realtime notifications now live
            <Sparkles className="size-3.5 text-amber-500" />
          </p>

          <h1 className="animate-fade-up-d1 mx-auto max-w-3xl text-balance text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
            Keep your team&apos;s work{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              flowing
            </span>{' '}
            from idea to done
          </h1>

          <p className="animate-fade-up-d2 mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
            TaskFlow brings tasks, comments, leave and payments into one beautiful workspace — so your team moves
            faster and nothing slips through the cracks.
          </p>

          <div className="animate-fade-up-d2 mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 hover:brightness-110"
            >
              Start for free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur transition-colors hover:border-slate-400 hover:bg-white"
            >
              Sign in
            </Link>
          </div>

          <p className="animate-fade-up-d3 mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              No credit card
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Set up in minutes
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Free to start
            </span>
          </p>

          {/* Browser mockup with floating cards */}
          <div className="animate-fade-up-d3 relative mx-auto mt-14 max-w-4xl">
            <div className="absolute -inset-x-6 -top-6 bottom-0 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10 blur-2xl" aria-hidden="true" />

            <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-indigo-500/10">
              {/* Window chrome */}
              <div className="flex items-center gap-2 rounded-t-2xl border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span className="size-3 rounded-full bg-rose-400" />
                <span className="size-3 rounded-full bg-amber-400" />
                <span className="size-3 rounded-full bg-emerald-400" />
                <span className="mx-auto rounded-md bg-white px-3 py-1 text-[11px] font-medium text-slate-400 ring-1 ring-slate-200">
                  app.taskflow.com
                </span>
                <span className="w-9" />
              </div>

              {/* Mini kanban board */}
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
                {BOARD_COLUMNS.map((col, i) => (
                  <div key={col.name} className="rounded-xl bg-slate-50 p-3">
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <span className={`size-2 rounded-full ${col.dot}`} />
                      {col.name}
                      <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-400 ring-1 ring-slate-200">
                        {col.count}
                      </span>
                    </p>

                    {i === 0 &&
                      TASKS.map((t) => (
                        <div
                          key={t.title}
                          className="mb-2 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition-transform hover:-translate-y-0.5"
                        >
                          <p className="text-xs font-semibold text-slate-800">{t.title}</p>
                          <span className={`mt-2 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold ${t.tagColor}`}>
                            {t.tag}
                          </span>
                        </div>
                      ))}
                    {i === 0 && (
                      <div className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 py-2 text-[11px] font-medium text-slate-400">
                        <span className="text-slate-300">+</span> Add task
                      </div>
                    )}

                    {i === 1 &&
                      TASKS.map((t, j) => (
                        <div
                          key={t.title}
                          className={`mb-2 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm ${j === 1 ? 'opacity-50' : ''}`}
                        >
                          <p className="text-xs font-semibold text-slate-800">{t.title}</p>
                          <span className={`mt-2 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold ${t.tagColor}`}>
                            {t.tag}
                          </span>
                        </div>
                      ))}

                    {i === 2 && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-left">
                        <p className="text-xs font-semibold text-emerald-800">Ship landing page</p>
                        <p className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                          <CheckCircle2 className="size-3" />
                          Completed
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Floating: payment toast */}
            <div className="animate-float absolute -left-8 top-16 hidden w-52 rounded-xl border border-slate-100 bg-white/90 p-3 shadow-xl shadow-slate-900/10 backdrop-blur lg:block">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Wallet className="size-4" />
                </span>
                <div>
                  <p className="text-[11px] font-bold text-slate-800">Payment received</p>
                  <p className="text-[10px] text-slate-500">Salary for August · $4,200</p>
                </div>
              </div>
            </div>

            {/* Floating: leave toast */}
            <div className="animate-float-slow absolute -right-10 bottom-16 hidden w-52 rounded-xl border border-slate-100 bg-white/90 p-3 shadow-xl shadow-slate-900/10 backdrop-blur lg:block">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <CalendarOff className="size-4" />
                </span>
                <div>
                  <p className="text-[11px] font-bold text-slate-800">Leave approved</p>
                  <p className="text-[10px] text-slate-500">Sep 4 – Sep 5 · 2 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features: bento grid */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Features</p>
          <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Everything a small team needs to stay on track
          </h2>
          <p className="mt-3 text-pretty text-slate-500">
            No clutter, no noise — just the tools that actually move work forward.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Hero card: kanban */}
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-7 text-white shadow-xl shadow-indigo-500/20 lg:col-span-2 lg:row-span-2">
            <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/20">
              <KanbanSquare className="size-5" />
            </span>
            <h3 className="mt-5 text-xl font-bold">Drag &amp; drop kanban board</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-indigo-100">
              Move tasks between To Do, In Progress and Done with a single drag. Statuses stay in sync instantly, across
              the whole team.
            </p>

            <div className="mt-7 grid grid-cols-3 gap-3">
              {BOARD_COLUMNS.map((col, i) => (
                <div key={col.name} className="rounded-2xl bg-white/10 p-3 ring-1 ring-inset ring-white/10 backdrop-blur">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-100">
                    <span className={`size-1.5 rounded-full ${col.dot}`} />
                    {col.name}
                  </p>
                  <div className="mt-2.5 space-y-2">
                    {i === 0 && (
                      <>
                        <div className="h-8 rounded-lg bg-white/90 shadow-sm" />
                        <div className="h-8 rounded-lg bg-white/60 shadow-sm" />
                      </>
                    )}
                    {i === 1 && <div className="h-8 rounded-lg bg-white/60 shadow-sm" />}
                    {i === 2 && (
                      <div className="flex h-8 items-center justify-center rounded-lg bg-emerald-400/20 text-[9px] font-bold text-emerald-100 ring-1 ring-inset ring-emerald-300/30">
                        <CheckCircle2 className="mr-1 size-3" />
                        Done
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Realtime notifications card */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-fuchsia-100/70 blur-2xl" aria-hidden="true" />
            <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow-lg shadow-fuchsia-500/30">
              <Bell className="size-5" />
            </span>
            <h3 className="mt-5 text-lg font-bold">Live notifications</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Get pinged in real time when a task is assigned, commented on or approved.
            </p>
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 p-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-[9px] font-bold text-white">
                AM
              </span>
              <p className="truncate text-[11px] font-medium text-slate-700">
                <span className="font-bold text-slate-900">Amara</span> assigned you a task
              </p>
              <span className="ml-auto size-2 shrink-0 rounded-full bg-fuchsia-500" />
            </div>
          </div>

          {/* Feature tiles */}
          {FEATURES.map(({ icon: Icon, title, body, accent }) => (
            <div
              key={title}
              className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <span
                className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${accent}`}
              >
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-16 text-center text-white">
          <div className="animate-float-slow pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-indigo-500/30 blur-3xl" aria-hidden="true" />
          <div className="animate-float pointer-events-none absolute -bottom-24 -right-16 size-64 rounded-full bg-fuchsia-500/30 blur-3xl" aria-hidden="true" />

          <div className="relative">
            <p className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-100 ring-1 ring-inset ring-white/20">
              <Zap className="size-3.5 text-amber-400" />
              Workspaces start free
            </p>
            <h2 className="mx-auto mt-4 max-w-xl text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to get work flowing?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-pretty text-slate-300">
              Set up your workspace in a minute, invite your team and watch projects move.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/register"
                className="group flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition-transform hover:scale-[1.02]"
              >
                Create your account
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/login"
                className="rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/25 transition-colors hover:bg-white/20"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
              <KanbanSquare className="size-4" />
            </span>
            <span className="font-bold tracking-tight text-slate-800">TaskFlow</span>
            <span className="ml-2 flex items-center gap-1 text-xs text-slate-400">
              <ShieldCheck className="size-3.5" />
              Secure &amp; realtime
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs font-medium text-slate-500">
            <Link to="/login" className="transition-colors hover:text-slate-900">Sign in</Link>
            <Link to="/register" className="transition-colors hover:text-slate-900">Register</Link>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
