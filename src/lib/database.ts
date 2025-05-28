import mongoose from 'mongoose';

const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017/edusecure';

if (!MONGODB_URI) {
  throw new Error('Missing MongoDB connection string');
}

// MongoDB connection
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  courses: [String],
  mfaEnabled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Essay Schema
const essaySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: String, required: true },
  score: {
    overall: Number,
    grammar: Number,
    content: Number,
    structure: Number,
    feedback: String
  },
  submittedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Storage Config Schema
const storageConfigSchema = new mongoose.Schema({
  name: { type: String, required: true },
  provider: { type: String, enum: ['aws', 'azure', 'gcp'], required: true },
  config: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Shared Files Schema
const sharedFileSchema = new mongoose.Schema({
  filePath: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  passwordHash: String,
  expiresAt: { type: Date, required: true },
  accessCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Export models
export const User = mongoose.model('User', userSchema);
export const Essay = mongoose.model('Essay', essaySchema);
export const StorageConfig = mongoose.model('StorageConfig', storageConfigSchema);
export const SharedFile = mongoose.model('SharedFile', sharedFileSchema);

export default mongoose;