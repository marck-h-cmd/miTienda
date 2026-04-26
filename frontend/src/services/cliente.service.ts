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

  // Direcciones
  obtenerDirecciones: async () => {
    const { data } = await api.get<ApiResponse<any[]>>('/clientes/direcciones');
    console.log('Respuesta de obtener direcciones:', data.data);
    return data.data || [];
  },

  crearDireccion: async (direccion: any) => {
    const { data } = await api.post<ApiResponse>('/clientes/direcciones', direccion);
    return data;
  },

  obtenerDireccion: async (direccionId: string) => {
    const { data } = await api.get<ApiResponse>('/clientes/direcciones/' + direccionId);
    return data.data;
  },

  actualizarDireccion: async (direccionId: string, direccion: any) => {
    const { data } = await api.put<ApiResponse>(`/clientes/direcciones/${direccionId}`, direccion);
    return data;
  },

  eliminarDireccion: async (direccionId: string) => {
    const { data } = await api.delete<ApiResponse>(`/clientes/direcciones/${direccionId}`);
    return data;
  },

  // Lista de deseos
  obtenerListaDeseos: async () => {
    const { data } = await api.get<ApiResponse>('/clientes/lista-deseos');
    return data.data;
  },

  agregarAListaDeseos: async (productoId: string) => {
    const { data } = await api.post<ApiResponse>('/clientes/lista-deseos', { producto_id: productoId });
    return data;
  },

  eliminarDeListaDeseos: async (productoId: string) => {
    const { data } = await api.delete<ApiResponse>(`/clientes/lista-deseos/${productoId}`);
    return data;
  },
};