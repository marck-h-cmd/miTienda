import api from './api';

export const subcategoriaService = {
  listar: async (params?: { page?: string; limit?: string; categoriaId?: string }) => {
    const { data } = await api.get('/subcategorias', { params });
    return data;
  },
  
  obtener: async (id: string) => {
    const { data } = await api.get(`/subcategorias/${id}`);
    return data.data;
  },
  
  crear: async (subcategoria: any) => {
    const { data } = await api.post('/subcategorias', subcategoria);
    return data.data;
  },
  
  actualizar: async (id: string, subcategoria: any) => {
    const { data } = await api.put(`/subcategorias/${id}`, subcategoria);
    return data.data;
  },
  
  eliminar: async (id: string, permanente?: boolean) => {
    const { data } = await api.delete(`/subcategorias/${id}`, { 
      params: { permanente } 
    });
    return data;
  },
};