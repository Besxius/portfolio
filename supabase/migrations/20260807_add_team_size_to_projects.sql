-- Supabase Migration Script: Add team_size column to projects table
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS team_size INTEGER DEFAULT 1;
