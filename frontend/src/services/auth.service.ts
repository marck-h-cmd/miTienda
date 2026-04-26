import api from './api';
import { ApiResponse, ILoginResponse } from '@/types';

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const { data } = await api.post<ApiResponse<ILoginResponse>>('/auth/login', credentials);
    return data.data!;
  },
  
  register: async (userData: { email: string; password: string; nombre: string; apellido: string }) => {
    const { data } = await api.post<ApiResponse>('/auth/register', userData);
    return data;
  },
  
  refreshToken: async (refreshToken: string) => {
    const { data } = await api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh-token',
      { refreshToken }
    );
    return data.data!;
  },
  
  logout: async (refreshToken: string) => {
    await api.post('/auth/logout', { refreshToken });
  },
};