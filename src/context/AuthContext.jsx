import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // Supabase auth user
  const [profile, setProfile] = useState(null) // matching row in profiles table
  const [loading, setLoading] = useState(true) // true until initial session is resolved

  const loadProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    setProfile(data)
  }, [])

  useEffect(() => {
    // Resolve the initial session on first render.
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) loadProfile(sessionUser.id)
      setLoading(false)
    })

    // Keep the session in sync across tabs / refresh / expiry.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) loadProfile(sessionUser.id)
      else setProfile(null)
      setLoading(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [loadProfile])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  // full_name / role travel inside user_metadata; the DB trigger uses them
  // to populate the profiles row automatically.
  const signUp = (email, password, fullName, role) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    })

  const signOut = () => supabase.auth.signOut()

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    signIn,
    signUp,
    signOut,
    refreshProfile: () => loadProfile(user?.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Convenience hook — components call useAuth() to reach the current session.
// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
