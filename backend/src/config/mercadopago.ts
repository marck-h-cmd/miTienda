import { MercadoPagoConfig, Preference, Payment, PaymentRefund } from 'mercadopago';
import { config } from './index';

// Configuración del cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: config.mercadopago.accessToken,
  options: { timeout: 5000 },
});

// Instancias de los recursos de Mercado Pago
export const preferenceClient = new Preference(client);
export const paymentClient = new Payment(client);
export const paymentRefundClient = new PaymentRefund(client);

export default client;
