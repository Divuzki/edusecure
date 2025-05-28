export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  courses?: string[];
  mfaEnabled?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CloudStorageConfig {
  id: string;
  provider: 'aws' | 'azure' | 'gcp';
  name: string;
  isConnected: boolean;
  lastConnected?: Date;
}

export interface EncryptedFile {
  id: string;
  name: string;
  path: string;
  size: number;
  owner: string;
  provider: 'aws' | 'azure' | 'gcp';
  encryptionKeyId: string;
  createdAt: Date;
  updatedAt: Date;
  sharedWith?: string[];
}

export interface Essay {
  id: string;
  title: string;
  content: string;
  fileId?: string;
  studentId: string;
  courseId: string;
  score?: EssayScore;
  submittedAt: Date;
}

export interface EssayScore {
  overall: number;
  coherence: number;
  grammar: number;
  structure: number;
  feedback: string;
}

export interface SecureLink {
  id: string;
  fileId: string;
  createdBy: string;
  password?: string;
  expiresAt: Date;
  url: string;
  accessCount: number;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  studentIds: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}