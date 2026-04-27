import api from './api';

export const unidadMedidaService = {
  listar: async (params?: { page?: string; limit?: string }) => {
    const { data } = await api.get('/unidades-medida', { params });
    return data;
  },
  
  obtener: async (id: string) => {
    const { data } = await api.get(`/unidades-medida/${id}`);
    return data.data;
  },
  
  crear: async (unidad: any) => {
    const { data } = await api.post('/unidades-medida', unidad);
    return data.data;
  },
  
  actualizar: async (id: string, unidad: any) => {
    const { data } = await api.put(`/unidades-medida/${id}`, unidad);
    return data.data;
  },
  
  eliminar: async (id: string, permanente?: boolean) => {
    const { data } = await api.delete(`/unidades-medida/${id}`, { 
      params: { permanente } 
    });
    return data;
  },
};