import swaggerJsdoc from 'swagger-jsdoc';
import { config } from '../config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de E-Commerce - Carrito de Compras',
      version: '1.0.0',
      description: 'API RESTful para sistema de e-commerce con integración de Mercado Pago',
      contact: {
        name: 'Equipo de Desarrollo',
        email: config.empresa.email,
      },
    },
    servers: [
      {
        url: config.app.apiUrl,
        description: process.env.NODE_ENV === 'production' ? 'Producción' : 'Desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        Paginacion: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            data: { type: 'array', items: { type: 'object' } },
          },
        },
        Producto: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            sku: { type: 'string' },
            nombre: { type: 'string' },
            precio_venta: { type: 'number' },
            estado: { type: 'string' },
          },
        },
        Orden: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            total: { type: 'number' },
            estado: { type: 'string' },
            fecha_pedido: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      { name: 'Autenticación', description: 'Endpoints de autenticación' },
      { name: 'Productos', description: 'Catálogo de productos' },
      { name: 'Carrito', description: 'Carrito de compras' },
      { name: 'Órdenes', description: 'Gestión de órdenes y checkout' },
      { name: 'Inventario', description: 'Control de inventario' },
      { name: 'Clientes', description: 'Gestión de clientes' },
      { name: 'Reportes', description: 'Generación de reportes PDF' },
      { name: 'Dashboard', description: 'KPIs y métricas' },
      { name: 'Estadísticas', description: 'Análisis descriptivos' },
      { name: 'Webhooks', description: 'Webhooks externos' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);