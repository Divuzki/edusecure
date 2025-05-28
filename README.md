# EduSecure Data Manager

A secure educational data management system with essay submission, grading, and file sharing capabilities.

## Migration from Supabase to MongoDB

This project has been migrated from Supabase to use MongoDB as the database and local file storage. The migration includes:

### Changes Made:

1. **Database Migration**:

   - Replaced Supabase PostgreSQL with MongoDB
   - Created Mongoose models for Users, Essays, StorageConfigs, and SharedFiles
   - Implemented proper indexing and validation

2. **Authentication System**:

   - Replaced Supabase Auth with JWT-based authentication
   - Added bcrypt for password hashing
   - Implemented token refresh functionality

3. **File Storage**:

   - Replaced Supabase Storage with local file system using Multer
   - Added file upload, download, and sharing capabilities
   - Implemented file expiration and access tracking

4. **API Updates**:
   - Updated all server routes to use MongoDB instead of Supabase
   - Maintained the same API interface for frontend compatibility
   - Added proper error handling and validation

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd edusecure
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up MongoDB**:

   - Install MongoDB locally or use MongoDB Atlas
   - Create a database named `edusecure`
   - Update the connection string in `.env`

4. **Configure environment variables**:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   # Server Configuration
   PORT=3000

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/edusecure

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # Client Environment Variables
   VITE_MONGODB_URI=mongodb://localhost:27017/edusecure
   VITE_API_URL=http://localhost:3000

   # File Storage Configuration
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=10485760
   ```

## Running the Application

1. **Start MongoDB** (if running locally):

   ```bash
   mongod
   ```

2. **Start the backend server**:

   ```bash
   npm run server
   ```

3. **Start the frontend development server**:

   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh JWT token

### Essays

- `POST /essays` - Submit an essay
- `GET /essays/student/:id` - Get essays by student
- `GET /essays/teacher` - Get all essays (teacher view)
- `POST /essays/:id/grade` - Grade an essay

### Storage

- `POST /storage/test` - Test storage configuration
- `POST /storage/upload` - Upload a file
- `GET /storage/files` - List all files
- `POST /storage/share/:fileId` - Share a file
- `GET /storage/download/:fileId` - Download a file

## Database Schema

### Users Collection

```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (admin|teacher|student),
  courses: [String],
  mfaEnabled: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Essays Collection

```javascript
{
  title: String,
  content: String,
  studentId: ObjectId (ref: User),
  courseId: String,
  score: {
    overall: Number,
    grammar: Number,
    content: Number,
    structure: Number,
    feedback: String
  },
  submittedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### SharedFiles Collection

```javascript
{
  filePath: String,
  originalName: String,
  mimeType: String,
  size: Number,
  createdBy: ObjectId (ref: User),
  passwordHash: String,
  expiresAt: Date,
  accessCount: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### StorageConfigs Collection

```javascript
{
  name: String,
  provider: String (aws|azure|gcp),
  config: Mixed,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- JWT-based authentication with secure token handling
- Password hashing using bcrypt
- Rate limiting on API endpoints
- File upload validation and size limits
- CORS protection
- Helmet.js for security headers
- Input validation using Zod schemas

## Development

### Available Scripts

- `npm run dev` - Start frontend development server
- `npm run server` - Start backend server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Project Structure

```
edusecure/
├── server/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── schemas/         # Validation schemas
│   └── index.js         # Server entry point
├── src/
│   ├── components/      # React components
│   ├── lib/            # API client and utilities
│   ├── store/          # Zustand stores
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── uploads/            # File storage directory
└── package.json
```

## Migration Notes

### Breaking Changes from Supabase Version:

1. **User IDs**: Changed from UUID to MongoDB ObjectId
2. **Authentication**: JWT tokens instead of Supabase session tokens
3. **File Storage**: Local file system instead of Supabase Storage
4. **Real-time**: No real-time subscriptions (can be added with Socket.io if needed)

### Data Migration:

If migrating from an existing Supabase instance:

1. Export data from Supabase
2. Transform the data to match MongoDB schema
3. Import using MongoDB tools or custom scripts
4. Update user passwords (will need to be reset as hashing method changed)

## Production Deployment

1. **Environment Setup**:

   - Use MongoDB Atlas or a managed MongoDB service
   - Set strong JWT secrets
   - Configure proper CORS origins
   - Set up SSL/TLS certificates

2. **File Storage**:

   - Consider using cloud storage (AWS S3, Google Cloud Storage) for production
   - Implement proper backup strategies for uploaded files

3. **Security**:
   - Enable MongoDB authentication
   - Use environment variables for all secrets
   - Implement proper logging and monitoring
   - Set up rate limiting and DDoS protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
