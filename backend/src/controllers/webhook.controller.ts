import { Request, Response, NextFunction } from 'express';
import { mercadopagoService } from '../services/mercadopago.service';
import logger from '../utils/logger';

export class WebhookController {
  async procesarWebhookMP(req: Request, res: Response, next: NextFunction) {
    try {
      const { topic, id } = req.body;

      if (!topic || !id) {
        res.status(400).json({
          success: false,
          message: 'Parámetros inválidos',
        });
        return;
      }

      logger.info(`Webhook MP: topic=${topic}, id=${id}`);

      const resultado = await mercadopagoService.procesarWebhook(topic, id);

      res.status(200).json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const webhookController = new WebhookController();