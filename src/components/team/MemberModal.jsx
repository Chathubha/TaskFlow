import { useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { supabase } from '../../services/supabaseClient'
import { ROLES } from '../../lib/constants'

const inputClasses =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'

// Edit member dialog — admins can change name + role, anyone can edit their own name.
export default function MemberModal({ open, member, isAdmin, onClose, onSaved }) {
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Reset the form each time the modal opens.
  useEffect(() => {
    if (!open) return
    setError('')
    setForm({
      full_name: member.full_name,
      role: member.role,
    })
  }, [open, member])

  if (!open || !form) return null

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = { full_name: form.full_name.trim() }
    if (isAdmin) payload.role = form.role

    const { error: updateError } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', member.id)

    setSaving(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Edit member</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Full name *</label>
            <input
              type="text"
              value={form.full_name}
              onChange={set('full_name')}
              required
              maxLength={80}
              placeholder="e.g. Nimal Perera"
              className={inputClasses}
            />
          </div>

          {isAdmin && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Role</label>
              <select value={form.role} onChange={set('role')} className={inputClasses}>
                {Object.entries(ROLES).map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>
          )}

          {/* Footer */}
          <div className="mt-1 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
