import api from './api';
import { ApiResponse, PaginatedResponse, IOrden } from '@/types';

export const ordenService = {
  iniciarCheckout: async (checkoutData: {
    direccionEnvioId: string;
    metodoEnvioId: string;
    cuponCodigo?: string;
  }) => {
    const { data } = await api.post<ApiResponse<{ ordenId: string; total: number; initPoint: string }>>(
      '/ordenes/checkout',
      checkoutData
    );
    return data.data!;
  },
  
  listar: async (params?: Record<string, string>) => {
    const { data } = await api.get<PaginatedResponse<IOrden>>('/ordenes', { params });
    console.log("ordenes", data);
    return data;
  },
  
  obtener: async (id: string) => {
    const { data } = await api.get<ApiResponse<IOrden>>(`/ordenes/${id}`);
    return data.data!;
  },
  
  cancelar: async (id: string) => {
    const { data } = await api.post<ApiResponse>(`/ordenes/${id}/cancelar`);
    return data;
  },
  
  cambiarEstado: async (id: string, estado: string) => {
    const { data } = await api.patch<ApiResponse>(`/ordenes/${id}/estado`, { estado });
    return data;
  },

  actualizar: async (id: string, payload: Record<string, any>) => {
    const { data } = await api.patch<ApiResponse<IOrden>>(`/ordenes/${id}`, payload);
    return data.data!;
  },

  obtenerOpcionesEnvio: async () => {
    const { data } = await api.get<ApiResponse<{ direcciones: any[]; metodos: any[] }>>(
      '/ordenes/opciones-envio'
    );
    return data.data!;
  },
};