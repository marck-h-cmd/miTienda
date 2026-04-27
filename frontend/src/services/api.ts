import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3000';
const normalizedApiBaseUrl = apiBaseUrl.replace(/\/+$/, '');
const apiV1BaseUrl = `${normalizedApiBaseUrl}/api/v1`;

const api = axios.create({
  baseURL: apiV1BaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

const refreshClient = axios.create({
  baseURL: apiV1BaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error('No refresh token');
        
        const { data } = await refreshClient.post('/auth/refresh-token', { refreshToken });
        useAuthStore.getState().setTokens(data.data.accessToken, data.data.refreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
