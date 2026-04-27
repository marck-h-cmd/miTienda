import api from './api';
import { ApiResponse, IListaDeseos } from '@/types';

export const favoritosService = {
  obtener: async (): Promise<IListaDeseos | null> => {
    const { data } = await api.get<ApiResponse<IListaDeseos>>('/favoritos');
    return data.data ?? null;
  },

  agregar: async (productoId: string): Promise<IListaDeseos> => {
    const { data } = await api.post<ApiResponse<IListaDeseos>>('/favoritos/items', {
      producto_id: productoId,
    });
    return data.data!;
  },

  eliminar: async (productoId: string): Promise<void> => {
    await api.delete(`/favoritos/items/${productoId}`);
  },

  vaciar: async (): Promise<void> => {
    await api.delete('/favoritos');
  },
};