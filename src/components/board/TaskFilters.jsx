import { ListFilter, Search, User } from 'lucide-react'
import { PRIORITY_META, PRIORITY_ORDER } from '../../lib/constants'

const selectClasses =
  'rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'

// Search + filter bar for the board: text search, priority, assignee,
// due-date state, label, and a "My Tasks" toggle.
export default function TaskFilters({ value, onChange, users, labels, myTasks, onMyTasksChange }) {
  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value })

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
      {/* Search */}
      <div className="relative min-w-52 flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={value.search}
          onChange={set('search')}
          placeholder="Search tasks…"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* My tasks toggle */}
      <button
        type="button"
        onClick={() => onMyTasksChange(!myTasks)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
          myTasks
            ? 'border-indigo-600 bg-indigo-600 text-white'
            : 'border-slate-300 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
        }`}
      >
        <User className="size-3.5" />
        My Tasks
      </button>

      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <ListFilter className="size-4" />
      </span>

      {/* Priority */}
      <select value={value.priority} onChange={set('priority')} className={selectClasses}>
        <option value="all">Any priority</option>
        {PRIORITY_ORDER.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_META[p].label}
          </option>
        ))}
      </select>

      {/* Assignee */}
      <select value={value.assignee} onChange={set('assignee')} className={selectClasses}>
        <option value="all">Anyone</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.full_name}
          </option>
        ))}
      </select>

      {/* Due date state */}
      <select value={value.due} onChange={set('due')} className={selectClasses}>
        <option value="all">Any due date</option>
        <option value="overdue">Overdue</option>
        <option value="due_soon">Due soon</option>
        <option value="no_date">No due date</option>
      </select>

      {/* Label */}
      <select value={value.label} onChange={set('label')} className={selectClasses}>
        <option value="all">Any label</option>
        {labels.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>
    </div>
  )
}
