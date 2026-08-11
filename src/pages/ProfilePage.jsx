import { useRef, useState } from 'react'
import { CalendarDays, Loader2, Mail, Pencil, Save } from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../lib/constants'
import Avatar from '../components/Avatar'

// Profile page — lets the user edit their display name and upload an avatar.
export default function ProfilePage() {
  const { user, profile, refreshProfile, isAdmin } = useAuth()
  const fileRef = useRef(null)
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [savingName, setSavingName] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const handleSaveName = async (e) => {
    e.preventDefault()
    const name = fullName.trim()
    if (!name) return
    setSavingName(true)
    setError('')
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: name })
      .eq('id', profile.id)
    setSavingName(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    await refreshProfile()
    setNotice('Name updated.')
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    setUploading(true)
    setError('')

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
    const path = `${profile.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setUploading(false)
      setError(uploadError.message)
      return
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', profile.id)

    setUploading(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    await refreshProfile()
    setNotice('Avatar updated.')
    e.target.value = ''
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
        <p className="text-sm text-slate-500">Manage your personal details.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar name={profile?.full_name} id={profile?.id} avatarUrl={profile?.avatar_url} size="xl" />
          <div className="flex flex-col gap-1.5">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
              {uploading ? 'Uploading…' : 'Change avatar'}
            </button>
            {profile?.avatar_url && (
              <button
                type="button"
                onClick={async () => {
                  setError('')
                  const { error: clearError } = await supabase
                    .from('profiles')
                    .update({ avatar_url: null })
                    .eq('id', profile.id)
                  if (clearError) {
                    setError(clearError.message)
                    return
                  }
                  await refreshProfile()
                  setNotice('Avatar removed.')
                }}
                className="text-xs font-medium text-slate-500 transition-colors hover:text-rose-600"
              >
                Remove avatar
              </button>
            )}
          </div>
        </div>

        {/* Details */}
        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Mail className="size-3.5" />
              Email
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">{profile?.email ?? user?.email}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">Role</dt>
            <dd className="mt-1">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${ROLES[profile?.role]?.badge ?? ROLES.employee.badge}`}>
                {ROLES[profile?.role]?.label ?? 'Employee'}
              </span>
            </dd>
          </div>
          {profile?.created_at && (
            <div className="sm:col-span-2">
              <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <CalendarDays className="size-3.5" />
                Member since
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Edit name */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">Display name</h3>
        <form onSubmit={handleSaveName} className="flex flex-col gap-3">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            required
            maxLength={80}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={savingName || fullName.trim() === (profile?.full_name ?? '')}
            className="flex w-fit items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {savingName ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save
          </button>
        </form>
      </div>

      {notice && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">{notice}</p>}
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>}

      <p className="text-xs text-slate-400">
        You are signed in as an {isAdmin ? 'admin' : 'employee'} account.
      </p>
    </div>
  )
}
