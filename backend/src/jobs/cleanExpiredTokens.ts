import prisma from '../config/database';
import logger from '../utils/logger';

const INTERVALO_LIMPIEZA = 60 * 60 * 1000; // Cada hora

/**
 * Limpia tokens de actualización expirados o revocados
 */
export function startCleanExpiredTokens(): void {
  logger.info('🧹 Job de limpieza de tokens expirados iniciado');

  setInterval(async () => {
    try {
      // Eliminar tokens expirados
      const resultExpirados = await prisma.seg_refresh_tokens.deleteMany({
        where: {
          expiracion: { lte: new Date() },
        },
      });

      if (resultExpirados.count > 0) {
        logger.info(`Tokens expirados eliminados: ${resultExpirados.count}`);
      }

      // Eliminar tokens revocados con más de 7 días
      const fechaLimite = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const resultRevocados = await prisma.seg_refresh_tokens.deleteMany({
        where: {
          revocado: true,
          fecha_creacion: { lte: fechaLimite },
        },
      });

      if (resultRevocados.count > 0) {
        logger.info(`Tokens revocados antiguos eliminados: ${resultRevocados.count}`);
      }

      // Limpiar sesiones de carrito abandonadas (más de 30 días)
      const fechaLimiteCarritos = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const carritosAbandonados = await prisma.ord_carritos.findMany({
        where: {
          usuario_id: null,
          updated_at: { lte: fechaLimiteCarritos },
        },
        select: { id: true },
      });

      for (const carrito of carritosAbandonados) {
        await prisma.ord_items_carrito.deleteMany({
          where: { carrito_id: carrito.id },
        });
        await prisma.ord_carritos.delete({
          where: { id: carrito.id },
        });
      }

      if (carritosAbandonados.length > 0) {
        logger.info(`Carritos abandonados eliminados: ${carritosAbandonados.length}`);
      }
    } catch (error) {
      logger.error('Error en job de limpieza de tokens:', error);
    }
  }, INTERVALO_LIMPIEZA);

  // Ejecutar inmediatamente al inicio
  logger.info('Ejecutando limpieza inicial de tokens...');
}