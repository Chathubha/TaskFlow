import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../Avatar'
import NotificationBell from '../notifications/NotificationBell'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/board': 'Kanban Board',
  '/team': 'Team',
  '/leaves': 'Leave Allocation',
  '/payments': 'Payments',
  '/profile': 'Profile',
}

export default function Navbar({ currentPath, onToggleSidebar }) {
  const { profile } = useAuth()
  const title = PAGE_TITLES[currentPath] ?? 'TaskFlow'

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          title="Open menu"
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
        >
          <Menu className="size-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-slate-900">{title}</h1>
          <p className="hidden text-xs text-slate-500 sm:block">
            Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <NotificationBell />
        <Link
          to="/profile"
          title="View profile"
          className="flex items-center gap-3 rounded-lg border-l border-slate-200 pl-3 transition-colors hover:bg-slate-50 sm:pl-4"
        >
          <Avatar name={profile?.full_name} id={profile?.id} avatarUrl={profile?.avatar_url} size="sm" />
          <div className="hidden pr-3 sm:block">
            <p className="text-sm font-medium text-slate-800">{profile?.full_name ?? 'User'}</p>
            <p className="text-xs text-slate-500">{profile?.email}</p>
          </div>
        </Link>
      </div>
    </header>
  )
}
