// Central place for status / priority metadata so the whole UI stays in sync.
// "classes" are Tailwind utility strings used by the board, cards and modals.

export const STATUS_ORDER = ['todo', 'in_progress', 'review', 'done']

export const STATUS_META = {
  todo: {
    label: 'To Do',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600',
    header: 'text-slate-500',
  },
  in_progress: {
    label: 'In Progress',
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    header: 'text-blue-600',
  },
  review: {
    label: 'Review',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    header: 'text-amber-600',
  },
  done: {
    label: 'Done',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    header: 'text-emerald-600',
  },
}

export const PRIORITY_ORDER = ['low', 'medium', 'high']

export const PRIORITY_META = {
  low: {
    label: 'Low',
    badge: 'bg-slate-100 text-slate-600',
  },
  medium: {
    label: 'Medium',
    badge: 'bg-blue-50 text-blue-600',
  },
  high: {
    label: 'High',
    badge: 'bg-rose-50 text-rose-600',
  },
}

export const ROLES = {
  admin: { label: 'Admin', badge: 'bg-indigo-100 text-indigo-700' },
  employee: { label: 'Employee', badge: 'bg-slate-100 text-slate-600' },
}

// Preset swatches offered when creating a label.
export const LABEL_COLORS = [
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#0ea5e9', // sky
  '#10b981', // emerald
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#14b8a6', // teal
]

// Each user is entitled to this many leave days per calendar month.
export const MONTHLY_LEAVE_LIMIT = 5
