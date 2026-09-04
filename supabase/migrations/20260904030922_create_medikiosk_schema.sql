/*
# MediKiosk - AI Clinical History Platform Database Schema

## Overview
Creates the complete database schema for the MediKiosk AI-driven public health chatbot platform.
This supports patient self-service clinical history taking, document digitization, and structured summary generation.

## New Tables

1. **patients** - Stores patient identification information
   - id (uuid, PK)
   - abha_id (text, nullable) - Ayushman Bharat Health Account ID
   - name (text, not null)
   - age (integer)
   - gender (text)
   - phone (text, nullable)
   - language (text, default 'en') - preferred language
   - created_at (timestamptz)

2. **sessions** - Clinical history taking sessions
   - id (uuid, PK)
   - patient_id (uuid, FK -> patients)
   - status (text) - 'active', 'completed', 'flagged'
   - language (text)
   - consent_given (boolean, default false)
   - mode (text) - 'allopathic' or 'ayush'
   - red_flag_triggered (boolean, default false)
   - created_at, completed_at (timestamptz)

3. **chat_messages** - Conversational history messages
   - id (uuid, PK)
   - session_id (uuid, FK -> sessions)
   - role (text) - 'user', 'assistant', 'system'
   - content (text)
   - mode (text) - 'text' or 'voice'
   - question_type (text, nullable) - e.g. 'chief_complaint', 'hpi', 'past_history'
   - created_at (timestamptz)

4. **documents** - Scanned/uploaded medical documents
   - id (uuid, PK)
   - session_id (uuid, FK -> sessions)
   - doc_type (text) - 'prescription', 'lab_report', 'discharge_summary'
   - file_name (text)
   - extracted_text (text) - OCR result
   - structured_data (jsonb) - extracted clinical entities
   - created_at (timestamptz)

5. **summaries** - Generated clinical history summaries
   - id (uuid, PK)
   - session_id (uuid, FK -> sessions)
   - summary (jsonb) - structured clinical summary
   - created_at (timestamptz)

6. **red_flags** - Emergency symptom alerts
   - id (uuid, PK)
   - session_id (uuid, FK -> sessions)
   - flag_type (text)
   - severity (text) - 'low', 'medium', 'high', 'critical'
   - description (text)
   - created_at (timestamptz)

## Security
- RLS enabled on all tables
- Single-tenant (kiosk) app: anon + authenticated roles allowed CRUD
- No auth sign-in screen - patients self-identify at kiosk
*/

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    abha_id text,
    name text NOT NULL,
    age integer,
    gender text,
    phone text,
    language text DEFAULT 'en',
    created_at timestamptz DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_patients" ON patients;
CREATE POLICY "anon_select_patients" ON patients FOR SELECT
    TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_patients" ON patients;
CREATE POLICY "anon_insert_patients" ON patients FOR INSERT
    TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_patients" ON patients;
CREATE POLICY "anon_update_patients" ON patients FOR UPDATE
    TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_patients" ON patients;
CREATE POLICY "anon_delete_patients" ON patients FOR DELETE
    TO anon, authenticated USING (true);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
    status text DEFAULT 'active',
    language text DEFAULT 'en',
    consent_given boolean DEFAULT false,
    mode text DEFAULT 'allopathic',
    red_flag_triggered boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sessions" ON sessions;
CREATE POLICY "anon_select_sessions" ON sessions FOR SELECT
    TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sessions" ON sessions;
CREATE POLICY "anon_insert_sessions" ON sessions FOR INSERT
    TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sessions" ON sessions;
CREATE POLICY "anon_update_sessions" ON sessions FOR UPDATE
    TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sessions" ON sessions;
CREATE POLICY "anon_delete_sessions" ON sessions FOR DELETE
    TO anon, authenticated USING (true);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
    role text NOT NULL,
    content text NOT NULL,
    mode text DEFAULT 'text',
    question_type text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_chat_messages" ON chat_messages;
CREATE POLICY "anon_select_chat_messages" ON chat_messages FOR SELECT
    TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat_messages" ON chat_messages;
CREATE POLICY "anon_insert_chat_messages" ON chat_messages FOR INSERT
    TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_chat_messages" ON chat_messages;
CREATE POLICY "anon_update_chat_messages" ON chat_messages FOR UPDATE
    TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chat_messages" ON chat_messages;
CREATE POLICY "anon_delete_chat_messages" ON chat_messages FOR DELETE
    TO anon, authenticated USING (true);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
    doc_type text NOT NULL,
    file_name text,
    extracted_text text,
    structured_data jsonb,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_documents" ON documents;
CREATE POLICY "anon_select_documents" ON documents FOR SELECT
    TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_documents" ON documents;
CREATE POLICY "anon_insert_documents" ON documents FOR INSERT
    TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_documents" ON documents;
CREATE POLICY "anon_update_documents" ON documents FOR UPDATE
    TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_documents" ON documents;
CREATE POLICY "anon_delete_documents" ON documents FOR DELETE
    TO anon, authenticated USING (true);

-- Summaries table
CREATE TABLE IF NOT EXISTS summaries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
    summary jsonb NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_summaries" ON summaries;
CREATE POLICY "anon_select_summaries" ON summaries FOR SELECT
    TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_summaries" ON summaries;
CREATE POLICY "anon_insert_summaries" ON summaries FOR INSERT
    TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_summaries" ON summaries;
CREATE POLICY "anon_update_summaries" ON summaries FOR UPDATE
    TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_summaries" ON summaries;
CREATE POLICY "anon_delete_summaries" ON summaries FOR DELETE
    TO anon, authenticated USING (true);

-- Red flags table
CREATE TABLE IF NOT EXISTS red_flags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
    flag_type text NOT NULL,
    severity text NOT NULL DEFAULT 'medium',
    description text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE red_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_red_flags" ON red_flags;
CREATE POLICY "anon_select_red_flags" ON red_flags FOR SELECT
    TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_red_flags" ON red_flags;
CREATE POLICY "anon_insert_red_flags" ON red_flags FOR INSERT
    TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_red_flags" ON red_flags;
CREATE POLICY "anon_update_red_flags" ON red_flags FOR UPDATE
    TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_red_flags" ON red_flags;
CREATE POLICY "anon_delete_red_flags" ON red_flags FOR DELETE
    TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_documents_session_id ON documents(session_id);
CREATE INDEX IF NOT EXISTS idx_summaries_session_id ON summaries(session_id);
CREATE INDEX IF NOT EXISTS idx_red_flags_session_id ON red_flags(session_id);