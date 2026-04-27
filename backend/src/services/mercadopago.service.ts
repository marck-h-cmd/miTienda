import { preferenceClient, paymentClient, paymentRefundClient } from '../config/mercadopago';
import { config } from '../config';
import { AppError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

interface CrearPreferenciaDTO {
  ordenId: string;
  items: Array<{
    titulo: string;
    cantidad: number;
    precioUnitario: number;
  }>;
  cliente: {
    email: string;
    nombre: string;
    apellido: string;
  };
}

interface ResultadoPago {
  id: string;
  estado: string;
  metodoPago: string;
  monto: number;
  moneda: string;
  fechaAprobacion: Date | null;
}

export class MercadoPagoService {
  /**
   * Crea una preferencia de pago en Mercado Pago
   */
  async crearPreferencia(data: CrearPreferenciaDTO) {
    try {
      const preferenceData = {
        items: data.items.map((item) => ({
          id: item.titulo,
          title: item.titulo,
          quantity: item.cantidad,
          unit_price: item.precioUnitario,
          currency_id: config.negocio.monedaDefecto,
        })),
        payer: {
          email: data.cliente.email,
          name: data.cliente.nombre,
          surname: data.cliente.apellido,
        },
        back_urls: {
          success: `${config.app.frontendUrl}/checkout/exito?ordenId=${data.ordenId}`,
          failure: `${config.app.frontendUrl}/checkout/fallo?ordenId=${data.ordenId}`,
          pending: `${config.app.frontendUrl}/checkout/pendiente?ordenId=${data.ordenId}`,
        },
        // auto_return requiere URLs públicas — solo en producción
        ...(config.app.nodeEnv === 'production' && { auto_return: 'approved' }),
        external_reference: data.ordenId,
        // notification_url también requiere URL pública
        ...(config.app.nodeEnv === 'production' && {
          notification_url: `${config.app.apiUrl}/api/v1/webhooks/mercadopago`,
        }),
        statement_descriptor: config.empresa.nombre.substring(0, 22),
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 12,
        },
      };

      const response = await preferenceClient.create({ body: preferenceData });

      if (!response.id || !response.init_point) {
        throw new AppError('Error al crear preferencia de pago', 500);
      }

      logger.info(`Preferencia creada: ${response.id} para orden ${data.ordenId}`);

      return {
        preferenceId: response.id,
        initPoint: response.init_point,
        sandboxInitPoint: response.sandbox_init_point,
      };
    } catch (error) {
      logger.error('Error en Mercado Pago:', error);
      throw new AppError('Error al procesar el pago con Mercado Pago', 500);
    }
  }

  /**
   * Obtiene el estado de un pago por su ID
   */
  async obtenerPago(paymentId: string): Promise<ResultadoPago> {
    try {
      const payment = await paymentClient.get({ id: paymentId });

      return {
        id: payment.id?.toString() || '',
        estado: payment.status || 'desconocido',
        metodoPago: payment.payment_method_id || 'no especificado',
        monto: payment.transaction_amount || 0,
        moneda: payment.currency_id || config.negocio.monedaDefecto,
        fechaAprobacion: payment.date_approved
          ? new Date(payment.date_approved)
          : null,
      };
    } catch (error) {
      logger.error('Error al obtener pago:', error);
      throw new AppError('Error al obtener información del pago', 500);
    }
  }

  /**
   * Procesa la notificación webhook de Mercado Pago
   */
  async procesarWebhook(topic: string, id: string) {
    try {
      logger.info(`Webhook recibido: topic=${topic}, id=${id}`);

      if (topic === 'payment') {
        const pago = await this.obtenerPago(id);

        // Buscar la orden asociada
        const prisma = (await import('../config/database')).default;

        const orden = await prisma.ord_ordenes.findFirst({
          where: {
            ord_transacciones_pago: {
              some: {
                referencia_externa: id,
              },
            },
          },
          include: {
            ord_items_orden: true,
          },
        });

        if (!orden) {
          logger.warn(`No se encontró orden para el pago ${id}`);
          return { procesado: false, mensaje: 'Orden no encontrada' };
        }

        // Actualizar transacción y orden según el estado del pago
        await prisma.ord_transacciones_pago.updateMany({
          where: {
            orden_id: orden.id,
            referencia_externa: id,
          },
          data: {
            estado: this.mapearEstado(pago.estado),
            fecha_procesamiento: pago.fechaAprobacion,
            metadata: JSON.stringify(pago),
          },
        });

        // Actualizar estado de la orden
        const nuevoEstado = this.obtenerEstadoOrden(pago.estado);
        if (nuevoEstado) {
          await prisma.ord_ordenes.update({
            where: { id: orden.id },
            data: { estado: nuevoEstado },
          });

          // Si el pago fue aprobado, descontar inventario
          if (pago.estado === 'approved') {
            await this.descontarInventario(orden.id);
          }
        }

        return { procesado: true, ordenId: orden.id };
      }

      return { procesado: false, mensaje: 'Topic no procesado' };
    } catch (error) {
      logger.error('Error al procesar webhook:', error);
      throw new AppError('Error al procesar notificación de pago', 500);
    }
  }

  /**
   * Mapea el estado de Mercado Pago a nuestro estado interno
   */
  private mapearEstado(estadoMP: string): string {
    const mapa: Record<string, string> = {
      approved: 'aprobado',
      pending: 'pendiente',
      in_process: 'en_proceso',
      rejected: 'rechazado',
      refunded: 'reembolsado',
      cancelled: 'cancelado',
      charged_back: 'contracargo',
    };
    return mapa[estadoMP] || 'pendiente';
  }

  /**
   * Obtiene el estado de la orden según el estado del pago
   */
  private obtenerEstadoOrden(estadoPago: string): string | null {
    const mapa: Record<string, string> = {
      approved: 'pagada',
      rejected: 'cancelada',
      cancelled: 'cancelada',
      refunded: 'devuelta',
      charged_back: 'devuelta',
    };
    return mapa[estadoPago] || null;
  }

  /**
   * Descuenta el inventario cuando un pago es aprobado
   */
   async descontarInventario(ordenId: string) {
    const prisma = (await import('../config/database')).default;

    const items = await prisma.ord_items_orden.findMany({
      where: { orden_id: ordenId },
    });

    for (const item of items) {
      // Descontar del stock físico
      await prisma.inv_stock_producto.updateMany({
        where: {
          producto_id: item.producto_id,
          cantidad_fisica: { gte: item.cantidad },
        },
        data: {
          cantidad_fisica: { decrement: item.cantidad },
          cantidad_reservada: { decrement: item.cantidad },
        },
      });

      // Registrar movimiento de inventario
      await prisma.inv_movimientos_inventario.create({
        data: {
          producto_id: item.producto_id,
          tipo_movimiento: 'salida',
          cantidad: item.cantidad,
          motivo: `Venta - Orden #${ordenId}`,
          fecha_movimiento: new Date(),
        },
      });
    }
  }

  /**
   * Genera un reembolso total o parcial
   */
  async reembolsarPago(paymentId: string, monto?: number) {
    try {
      const refund = monto
        ? await paymentRefundClient.create({
          payment_id: paymentId,
          body: { amount: monto },
        })
        : await paymentRefundClient.total({ payment_id: paymentId });

      return {
        reembolsoId: refund.id?.toString() || '',
        estado: refund.status || 'desconocido',
        montoReembolsado: refund.amount || 0,
      };
    } catch (error) {
      logger.error('Error al reembolsar pago:', error);
      throw new AppError('Error al procesar el reembolso', 500);
    }
  }
}

export const mercadopagoService = new MercadoPagoService();
