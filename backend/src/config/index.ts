import dotenv from 'dotenv';
dotenv.config();

export const config = {
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiUrl: process.env.API_URL || 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    expiration: process.env.JWT_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  mercadopago: {
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
    clientId: process.env.MERCADOPAGO_CLIENT_ID || '',
    clientSecret: process.env.MERCADOPAGO_CLIENT_SECRET || '',
    webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || '',
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@tienda.com',
  },
  empresa: {
    nombre: process.env.EMPRESA_NOMBRE || 'Mi Tienda Online',
    ruc: process.env.EMPRESA_RUC || '20123456789',
    direccion: process.env.EMPRESA_DIRECCION || '',
    telefono: process.env.EMPRESA_TELEFONO || '',
    email: process.env.EMPRESA_EMAIL || '',
    logoUrl: process.env.EMPRESA_LOGO_URL || '',
  },
  negocio: {
    igvPorcentaje: parseFloat(process.env.IGV_PORCENTAJE || '18'),
    monedaDefecto: process.env.MONEDA_DEFECTO || 'PEN',
    stockReservaTimeout: parseInt(process.env.STOCK_RESERVA_TIMEOUT || '15', 10),
  },
};