import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: { email: string; password: string; name: string; role: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  getCurrent: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const storage = {
  testConnection: async (config: any) => {
    const response = await api.post('/storage/test', config);
    return response.data;
  },
  
  listFiles: async () => {
    const response = await api.get('/storage/files');
    return response.data;
  },
  
  uploadFile: async (file: File, metadata?: any) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    const response = await api.post('/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  generateShareLink: async (fileId: string, options: any) => {
    const response = await api.post(`/storage/share/${fileId}`, options);
    return response.data;
  },

  downloadFile: async (fileId: string) => {
    const response = await api.get(`/storage/download/${fileId}`, {
      responseType: 'blob',
    });
    return response;
  },
};

export const essays = {
  submit: async (essay: any) => {
    const response = await api.post('/essays', essay);
    return response.data;
  },
  
  getByStudent: async (studentId: string) => {
    const response = await api.get(`/essays/student/${studentId}`);
    return response.data;
  },
  
  getByTeacher: async () => {
    const response = await api.get('/essays/teacher');
    return response.data;
  },
  
  grade: async (essayId: string, score: any) => {
    const response = await api.post(`/essays/${essayId}/grade`, { score });
    return response.data;
  },
};

export default api;