import prisma from '../config/database';
import logger from '../utils/logger';

const INTERVALO_LIBERACION = 5 * 60 * 1000; // 5 minutos

export function startStockReservationCleanup(): void {
  logger.info('Job de limpieza de reservas de stock iniciado');

  setInterval(async () => {
    try {
      // Liberar reservas expiradas
      const result = await prisma.inv_stock_producto.updateMany({
        where: {
          fecha_expiracion_reserva: {
            lte: new Date(),
          },
          cantidad_reservada: { gt: 0 },
        },
        data: {
          cantidad_reservada: 0,
          fecha_reserva: null,
          fecha_expiracion_reserva: null,
        },
      });

      if (result.count > 0) {
        logger.info(`Reservas de stock liberadas: ${result.count}`);

        // Cancelar órdenes pendientes con reserva expirada
        await prisma.ord_ordenes.updateMany({
          where: {
            estado: 'pendiente_pago',
            fecha_pedido: {
              lte: new Date(Date.now() - 15 * 60 * 1000),
            },
          },
          data: {
            estado: 'cancelada',
          },
        });
      }
    } catch (error) {
      logger.error('Error en job de limpieza de reservas:', error);
    }
  }, INTERVALO_LIBERACION);
}