-- Supabase Migration Script: Create education table
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

CREATE TABLE IF NOT EXISTS education (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school TEXT NOT NULL,
  school_vi TEXT,
  degree TEXT,
  degree_vi TEXT,
  major TEXT,
  major_vi TEXT,
  start_date DATE,
  end_date DATE,
  logo_url TEXT,
  description TEXT,
  description_vi TEXT,
  tech_stack TEXT[],
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE education ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read education" ON education
  FOR SELECT USING (true);

-- Allow anonymous/public insert, update, delete (or authenticated depending on setup)
CREATE POLICY "Public insert education" ON education
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update education" ON education
  FOR UPDATE USING (true);

CREATE POLICY "Public delete education" ON education
  FOR DELETE USING (true);
