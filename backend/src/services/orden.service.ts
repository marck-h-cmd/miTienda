import prisma from '../config/database';
import { NotFoundError, AppError, ConflictError } from '../middlewares/errorHandler';
import { mercadopagoService } from './mercadopago.service';
import { config } from '../config';
import logger from '../utils/logger';

interface CrearOrdenDTO {
  usuarioId: string;
  direccionEnvioId: string;
  metodoEnvioId: string;
  cuponCodigo?: string;
}

export class OrdenService {
  /**
   * Inicia el proceso de checkout creando la orden y la preferencia de pago
   */
  async iniciarCheckout(data: CrearOrdenDTO) {
    // Usar transacción para garantizar atomicidad
    const result = await prisma.$transaction(async (tx) => {
      // Obtener el carrito del usuario
      const carrito = await tx.ord_carritos.findFirst({
        where: { usuario_id: data.usuarioId },
        include: {
          ord_items_carrito: {
            include: {
              cat_productos: true,
            },
          },
        },
      });

      if (!carrito || carrito.ord_items_carrito.length === 0) {
        throw new ConflictError('El carrito está vacío');
      }

      // Validar stock disponible
      for (const item of carrito.ord_items_carrito) {
        const stock = await tx.inv_stock_producto.findFirst({
          where: {
            producto_id: item.producto_id,
            cantidad_fisica: { gte: item.cantidad },
          },
        });

        if (!stock) {
          throw new ConflictError(
            `Stock insuficiente para el producto: ${item.cat_productos.nombre}`
          );
        }
      }

      // Calcular totales
      const subtotal = carrito.ord_items_carrito.reduce(
        (sum, item) => sum + Number(item.precio_unitario) * item.cantidad,
        0
      );

      // Aplicar cupón si existe
      let descuento = 0;
      if (data.cuponCodigo) {
        const cupon = await tx.ord_cupones.findFirst({
          where: {
            codigo: data.cuponCodigo,
            fecha_inicio: { lte: new Date() },
            fecha_fin: { gte: new Date() },
            usos_actuales: { lt: prisma.ord_cupones.fields.usos_maximos },
            activo: true,
          },
        });

        if (cupon) {
          descuento = cupon.tipo_descuento === 'porcentaje'
            ? (subtotal * Number(cupon.valor_descuento)) / 100
            : Number(cupon.valor_descuento);

          await tx.ord_cupones.update({
            where: { id: cupon.id },
            data: { usos_actuales: { increment: 1 } },
          });
        }
      }

      // Calcular impuestos
      const subtotalConDescuento = subtotal - descuento;
      const impuesto = (subtotalConDescuento * config.negocio.igvPorcentaje) / 100;

      // Obtener costo de envío
      const metodoEnvio = await tx.ord_metodos_envio.findUnique({
        where: { id: data.metodoEnvioId },
      });

      if (!metodoEnvio) {
        throw new NotFoundError('Método de envío no encontrado');
      }

      const costoEnvio = Number(metodoEnvio.precio);
      const total = subtotalConDescuento + impuesto + costoEnvio;

      // Crear la orden
      const orden = await tx.ord_ordenes.create({
        data: {
          cliente_id: data.usuarioId,
          direccion_envio_id: data.direccionEnvioId,
          metodo_envio_id: data.metodoEnvioId,
          subtotal,
          descuento,
          impuesto,
          costo_envio: costoEnvio,
          total,
          estado: 'pendiente_pago',
          moneda: config.negocio.monedaDefecto,
          fecha_pedido: new Date(),
        },
      });

      // Crear items de la orden
      const items = await Promise.all(
        carrito.ord_items_carrito.map((item) =>
          tx.ord_items_orden.create({
            data: {
              orden_id: orden.id,
              producto_id: item.producto_id,
              nombre_producto: item.cat_productos.nombre,
              cantidad: item.cantidad,
              precio_unitario: item.precio_unitario,
              subtotal: Number(item.precio_unitario) * item.cantidad,
            },
          })
        )
      );

      // Reservar stock
      const fechaExpiracionReserva = new Date(
        Date.now() + config.negocio.stockReservaTimeout * 60 * 1000
      );

      await Promise.all(
        carrito.ord_items_carrito.map((item) =>
          tx.inv_stock_producto.updateMany({
            where: { producto_id: item.producto_id },
            data: {
              cantidad_reservada: { increment: item.cantidad },
              fecha_reserva: new Date(),
              fecha_expiracion_reserva: fechaExpiracionReserva,
            },
          })
        )
      );

      // Registrar historial de estados
      await tx.ord_historial_estados.create({
        data: {
          orden_id: orden.id,
          estado_anterior: null,
          estado_nuevo: 'pendiente_pago',
          comentario: 'Orden creada',
          fecha_cambio: new Date(),
        },
      });

      return { orden, items, carritoId: carrito.id };
    });

    // Obtener datos del cliente para Mercado Pago
    const cliente = await prisma.seg_usuarios.findUnique({
      where: { id: data.usuarioId },
    });

    if (!cliente) {
      throw new NotFoundError('Cliente no encontrado');
    }

    // Crear preferencia de pago en Mercado Pago
    const preferencia = await mercadopagoService.crearPreferencia({
      ordenId: result.orden.id,
      items: result.items.map((item) => ({
        titulo: item.nombre_producto,
        cantidad: item.cantidad,
        precioUnitario: Number(item.precio_unitario),
      })),
      cliente: {
        email: cliente.email,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
      },
    });

    // Guardar la preferencia de pago
    await prisma.ord_transacciones_pago.create({
      data: {
        orden_id: result.orden.id,
        tipo_pago: 'mercadopago',
        estado: 'pendiente',
        monto: result.orden.total,
        moneda: result.orden.moneda,
        preferencia_id: preferencia.preferenceId,
        init_point: preferencia.initPoint,
      },
    });

    // Limpiar el carrito después del checkout
    await prisma.ord_items_carrito.deleteMany({
      where: { carrito_id: result.carritoId },
    });

    logger.info(`Checkout iniciado: Orden #${result.orden.id}`);

    return {
      ordenId: result.orden.id,
      total: result.orden.total,
      initPoint: preferencia.initPoint,
      sandboxInitPoint: preferencia.sandboxInitPoint,
    };
  }

  async obtenerOrden(ordenId: string, usuarioId: string) {
    const orden = await prisma.ord_ordenes.findFirst({
      where: {
        id: ordenId,
        cliente_id: usuarioId,
      },
      include: {
        ord_items_orden: true,
        ord_direcciones_envio: true,
        ord_metodos_envio: true,
        ord_historial_estados: true,
        ord_transacciones_pago: true,
      },
    });

    if (!orden) {
      throw new NotFoundError('Orden no encontrada');
    }

    return orden;
  }

  async cancelarOrden(ordenId: string, usuarioId: string) {
    const orden = await this.obtenerOrden(ordenId, usuarioId);

    if (!['pendiente_pago', 'pagada'].includes(orden.estado)) {
      throw new ConflictError('La orden no puede ser cancelada en su estado actual');
    }

    // Si está pagada, reembolsar
    if (orden.estado === 'pagada') {
      const transaccion = await prisma.ord_transacciones_pago.findFirst({
        where: { orden_id: ordenId, estado: 'aprobado' },
      });

      if (transaccion?.referencia_externa) {
        await mercadopagoService.reembolsarPago(transaccion.referencia_externa);
      }
    }

    // Liberar stock reservado
    const items = await prisma.ord_items_orden.findMany({
      where: { orden_id: ordenId },
    });

    await Promise.all(
      items.map((item) =>
        prisma.inv_stock_producto.updateMany({
          where: { producto_id: item.producto_id },
          data: {
            cantidad_reservada: { decrement: item.cantidad },
          },
        })
      )
    );

    // Actualizar orden
    await prisma.ord_ordenes.update({
      where: { id: ordenId },
      data: { estado: 'cancelada' },
    });

    // Registrar en historial
    await prisma.ord_historial_estados.create({
      data: {
        orden_id: ordenId,
        estado_anterior: orden.estado,
        estado_nuevo: 'cancelada',
        comentario: 'Cancelada por el cliente',
        fecha_cambio: new Date(),
      },
    });

    logger.info(`Orden #${ordenId} cancelada`);
    return { mensaje: 'Orden cancelada exitosamente' };
  }
}

export const ordenService = new OrdenService();
