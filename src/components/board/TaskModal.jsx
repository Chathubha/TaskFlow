import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Loader2,
  MessageSquare,
  Plus,
  Tag,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'
import { supabase } from '../../services/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { LABEL_COLORS, PRIORITY_META, PRIORITY_ORDER, STATUS_META, STATUS_ORDER } from '../../lib/constants'
import Avatar from '../Avatar'

const inputClasses =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'

// Create / edit task dialog. For existing tasks it also hosts label
// assignment, a subtask checklist, and a comments thread.
export default function TaskModal({ open, task, users, labels, onLabelCreated, onClose, onSaved }) {
  const { user, isAdmin } = useAuth()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [comments, setComments] = useState([])
  const [commentBody, setCommentBody] = useState('')
  const [commenting, setCommenting] = useState(false)

  const [subtasks, setSubtasks] = useState([])
  const [subtaskTitle, setSubtaskTitle] = useState('')
  const [addingSubtask, setAddingSubtask] = useState(false)

  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0])

  // Reset the form each time the modal opens (create vs. edit).
  useEffect(() => {
    if (!open) return
    setError('')
    if (task) {
      setForm({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        assigned_to: task.assigned_to ?? '',
        due_date: task.due_date ?? '',
        labels: task.labels ?? [],
      })
    } else {
      setForm({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assigned_to: user?.id ?? '',
        due_date: '',
        labels: [],
      })
    }
  }, [open, task, user])

  // Load thread data for the task being edited.
  useEffect(() => {
    if (!open || !task) return

    const load = async () => {
      const [commentsRes, subtasksRes] = await Promise.all([
        supabase
          .from('comments')
          .select('id, body, created_at, author:user_id(id, full_name, avatar_url)')
          .eq('task_id', task.id)
          .order('created_at', { ascending: true }),
        supabase.from('subtasks').select('*').eq('task_id', task.id).order('created_at'),
      ])
      setComments(commentsRes.data ?? [])
      setSubtasks(subtasksRes.data ?? [])
    }
    load()
  }, [open, task])

  if (!open || !form) return null

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const toggleLabel = (label) => {
    setForm((prev) => {
      const has = prev.labels.some((l) => l.id === label.id)
      return { ...prev, labels: has ? prev.labels.filter((l) => l.id !== label.id) : [...prev.labels, label] }
    })
  }

  const createLabel = async () => {
    const name = newLabelName.trim()
    if (!name) return
    setAddingSubtask(true)
    const { data, error: insertError } = await supabase
      .from('labels')
      .insert({ name, color: newLabelColor })
      .select()
      .single()
    setAddingSubtask(false)
    if (insertError || !data) {
      setError(insertError?.message ?? 'Could not create label')
      return
    }
    onLabelCreated?.(data)
    setForm((prev) => ({ ...prev, labels: [...prev.labels, data] }))
    setNewLabelName('')
    setNewLabelColor(LABEL_COLORS[0])
  }

  const syncLabels = async (taskId) => {
    const desired = form.labels.map((l) => l.id)
    const current = (task?.labels ?? []).map((l) => l.id)
    const toRemove = current.filter((id) => !desired.includes(id))
    const toAdd = desired.filter((id) => !current.includes(id))

    const ops = []
    if (toRemove.length > 0) {
      ops.push(supabase.from('task_labels').delete().eq('task_id', taskId).in('label_id', toRemove))
    }
    if (toAdd.length > 0) {
      ops.push(
        supabase
          .from('task_labels')
          .insert(toAdd.map((label_id) => ({ task_id: taskId, label_id }))),
      )
    }
    await Promise.all(ops)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    setSaving(true)
    setError('')

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      priority: form.priority,
      assigned_to: form.assigned_to || null,
      due_date: form.due_date || null,
    }

    if (task) {
      const { error: updateError } = await supabase.from('tasks').update(payload).eq('id', task.id)
      setSaving(false)
      if (updateError) {
        setError(updateError.message)
        return
      }
      await syncLabels(task.id)
    } else {
      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert({ ...payload, created_by: user.id })
        .select('id')
        .single()
      setSaving(false)
      if (insertError || !data) {
        setError(insertError?.message ?? 'Could not create task')
        return
      }
      await syncLabels(data.id)
    }
    onSaved()
  }

  const handleDelete = async () => {
    if (!task || !window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return
    setSaving(true)
    const { error: deleteError } = await supabase.from('tasks').delete().eq('id', task.id)
    setSaving(false)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    onSaved()
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    const body = commentBody.trim()
    if (!body) return
    setCommenting(true)
    const { error: insertError } = await supabase
      .from('comments')
      .insert({ task_id: task.id, user_id: user.id, body })
    setCommenting(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setCommentBody('')
    const { data } = await supabase
      .from('comments')
      .select('id, body, created_at, author:user_id(id, full_name, avatar_url)')
      .eq('task_id', task.id)
      .order('created_at', { ascending: true })
    setComments(data ?? [])
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    const { error: deleteError } = await supabase.from('comments').delete().eq('id', commentId)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  const handleAddSubtask = async (e) => {
    e.preventDefault()
    const title = subtaskTitle.trim()
    if (!title) return
    setAddingSubtask(true)
    const { data, error: insertError } = await supabase
      .from('subtasks')
      .insert({ task_id: task.id, title })
      .select()
      .single()
    setAddingSubtask(false)
    if (insertError || !data) {
      setError(insertError?.message ?? 'Could not add subtask')
      return
    }
    setSubtasks((prev) => [...prev, data])
    setSubtaskTitle('')
  }

  const handleToggleSubtask = async (subtask) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subtask.id ? { ...s, done: !s.done } : s)),
    )
    await supabase.from('subtasks').update({ done: !subtask.done }).eq('id', subtask.id)
  }

  const handleDeleteSubtask = async (subtaskId) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId))
    await supabase.from('subtasks').delete().eq('id', subtaskId)
  }

  const doneCount = subtasks.filter((s) => s.done).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={set('title')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                required
                maxLength={120}
                placeholder="e.g. Design the onboarding flow"
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Description</label>
              <textarea
                value={form.description}
                onChange={set('description')}
                rows={3}
                placeholder="Add more context, acceptance criteria, links…"
                className={`${inputClasses} resize-none`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Status</label>
                <select value={form.status} onChange={set('status')} className={inputClasses}>
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Priority</label>
                <select value={form.priority} onChange={set('priority')} className={inputClasses}>
                  {PRIORITY_ORDER.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_META[p].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Assignee</label>
                <select value={form.assigned_to} onChange={set('assigned_to')} className={inputClasses}>
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Due date</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={set('due_date')}
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Labels */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Tag className="size-3.5" />
                Labels
              </label>
              <div className="flex flex-wrap gap-1.5">
                {labels.map((label) => {
                  const active = form.labels.some((l) => l.id === label.id)
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        active ? 'text-white ring-2 ring-offset-1' : 'bg-slate-100 text-slate-600 opacity-70 hover:opacity-100'
                      }`}
                      style={active ? { backgroundColor: label.color, '--tw-ring-color': label.color } : {}}
                    >
                      {label.name}
                    </button>
                  )
                })}
              </div>

              {/* Create a new label inline */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex gap-1">
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewLabelColor(color)}
                      title={color}
                      className={`size-5 rounded-full transition-transform ${newLabelColor === color ? 'scale-110 ring-2 ring-slate-800 ring-offset-1' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      createLabel()
                    }
                  }}
                  placeholder="New label name"
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={createLabel}
                  disabled={!newLabelName.trim() || addingSubtask}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
                >
                  {addingSubtask ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                  Add
                </button>
              </div>
            </div>

            {/* Subtasks */}
            {task && (
              <div className="border-t border-slate-200 pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <CheckCircle2 className="size-3.5" />
                    Subtasks
                  </label>
                  {subtasks.length > 0 && (
                    <span className="text-[11px] font-medium text-slate-500">
                      {doneCount}/{subtasks.length} done
                    </span>
                  )}
                </div>

                {subtasks.length > 0 && (
                  <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${doneCount === subtasks.length ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${subtasks.length ? (doneCount / subtasks.length) * 100 : 0}%` }}
                    />
                  </div>
                )}

                <ul className="flex flex-col gap-1">
                  {subtasks.map((subtask) => (
                    <li key={subtask.id} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(subtask)}
                        title={subtask.done ? 'Mark not done' : 'Mark done'}
                        className="shrink-0 text-slate-400 transition-colors hover:text-emerald-600"
                      >
                        {subtask.done ? (
                          <CheckCircle2 className="size-4 text-emerald-500" />
                        ) : (
                          <XCircle className="size-4" />
                        )}
                      </button>
                      <span className={`min-w-0 flex-1 truncate text-sm ${subtask.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {subtask.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(subtask.id)}
                        title="Remove subtask"
                        className="shrink-0 rounded p-1 text-slate-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>

                <form onSubmit={handleAddSubtask} className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={subtaskTitle}
                    onChange={(e) => setSubtaskTitle(e.target.value)}
                    placeholder="Add a subtask…"
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="submit"
                    disabled={!subtaskTitle.trim() || addingSubtask}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {addingSubtask ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                    Add
                  </button>
                </form>
              </div>
            )}

            {/* Comments */}
            {task && (
              <div className="border-t border-slate-200 pt-4">
                <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <MessageSquare className="size-3.5" />
                  Comments ({comments.length})
                </label>

                <ul className="flex flex-col gap-3">
                  {comments.map((comment) => (
                    <li key={comment.id} className="group flex gap-2.5">
                      <Avatar
                        name={comment.author?.full_name}
                        id={comment.author?.id}
                        avatarUrl={comment.author?.avatar_url}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1 rounded-lg bg-slate-50 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-800">
                            {comment.author?.full_name ?? 'Unknown'}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">
                              {new Date(comment.created_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                            {(comment.author?.id === user?.id || isAdmin) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comment.id)}
                                title="Delete comment"
                                className="rounded p-0.5 text-slate-300 opacity-0 transition-all hover:text-rose-600 group-hover:opacity-100"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">{comment.body}</p>
                      </div>
                    </li>
                  ))}
                  {comments.length === 0 && (
                    <li className="text-xs text-slate-400">No comments yet.</li>
                  )}
                </ul>

                <form onSubmit={handleAddComment} className="mt-2.5 flex items-start gap-2">
                  <input
                    type="text"
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Write a comment…"
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="submit"
                    disabled={!commentBody.trim() || commenting}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {commenting ? <Loader2 className="size-3.5 animate-spin" /> : 'Post'}
                  </button>
                </form>
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          {task ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {task ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
