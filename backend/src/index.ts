import app from './app';
import { config } from './config';
import { connectDatabase } from './config/database';
import logger from './utils/logger';
import { startStockReservationCleanup } from './jobs/stockReservation';
import { startCleanExpiredTokens } from './jobs/cleanExpiredTokens';

async function startServer(): Promise<void> {
  try {
    // Conectar base de datos
    await connectDatabase();

    // Iniciar jobs programados
    startStockReservationCleanup();
    startCleanExpiredTokens();

    // Iniciar servidor
    app.listen(config.app.port, () => {
      logger.info(`🚀 Servidor corriendo en ${config.app.apiUrl}`);
      logger.info(`📚 Documentación API: ${config.app.apiUrl}/api/docs`);
      logger.info(`🌍 Entorno: ${config.app.nodeEnv}`);
      logger.info(`⏰ Jobs programados iniciados`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de señales de cierre graceful
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} recibido. Cerrando servidor...`);
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();