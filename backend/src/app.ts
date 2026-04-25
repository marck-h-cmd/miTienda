import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';
import { generalLimiter } from './middlewares/rateLimiter';
import routes from './routes';
import { swaggerSpec } from './utils/swagger';

const app: Application = express();

// Middlewares globales
app.use(helmet());
app.use(cors({
  origin: config.app.frontendUrl,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(generalLimiter);

// Ruta de health check
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API funcionando correctamente' });
});

// Documentación Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de la API
app.use('/api/v1', routes);

// Middleware de manejo de errores
app.use(errorHandler);

export default app;