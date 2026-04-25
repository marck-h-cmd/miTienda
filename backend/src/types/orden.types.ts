import { EstadoOrden, MetodoPago } from './index';

export interface CrearOrdenDTO {
  usuarioId: string;
  direccionEnvioId: string;
  metodoEnvioId: string;
  cuponCodigo?: string;
  metodoPago?: MetodoPago;
}

export interface OrdenItem {
  producto_id: string;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface OrdenResponse {
  id: string;
  total: number;
  estado: EstadoOrden;
  fecha_pedido: Date;
  items: OrdenItem[];
}

export interface CheckoutResponse {
  ordenId: string;
  total: number;
  initPoint: string;
  sandboxInitPoint?: string;
}

export interface PagoWebhookPayload {
  topic: string;
  id: string;
}

export interface ResultadoPago {
  procesado: boolean;
  ordenId?: string;
  mensaje?: string;
}