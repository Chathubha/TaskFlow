import { Draggable } from '@hello-pangea/dnd'
import { CalendarDays, CheckCircle2, Circle } from 'lucide-react'
import { PRIORITY_META } from '../../lib/constants'
import { formatDate, isOverdue, isDueSoon, getDragShadowStyle } from '../../lib/utils'
import Avatar from '../Avatar'

// One draggable task card on the board.
export default function TaskCard({ task, index, onEdit }) {
  const priority = PRIORITY_META[task.priority] ?? PRIORITY_META.medium
  const overdue = isOverdue(task.due_date) && task.status !== 'done'
  const dueSoon = !overdue && isDueSoon(task.due_date) && task.status !== 'done'
  const { done = 0, total = 0 } = task.subtasks ?? {}
  const progress = total ? Math.round((done / total) * 100) : 0

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <article
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(task)}
          style={{ ...provided.draggableProps.style, ...getDragShadowStyle(snapshot.isDragging) }}
          className={`group cursor-pointer rounded-lg border bg-white p-3.5 transition-shadow hover:shadow-sm ${
            overdue ? 'border-rose-300 hover:border-rose-400' : 'border-slate-200 hover:border-indigo-200'
          } ${snapshot.isDragging ? 'border-indigo-300' : ''}`}
        >
          {/* Priority + title */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-800">{task.title}</h3>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${priority.badge}`}>
              {priority.label}
            </span>
          </div>

          {/* Labels */}
          {task.labels?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {task.labels.map((label) => (
                <span
                  key={label.id}
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {task.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
              {task.description}
            </p>
          )}

          {/* Subtask progress */}
          {total > 0 && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                {done === total ? (
                  <CheckCircle2 className="size-3 text-emerald-500" />
                ) : (
                  <Circle className="size-3" />
                )}
                {done}/{total}
              </span>
            </div>
          )}

          {/* Footer: due date + assignee */}
          <div className="mt-3 flex items-center justify-between">
            {task.due_date ? (
              <span
                className={`flex items-center gap-1 text-[11px] font-medium ${
                  overdue ? 'text-rose-600' : dueSoon ? 'text-amber-600' : 'text-slate-500'
                }`}
              >
                <CalendarDays className="size-3.5" />
                {formatDate(task.due_date)}
                {overdue && (
                  <span className="rounded bg-rose-50 px-1.5 py-px text-[9px] font-bold uppercase text-rose-600">Overdue</span>
                )}
                {dueSoon && (
                  <span className="rounded bg-amber-50 px-1.5 py-px text-[9px] font-bold uppercase text-amber-600">Due soon</span>
                )}
              </span>
            ) : (
              <span className="text-[11px] text-slate-300">No due date</span>
            )}

            {task.assignee ? (
              <Avatar
                name={task.assignee.full_name}
                id={task.assignee.id}
                avatarUrl={task.assignee.avatar_url}
                size="sm"
              />
            ) : (
              <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-400 ring-2 ring-white">
                ?
              </span>
            )}
          </div>
        </article>
      )}
    </Draggable>
  )
}
