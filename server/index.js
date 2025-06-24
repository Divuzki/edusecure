import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Setup Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Auth middleware to verify JWT and attach user to request
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      throw error || new Error('User not found');
    }
    
    req.user = data.user;
    
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// Routes

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Create profile for the new user if registration was successful
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          role: null // Role is optional in simplified schema
        });
      
      if (profileError) {
        console.error('Profile creation error:', profileError.message);
        // Don't fail registration if profile creation fails
        // The profile can be created later if needed
      }
    }
    
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    res.json({
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(401).json({ error: err.message });
  }
});

// File routes
app.get('/api/files', authMiddleware, async (req, res) => {
  try {
    // Users can only see their own files
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('owner_id', req.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Generate signed URLs for each file
    const filesWithUrls = await Promise.all(
      data.map(async (file) => {
        const { data: urlData } = await supabase.storage
          .from('files')
          .createSignedUrl(file.path, 3600); // 1 hour expiration
          
        return {
          ...file,
          url: urlData?.signedUrl || '',
        };
      })
    );
    
    res.json(filesWithUrls);
  } catch (err) {
    console.error('Error fetching files:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/files/upload', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }
  
  try {
    // Ensure user profile exists (fallback for existing users)
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', req.user.id)
      .single();
    
    console.log('Profile check result:', { existingProfile, profileCheckError, userId: req.user.id });
    
    if (!existingProfile) {
      console.log('Creating profile for user:', req.user.id);
      // Create profile if it doesn't exist
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: req.user.id,
          email: req.user.email,
          role: null
        })
        .select();
      
      console.log('Profile creation result:', { newProfile, profileError });
      
      if (profileError) {
        console.error('Profile creation error:', profileError.message);
        return res.status(500).json({ 
          error: 'Failed to create user profile',
          details: profileError.message 
        });
      }
    }
    
    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = file.originalname;
    const filePath = `${req.user.id}/${Date.now()}-${fileName}`;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
      });
    
    if (uploadError) throw uploadError;
    
    // Create file record in database
    const { data, error: dbError } = await supabase.from('files').insert({
      name: fileName,
      size: file.size,
      type: file.mimetype,
      path: filePath,
      owner_id: req.user.id
    }).select();
    
    if (dbError) throw dbError;
    
    // Generate signed URL
    const { data: urlData } = await supabase.storage
      .from('files')
      .createSignedUrl(filePath, 3600);
    
    res.status(201).json({
      ...data[0],
      url: urlData?.signedUrl || '',
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/files/:id', authMiddleware, async (req, res) => {
  const fileId = req.params.id;
  
  try {
    // Get file info first
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Check if user owns the file
    if (file.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to delete this file' });
    }
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('files')
      .remove([file.path]);
      
    if (storageError) throw storageError;
    
    // Delete from database (cascade will remove share links)
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);
      
    if (dbError) throw dbError;
    
    res.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Share links routes
app.get('/api/files/share-links', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('share_links')
      .select('*, files!inner(*)')
      .eq('owner_id', req.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Filter out expired links
    const validLinks = data.filter(
      link => new Date(link.expires_at) > new Date()
    );
    
    res.json(validLinks);
  } catch (err) {
    console.error('Error fetching share links:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/files/share', authMiddleware, async (req, res) => {
  const { fileId, expiryDays = 7 } = req.body;
  
  if (!fileId) {
    return res.status(400).json({ error: 'File ID is required' });
  }
  
  try {
    // Check if user owns the file
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();
    
    if (fileError) throw fileError;
    
    if (file.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only share files you own' });
    }
    
    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);
    
    // Create signed URL with longer expiration
    const { data: urlData, error: urlError } = await supabase.storage
      .from('files')
      .createSignedUrl(file.path, 60 * 60 * 24 * expiryDays); // Convert days to seconds
    
    if (urlError) throw urlError;
    
    // Create share link record
    const { data, error: dbError } = await supabase.from('share_links').insert({
      file_id: fileId,
      url: urlData?.signedUrl || '',
      expires_at: expiresAt.toISOString(),
      owner_id: req.user.id
    }).select();
    
    if (dbError) throw dbError;
    
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error creating share link:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/files/share/:id', authMiddleware, async (req, res) => {
  const linkId = req.params.id;
  
  try {
    // Check if user owns the share link
    const { data: link, error: linkError } = await supabase
      .from('share_links')
      .select('*')
      .eq('id', linkId)
      .single();
    
    if (linkError) throw linkError;
    
    if (link.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to revoke this share link' });
    }
    
    // Delete the share link
    const { error: deleteError } = await supabase
      .from('share_links')
      .delete()
      .eq('id', linkId);
      
    if (deleteError) throw deleteError;
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error revoking share link:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});