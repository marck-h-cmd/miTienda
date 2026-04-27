import api from './api';

export const estadisticasService = {
  // Tendencia de ventas mensuales
  tendenciaVentas: async (meses: number = 12) => {
    const { data } = await api.get('/estadisticas/tendencia-ventas', { 
      params: { meses } 
    });
    return data.data;
  },
  
  // Análisis ABC de productos
  analisisABC: async () => {
    const { data } = await api.get('/estadisticas/analisis-abc');
    return data.data;
  },
  
  // Análisis RFM de clientes
  analisisRFM: async () => {
    const { data } = await api.get('/estadisticas/analisis-rfm');
    return data.data;
  },
};