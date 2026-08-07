-- Supabase Migration Script: Add logo_url and tech_stack columns to projects table
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS tech_stack TEXT[];
