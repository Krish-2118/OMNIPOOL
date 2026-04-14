import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('omnipool_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch {
        // ignore
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('omnipool_user');
    }
    return Promise.reject(error);
  }
);

// ===== AI Endpoints =====
export const parseProject = (raw_description: string) =>
  api.post('/ai/parse-project', { raw_description });

export const matchResources = (extrapolated_BOM: unknown[], required_skills: string[]) =>
  api.post('/ai/match-resources', { extrapolated_BOM, required_skills });

export const getAdvice = (raw_description: string, matched_hardware: unknown[], matched_mentors: unknown[]) =>
  api.post('/ai/get-advice', { raw_description, matched_hardware, matched_mentors });

// ===== User Endpoints =====
export const registerUser = (data: { name: string; email: string; password: string; skills?: string[] }) =>
  api.post('/users', data);

export const getUsers = () => api.get('/users');

export const getUserById = (id: string) => api.get(`/users/${id}`);

export const updateUser = (id: string, data: Record<string, unknown>) =>
  api.put(`/users/${id}`, data);

// ===== Hardware Endpoints =====
export const getHardware = (params?: Record<string, string>) =>
  api.get('/hardware', { params });

export const createHardware = (data: Record<string, unknown>) =>
  api.post('/hardware', data);

export const updateHardware = (id: string, data: Record<string, unknown>) =>
  api.put(`/hardware/${id}`, data);

export const deleteHardware = (id: string) =>
  api.delete(`/hardware/${id}`);

// ===== Project Endpoints =====
export const getProjects = (params?: Record<string, string>) =>
  api.get('/projects', { params });

export const createProject = (data: { title: string; raw_description: string }) =>
  api.post('/projects', data);

export const getProjectById = (id: string) => api.get(`/projects/${id}`);

export const updateProject = (id: string, data: Record<string, unknown>) =>
  api.put(`/projects/${id}`, data);

export default api;
