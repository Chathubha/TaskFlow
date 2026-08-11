import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CalendarOff,
  CheckCheck,
  CheckCircle2,
  KanbanSquare,
  Loader2,
  MessageSquare,
  Wallet,
} from 'lucide-react'
import { supabase } from '../../services/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { timeAgo } from '../../lib/utils'

const TYPE_META = {
  leave_request: { icon: CalendarOff, color: 'bg-amber-50 text-amber-600' },
  leave_decision: { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
  task_assigned: { icon: KanbanSquare, color: 'bg-indigo-50 text-indigo-600' },
  task_comment: { icon: MessageSquare, color: 'bg-blue-50 text-blue-600' },
  payment: { icon: Wallet, color: 'bg-emerald-50 text-emerald-600' },
}

// Notification bell with a live dropdown. Fetches recent notifications,
// subscribes to realtime inserts for the current user, and lets the user
// mark items (or everything) as read.
export default function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const menuRef = useRef(null)

  const load = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setUnread(0)
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) {
      setLoading(false)
      return
    }
    setNotifications(data ?? [])
    setUnread((data ?? []).filter((n) => !n.read).length)
    setLoading(false)
  }, [user])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  // Live updates: new notifications arrive in real time.
  useEffect(() => {
    if (!user) return undefined
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev].slice(0, 20))
          setUnread((count) => count + 1)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Close the dropdown when clicking outside of it.
  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const markRead = async (notification) => {
    if (notification.read) return
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
    setUnread((count) => Math.max(0, count - 1))
    supabase.from('notifications').update({ read: true }).eq('id', notification.id)
    if (notification.link) {
      setOpen(false)
      navigate(notification.link)
    }
  }

  const markAllRead = async () => {
    if (unread === 0) return
    setMarking(true)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnread(0)
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    setMarking(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Notifications"
        className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">Notifications</p>
            <button
              type="button"
              onClick={markAllRead}
              disabled={marking || unread === 0}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:opacity-50"
            >
              {marking ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCheck className="size-3.5" />}
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8 text-slate-400">
                <Loader2 className="size-6 animate-spin" />
              </div>
            )}
            {!loading && notifications.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">No notifications yet.</p>
            )}
            {!loading &&
              notifications.map((n) => {
                const meta = TYPE_META[n.type] ?? { icon: Bell, color: 'bg-slate-100 text-slate-500' }
                const Icon = meta.icon
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => markRead(n)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                      !n.read ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${meta.color}`}>
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-semibold text-slate-800">{n.title}</span>
                        <span className="shrink-0 text-[10px] text-slate-400">{timeAgo(n.created_at)}</span>
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-slate-500">{n.body}</span>
                    </span>
                    {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-indigo-500" />}
                  </button>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
