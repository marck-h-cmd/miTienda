import api from './api';
import { ApiResponse, ICarrito } from '@/types';

export const carritoService = {
  obtener: async (sessionId?: string): Promise<ICarrito | null> => {
    const { data } = await api.get<ApiResponse<ICarrito>>('/carrito', {
      headers: sessionId ? { 'x-session-id': sessionId } : {},
    });
    return data.data ?? null;
  },
  
  agregar: async (item: { producto_id: string; cantidad: number }) => {
    const { data } = await api.post<ApiResponse<ICarrito>>('/carrito/items', item);
    return data.data!;
  },
  
  actualizarItem: async (itemId: string, cantidad: number) => {
    const { data } = await api.put<ApiResponse>(`/carrito/items/${itemId}`, { cantidad });
    return data;
  },
  
  eliminarItem: async (itemId: string) => {
    const { data } = await api.delete<ApiResponse>(`/carrito/items/${itemId}`);
    return data;
  },
  
  vaciar: async (carritoId: string) => {
    const { data } = await api.delete<ApiResponse>(`/carrito/${carritoId}`);
    return data;
  },
    // NUEVO: Limpiar todo el carrito
  limpiarCarrito: (sessionId?: string) => {
    const config = sessionId ? { headers: { 'x-session-id': sessionId } } : {};
    return api.delete('/carrito', config).then(res => res.data);
  },
};
