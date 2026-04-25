export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ campo: string; mensaje: string }>;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  data: T[];
}

export interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

export enum EstadoOrden {
  PENDIENTE_PAGO = 'pendiente_pago',
  PAGADA = 'pagada',
  EN_PROCESO = 'en_proceso',
  ENVIADA = 'enviada',
  ENTREGADA = 'entregada',
  CANCELADA = 'cancelada',
  DEVUELTA = 'devuelta',
}

export enum EstadoProducto {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  BORRADOR = 'borrador',
}

export enum TipoMovimientoInventario {
  ENTRADA = 'entrada',
  SALIDA = 'salida',
  AJUSTE = 'ajuste',
}

export enum MetodoPago {
  MERCADOPAGO = 'mercadopago',
  TRANSFERENCIA = 'transferencia',
  CONTRA_ENTREGA = 'contra_entrega',
}

export interface ProductoFilter {
  page?: number;
  limit?: number;
  categoria?: string;
  marca?: string;
  precio_min?: number;
  precio_max?: number;
  busqueda?: string;
  ordenar_por?: 'nombre' | 'precio' | 'fecha' | 'popularidad';
}

export interface OrdenFilter {
  page?: number;
  limit?: number;
  estado?: EstadoOrden;
  fecha_inicio?: string;
  fecha_fin?: string;
  cliente_id?: string;
}

export interface ClienteFilter {
  page?: number;
  limit?: number;
  busqueda?: string;
  segmento?: 'nuevos' | 'recurrentes' | 'inactivos' | 'vip';
}

export interface InventarioFilter {
  page?: number;
  limit?: number;
  stock_bajo?: boolean;
  producto_id?: string;
}

export interface ReporteFilter {
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string;
  formato?: 'pdf' | 'excel';
}

export interface DashboardKPIs {
  ventas_totales: number;
  total_ordenes: number;
  ticket_promedio: number;
  tasa_conversion: number;
  tasa_abandono: number;
  productos_agotados: number;
  productos_stock_bajo: number;
  clientes_nuevos: number;
  ordenes_pendientes: number;
}

export interface MercadoPagoPreference {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint?: string;
}

export interface CheckoutResult {
  ordenId: string;
  total: number;
  initPoint: string;
  sandboxInitPoint?: string;
}