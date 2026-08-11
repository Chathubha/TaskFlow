import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Flag,
  Layers,
  ListTodo,
  Loader2,
  Search,
  User,
} from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import { PRIORITY_META, STATUS_META, STATUS_ORDER } from '../lib/constants'
import { isOverdue, isDueSoon } from '../lib/utils'
import Avatar from '../components/Avatar'

function StatCard({ icon: Icon, label, value, sub, iconClass = 'bg-indigo-50 text-indigo-600' }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-tight text-slate-900">{value}</p>
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
        {sub && <p className="truncate text-[11px] text-slate-400">{sub}</p>}
      </div>
    </div>
  )
}

function Bar({ label, count, total, color = 'bg-indigo-500' }) {
  const pct = total ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-slate-500">{count}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// Dashboard — task statistics and workload overview.
export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])

  useEffect(() => {
    const load = async () => {
      const [tasksRes, membersRes] = await Promise.all([
        supabase
          .from('tasks')
          .select('id, title, status, priority, due_date, assigned_to, assignee:assigned_to(id, full_name, email, avatar_url)'),
        supabase.from('profiles').select('id, full_name, email, avatar_url').order('full_name'),
      ])
      if (tasksRes.error) {
        setError(tasksRes.error.message)
        setLoading(false)
        return
      }
      setTasks(tasksRes.data ?? [])
      setMembers(membersRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Could not load the dashboard: {error}
      </div>
    )
  }

  const open = tasks.filter((t) => t.status !== 'done')
  const done = tasks.filter((t) => t.status === 'done')
  const overdue = open.filter((t) => isOverdue(t.due_date))
  const dueSoon = open.filter((t) => isDueSoon(t.due_date))
  const high = tasks.filter((t) => t.priority === 'high' && t.status !== 'done')

  const statusCounts = {}
  for (const s of STATUS_ORDER) {
    statusCounts[s] = tasks.filter((t) => t.status === s).length
  }
  const priorityCounts = {}
  for (const p of ['low', 'medium', 'high']) {
    priorityCounts[p] = tasks.filter((t) => t.priority === p).length
  }

  const workload = members
    .map((m) => ({ ...m, count: open.filter((t) => t.assigned_to === m.id).length }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500">A snapshot of what's happening across the workspace.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Layers} label="Total tasks" value={tasks.length} />
        <StatCard icon={ListTodo} label="Open tasks" value={open.length} iconClass="bg-blue-50 text-blue-600" />
        <StatCard icon={CheckCircle2} label="Completed" value={done.length} iconClass="bg-emerald-50 text-emerald-600" />
        <StatCard
          icon={AlertTriangle}
          label="Overdue"
          value={overdue.length}
          iconClass="bg-rose-50 text-rose-600"
          sub={overdue.length > 0 ? 'Needs attention' : undefined}
        />
        <StatCard
          icon={CalendarClock}
          label="Due soon"
          value={dueSoon.length}
          iconClass="bg-amber-50 text-amber-600"
          sub={dueSoon.length > 0 ? 'Next 3 days' : undefined}
        />
        <StatCard icon={Flag} label="High priority" value={high.length} iconClass="bg-violet-50 text-violet-600" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Status breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Status</h3>
          <div className="flex flex-col gap-3.5">
            {STATUS_ORDER.map((s) => (
              <Bar
                key={s}
                label={STATUS_META[s].label}
                count={statusCounts[s]}
                total={tasks.length}
                color={STATUS_META[s].dot}
              />
            ))}
          </div>
        </div>

        {/* Priority breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Priority</h3>
          <div className="flex flex-col gap-3.5">
            {['low', 'medium', 'high'].map((p) => (
              <Bar key={p} label={PRIORITY_META[p].label} count={priorityCounts[p]} total={tasks.length} />
            ))}
          </div>
        </div>

        {/* Workload */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            <User className="size-4" />
            Open workload by member
          </h3>
          <div className="flex flex-col gap-3.5">
            {workload.length === 0 && <p className="text-xs text-slate-400">No members yet.</p>}
            {workload.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <Avatar name={m.full_name} id={m.id} avatarUrl={m.avatar_url} size="sm" />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">{m.full_name}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {m.count} open
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overdue / due soon lists */}
      {(overdue.length > 0 || dueSoon.length > 0) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {overdue.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-5">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-rose-700">
                <AlertTriangle className="size-4" />
                Overdue tasks
              </h3>
              <ul className="flex flex-col gap-1.5">
                {overdue.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm">
                    <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{t.title}</span>
                    <span className="shrink-0 text-[11px] font-semibold text-rose-600">
                      {STATUS_META[t.status].label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {dueSoon.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                <CalendarClock className="size-4" />
                Due in the next 3 days
              </h3>
              <ul className="flex flex-col gap-1.5">
                {dueSoon.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm">
                    <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{t.title}</span>
                    <span className="shrink-0 text-[11px] font-semibold text-amber-600">
                      {STATUS_META[t.status].label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {tasks.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Search className="size-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">No tasks yet</p>
          <p className="text-xs text-slate-400">Create your first task on the Board page.</p>
        </div>
      )}
    </div>
  )
}
