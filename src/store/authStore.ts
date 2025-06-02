/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import { AuthState } from '../types';
import { auth } from '../utils/api';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { token } = await auth.login(email, password);
      localStorage.setItem('auth_token', token);
      const user = await auth.getCurrent();
      
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response ? error.response?.data?.error : error instanceof Error ? error.message : 'Login failed', 
        isLoading: false 
      });
    }
  },

  register: async (email: string, password: string, name: string, role: string) => {
    set({ isLoading: true, error: null });
    try {
      const { token } = await auth.register({ email, password, name, role });
      localStorage.setItem('auth_token', token);
      const user = await auth.getCurrent();
      
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response ? error.response?.data?.error : error instanceof Error ? error.message : 'Registration failed', 
        isLoading: false 
      });
    }
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    });
  },
  
  refreshToken: async () => {
    const storedToken = localStorage.getItem('auth_token');
    
    if (!storedToken) {
      return;
    }
    
    try {
      const { token } = await auth.refreshToken();
      localStorage.setItem('auth_token', token);
      
      const user = await auth.getCurrent();
      
      set({ 
        user, 
        token, 
        isAuthenticated: true 
      });
    } catch (_) {
      localStorage.removeItem('auth_token');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      });
    }
  }
}));