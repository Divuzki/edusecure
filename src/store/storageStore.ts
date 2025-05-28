import { create } from 'zustand';
import { storage } from '../utils/api';
import { CloudStorageConfig, EncryptedFile } from '../types';

interface StorageState {
  configs: CloudStorageConfig[];
  files: EncryptedFile[];
  isLoading: boolean;
  error: string | null;
}

interface StorageStore extends StorageState {
  testConnection: (config: any) => Promise<void>;
  listFiles: () => Promise<void>;
  uploadFile: (file: File, metadata: any) => Promise<void>;
  generateShareLink: (fileId: string, options: any) => Promise<string>;
}

export const useStorageStore = create<StorageStore>((set, get) => ({
  configs: [],
  files: [],
  isLoading: false,
  error: null,
  
  testConnection: async (config) => {
    set({ isLoading: true, error: null });
    try {
      await storage.testConnection(config);
      set((state) => ({
        configs: [...state.configs, config],
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Connection test failed',
        isLoading: false,
      });
    }
  },
  
  listFiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const files = await storage.listFiles();
      set({ files, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to list files',
        isLoading: false,
      });
    }
  },
  
  uploadFile: async (file, metadata) => {
    set({ isLoading: true, error: null });
    try {
      const uploadedFile = await storage.uploadFile(file, metadata);
      set((state) => ({
        files: [...state.files, uploadedFile],
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Upload failed',
        isLoading: false,
      });
    }
  },
  
  generateShareLink: async (fileId, options) => {
    set({ isLoading: true, error: null });
    try {
      const { url } = await storage.generateShareLink(fileId, options);
      set({ isLoading: false });
      return url;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to generate share link',
        isLoading: false,
      });
      throw error;
    }
  },
}));