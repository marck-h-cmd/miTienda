import prisma from '../src/config/database';

async function createTestOrders() {
  try {
    // Buscar un usuario existente
    const usuario = await prisma.seg_usuarios.findFirst();
    if (!usuario) {
      console.log('No hay usuarios en la base de datos');
      return;
    }

    // Buscar métodos de envío
    const metodoEnvio = await prisma.ord_metodos_envio.findFirst();
    if (!metodoEnvio) {
      console.log('No hay métodos de envío');
      return;
    }

    // Buscar dirección
    const direccion = await prisma.ord_direcciones_envio.findFirst();
    if (!direccion) {
      console.log('No hay direcciones de envío');
      return;
    }

    // Crear órdenes de prueba
    for (let i = 0; i < 10; i++) {
      const total = Math.random() * 1000 + 100;
      
      const orden = await prisma.ord_ordenes.create({
        data: {
          cliente_id: usuario.id,
          direccion_envio_id: direccion.id,
          metodo_envio_id: metodoEnvio.id,
          subtotal: total - total * 0.18 - 10,
          descuento: 0,
          impuesto: total * 0.18,
          costo_envio: 10,
          total: total,
          estado: i % 3 === 0 ? 'pagada' : i % 3 === 1 ? 'pendiente_pago' : 'pagada',
          moneda: 'PEN',
          fecha_pedido: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        }
      });

      console.log(`Orden creada: ${orden.id} - Estado: ${orden.estado}`);
    }

    console.log('Órdenes de prueba creadas exitosamente');
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestOrders();