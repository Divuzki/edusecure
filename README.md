# FileVault

FileVault is a modern, secure file storage web application built with React, TypeScript, and Supabase. It provides a simplified, user-friendly interface for personal file management and secure sharing without the complexity of role-based access control.

## Project Overview

**What it is:** A personal cloud storage solution that allows users to securely upload, manage, and share files through time-limited sharing links.

**What it's not:** This is NOT a multi-tenant or role-based system. Each user has access only to their own files, making it perfect for personal use or small teams where users manage their own content independently.

**Key Philosophy:** Simplicity over complexity - we removed all role-based features (admin panels, teacher/student distinctions) to create a streamlined experience focused on core file management needs.

## Core Features

### 🔐 **User Authentication**
- Simple email/password registration and login
- Secure JWT-based authentication via Supabase Auth
- Email verification support
- Session management with automatic token refresh

### 📁 **Personal File Management**
- Upload files up to 10MB with drag-and-drop interface
- Real-time upload progress tracking
- File browser with sorting by upload date
- Download files with original filenames
- Delete files with confirmation prompts
- **Privacy:** Users can ONLY see and manage their own files

### 🔗 **Secure File Sharing**
- Generate time-limited secure sharing links (7-day expiration)
- Share files with anyone via secure URLs (no account required for recipients)
- Manage active sharing links (view, copy, revoke)
- Automatic link expiration for security
- Manual revocation of sharing links before expiration

## Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for responsive, utility-first styling
- **React Router** for client-side routing
- **Lucide React** for consistent iconography

### Backend
- **Node.js** with Express.js server
- **Supabase** as Backend-as-a-Service (BaaS)
- **Supabase Auth** for user authentication
- **Supabase Storage** for file storage with automatic CDN
- **Supabase Database** (PostgreSQL) for metadata

### Database Schema
```sql
-- Core tables (simplified from original role-based system)
profiles (
  id: uuid (references auth.users)
  email: text
  created_at: timestamp
  -- Note: 'role' column exists but is unused (legacy)
)

files (
  id: uuid (primary key)
  filename: text
  file_path: text
  file_size: bigint
  content_type: text
  owner_id: uuid (references profiles.id)
  created_at: timestamp
  -- Note: 'owner_role' column removed during simplification
)

share_links (
  id: uuid (primary key)
  file_id: uuid (references files.id)
  created_by: uuid (references profiles.id)
  expires_at: timestamp
  created_at: timestamp
)
```

## Architecture Overview

### Security Model
- **Row Level Security (RLS)** enforced at database level
- Users can only access their own files (owner_id = auth.uid())
- Share links provide temporary, secure access to specific files
- No role-based permissions - all users have equal capabilities

### File Flow
1. **Upload**: Client → Express server → Supabase Storage → Database metadata
2. **Download**: Client → Express server → Supabase Storage (signed URL)
3. **Share**: Generate signed URL with expiration → Store in share_links table
4. **Access Shared**: Public access via share link → Temporary signed URL

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or yarn package manager
- **Supabase** account and project
- **Git** for version control

### Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/eduvault.git
cd eduvault
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure Supabase**

- Create a new Supabase project
- Create the required tables and policies (see `supabase/migrations/initial_schema.sql`)
- Create a new storage bucket named `files` with private access

4. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Development settings
PORT=3001
NODE_ENV=development
```

5. **Run database migrations**

```bash
npx supabase db push
```

6. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or next available port)

## Project Structure

```
filevault/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   │   ├── ui/                  # Base UI components (Button, Input, etc.)
│   │   ├── FileUpload.tsx       # Drag-and-drop file upload
│   │   ├── FileList.tsx         # File browser component
│   │   └── ShareLinkManager.tsx # Share link management
│   ├── contexts/                # React contexts
│   │   ├── AuthContext.tsx      # Authentication state management
│   │   └── FileContext.tsx      # File operations and state
│   ├── pages/                   # Route components
│   │   ├── Login.tsx           # Login page
│   │   ├── Register.tsx        # Registration page
│   │   ├── Dashboard.tsx       # Main file management interface
│   │   └── SharedFile.tsx      # Public shared file access
│   ├── lib/                    # Utilities and configurations
│   │   └── supabase.ts         # Supabase client configuration
│   └── App.tsx                 # Main application component
├── server/                      # Backend Express server
│   └── index.js                # API routes and server logic
├── supabase/                   # Database schema and migrations
│   └── migrations/             # SQL migration files
├── public/                     # Static assets
└── package.json               # Dependencies and scripts
```

## API Documentation

### Authentication Endpoints

#### `POST /api/auth/register`
Register a new user account
- **Body**: `{ email: string, password: string }`
- **Response**: `{ user: object, session: object }`
- **Note**: Creates profile in database automatically

#### `POST /api/auth/login`
Authenticate existing user
- **Body**: `{ email: string, password: string }`
- **Response**: `{ user: object, session: object }`

### File Management Endpoints

#### `GET /api/files`
Retrieve user's files (RLS enforced)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ files: Array<FileObject> }`
- **Security**: Only returns files owned by authenticated user

#### `POST /api/files/upload`
Upload a new file
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body**: FormData with file
- **Response**: `{ file: FileObject }`
- **Limits**: 10MB max file size

#### `GET /api/files/:id/download`
Download a file (owner only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: File stream with original filename
- **Security**: Verifies file ownership before serving

#### `DELETE /api/files/:id`
Delete a file and its metadata
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success: boolean }`
- **Security**: Only file owner can delete

### Share Link Endpoints

#### `POST /api/files/:id/share`
Create a time-limited share link
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ shareLink: string, expiresAt: timestamp }`
- **Expiration**: 7 days from creation

#### `GET /api/share/:shareId`
Access shared file (public endpoint)
- **No authentication required**
- **Response**: File stream
- **Security**: Validates link expiration before serving

#### `DELETE /api/share/:shareId`
Revoke an active share link
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success: boolean }`
- **Security**: Only link creator can revoke

## Key Implementation Details

### Authentication Flow
1. User registers/logs in via Supabase Auth
2. JWT token stored in localStorage
3. Token included in API requests via Authorization header
4. Server validates token and extracts user ID for RLS

### File Upload Process
1. Client selects file via drag-and-drop or file picker
2. File sent to Express server as multipart/form-data
3. Server uploads to Supabase Storage bucket
4. Metadata stored in `files` table with owner_id
5. Client receives file object and updates UI

### Security Considerations
- All database operations use Row Level Security (RLS)
- File access requires ownership verification
- Share links have automatic expiration (7 days)
- No role-based access - simplified permission model
- File uploads limited to 10MB to prevent abuse

### Migration History
This project was simplified from a role-based educational platform:
- **Removed**: Admin panels, teacher/student roles, role-based file access
- **Simplified**: Single user type, personal file management only
- **Retained**: Core file operations, secure sharing, authentication

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (frontend + backend)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Database operations
npx supabase db push          # Apply migrations
npx supabase db reset         # Reset database
npx supabase gen types typescript --local  # Generate TypeScript types
```

## Deployment Considerations

- **Frontend**: Can be deployed to Vercel, Netlify, or any static hosting
- **Backend**: Deploy Express server to Railway, Render, or similar
- **Database**: Supabase handles hosting and scaling
- **Environment**: Ensure all environment variables are set in production
- **CORS**: Configure for your production domain

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
