import { supabase } from './supabase'

export async function registerPatient(data: {
  abhaId: string
  aadhaarId?: string
  name: string
  age?: number
  gender?: string
  phone?: string
  password: string
}): Promise<{ error: string | null }> {
  const email = `${data.abhaId}@patient.medikiosk.in`

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password: data.password,
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'An account with this ABHA ID already exists. Please log in instead.' }
    }
    return { error: 'Registration failed. Please try again.' }
  }

  const userId = authData.user?.id
  if (!userId) return { error: 'Registration failed. Please try again.' }

  const { error: profileError } = await supabase.from('patient_profiles').insert({
    id: userId,
    abha_id: data.abhaId,
    aadhaar_id: data.aadhaarId || null,
    name: data.name,
    age: data.age || null,
    gender: data.gender || null,
    phone: data.phone || null,
  })

  if (profileError) {
    return { error: 'Failed to create patient profile. Please contact support.' }
  }

  return { error: null }
}

export async function loginPatient(abhaId: string, password: string): Promise<{ error: string | null }> {
  const email = `${abhaId}@patient.medikiosk.in`
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: 'Invalid ABHA ID or password. Please try again.' }
  }
  localStorage.setItem('medikiosk_auth_role', 'patient')
  return { error: null }
}

export async function registerHisUser(data: {
  username: string
  displayName: string
  password: string
}): Promise<{ error: string | null }> {
  const email = `${data.username}@his.medikiosk.in`

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password: data.password,
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'An account with this username already exists. Please log in instead.' }
    }
    return { error: 'Registration failed. Please try again.' }
  }

  const userId = authData.user?.id
  if (!userId) return { error: 'Registration failed. Please try again.' }

  const { error: profileError } = await supabase.from('his_users').insert({
    id: userId,
    username: data.username,
    display_name: data.displayName,
  })

  if (profileError) {
    return { error: 'Failed to create HIS account. Please contact support.' }
  }

  return { error: null }
}

export async function loginHisUser(username: string, password: string): Promise<{ error: string | null }> {
  const email = `${username}@his.medikiosk.in`
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: 'Invalid username or password. Please try again.' }
  }
  localStorage.setItem('medikiosk_auth_role', 'his')
  return { error: null }
}

export async function getPatientRecords(limit: number = 10): Promise<PatientRecord[]> {
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !sessions || sessions.length === 0) return []

  const patientIds = [...new Set(sessions.map((s) => s.patient_id))]
  const [{ data: patients }, { data: summaries }, { data: redFlags }] = await Promise.all([
    supabase.from('patients').select('*').in('id', patientIds),
    supabase.from('summaries').select('*').in('session_id', sessions.map((s) => s.id)),
    supabase.from('red_flags').select('*').in('session_id', sessions.map((s) => s.id)),
  ])

  const patientMap = new Map(patients?.map((p) => [p.id, p]) || [])
  const summaryMap = new Map<string, Summary>()
  summaries?.forEach((s) => {
    if (!summaryMap.has(s.session_id)) summaryMap.set(s.session_id, s as Summary)
  })
  const flagsMap = new Map<string, RedFlag[]>()
  redFlags?.forEach((f) => {
    const arr = flagsMap.get(f.session_id) || []
    arr.push(f as RedFlag)
    flagsMap.set(f.session_id, arr)
  })

  return sessions.map((session) => ({
    patient: patientMap.get(session.patient_id) || ({} as Patient),
    session: session as Session,
    summary: summaryMap.get(session.id) || null,
    redFlags: flagsMap.get(session.id) || [],
  }))
}

export async function getHisRecords(limit: number = 50): Promise<PatientRecord[]> {
  return getPatientRecords(limit)
}

export async function updateSummary(summaryId: string, summary: Record<string, unknown>): Promise<boolean> {
  const { error } = await supabase.from('summaries').update({ summary }).eq('id', summaryId)
  return !error
}

export async function callCleanupPatientRecords(): Promise<void> {
  await supabase.rpc('cleanup_patient_records')
}

export async function callCleanupHisRecords(): Promise<void> {
  await supabase.rpc('cleanup_his_records')
}

export interface PatientRecord {
  patient: Patient
  session: Session
  summary: Summary | null
  redFlags: RedFlag[]
}

interface Patient {
  id: string
  abha_id: string | null
  name: string
  age: number | null
  gender: string | null
  phone: string | null
  language: string
  created_at: string
}

interface Session {
  id: string
  patient_id: string
  user_id: string | null
  status: string
  language: string
  consent_given: boolean
  mode: string
  red_flag_triggered: boolean
  created_at: string
  completed_at: string | null
}

interface Summary {
  id: string
  session_id: string
  summary: Record<string, unknown>
  created_at: string
}

interface RedFlag {
  id: string
  session_id: string
  flag_type: string
  severity: string
  description: string
  created_at: string
}
