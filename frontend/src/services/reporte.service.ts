import api from './api';

export const reporteService = {
  descargarReporte: async (url: string, filename: string) => {
    const response = await api.get(url, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  },
  
  reporteOrdenes: (_filtros?: unknown) => 
    reporteService.descargarReporte('/reportes/operacionales/ordenes', 'reporte-ordenes.pdf'),
  
  reporteInventario: () =>
    reporteService.descargarReporte('/reportes/operacionales/inventario', 'reporte-inventario.pdf'),
  
  reporteMovimientos: (_filtros?: unknown) =>
    reporteService.descargarReporte('/reportes/operacionales/movimientos', 'reporte-movimientos.pdf'),
  
  reporteStockBajo: () =>
    reporteService.descargarReporte('/reportes/operacionales/stock-bajo', 'reporte-stock-bajo.pdf'),
  
  reportePagos: (_filtros?: unknown) =>
    reporteService.descargarReporte('/reportes/operacionales/pagos', 'reporte-pagos.pdf'),
  
  reporteDevoluciones: (_filtros?: unknown) =>
    reporteService.descargarReporte('/reportes/operacionales/devoluciones', 'reporte-devoluciones.pdf'),
  
  facturaOrden: (ordenId: string) =>
    reporteService.descargarReporte(`/reportes/operacionales/factura/${ordenId}`, `factura-${ordenId}.pdf`),
  
  reporteRentabilidad: () =>
    reporteService.descargarReporte('/reportes/gestion/rentabilidad', 'reporte-rentabilidad.pdf'),
  
  reporteVentasCategoria: () =>
    reporteService.descargarReporte('/reportes/gestion/ventas-categoria', 'reporte-ventas-categoria.pdf'),
  
  reporteClientes: () =>
    reporteService.descargarReporte('/reportes/gestion/clientes', 'reporte-clientes.pdf'),
  
  reporteRotacion: () =>
    reporteService.descargarReporte('/reportes/gestion/rotacion-inventario', 'reporte-rotacion.pdf'),
};
