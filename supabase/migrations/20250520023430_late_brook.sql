/*
  # Initial Schema Setup for EduSecure

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `role` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `essays`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `student_id` (uuid, references profiles)
      - `course_id` (text)
      - `score` (jsonb, for storing scoring details)
      - `submitted_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `storage_configs`
      - `id` (uuid, primary key)
      - `name` (text)
      - `provider` (text)
      - `config` (jsonb, encrypted storage credentials)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `shared_files`
      - `id` (uuid, primary key)
      - `file_path` (text)
      - `created_by` (uuid, references profiles)
      - `password_hash` (text, nullable)
      - `expires_at` (timestamp)
      - `access_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for each table based on user roles
    - Encrypt sensitive data in storage_configs
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create essays table
CREATE TABLE essays (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  student_id uuid REFERENCES profiles ON DELETE CASCADE,
  course_id text NOT NULL,
  score jsonb,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create storage_configs table
CREATE TABLE storage_configs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  provider text NOT NULL CHECK (provider IN ('aws', 'azure', 'gcp')),
  config jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shared_files table
CREATE TABLE shared_files (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_path text NOT NULL,
  created_by uuid REFERENCES profiles ON DELETE CASCADE,
  password_hash text,
  expires_at timestamptz NOT NULL,
  access_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_files ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Essays policies
CREATE POLICY "Students can read own essays"
  ON essays FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Students can create own essays"
  ON essays FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = student_id
  );

CREATE POLICY "Teachers and admins can update essays"
  ON essays FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );

-- Storage configs policies
CREATE POLICY "Only admins can manage storage configs"
  ON storage_configs
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Shared files policies
CREATE POLICY "Users can read shared files"
  ON shared_files FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Teachers and admins can create shared files"
  ON shared_files FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();