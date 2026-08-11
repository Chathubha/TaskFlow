import { NavLink } from 'react-router-dom'
import { CalendarOff, KanbanSquare, LayoutDashboard, LogOut, Users, Wallet } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../lib/constants'
import Avatar from '../Avatar'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/board', label: 'Board', icon: KanbanSquare },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/leaves', label: 'Leave Allocation', icon: CalendarOff },
  { to: '/payments', label: 'Payments', icon: Wallet },
]

export default function Sidebar() {
  const { profile, signOut } = useAuth()

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-slate-900 text-slate-300">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-500 text-white">
          <KanbanSquare className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">TaskFlow</p>
          <p className="text-[11px] text-slate-400">Task Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`
            }
          >
            <Icon className="size-4.5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="mt-auto border-t border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <Avatar name={profile?.full_name} id={profile?.id} avatarUrl={profile?.avatar_url} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {profile?.full_name ?? 'User'}
            </p>
            <span
              className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLES[profile?.role]?.badge ?? ROLES.employee.badge}`}
            >
              {ROLES[profile?.role]?.label ?? 'Employee'}
            </span>
          </div>
          <button
            type="button"
            onClick={signOut}
            title="Sign out"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="size-4.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
