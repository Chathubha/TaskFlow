import { useEffect, useState } from 'react'
import { Loader2, Mail, Pencil, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import { ROLES } from '../lib/constants'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'
import AddMemberModal from '../components/team/AddMemberModal'
import MemberModal from '../components/team/MemberModal'

// Team directory — lists profiles with full CRUD for admins (name/role edit + delete),
// and self-editing of the user's own name.
export default function TeamPage() {
  const { profile: currentUser, refreshProfile } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const load = async () => {
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, avatar_url')
      .order('full_name')

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setMembers(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const isAdmin = currentUser?.role === 'admin'

  const handleEdit = (member) => {
    setEditingMember(member)
    setModalOpen(true)
  }

  const handleDelete = async (member) => {
    if (!window.confirm(`Remove "${member.full_name}" from the team? This cannot be undone.`)) return
    setDeletingId(member.id)
    const { error: deleteError } = await supabase.from('profiles').delete().eq('id', member.id)
    setDeletingId(null)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    load()
  }

  const handleSaved = () => {
    if (editingMember?.id === currentUser?.id) refreshProfile()
    setModalOpen(false)
    setEditingMember(null)
    load()
  }

  const handleMemberAdded = () => {
    setAddOpen(false)
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
        Could not load the team: {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Team members</h2>
          <p className="text-sm text-slate-500">{members.length} people in the workspace.</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <Plus className="size-4" />
            Add member
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4"
          >
            <Avatar name={member.full_name} id={member.id} avatarUrl={member.avatar_url} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{member.full_name}</p>
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                <Mail className="size-3.5 shrink-0" />
                {member.email}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {(isAdmin || member.id === currentUser?.id) && (
                <button
                  type="button"
                  onClick={() => handleEdit(member)}
                  title="Edit member"
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                >
                  <Pencil className="size-4" />
                </button>
              )}
              {isAdmin && member.id !== currentUser?.id && (
                <button
                  type="button"
                  onClick={() => handleDelete(member)}
                  disabled={deletingId === member.id}
                  title="Remove member"
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                >
                  {deletingId === member.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>
              )}
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${ROLES[member.role]?.badge ?? ROLES.employee.badge}`}
            >
              {ROLES[member.role]?.label ?? 'Employee'}
            </span>
          </div>
        ))}
      </div>

      <MemberModal
        open={modalOpen}
        member={editingMember}
        isAdmin={isAdmin}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />

      <AddMemberModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={handleMemberAdded} />
    </div>
  )
}
