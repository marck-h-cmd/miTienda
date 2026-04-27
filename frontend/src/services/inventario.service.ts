// services/inventario.service.ts
import api from './api';
import { ApiResponse, PaginatedResponse, IStockInventario, IProveedor } from '@/types';

export const inventarioService = {
  obtenerStock: async (params?: Record<string, string>) => {
    const { data } = await api.get<PaginatedResponse<IStockInventario>>('/inventario/stock', { params });
    return data;
  },
  
  obtenerMovimientos: async (productoId: string, params?: Record<string, string>) => {
    const { data } = await api.get(`/inventario/movimientos/${productoId}`, { params });
    return data;
  },
  
  ajustarStock: async (ajuste: { producto_id: string; cantidad: number; tipo: string; motivo: string }) => {
    // ✅ Usar la ruta correcta (la que existe en el backend)
    const { data } = await api.post<ApiResponse>('/inventario/ajustes', ajuste);
    return data;
  },
  
  listarProveedores: async (params?: Record<string, string>) => {
    const { data } = await api.get<PaginatedResponse<IProveedor>>('/inventario/proveedores', { params });
    return data;
  },
  
  crearProveedor: async (proveedor: Partial<IProveedor>) => {
    const { data } = await api.post<ApiResponse<IProveedor>>('/inventario/proveedores', proveedor);
    return data.data!;
  },
  
  productosStockBajo: async () => {
    const { data } = await api.get<ApiResponse<IStockInventario[]>>('/inventario/stock/bajo');
    return data.data!;
  },
};