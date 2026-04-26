import api from './api';
import { ApiResponse, PaginatedResponse, IProducto } from '@/types';

export const productoService = {
  listar: async (params?: Record<string, string>) => {
    const { data } = await api.get<PaginatedResponse<IProducto>>('/productos', { params });
    console.log('Respuesta de listar productos:', data);
    return data;
  },
  
  obtener: async (id: string) => {
    const { data } = await api.get<ApiResponse<IProducto>>(`/productos/${id}`);
    return data.data!;
  },
  
  crear: async (producto: Partial<IProducto>) => {
    const { data } = await api.post<ApiResponse<IProducto>>('/productos', producto);
    return data.data!;
  },
  
  actualizar: async (id: string, producto: Partial<IProducto>) => {
    const { data } = await api.put<ApiResponse<IProducto>>(`/productos/${id}`, producto);
    return data.data!;
  },
  
  eliminar: async (id: string) => {
    const { data } = await api.delete<ApiResponse>(`/productos/${id}`);
    return data;
  },
};