import nodemailer from 'nodemailer';
import { config } from '../config';
import logger from './logger';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export async function enviarEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  try {
    await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    });
    logger.info(`Email enviado a ${to}: ${subject}`);
  } catch (error) {
    logger.error(`Error al enviar email a ${to}:`, error);
  }
}

export async function enviarEmailConfirmacion(email: string, token: string): Promise<void> {
  const html = `
    <h1>Confirma tu cuenta</h1>
    <p>Gracias por registrarte. Haz clic en el siguiente enlace para confirmar tu cuenta:</p>
    <a href="${config.app.frontendUrl}/confirmar-email?token=${token}">Confirmar cuenta</a>
  `;
  await enviarEmail(email, 'Confirma tu cuenta', html);
}

export async function enviarEmailRecuperacion(email: string, token: string): Promise<void> {
  const html = `
    <h1>Recuperación de contraseña</h1>
    <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
    <a href="${config.app.frontendUrl}/reset-password?token=${token}">Restablecer contraseña</a>
  `;
  await enviarEmail(email, 'Recuperación de contraseña', html);
}

export async function enviarEmailConfirmacionOrden(
  email: string,
  ordenId: string,
  total: number
): Promise<void> {
  const html = `
    <h1>¡Gracias por tu compra!</h1>
    <p>Tu orden #${ordenId} ha sido confirmada.</p>
    <p>Total: ${config.negocio.monedaDefecto} ${total.toFixed(2)}</p>
  `;
  await enviarEmail(email, 'Confirmación de orden', html);
}