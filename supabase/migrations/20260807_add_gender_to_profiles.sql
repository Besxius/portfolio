-- Supabase Migration Script: Add gender column to profiles table
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'he/him';
