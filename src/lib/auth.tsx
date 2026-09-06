import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type UserRole = 'patient' | 'his' | null

interface AuthUser {
  id: string
  role: UserRole
  displayName: string
  abhaId?: string
  username?: string
}

interface AuthContextValue {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!mounted) return
      setSession(s)
      if (s) {
        const authUser = await resolveUser(s.user.id, s.user.email || '')
        if (mounted) {
          setUser(authUser)
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!mounted) return
      setSession(s)
      if (s) {
        const authUser = await resolveUser(s.user.id, s.user.email || '')
        if (mounted) setUser(authUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    localStorage.removeItem('medikiosk_auth_role')
  }

  async function resolveUser(uid: string, email: string): Promise<AuthUser> {
    const isPatient = email.endsWith('@patient.medikiosk.in')
    const isHis = email.endsWith('@his.medikiosk.in')

    if (isPatient) {
      const { data } = await supabase.from('patient_profiles').select('*').eq('id', uid).maybeSingle()
      return {
        id: uid,
        role: 'patient',
        displayName: data?.name || 'Patient',
        abhaId: data?.abha_id,
      }
    }

    if (isHis) {
      const { data } = await supabase.from('his_users').select('*').eq('id', uid).maybeSingle()
      return {
        id: uid,
        role: 'his',
        displayName: data?.display_name || 'HIS Staff',
        username: data?.username,
      }
    }

    return { id: uid, role: null, displayName: 'User' }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
