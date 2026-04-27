import api from './api';
import { ApiResponse, PaginatedResponse } from '@/types';

export const categoriaService = {
  listar: async (params?: Record<string, string>) => {
    const { data } = await api.get<PaginatedResponse<any>>('/categorias', { params });
    console.log("data categoria", data);
    return data;
  },
  
  obtener: async (id: string) => {
    const { data } = await api.get<ApiResponse<any>>(`/categorias/${id}`);
    return data.data;
  },
};