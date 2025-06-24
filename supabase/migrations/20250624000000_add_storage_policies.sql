-- Create storage bucket for files (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', false)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS is already enabled on storage.objects by default

-- Policy: Users can upload files to their own folder
CREATE POLICY "Users can upload own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own files
CREATE POLICY "Users can view own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Teachers can view student files
CREATE POLICY "Teachers can view student files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'files' AND
  EXISTS (
    SELECT 1 FROM profiles p1, profiles p2
    WHERE p1.id = auth.uid() 
    AND p1.role = 'teacher'
    AND p2.id::text = (storage.foldername(name))[1]
    AND p2.role = 'student'
  )
);

-- Policy: Admins can access all files
CREATE POLICY "Admins can access all files"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'files' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);