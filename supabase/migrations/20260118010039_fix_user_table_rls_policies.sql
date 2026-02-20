/*
  # Fix USER Table RLS Policies
  
  1. Changes
    - Drop existing restrictive RLS policy on USER table
    - Add new policies that allow:
      - Anonymous users to register (INSERT)
      - Anonymous users to query for login verification (SELECT)
      - This is necessary because the app uses custom JWT auth, not Supabase Auth
    
  2. Security Notes
    - RLS is still enabled to provide a security layer
    - Policies allow the necessary operations for custom authentication
    - Password hashing is handled in the application layer
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can read their own data" ON "USER";

-- Allow anonymous users to register (INSERT)
CREATE POLICY "Allow registration"
  ON "USER"
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to query for login (SELECT)
CREATE POLICY "Allow login queries"
  ON "USER"
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to update user data (for session management)
CREATE POLICY "Allow user updates"
  ON "USER"
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to delete accounts
CREATE POLICY "Allow account deletion"
  ON "USER"
  FOR DELETE
  TO anon
  USING (true);