// Interfaces compartidas
export interface IUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  roles: string[];
}

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  usuario: IUser;
}

export interface IProducto {
  id: string;
  sku: string;
  nombre: string;
  descripcion_corta?: string;
  descripcion_larga?: string;
  categoria_id: string;
  subcategoria_id?: string;
  marca_id?: string;
  precio_costo: number;
  precio_venta: number;
  precio_oferta?: number;
  peso?: number;
  stock_minimo: number;
  estado: 'activo' | 'inactivo' | 'borrador';
  activo: boolean;
  cat_categorias?: { id: string; nombre: string };
  cat_marcas?: { id: string; nombre: string };
  cat_imagenes_producto?: IImagenProducto[];
  inv_stock_producto?: IStockProducto[];
  cat_producto_atributo?: IProductoAtributo[];
  cli_resenas_producto?: IResena[];
}

export interface IImagenProducto {
  id: string;
  url: string;
  es_principal: boolean;
  orden: number;
}

export interface IStockProducto {
  cantidad_fisica: number;
  cantidad_reservada: number;
}

export interface IProductoAtributo {
  id: string;
  cat_valores_atributo: {
    valor: string;
    cat_atributos: { nombre: string; tipo: string };
  };
}

export interface IResena {
  id: string;
  calificacion: number;
  comentario?: string;
  created_at: string;
  seg_usuarios: { nombre: string; apellido: string };
}

export interface ICarrito {
  id: string;
  ord_items_carrito: ICarritoItem[];
}

export interface ICarritoItem {
  id: string;
  carrito_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  cat_productos: IProducto;
}

export interface IOrden {
  id: string;
  total: number;
  estado: string;
  moneda: string;
  subtotal: number;
  descuento: number;
  impuesto: number;
  costo_envio: number;
  fecha_pedido: string;
  ord_items_orden: IOrdenItem[];
  ord_historial_estados: IHistorialEstado[];
  ord_transacciones_pago?: ITransaccionPago[];
  cli_clientes?: { nombre: string; apellido: string; email: string };
}

export interface IOrdenItem {
  id: string;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface IHistorialEstado {
  id: string;
  estado_anterior?: string;
  estado_nuevo: string;
  comentario?: string;
  fecha_cambio: string;
}

export interface ITransaccionPago {
  id: string;
  estado: string;
  monto: number;
  tipo_pago: string;
  init_point?: string;
}

export interface ICliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  seg_usuarios: { activo: boolean; created_at: string };
}

export interface IProveedor {
  id: string;
  nombre: string;
  ruc?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
}

export interface IStockInventario {
  producto_id: string;
  cantidad_fisica: number;
  cantidad_reservada: number;
  cat_productos: {
    id: string;
    sku: string;
    nombre: string;
    stock_minimo: number;
    precio_venta: number;
  };
}

export interface IDashboardKPIs {
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

export enum Role {
  CLIENTE = 'CLIENTE',
  ADMINISTRADOR = 'ADMINISTRADOR',
  GERENTE_VENTAS = 'GERENTE_VENTAS',
  GERENTE_INVENTARIO = 'GERENTE_INVENTARIO',
  VENDEDOR = 'VENDEDOR',
}

export const ESTADOS_ORDEN: Record<string, string> = {
  pendiente_pago: 'Pendiente de Pago',
  pagada: 'Pagada',
  en_proceso: 'En Proceso',
  enviada: 'Enviada',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
  devuelta: 'Devuelta',
};

export interface IItemListaDeseos {
  id: string;
  lista_id: string;
  producto_id: string;
  created_at: string;
  cat_productos?: IProducto;
}

export interface IListaDeseos {
  id: string;
  usuario_id: string;
  created_at: string;
  cli_items_lista_deseos: IItemListaDeseos[];
}