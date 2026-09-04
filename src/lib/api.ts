import { supabase } from './supabase'
import type { Patient, Session, ChatMessage, Document, Summary, RedFlag } from '../types'

export async function createPatient(data: {
  name: string
  age?: number
  gender?: string
  phone?: string
  abha_id?: string
  language?: string
}): Promise<Patient | null> {
  const { data: patient, error } = await supabase
    .from('patients')
    .insert({
      name: data.name,
      age: data.age ?? null,
      gender: data.gender ?? null,
      phone: data.phone ?? null,
      abha_id: data.abha_id ?? null,
      language: data.language ?? 'en',
    })
    .select()
    .single()
  if (error) {
    console.error('Error creating patient:', error)
    return null
  }
  return patient
}

export async function createSession(patientId: string, mode: string, language: string): Promise<Session | null> {
  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      patient_id: patientId,
      mode,
      language,
      consent_given: true,
      status: 'active',
    })
    .select()
    .single()
  if (error) {
    console.error('Error creating session:', error)
    return null
  }
  return session
}

export async function addChatMessage(
  sessionId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  mode: string = 'text',
  questionType?: string
): Promise<ChatMessage | null> {
  const { data: message, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      role,
      content,
      mode,
      question_type: questionType ?? null,
    })
    .select()
    .single()
  if (error) {
    console.error('Error adding chat message:', error)
    return null
  }
  return message
}

export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }
  return data || []
}

export async function addDocument(
  sessionId: string,
  docType: string,
  fileName: string,
  extractedText: string,
  structuredData: Record<string, unknown>
): Promise<Document | null> {
  const { data: doc, error } = await supabase
    .from('documents')
    .insert({
      session_id: sessionId,
      doc_type: docType,
      file_name: fileName,
      extracted_text: extractedText,
      structured_data: structuredData,
    })
    .select()
    .single()
  if (error) {
    console.error('Error adding document:', error)
    return null
  }
  return doc
}

export async function getDocuments(sessionId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  if (error) {
    console.error('Error fetching documents:', error)
    return []
  }
  return data || []
}

export async function saveSummary(sessionId: string, summary: Record<string, unknown>): Promise<Summary | null> {
  const { data, error } = await supabase
    .from('summaries')
    .insert({
      session_id: sessionId,
      summary,
    })
    .select()
    .single()
  if (error) {
    console.error('Error saving summary:', error)
    return null
  }
  return data
}

export async function getSummary(sessionId: string): Promise<Summary | null> {
  const { data, error } = await supabase
    .from('summaries')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .maybeSingle()
  if (error) {
    console.error('Error fetching summary:', error)
    return null
  }
  return data
}

export async function addRedFlag(
  sessionId: string,
  flagType: string,
  severity: string,
  description: string
): Promise<RedFlag | null> {
  const { data, error } = await supabase
    .from('red_flags')
    .insert({
      session_id: sessionId,
      flag_type: flagType,
      severity,
      description,
    })
    .select()
    .single()
  if (error) {
    console.error('Error adding red flag:', error)
    return null
  }
  return data
}

export async function getRedFlags(sessionId: string): Promise<RedFlag[]> {
  const { data, error } = await supabase
    .from('red_flags')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  if (error) {
    console.error('Error fetching red flags:', error)
    return []
  }
  return data || []
}

export async function completeSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', sessionId)
  if (error) console.error('Error completing session:', error)
}

export async function flagSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .update({ red_flag_triggered: true, status: 'flagged' })
    .eq('id', sessionId)
  if (error) console.error('Error flagging session:', error)
}
