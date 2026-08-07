-- Supabase Migration Script: Update Stack Tables
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Language Table
CREATE TABLE IF NOT EXISTS languages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE languages DROP COLUMN IF EXISTS level;
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read languages" ON languages;
DROP POLICY IF EXISTS "Public insert languages" ON languages;
DROP POLICY IF EXISTS "Public update languages" ON languages;
DROP POLICY IF EXISTS "Public delete languages" ON languages;
CREATE POLICY "Public read languages" ON languages FOR SELECT USING (true);
CREATE POLICY "Public insert languages" ON languages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update languages" ON languages FOR UPDATE USING (true);
CREATE POLICY "Public delete languages" ON languages FOR DELETE USING (true);

-- 2. Frontend Table
CREATE TABLE IF NOT EXISTS frontend (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE frontend ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read frontend" ON frontend;
DROP POLICY IF EXISTS "Public insert frontend" ON frontend;
DROP POLICY IF EXISTS "Public update frontend" ON frontend;
DROP POLICY IF EXISTS "Public delete frontend" ON frontend;
CREATE POLICY "Public read frontend" ON frontend FOR SELECT USING (true);
CREATE POLICY "Public insert frontend" ON frontend FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update frontend" ON frontend FOR UPDATE USING (true);
CREATE POLICY "Public delete frontend" ON frontend FOR DELETE USING (true);

-- 3. Backend & Database Table
CREATE TABLE IF NOT EXISTS backend (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE backend ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read backend" ON backend;
DROP POLICY IF EXISTS "Public insert backend" ON backend;
DROP POLICY IF EXISTS "Public update backend" ON backend;
DROP POLICY IF EXISTS "Public delete backend" ON backend;
CREATE POLICY "Public read backend" ON backend FOR SELECT USING (true);
CREATE POLICY "Public insert backend" ON backend FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update backend" ON backend FOR UPDATE USING (true);
CREATE POLICY "Public delete backend" ON backend FOR DELETE USING (true);

-- 4. Workflow & AI Table
CREATE TABLE IF NOT EXISTS workflow_ai (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE workflow_ai ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read workflow_ai" ON workflow_ai;
DROP POLICY IF EXISTS "Public insert workflow_ai" ON workflow_ai;
DROP POLICY IF EXISTS "Public update workflow_ai" ON workflow_ai;
DROP POLICY IF EXISTS "Public delete workflow_ai" ON workflow_ai;
CREATE POLICY "Public read workflow_ai" ON workflow_ai FOR SELECT USING (true);
CREATE POLICY "Public insert workflow_ai" ON workflow_ai FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update workflow_ai" ON workflow_ai FOR UPDATE USING (true);
CREATE POLICY "Public delete workflow_ai" ON workflow_ai FOR DELETE USING (true);

-- 5. Coding Tool Table
CREATE TABLE IF NOT EXISTS coding_tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE coding_tools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read coding_tools" ON coding_tools;
DROP POLICY IF EXISTS "Public insert coding_tools" ON coding_tools;
DROP POLICY IF EXISTS "Public update coding_tools" ON coding_tools;
DROP POLICY IF EXISTS "Public delete coding_tools" ON coding_tools;
CREATE POLICY "Public read coding_tools" ON coding_tools FOR SELECT USING (true);
CREATE POLICY "Public insert coding_tools" ON coding_tools FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update coding_tools" ON coding_tools FOR UPDATE USING (true);
CREATE POLICY "Public delete coding_tools" ON coding_tools FOR DELETE USING (true);

-- Clean up redundant/incorrect legacy tables
DROP TABLE IF EXISTS frameworks CASCADE;
DROP TABLE IF EXISTS dev_tools CASCADE;
DROP TABLE IF EXISTS capabilities CASCADE;
