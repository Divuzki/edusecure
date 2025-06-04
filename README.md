# EduVault: Secure Cloud Storage for Educational Institutions

EduVault is a full-stack web application that provides secure cloud storage specifically designed for educational institutions. It allows students, teachers, and administrators to upload, store, and share files securely with role-based access control.

## Features

- **User Authentication**
  - Registration with role selection (student, teacher, administrator)
  - Secure login with JWT
  - Email verification

- **Role-Based Access Control**
  - Students can only access their own files
  - Teachers can access their files and student files
  - Administrators have full access to all files

- **File Management**
  - Upload files (up to 10MB) with drag-and-drop interface
  - Download files
  - Delete files
  - Progressive file upload with visual feedback

- **Secure File Sharing**
  - Generate time-limited secure sharing links (7-day expiration)
  - Manually revoke sharing links
  - Track active sharing links

## Tech Stack

- **Frontend**
  - React.js with TypeScript
  - Tailwind CSS for styling
  - React Router for navigation
  - React Dropzone for file uploads

- **Backend**
  - Node.js with Express
  - Supabase for authentication and storage
  - JWT for secure API authorization

- **Database**
  - PostgreSQL (via Supabase)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Supabase account and project

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

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

5. **Start the development servers**

```bash
npm run dev:all
```

This will start both the React frontend and the Node.js backend.

## Deployment

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Add the environment variables in the Vercel dashboard
3. Deploy with the following settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Backend Deployment

The backend can be deployed to any Node.js hosting service like:

- Heroku
- Render
- Digital Ocean App Platform

Remember to set the environment variables on your hosting provider.

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ email, password, role }`
  - Returns: Success message

- `POST /api/auth/login` - Authenticate a user
  - Body: `{ email, password }`
  - Returns: User object and JWT token

### Files

- `GET /api/files` - Get user's accessible files
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of file objects

- `POST /api/files/upload` - Upload a file
  - Headers: `Authorization: Bearer <token>`
  - Body: FormData with `file` field
  - Returns: Uploaded file object

- `DELETE /api/files/:id` - Delete a file
  - Headers: `Authorization: Bearer <token>`
  - Returns: Success message

### Share Links

- `GET /api/files/share-links` - Get user's share links
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of share link objects

- `POST /api/files/share` - Create a share link
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ fileId, expiryDays }`
  - Returns: Created share link object

- `DELETE /api/files/share/:id` - Revoke a share link
  - Headers: `Authorization: Bearer <token>`
  - Returns: Success message

## License

This project is licensed under the MIT License - see the LICENSE file for details.