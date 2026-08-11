import { useCallback, useEffect, useState } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { supabase } from '../../services/supabaseClient'
import { STATUS_ORDER } from '../../lib/constants'
import { isOverdue, isDueSoon } from '../../lib/utils'
import BoardColumn from './BoardColumn'

// Renders the four status columns and handles drag-and-drop status updates.
// `filters` narrows which tasks are shown; drag-and-drop still operates on
// the full task list so filtered cards can be moved between columns.
export default function KanbanBoard({ reloadKey, onEdit, filters = {} }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTasks = useCallback(async () => {
    const [tasksRes, subtasksRes] = await Promise.all([
      supabase
        .from('tasks')
        .select(
          'id, title, description, status, priority, assigned_to, due_date, created_by, assignee:assigned_to(id, full_name, email, role, avatar_url), task_labels:task_labels(label_id, label:labels(id, name, color))',
        )
        .order('created_at', { ascending: false }),
      supabase.from('subtasks').select('task_id, done'),
    ])

    if (tasksRes.error) {
      setError(tasksRes.error.message)
      return
    }

    // Count completed / total subtasks per task for the card progress bar.
    const subtaskMap = {}
    for (const s of subtasksRes.data ?? []) {
      const entry = subtaskMap[s.task_id] ?? { done: 0, total: 0 }
      entry.total += 1
      if (s.done) entry.done += 1
      subtaskMap[s.task_id] = entry
    }

    const shaped = (tasksRes.data ?? []).map((t) => ({
      ...t,
      labels: t.task_labels?.map((tl) => tl.label).filter(Boolean) ?? [],
      subtasks: subtaskMap[t.id] ?? { done: 0, total: 0 },
    }))
    setTasks(shaped)
    setError(null)
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchTasks().finally(() => setLoading(false))
  }, [fetchTasks, reloadKey])

  const matchesFilters = useCallback(
    (task) => {
      const { search, priority, assignee, due, label, myTasks } = filters
      if (myTasks && task.assigned_to !== myTasks) return false
      if (search) {
        const q = search.trim().toLowerCase()
        if (!task.title.toLowerCase().includes(q) && !(task.description ?? '').toLowerCase().includes(q)) {
          return false
        }
      }
      if (priority && priority !== 'all' && task.priority !== priority) return false
      if (assignee && assignee !== 'all' && task.assigned_to !== assignee) return false
      if (label && label !== 'all' && !task.labels?.some((l) => l.id === label)) return false
      if (due && due !== 'all') {
        if (due === 'overdue' && !(isOverdue(task.due_date) && task.status !== 'done')) return false
        if (due === 'due_soon' && !(isDueSoon(task.due_date) && task.status !== 'done')) return false
        if (due === 'no_date' && task.due_date) return false
      }
      return true
    },
    [filters],
  )

  const visibleTasks = tasks.filter(matchesFilters)

  // Optimistic move + persist the status change to Supabase.
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const moved = tasks.find((t) => t.id === draggableId)
    if (!moved) return

    const destStatus = destination.droppableId

    // Remove the card, then splice it into the destination column at the drop index.
    const rest = tasks.filter((t) => t.id !== draggableId)
    const destColumn = rest.filter((t) => t.status === destStatus)
    destColumn.splice(destination.index, 0, { ...moved, status: destStatus })
    setTasks([...destColumn, ...rest.filter((t) => t.status !== destStatus)])

    // Persist only when the status actually changed (cross-column drop).
    if (source.droppableId !== destStatus) {
      supabase
        .from('tasks')
        .update({ status: destStatus })
        .eq('id', draggableId)
        .then(({ error: updateError }) => {
          if (updateError) {
            // Roll back to the server's view on failure.
            fetchTasks()
          }
        })
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
        <AlertTriangle className="size-8 text-rose-500" />
        <p className="text-sm font-medium text-rose-700">Could not load tasks</p>
        <p className="text-xs text-rose-600">{error}</p>
        <button
          type="button"
          onClick={() => { setLoading(true); fetchTasks().finally(() => setLoading(false)) }}
          className="mt-2 rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex items-start gap-4 overflow-x-auto pb-4">
        {STATUS_ORDER.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tasks={visibleTasks.filter((t) => t.status === status)}
            onEdit={onEdit}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
