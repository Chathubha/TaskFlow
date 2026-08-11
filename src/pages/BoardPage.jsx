import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import KanbanBoard from '../components/board/KanbanBoard'
import TaskModal from '../components/board/TaskModal'
import TaskFilters from '../components/board/TaskFilters'

const DEFAULT_FILTERS = {
  search: '',
  priority: 'all',
  assignee: 'all',
  due: 'all',
  label: 'all',
}

// Kanban board page — owns filters, the task modal and the "New Task" trigger.
export default function BoardPage() {
  const { user, isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [labels, setLabels] = useState([])
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [myTasks, setMyTasks] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  // Employee list powers the assignee dropdown in the task modal and filters.
  const fetchUsers = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .order('full_name')
    setUsers(data ?? [])
  }, [])

  const fetchLabels = useCallback(async () => {
    const { data } = await supabase.from('labels').select('id, name, color').order('name')
    setLabels(data ?? [])
  }, [])

  useEffect(() => {
    fetchUsers()
    fetchLabels()
  }, [fetchUsers, fetchLabels])

  const handleSaved = () => {
    setModalOpen(false)
    setEditingTask(null)
    setReloadKey((k) => k + 1) // triggers a fresh fetch in KanbanBoard
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const activeFilters = myTasks ? { ...filters, myTasks: user.id } : filters

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {myTasks ? 'My tasks' : 'All tasks'}
          </h2>
          <p className="text-sm text-slate-500">Drag tasks between columns to update their status.</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setEditingTask(null)
              setModalOpen(true)
            }}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <Plus className="size-4" />
            New Task
          </button>
        )}
      </div>

      <TaskFilters
        value={filters}
        onChange={setFilters}
        users={users}
        labels={labels}
        myTasks={myTasks}
        onMyTasksChange={setMyTasks}
      />

      <KanbanBoard reloadKey={reloadKey} onEdit={handleEdit} filters={activeFilters} />

      <TaskModal
        open={modalOpen}
        task={editingTask}
        users={users}
        labels={labels}
        onLabelCreated={fetchLabels}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  )
}
