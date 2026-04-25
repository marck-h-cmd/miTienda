import { enviarEmail, enviarEmailConfirmacion, enviarEmailRecuperacion, enviarEmailConfirmacionOrden } from '../utils/email';
import logger from '../utils/logger';

export class EmailService {
  async enviarConfirmacionRegistro(email: string, token: string) {
    try {
      await enviarEmailConfirmacion(email, token);
      return { enviado: true };
    } catch (error) {
      logger.error('Error enviando confirmación:', error);
      return { enviado: false };
    }
  }

  async enviarRecuperacionPassword(email: string, token: string) {
    try {
      await enviarEmailRecuperacion(email, token);
      return { enviado: true };
    } catch (error) {
      logger.error('Error enviando recuperación:', error);
      return { enviado: false };
    }
  }

  async enviarConfirmacionOrden(email: string, ordenId: string, total: number) {
    try {
      await enviarEmailConfirmacionOrden(email, ordenId, total);
      return { enviado: true };
    } catch (error) {
      logger.error('Error enviando confirmación de orden:', error);
      return { enviado: false };
    }
  }
}

export const emailService = new EmailService();