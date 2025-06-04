/*
  # Initial Schema for Secure Educational Storage System

  1. Database Tables
    - `profiles`: Stores user profile data including role (student, teacher, admin)
    - `files`: Stores file metadata
    - `share_links`: Stores file sharing links with expiration

  2. Security
    - Enables RLS (Row Level Security) on all tables
    - Creates policies for role-based access control
    - Sets up authentication security
*/

-- Create profiles table for user roles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,
  path TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create share_links table
CREATE TABLE IF NOT EXISTS share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES --

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow admin to read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- FILES POLICIES --

-- Allow users to read their own files
CREATE POLICY "Users can read own files"
  ON files
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Allow teachers to read student files
CREATE POLICY "Teachers can read student files"
  ON files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
    AND owner_role = 'student'
  );

-- Allow admins to read all files
CREATE POLICY "Admins can read all files"
  ON files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow users to insert their own files
CREATE POLICY "Users can insert own files"
  ON files
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
  ON files
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- SHARE LINKS POLICIES --

-- Allow users to read their own share links
CREATE POLICY "Users can read own share links"
  ON share_links
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Allow users to insert share links for files they own
CREATE POLICY "Users can insert share links for own files"
  ON share_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM files
      WHERE id = file_id AND owner_id = auth.uid()
    )
  );

-- Allow users to delete their own share links
CREATE POLICY "Users can delete own share links"
  ON share_links
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Create a function to clean up expired share links
CREATE OR REPLACE FUNCTION cleanup_expired_share_links() RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM share_links WHERE expires_at < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run the cleanup function periodically
CREATE TRIGGER trigger_cleanup_expired_share_links
  AFTER INSERT ON share_links
  EXECUTE FUNCTION cleanup_expired_share_links();