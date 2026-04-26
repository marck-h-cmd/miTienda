import api from './api';
import { ApiResponse, PaginatedResponse, ICliente } from '@/types';

export const clienteService = {
  listar: async (params?: Record<string, string>) => {
    const { data } = await api.get<PaginatedResponse<ICliente>>('/clientes', { params });
    return data;
  },
  
  obtener: async (id: string) => {
    const { data } = await api.get<ApiResponse<ICliente>>(`/clientes/${id}`);
    return data.data!;
  },
  
  obtenerPerfil: async () => {
    const { data } = await api.get<ApiResponse<ICliente>>('/clientes/perfil');
    return data.data!;
  },
  
  actualizarPerfil: async (perfil: Partial<ICliente>) => {
    const { data } = await api.put<ApiResponse<ICliente>>('/clientes/perfil', perfil);
    return data.data!;
  },
  
  toggleActivo: async (id: string, activo: boolean) => {
    const { data } = await api.patch<ApiResponse>(`/clientes/${id}/toggle-activo`, { activo });
    return data;
  },
};