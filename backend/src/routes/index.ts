import { Router } from 'express';
import authRoutes from './auth.routes';
import productoRoutes from './producto.routes';
import carritoRoutes from './carrito.routes';
import ordenRoutes from './orden.routes';
import inventarioRoutes from './inventario.routes';
import clienteRoutes from './cliente.routes';
import reporteRoutes from './reporte.routes';
import dashboardRoutes from './dashboard.routes';
import estadisticasRoutes from './estadisticas.routes';
import webhookRoutes from './webhook.routes';
import categoriaRoutes from './categoria.routes';
import marcaRoutes from './marca.routes';
import unidadMedidaRoutes from './unidadMedida.routes';
import subcategoriaRoutes from './subcategoria.routes';
import favoritosRoutes from './favoritos.routes';



const router = Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check
 *     tags: [Sistema]
 */
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API funcionando' });
});

router.use('/auth', authRoutes);
router.use('/productos', productoRoutes);
router.use('/carrito', carritoRoutes);
router.use('/ordenes', ordenRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/clientes', clienteRoutes);
router.use('/reportes', reporteRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/estadisticas', estadisticasRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/marcas', marcaRoutes);
router.use('/unidadesMedida', unidadMedidaRoutes);
router.use('/subcategorias', subcategoriaRoutes);
router.use('/favoritos', favoritosRoutes);


export default router;