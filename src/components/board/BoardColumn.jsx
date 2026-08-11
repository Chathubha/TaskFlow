import { Droppable } from '@hello-pangea/dnd'
import { STATUS_META } from '../../lib/constants'
import TaskCard from './TaskCard'

// A single Kanban column (droppable zone) for one task status.
export default function BoardColumn({ status, tasks, onEdit }) {
  const meta = STATUS_META[status]

  return (
    <section className="flex w-72 shrink-0 flex-col rounded-xl bg-slate-200/50">
      {/* Column header */}
      <header className="flex items-center gap-2 px-4 pb-2 pt-3.5">
        <span className={`size-2.5 rounded-full ${meta.dot}`} />
        <h2 className="text-sm font-semibold text-slate-700">{meta.label}</h2>
        <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-500">
          {tasks.length}
        </span>
      </header>

      {/* Droppable task area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex min-h-40 flex-1 flex-col gap-2.5 overflow-y-auto rounded-b-xl p-2.5 transition-colors ${
              snapshot.isDraggingOver ? 'bg-indigo-50' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onEdit={onEdit} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </section>
  )
}
