/*
  # Simplify Schema - Remove Role-Based Access Control
  
  This migration simplifies the database schema by:
  1. Removing role constraints from profiles table
  2. Removing owner_role column from files table
  3. Updating RLS policies to be user-based instead of role-based
*/

-- Drop existing policies first (including those that depend on owner_role)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Students can view own files" ON files;
DROP POLICY IF EXISTS "Teachers can view student and own files" ON files;
DROP POLICY IF EXISTS "Teachers can read student files" ON files;
DROP POLICY IF EXISTS "Admins can view all files" ON files;
DROP POLICY IF EXISTS "Admins can read all files" ON files;
DROP POLICY IF EXISTS "Users can insert own files" ON files;
DROP POLICY IF EXISTS "Users can update own files" ON files;
DROP POLICY IF EXISTS "Users can delete own files" ON files;
DROP POLICY IF EXISTS "Users can view own share links" ON share_links;
DROP POLICY IF EXISTS "Users can insert own share links" ON share_links;
DROP POLICY IF EXISTS "Users can update own share links" ON share_links;
DROP POLICY IF EXISTS "Users can delete own share links" ON share_links;

-- Remove role constraint from profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Make role column optional and remove constraint
ALTER TABLE profiles ALTER COLUMN role DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT NULL;

-- Remove owner_role column from files table (after dropping dependent policies)
ALTER TABLE files DROP COLUMN IF EXISTS owner_role;

-- Create simplified policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create simplified policies for files (users can only access their own files)
CREATE POLICY "Users can view own files"
  ON files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own files"
  ON files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own files"
  ON files
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own files"
  ON files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Create simplified policies for share_links
CREATE POLICY "Users can view own share links"
  ON share_links
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own share links"
  ON share_links
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own share links"
  ON share_links
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own share links"
  ON share_links
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);