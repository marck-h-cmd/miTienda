import api from './api';
import { ApiResponse, IDashboardKPIs } from '@/types';

export const dashboardService = {
  obtenerKPIs: async (dias: number = 30) => {
    const { data } = await api.get<ApiResponse<IDashboardKPIs>>('/dashboard/kpis', { params: { dias } });
    return data.data;
  },
  
  ventasDiarias: async (dias: number = 30) => {
    const { data } = await api.get<ApiResponse<any[]>>('/dashboard/ventas-diarias', { params: { dias } });
    return data.data;
  },
  
  ventasPorCategoria: async (dias: number = 30) => {
    const { data } = await api.get<ApiResponse<any[]>>('/dashboard/ventas-categoria', { params: { dias } });
    return data.data;
  },
  
  topProductos: async (dias: number = 30) => {
    const { data } = await api.get<ApiResponse<any[]>>('/dashboard/top-productos', { params: { dias } });
    return data.data;
  },
};