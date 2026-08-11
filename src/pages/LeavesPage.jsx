import { useEffect, useMemo, useState } from 'react'
import {
  CalendarOff,
  Check,
  CheckCircle2,
  Loader2,
  Palette,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { LABEL_COLORS } from '../lib/constants'
import Avatar from '../components/Avatar'

const inputClasses =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
}

function calcDays(start, end) {
  if (!start || !end) return 0
  const ms = new Date(end) - new Date(start)
  return Math.max(0, Math.round(ms / 86400000)) + 1
}

// Leave Allocation — balances per leave type, request/approval workflow,
// admin allocation and leave-type management.
export default function LeavesPage() {
  const { user, isAdmin } = useAuth()
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState('')

  const [types, setTypes] = useState([])
  const [balances, setBalances] = useState([])
  const [requests, setRequests] = useState([])
  const [members, setMembers] = useState([])

  // Request form
  const [form, setForm] = useState({ typeId: '', start: '', end: '', reason: '' })
  const [submitting, setSubmitting] = useState(false)

  // Allocation form
  const [alloc, setAlloc] = useState({ userId: '', typeId: '', days: '', year: new Date().getFullYear() })
  const [allocating, setAllocating] = useState(false)

  // Type form
  const [typeForm, setTypeForm] = useState({ name: '', color: LABEL_COLORS[0], days: 20 })
  const [savingType, setSavingType] = useState(false)

  const year = new Date().getFullYear()

  const load = async () => {
    const [typesRes, balancesRes, requestsRes, membersRes] = await Promise.all([
      supabase.from('leave_types').select('*').order('name'),
      supabase.from('leave_balances').select('*'),
      isAdmin
        ? supabase
            .from('leave_requests')
            .select('*, type:leave_type_id(id, name, color), author:user_id(id, full_name, email, avatar_url)')
            .order('created_at', { ascending: false })
        : supabase
            .from('leave_requests')
            .select('*, type:leave_type_id(id, name, color)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, email, avatar_url').order('full_name'),
    ])

    if (typesRes.error || balancesRes.error || requestsRes.error || membersRes.error) {
      setError(typesRes.error?.message ?? balancesRes.error?.message ?? requestsRes.error?.message ?? membersRes.error?.message)
      setLoading(false)
      return
    }
    setTypes(typesRes.data ?? [])
    setBalances(balancesRes.data ?? [])
    setRequests(requestsRes.data ?? [])
    setMembers(membersRes.data ?? [])
    setError(null)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const balanceMap = useMemo(() => {
    const map = {}
    for (const b of balances) map[`${b.user_id}:${b.leave_type_id}:${b.year}`] = b
    return map
  }, [balances])

  const getRemaining = (userId, typeId, forYear) => {
    const b = balanceMap[`${userId}:${typeId}:${forYear}`]
    return (Number(b?.allocated_days) || 0) - (Number(b?.used_days) || 0)
  }

  const days = calcDays(form.start, form.end)
  const reqYear = form.start ? new Date(form.start).getFullYear() : year
  const remaining = form.typeId ? getRemaining(user.id, form.typeId, reqYear) : 0

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const submitRequest = async (e) => {
    e.preventDefault()
    if (days <= 0) return
    setSubmitting(true)
    setError(null)
    const { error: insertError } = await supabase.from('leave_requests').insert({
      user_id: user.id,
      leave_type_id: form.typeId,
      start_date: form.start,
      end_date: form.end,
      days,
      reason: form.reason.trim() || null,
      status: 'pending',
    })
    setSubmitting(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setForm({ typeId: '', start: '', end: '', reason: '' })
    setNotice('Leave request submitted.')
    load()
  }

  const cancelRequest = async (request) => {
    if (!window.confirm('Cancel this leave request?')) return
    setError(null)
    const { error: deleteError } = await supabase.from('leave_requests').delete().eq('id', request.id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    load()
  }

  const decide = async (request, status) => {
    setError(null)
    const { error: updateError } = await supabase
      .from('leave_requests')
      .update({ status, decided_by: user.id, decided_at: new Date().toISOString() })
      .eq('id', request.id)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setNotice(status === 'approved' ? 'Request approved.' : 'Request rejected.')
    load()
  }

  const allocate = async (e) => {
    e.preventDefault()
    const daysNum = Number(alloc.days)
    if (!alloc.userId || !alloc.typeId || daysNum <= 0) return
    setAllocating(true)
    setError(null)

    const key = `${alloc.userId}:${alloc.typeId}:${alloc.year}`
    const existing = balanceMap[key]
    if (existing) {
      const { error: updateError } = await supabase
        .from('leave_balances')
        .update({ allocated_days: (Number(existing.allocated_days) || 0) + daysNum })
        .eq('id', existing.id)
      if (updateError) {
        setAllocating(false)
        setError(updateError.message)
        return
      }
    } else {
      const { error: insertError } = await supabase.from('leave_balances').insert({
        user_id: alloc.userId,
        leave_type_id: alloc.typeId,
        year: alloc.year,
        allocated_days: daysNum,
        used_days: 0,
      })
      if (insertError) {
        setAllocating(false)
        setError(insertError.message)
        return
      }
    }
    setAllocating(false)
    setAlloc({ userId: '', typeId: '', days: '', year: new Date().getFullYear() })
    setNotice('Leave allocated.')
    load()
  }

  const addType = async (e) => {
    e.preventDefault()
    if (!typeForm.name.trim()) return
    setSavingType(true)
    setError(null)
    const { error: insertError } = await supabase.from('leave_types').insert({
      name: typeForm.name.trim(),
      color: typeForm.color,
      days_per_year: Number(typeForm.days) || 0,
    })
    setSavingType(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setTypeForm({ name: '', color: LABEL_COLORS[0], days: 20 })
    setNotice('Leave type added.')
    load()
  }

  const deleteType = async (type) => {
    if (!window.confirm(`Delete leave type "${type.name}"? Balances and requests for it will also be removed.`)) return
    setError(null)
    const { error: deleteError } = await supabase.from('leave_types').delete().eq('id', type.id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    load()
  }

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
        Could not load leaves: {error}
      </div>
    )
  }

  const myBalances = types.map((type) => ({
    type,
    allocated: Number(balanceMap[`${user.id}:${type.id}:${year}`]?.allocated_days) || 0,
    used: Number(balanceMap[`${user.id}:${type.id}:${year}`]?.used_days) || 0,
  }))

  const TABS = [
    { id: 'overview', label: 'Overview' },
    ...(isAdmin ? [{ id: 'requests', label: 'All Requests' }, { id: 'types', label: 'Types & Allocation' }] : []),
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Leave Allocation</h2>
        <p className="text-sm text-slate-500">Request leave and track your balance.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {notice && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">{notice}</p>}
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>}

      {tab === 'overview' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Balances */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {myBalances.map(({ type, allocated, used }) => (
                <div key={type.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-semibold text-white" style={{ backgroundColor: type.color }}>
                      {type.name}
                    </span>
                  </div>
                  <p className="mt-3 text-xl font-bold text-slate-900">
                    {allocated - used}
                    <span className="text-sm font-medium text-slate-400"> / {allocated} days</span>
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${allocated ? Math.min(100, (used / allocated) * 100) : 0}%`, backgroundColor: type.color }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    {used} used · {year}
                  </p>
                </div>
              ))}
              {myBalances.length === 0 && (
                <p className="col-span-full text-sm text-slate-400">No leave types configured yet.</p>
              )}
            </div>

            {/* My requests */}
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-sm font-semibold text-slate-800">My leave requests</h3>
              </div>
              <ul className="flex flex-col divide-y divide-slate-100">
                {requests.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: r.type?.color }}>
                      <CalendarOff className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{r.type?.name}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(`${r.start_date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} →{' '}
                        {new Date(`${r.end_date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' · '}
                        {r.days} day{r.days > 1 ? 's' : ''}
                        {r.reason ? ` · ${r.reason}` : ''}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_BADGE[r.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {r.status}
                    </span>
                    {r.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => cancelRequest(r)}
                        title="Cancel request"
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </li>
                ))}
                {requests.length === 0 && (
                  <li className="px-5 py-8 text-center text-sm text-slate-400">No leave requests yet.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Request form */}
          <div className="h-fit rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <Plus className="size-4" />
              Request leave
            </h3>
            <form onSubmit={submitRequest} className="flex flex-col gap-3.5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Leave type</label>
                <select value={form.typeId} onChange={set('typeId')} className={inputClasses}>
                  <option value="">Select type…</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({getRemaining(user.id, t.id, reqYear)} remaining)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Start date</label>
                  <input type="date" value={form.start} onChange={set('start')} className={inputClasses} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">End date</label>
                  <input type="date" value={form.end} onChange={set('end')} className={inputClasses} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Reason</label>
                <textarea
                  value={form.reason}
                  onChange={set('reason')}
                  rows={2}
                  placeholder="Optional"
                  className={`${inputClasses} resize-none`}
                />
              </div>
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                {days > 0 ? `${days} day${days > 1 ? 's' : ''}` : '—'} ·{' '}
                {form.typeId ? (
                  <span className={remaining - days < 0 ? 'font-semibold text-rose-600' : ''}>
                    {remaining} remaining for {reqYear}
                  </span>
                ) : (
                  'Select a type to see balance'
                )}
              </p>
              <button
                type="submit"
                disabled={
                  submitting ||
                  !form.typeId ||
                  !form.start ||
                  !form.end ||
                  days <= 0 ||
                  (form.typeId && days > remaining)
                }
                className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Submit request
              </button>
            </form>
          </div>
        </div>
      )}

      {isAdmin && tab === 'requests' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Dates</th>
                <th className="px-4 py-3 font-semibold">Days</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.author?.full_name} id={r.author?.id} avatarUrl={r.author?.avatar_url} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">{r.author?.full_name ?? 'Unknown'}</p>
                        <p className="truncate text-xs text-slate-400">{r.author?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-semibold text-white" style={{ backgroundColor: r.type?.color }}>
                      {r.type?.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {new Date(`${r.start_date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} →{' '}
                    {new Date(`${r.end_date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{r.days}</td>
                  <td className="max-w-48 truncate px-4 py-3 text-xs text-slate-500">{r.reason ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_BADGE[r.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => decide(r, 'approved')}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                          >
                            <Check className="size-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => decide(r, 'rejected')}
                            className="flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700"
                          >
                            <X className="size-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                      {r.status !== 'pending' && (
                        <span className="text-xs text-slate-400">
                          {r.status} · {new Date(r.decided_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                    No leave requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isAdmin && tab === 'types' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Leave types */}
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <Palette className="size-4" />
                Leave types
              </h3>
            </div>
            <ul className="flex flex-col divide-y divide-slate-100">
              {types.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="size-3 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="flex-1 text-sm font-medium text-slate-800">{t.name}</span>
                  <span className="text-xs text-slate-500">{t.days_per_year} days / year</span>
                  <button
                    type="button"
                    onClick={() => deleteType(t)}
                    title="Delete type"
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
              {types.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-slate-400">No leave types yet.</li>
              )}
            </ul>

            <form onSubmit={addType} className="flex flex-col gap-3 border-t border-slate-200 p-5">
              <p className="text-xs font-semibold text-slate-600">Add leave type</p>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setTypeForm((prev) => ({ ...prev, color }))}
                      className={`size-5 rounded-full transition-transform ${typeForm.color === color ? 'scale-110 ring-2 ring-slate-800 ring-offset-1' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  value={typeForm.name}
                  onChange={(e) => setTypeForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Type name"
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <input
                  type="number"
                  min="0"
                  value={typeForm.days}
                  onChange={(e) => setTypeForm((prev) => ({ ...prev, days: e.target.value }))}
                  title="Days per year"
                  className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="submit"
                  disabled={savingType || !typeForm.name.trim()}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingType ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                  Add
                </button>
              </div>
            </form>
          </div>

          {/* Allocate */}
          <div className="h-fit rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <Users className="size-4" />
              Allocate leave
            </h3>
            <form onSubmit={allocate} className="flex flex-col gap-3.5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Employee</label>
                <select value={alloc.userId} onChange={(e) => setAlloc((prev) => ({ ...prev, userId: e.target.value }))} className={inputClasses}>
                  <option value="">Select employee…</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Leave type</label>
                <select value={alloc.typeId} onChange={(e) => setAlloc((prev) => ({ ...prev, typeId: e.target.value }))} className={inputClasses}>
                  <option value="">Select type…</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Days to add</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={alloc.days}
                    onChange={(e) => setAlloc((prev) => ({ ...prev, days: e.target.value }))}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Year</label>
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={alloc.year}
                    onChange={(e) => setAlloc((prev) => ({ ...prev, year: Number(e.target.value) }))}
                    className={inputClasses}
                  />
                </div>
              </div>

              {alloc.userId && alloc.typeId && alloc.year && (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  Current balance: {getRemaining(alloc.userId, alloc.typeId, alloc.year)} day(s)
                </p>
              )}

              <button
                type="submit"
                disabled={allocating || !alloc.userId || !alloc.typeId || !(Number(alloc.days) > 0)}
                className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {allocating && <Loader2 className="size-4 animate-spin" />}
                <CheckCircle2 className="size-4" />
                Allocate
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
