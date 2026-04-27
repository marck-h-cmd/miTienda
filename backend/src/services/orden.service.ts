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
   * Obtiene las opciones de envío disponibles.
   * Direcciones → cli_direcciones (tabla del módulo de clientes)
   * Métodos     → ord_metodos_envio
   */
  async obtenerOpcionesEnvio(usuarioId: string) {
    const [direcciones, metodos] = await Promise.all([
      // ✅ Tabla correcta: cli_direcciones, no ord_direcciones_envio
      prisma.cli_direcciones.findMany({
        where: { usuario_id: usuarioId },
      }),
      prisma.ord_metodos_envio.findMany({
        where: { activo: true },
      }),
    ]);
    console.log('Direcciones obtenidas:', direcciones);

    return { direcciones, metodos };
  }

  /**
   * Busca una dirección en cli_direcciones por id + usuarioId.
   * Si no la encuentra, usa la principal o la primera disponible.
   */
  private async obtenerOCrearDireccion(usuarioId: string, direccionId: string) {
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(direccionId);

    if (isUUID) {
      const direccion = await prisma.cli_direcciones.findFirst({
        where: { id: direccionId, usuario_id: usuarioId },
      });
      if (direccion) return direccion;
    }

    // Fallback 1: dirección principal
    const principal = await prisma.cli_direcciones.findFirst({
      where: { usuario_id: usuarioId, es_principal: true },
    });
    if (principal) return principal;

    // Fallback 2: cualquier dirección del usuario
    const cualquiera = await prisma.cli_direcciones.findFirst({
      where: { usuario_id: usuarioId },
    });
    if (cualquiera) return cualquiera;

    throw new AppError(
      'No hay direcciones de envío disponibles. Por favor, agrega una dirección.',
      400
    );
  }

  /**
   * Inicia el proceso de checkout creando la orden y la preferencia de pago.
   */
  async iniciarCheckout(data: CrearOrdenDTO) {
    const direccion = await this.obtenerOCrearDireccion(data.usuarioId, data.direccionEnvioId);

    // Resolver método de envío
    const metodoEnvio = await prisma.ord_metodos_envio.findFirst({
      where: {
        OR: [
          { id: data.metodoEnvioId },
          { nombre: { contains: data.metodoEnvioId, mode: 'insensitive' } },
        ],
      },
    });

    if (!metodoEnvio) {
      const fallback = await prisma.ord_metodos_envio.findFirst({ where: { activo: true } });
      if (!fallback) throw new AppError('No hay métodos de envío disponibles', 400);
      data.metodoEnvioId = fallback.id;
    } else {
      data.metodoEnvioId = metodoEnvio.id;
    }

    const result = await prisma.$transaction(async (tx) => {
      const carrito = await tx.ord_carritos.findFirst({
        where: { usuario_id: data.usuarioId },
        include: {
          ord_items_carrito: { include: { cat_productos: true } },
        },
      });

      if (!carrito || carrito.ord_items_carrito.length === 0) {
        throw new ConflictError('El carrito está vacío');
      }

      // Validar stock
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

      // Calcular subtotal
      const subtotal = carrito.ord_items_carrito.reduce(
        (sum, item) => sum + Number(item.precio_unitario) * item.cantidad,
        0
      );

      // Cupón
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
          descuento =
            cupon.tipo_descuento === 'porcentaje'
              ? (subtotal * Number(cupon.valor_descuento)) / 100
              : Number(cupon.valor_descuento);

          await tx.ord_cupones.update({
            where: { id: cupon.id },
            data: { usos_actuales: { increment: 1 } },
          });
        }
      }

      const subtotalConDescuento = subtotal - descuento;
      const impuesto = (subtotalConDescuento * config.negocio.igvPorcentaje) / 100;

      const metodoEnvioData = await tx.ord_metodos_envio.findUnique({
        where: { id: data.metodoEnvioId },
      });
      if (!metodoEnvioData) throw new NotFoundError('Método de envío no encontrado');

      const costoEnvio = Number(metodoEnvioData.precio);
      const total = subtotalConDescuento + impuesto + costoEnvio;

      // Crear snapshot inmutable de la dirección en ord_direcciones_envio
      // (ord_ordenes.direccion_envio_id apunta a esta tabla, no a cli_direcciones)
      const dirEnvio = await tx.ord_direcciones_envio.create({
        data: {
          usuario_id: direccion.usuario_id,
          nombre: direccion.nombre,
          apellido: direccion.apellido,
          direccion: direccion.direccion,
          ciudad: direccion.ciudad,
          departamento: direccion.departamento,
          codigo_postal: direccion.codigo_postal ?? null,
          telefono: direccion.telefono,
          es_principal: direccion.es_principal,
        },
      });

      // Crear orden usando el id del snapshot recién creado
      const orden = await tx.ord_ordenes.create({
        data: {
          cliente_id: data.usuarioId,
          direccion_envio_id: dirEnvio.id,  // ← ahora sí apunta a ord_direcciones_envio
          metodo_envio_id: data.metodoEnvioId,
          subtotal,
          descuento,
          impuesto,
          costo_envio: costoEnvio,
          total,
          estado: 'pagada',
          moneda: config.negocio.monedaDefecto,
          fecha_pedido: new Date(),
        },
      });

      // Crear items
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

      // Historial
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

    // Cliente para Mercado Pago
    const cliente = await prisma.seg_usuarios.findUnique({
      where: { id: data.usuarioId },
    });
    if (!cliente) throw new NotFoundError('Cliente no encontrado');

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

    await prisma.ord_transacciones_pago.create({
      data: {
        orden_id: result.orden.id,
        tipo_pago: 'mercadopago',
        estado: 'pagada',
        monto: result.orden.total,
        moneda: result.orden.moneda,
        preferencia_id: preferencia.preferenceId,
        init_point: preferencia.initPoint,
      },
    });

    // Limpiar carrito
    await prisma.ord_items_carrito.deleteMany({
      where: { carrito_id: result.carritoId },
    });

    await mercadopagoService.descontarInventario(result.orden.id);

    logger.info(`Checkout iniciado: Orden #${result.orden.id}`);

    return {
      ordenId: result.orden.id,
      total: result.orden.total,
      initPoint: preferencia.initPoint,
      preferenceId:     preferencia.preferenceId,
      sandboxInitPoint: preferencia.sandboxInitPoint,
    };
  }

  async obtenerOrden(ordenId: string, usuarioId: string) {
    const orden = await prisma.ord_ordenes.findFirst({
      where: { id: ordenId, cliente_id: usuarioId },
      include: {
        ord_items_orden: true,
        ord_metodos_envio: true,
        ord_historial_estados: true,
        ord_transacciones_pago: true,
      },
    });
    if (!orden) throw new NotFoundError('Orden no encontrada');
    return orden;
  }

  async cancelarOrden(ordenId: string, usuarioId: string) {
    const orden = await this.obtenerOrden(ordenId, usuarioId);

    if (!['pendiente_pago', 'pagada'].includes(orden.estado)) {
      throw new ConflictError('La orden no puede ser cancelada en su estado actual');
    }

    if (orden.estado === 'pagada') {
      const transaccion = await prisma.ord_transacciones_pago.findFirst({
        where: { orden_id: ordenId, estado: 'aprobado' },
      });
      if (transaccion?.referencia_externa) {
        await mercadopagoService.reembolsarPago(transaccion.referencia_externa);
      }
    }

    const items = await prisma.ord_items_orden.findMany({ where: { orden_id: ordenId } });

    await Promise.all(
      items.map((item) =>
        prisma.inv_stock_producto.updateMany({
          where: { producto_id: item.producto_id },
          data: { cantidad_reservada: { decrement: item.cantidad } },
        })
      )
    );

    await prisma.ord_ordenes.update({
      where: { id: ordenId },
      data: { estado: 'cancelada' },
    });

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

async listarOrdenes(usuarioId: string, filtros: any) {
  const { page = 1, limit = 10, estado } = filtros;
  const skip = (Number(page) - 1) * Number(limit);

  // ✅ Eliminar el filtro por cliente_id para que devuelva TODAS las órdenes
  const where: any = {};
  
  // Solo filtrar por estado si viene
  if (estado && estado !== 'todos') {
    where.estado = estado;
  }

  const [ordenes, total] = await Promise.all([
    prisma.ord_ordenes.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { fecha_pedido: 'desc' },
      include: {
        ord_items_orden: true,
        ord_metodos_envio: true,
        ord_transacciones_pago: { select: { estado: true, tipo_pago: true } },
        seg_usuarios: {  // Incluir datos del cliente
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
          }
        }
      },
    }),
    prisma.ord_ordenes.count({ where }),
  ]);

  return { ordenes, total, page: Number(page), limit: Number(limit) };
}
}

export const ordenService = new OrdenService();