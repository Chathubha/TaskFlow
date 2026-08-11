// Small shared helpers used across components.

/** Formats a YYYY-MM-DD date as a short human label, e.g. "Aug 11". */
export function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** True when a YYYY-MM-DD date is before today (ignores time). */
export function isOverdue(dateStr) {
  if (!dateStr) return false
  const d = new Date(`${dateStr}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d < today
}

/** True when a YYYY-MM-DD date is within the next `withinDays` days (today or later). */
export function isDueSoon(dateStr, withinDays = 3) {
  if (!dateStr) return false
  const d = new Date(`${dateStr}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.ceil((d - today) / 86400000)
  return diff >= 0 && diff <= withinDays
}

/** Returns a relative label for a date: "Today", "Tomorrow", or formatted. */
export function relativeDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(`${dateStr}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.ceil((d - today) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return formatDate(dateStr)
}

/** Short human time label for timestamps, e.g. "5m ago", "2h ago". */
export function timeAgo(dateStr) {
  if (!dateStr) return ''
  const then = new Date(dateStr).getTime()
  if (Number.isNaN(then)) return ''
  const sec = Math.max(0, Math.floor((Date.now() - then) / 1000))
  if (sec < 60) return 'Just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Returns up to two initials from a person's name, e.g. "Jane Doe" -> "JD". */
export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

/** Deterministic pastel color per assignee id — keeps avatars stable. */
const AVATAR_COLORS = [
  'bg-indigo-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-teal-500',
]

export function avatarColor(id = '') {
  if (!id) return 'bg-slate-400'
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 1000
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

/** Formats a number as a currency string, e.g. "LKR 75,000". */
export function formatMoney(value) {
  const num = Number(value ?? 0)
  if (Number.isNaN(num)) return 'LKR 0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(num)
}

/** Returns a flat CSS style map for the drag shadow applied while dragging. */
export function getDragShadowStyle(isDragging) {
  return {
    boxShadow: isDragging
      ? '0 10px 20px rgba(15, 23, 42, 0.18), 0 4px 8px rgba(15, 23, 42, 0.12)'
      : undefined,
  }
}
