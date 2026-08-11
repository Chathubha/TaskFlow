import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../Avatar'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/board': 'Kanban Board',
  '/team': 'Team',
  '/leaves': 'Leave Allocation',
  '/payments': 'Payments',
  '/profile': 'Profile',
}

export default function Navbar({ currentPath }) {
  const { profile } = useAuth()
  const title = PAGE_TITLES[currentPath] ?? 'TaskFlow'

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        <p className="text-xs text-slate-500">Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'}</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          title="Notifications"
          className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <Bell className="size-5" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>
        <Link
          to="/profile"
          title="View profile"
          className="flex items-center gap-3 rounded-lg border-l border-slate-200 pl-4 transition-colors hover:bg-slate-50"
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
