-- This migration fixes the infinite recursion issue in the profiles table policy
-- by modifying the admin read policy to avoid circular dependency

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create a new policy that avoids the circular dependency
-- Instead of using EXISTS with a subquery that references profiles again,
-- we'll use a direct comparison with the 'admin' role string
CREATE POLICY "Admins can read all profiles" 
ON profiles 
FOR SELECT 
TO authenticated 
USING (
  auth.jwt() ->> 'role' = 'admin'
);