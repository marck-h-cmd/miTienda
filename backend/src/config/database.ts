import { PrismaClient } from '@prisma/client';
import { config } from './index';
import logger from '../utils/logger';

const prisma = new PrismaClient({
  log: config.app.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('📦 Base de datos conectada exitosamente');
  } catch (error) {
    logger.error('Error al conectar la base de datos:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Base de datos desconectada');
}

export default prisma;