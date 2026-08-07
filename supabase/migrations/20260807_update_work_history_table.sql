-- Supabase Migration Script: Add description and tech_stack columns to work_history table
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

ALTER TABLE work_history 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS description_vi TEXT,
ADD COLUMN IF NOT EXISTS tech_stack TEXT[];
