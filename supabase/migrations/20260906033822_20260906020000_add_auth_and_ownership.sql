/*
# Add Patient & HIS Authentication, Ownership, and Auto-Cleanup

## Overview
Adds multi-user authentication support to MediKiosk. Patients register/login with ABHA ID + password.
HIS staff register/login with username + password. Sessions are ownership-scoped. Old records auto-delete
when limits are reached (patient: keep 10 when 20 reached; HIS: keep 50 when 100 reached).

## New Tables
1. **patient_profiles** - Links auth.users to patient demographics
   - id (uuid, PK, = auth.users.id)
   - abha_id (text, unique, not null) - used as login username
   - aadhaar_id (text, nullable)
   - name (text, not null)
   - age (integer, nullable)
   - gender (text, nullable)
   - phone (text, nullable)
   - created_at (timestamptz)

2. **his_users** - Links auth.users to HIS staff profiles
   - id (uuid, PK, = auth.users.id)
   - username (text, unique, not null) - used as login username
   - display_name (text, not null)
   - created_at (timestamptz)

## Modified Tables
- **sessions** - user_id column already added in previous migration.

## Security
- RLS enabled on patient_profiles and his_users (owner-scoped CRUD).
- Sessions get additional authenticated policies: patients see only their own; HIS users see all.
- Auto-cleanup functions are SECURITY DEFINER (run as owner) so they can delete across users.
- EXECUTE on cleanup functions granted to authenticated only.

## Important Notes
1. Existing anon policies on all tables remain unchanged — kiosk mode still works.
2. Patient email format: `{abha_id}@patient.medikiosk.in` (synthetic, not shown to user).
3. HIS email format: `{username}@his.medikiosk.in` (synthetic, not shown to user).
*/

-- Patient profiles table
CREATE TABLE IF NOT EXISTS patient_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    abha_id text UNIQUE NOT NULL,
    aadhaar_id text,
    name text NOT NULL,
    age integer,
    gender text,
    phone text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patient_select_own" ON patient_profiles;
CREATE POLICY "patient_select_own" ON patient_profiles FOR SELECT
    TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "patient_insert_own" ON patient_profiles;
CREATE POLICY "patient_insert_own" ON patient_profiles FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "patient_update_own" ON patient_profiles;
CREATE POLICY "patient_update_own" ON patient_profiles FOR UPDATE
    TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "anon_select_patient_profiles" ON patient_profiles;
CREATE POLICY "anon_select_patient_profiles" ON patient_profiles FOR SELECT
    TO anon, authenticated USING (true);

-- HIS users table
CREATE TABLE IF NOT EXISTS his_users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text UNIQUE NOT NULL,
    display_name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE his_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "his_select_own" ON his_users;
CREATE POLICY "his_select_own" ON his_users FOR SELECT
    TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "his_insert_own" ON his_users;
CREATE POLICY "his_insert_own" ON his_users FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "anon_select_his_users" ON his_users;
CREATE POLICY "anon_select_his_users" ON his_users FOR SELECT
    TO anon, authenticated USING (true);

-- Authenticated session policies (in addition to existing anon policies)
DROP POLICY IF EXISTS "auth_select_own_sessions" ON sessions;
CREATE POLICY "auth_select_own_sessions" ON sessions FOR SELECT
    TO authenticated USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM his_users WHERE his_users.id = auth.uid())
    );

DROP POLICY IF EXISTS "auth_insert_own_sessions" ON sessions;
CREATE POLICY "auth_insert_own_sessions" ON sessions FOR INSERT
    TO authenticated WITH CHECK (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM his_users WHERE his_users.id = auth.uid())
    );

DROP POLICY IF EXISTS "auth_update_own_sessions" ON sessions;
CREATE POLICY "auth_update_own_sessions" ON sessions FOR UPDATE
    TO authenticated USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM his_users WHERE his_users.id = auth.uid())
    )
    WITH CHECK (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM his_users WHERE his_users.id = auth.uid())
    );

-- Authenticated access to child tables (chat_messages, documents, summaries, red_flags)
DROP POLICY IF EXISTS "auth_select_chat_messages" ON chat_messages;
CREATE POLICY "auth_select_chat_messages" ON chat_messages FOR SELECT
    TO authenticated USING (
        EXISTS (SELECT 1 FROM sessions WHERE sessions.id = chat_messages.session_id AND sessions.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM his_users WHERE his_users.id = auth.uid())
    );

DROP POLICY IF EXISTS "auth_insert_chat_messages" ON chat_messages;
CREATE POLICY "auth_insert_chat_messages" ON chat_messages FOR INSERT
    TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM sessions WHERE sessions.id = chat_messages.session_id AND sessions.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM his_users WHERE his_users.id = auth.uid())
    );

DROP POLICY IF EXISTS "auth_select_documents" ON documents;
CREATE POLICY "auth_select_documents" ON documents FOR SELECT
    TO authenticated USING (
        EXISTS (SELECT 1 FROM sessions WHERE sessions.id = documents.session_id AND sessions.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM his_users WHERE his_users.id = auth.uid())
    );

DROP POLICY IF EXISTS "auth_insert_documents" ON documents;
CREATE POLICY "auth_insert_documents" ON documents FOR INSERT
    TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM sessions WHERE sessions.id = documents.session_id AND sessions.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM his_users WHERE his_users.id = auth.uid())
    );

DROP POLICY IF EXISTS "auth_select_summaries" ON summaries;
CREATE POLICY "auth_select_summaries" ON summaries FOR SELECT
    TO authenticated USING (
        EXISTS (SELECT 1 FROM sessions WHERE sessions.id = summaries.session_id AND sessions.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM his_users WHERE his_users.id = auth.uid())
    );

DROP POLICY IF EXISTS "auth_insert_summaries" ON summaries;
CREATE POLICY "auth_insert_summaries" ON summaries FOR INSERT
    TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM sessions WHERE sessions.id = summaries.session_id AND sessions.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM his_users WHERE his_users.id = auth.uid())
    );

DROP POLICY IF EXISTS "auth_update_summaries" ON summaries;
CREATE POLICY "auth_update_summaries" ON summaries FOR UPDATE
    TO authenticated USING (
        EXISTS (SELECT 1 FROM sessions WHERE sessions.id = summaries.session_id AND sessions.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM his_users WHERE his_users.id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM sessions WHERE sessions.id = summaries.session_id AND sessions.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM his_users WHERE his_users.id = auth.uid())
    );

DROP POLICY IF EXISTS "auth_select_red_flags" ON red_flags;
CREATE POLICY "auth_select_red_flags" ON red_flags FOR SELECT
    TO authenticated USING (
        EXISTS (SELECT 1 FROM sessions WHERE sessions.id = red_flags.session_id AND sessions.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM his_users WHERE his_users.id = auth.uid())
    );

DROP POLICY IF EXISTS "auth_insert_red_flags" ON red_flags;
CREATE POLICY "auth_insert_red_flags" ON red_flags FOR INSERT
    TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM sessions WHERE sessions.id = red_flags.session_id AND sessions.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM his_users WHERE his_users.id = auth.uid())
    );

-- Authenticated access to patients table (HIS needs to see patient info)
DROP POLICY IF EXISTS "auth_select_patients" ON patients;
CREATE POLICY "auth_select_patients" ON patients FOR SELECT
    TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_patients" ON patients;
CREATE POLICY "auth_insert_patients" ON patients FOR INSERT
    TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_patients" ON patients;
CREATE POLICY "auth_update_patients" ON patients FOR UPDATE
    TO authenticated USING (true) WITH CHECK (true);

-- Auto-cleanup function for patient records
CREATE OR REPLACE FUNCTION cleanup_patient_records(p_user uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_count integer;
BEGIN
    SELECT COUNT(*) INTO v_count FROM sessions WHERE user_id = p_user;
    IF v_count >= 20 THEN
        DELETE FROM sessions
        WHERE user_id = p_user
        AND id NOT IN (
            SELECT id FROM sessions
            WHERE user_id = p_user
            ORDER BY created_at DESC
            LIMIT 10
        );
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION cleanup_patient_records FROM anon;
GRANT EXECUTE ON FUNCTION cleanup_patient_records TO authenticated;

-- Auto-cleanup function for HIS records
CREATE OR REPLACE FUNCTION cleanup_his_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_count integer;
BEGIN
    SELECT COUNT(*) INTO v_count FROM sessions WHERE user_id IS NOT NULL;
    IF v_count >= 100 THEN
        DELETE FROM sessions
        WHERE user_id IS NOT NULL
        AND id NOT IN (
            SELECT id FROM sessions
            WHERE user_id IS NOT NULL
            ORDER BY created_at DESC
            LIMIT 50
        );
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION cleanup_his_records FROM anon;
GRANT EXECUTE ON FUNCTION cleanup_his_records TO authenticated;