import api from './api';
import { ApiResponse, PaginatedResponse } from '@/types';

export const marcaService = {
  listar: async (params?: Record<string, string>) => {
    const { data } = await api.get<PaginatedResponse<any>>('/marcas', { params });
     console.log("data marca", data);
    return data;
  },
  
  obtener: async (id: string) => {
    const { data } = await api.get<ApiResponse<any>>(`/marcas/${id}`);
    return data.data;
  },
};