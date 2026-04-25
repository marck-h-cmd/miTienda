import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // ==================== MONEDAS ====================
  const monedas = [
    { codigo: 'PEN', nombre: 'Sol Peruano', simbolo: 'S/' },
    { codigo: 'USD', nombre: 'Dólar Estadounidense', simbolo: '$' },
    { codigo: 'EUR', nombre: 'Euro', simbolo: '€' },
    { codigo: 'MXN', nombre: 'Peso Mexicano', simbolo: 'MX$' },
  ];

  for (const moneda of monedas) {
    await prisma.monedas.upsert({
      where: { codigo: moneda.codigo },
      update: moneda,
      create: moneda,
    });
  }
  console.log('✅ Monedas creadas');

  // ==================== ROLES ====================
  const roles = [
    { nombre: 'CLIENTE', descripcion: 'Cliente comprador' },
    { nombre: 'ADMINISTRADOR', descripcion: 'Administrador del sistema' },
    { nombre: 'GERENTE_VENTAS', descripcion: 'Gerente de ventas' },
    { nombre: 'GERENTE_INVENTARIO', descripcion: 'Gerente de inventario' },
    { nombre: 'VENDEDOR', descripcion: 'Vendedor / Atención al cliente' },
  ];

  const rolesCreados: Record<string, string> = {};
  for (const rol of roles) {
    const rolCreado = await prisma.seg_roles.upsert({
      where: { nombre: rol.nombre },
      update: rol,
      create: rol,
    });
    rolesCreados[rol.nombre] = rolCreado.id;
  }
  console.log('✅ Roles creados');

  // ==================== PERMISOS ====================
  const permisos = [
    { modulo: 'productos', accion: 'LEER' },
    { modulo: 'productos', accion: 'CREAR' },
    { modulo: 'productos', accion: 'EDITAR' },
    { modulo: 'productos', accion: 'ELIMINAR' },
    { modulo: 'ordenes', accion: 'LEER' },
    { modulo: 'ordenes', accion: 'CREAR' },
    { modulo: 'ordenes', accion: 'EDITAR' },
    { modulo: 'ordenes', accion: 'ELIMINAR' },
    { modulo: 'ordenes', accion: 'APROBAR' },
    { modulo: 'inventario', accion: 'LEER' },
    { modulo: 'inventario', accion: 'CREAR' },
    { modulo: 'inventario', accion: 'EDITAR' },
    { modulo: 'inventario', accion: 'ELIMINAR' },
    { modulo: 'clientes', accion: 'LEER' },
    { modulo: 'clientes', accion: 'EDITAR' },
    { modulo: 'reportes', accion: 'LEER' },
    { modulo: 'dashboard', accion: 'LEER' },
    { modulo: 'usuarios', accion: 'LEER' },
    { modulo: 'usuarios', accion: 'CREAR' },
    { modulo: 'usuarios', accion: 'EDITAR' },
    { modulo: 'usuarios', accion: 'ELIMINAR' },
  ];

  const permisosCreados: Record<string, string> = {};
  for (const permiso of permisos) {
    const permisoCreado = await prisma.seg_permisos.upsert({
      where: { modulo_accion: { modulo: permiso.modulo, accion: permiso.accion } },
      update: permiso,
      create: permiso,
    });
    permisosCreados[`${permiso.modulo}_${permiso.accion}`] = permisoCreado.id;
  }
  console.log('✅ Permisos creados');

  // ==================== ASIGNAR PERMISOS A ROLES ====================
  const permisosPorRol: Record<string, string[]> = {
    ADMINISTRADOR: Object.keys(permisosCreados),
    GERENTE_VENTAS: [
      'productos_LEER',
      'ordenes_LEER', 'ordenes_EDITAR', 'ordenes_APROBAR',
      'clientes_LEER',
      'reportes_LEER',
      'dashboard_LEER',
    ],
    GERENTE_INVENTARIO: [
      'productos_LEER', 'productos_CREAR', 'productos_EDITAR',
      'inventario_LEER', 'inventario_CREAR', 'inventario_EDITAR',
      'reportes_LEER',
    ],
    VENDEDOR: [
      'productos_LEER',
      'ordenes_LEER', 'ordenes_EDITAR',
      'clientes_LEER',
      'dashboard_LEER',
    ],
    CLIENTE: [
      'productos_LEER',
      'ordenes_LEER', 'ordenes_CREAR',
    ],
  };

  for (const [rolNombre, permisosKeys] of Object.entries(permisosPorRol)) {
    const rolId = rolesCreados[rolNombre];
    if (!rolId) continue;

    for (const permisoKey of permisosKeys) {
      const permisoId = permisosCreados[permisoKey];
      if (!permisoId) continue;

      await prisma.seg_rol_permiso.upsert({
        where: { rol_id_permiso_id: { rol_id: rolId, permiso_id: permisoId } },
        update: {},
        create: { rol_id: rolId, permiso_id: permisoId },
      });
    }
  }
  console.log('✅ Permisos asignados a roles');

  // ==================== USUARIOS DE PRUEBA ====================
  const passwordHash = await bcrypt.hash('password123', 12);

  const usuarios = [
    {
      email: 'admin@mitienda.com',
      password_hash: passwordHash,
      nombre: 'Admin',
      apellido: 'Sistema',
      activo: true,
      email_verificado: true,
      rol: 'ADMINISTRADOR',
    },
    {
      email: 'gerente@mitienda.com',
      password_hash: passwordHash,
      nombre: 'Gerente',
      apellido: 'Ventas',
      activo: true,
      email_verificado: true,
      rol: 'GERENTE_VENTAS',
    },
    {
      email: 'inventario@mitienda.com',
      password_hash: passwordHash,
      nombre: 'Gerente',
      apellido: 'Inventario',
      activo: true,
      email_verificado: true,
      rol: 'GERENTE_INVENTARIO',
    },
    {
      email: 'vendedor@mitienda.com',
      password_hash: passwordHash,
      nombre: 'Vendedor',
      apellido: 'Tienda',
      activo: true,
      email_verificado: true,
      rol: 'VENDEDOR',
    },
    {
      email: 'cliente@email.com',
      password_hash: passwordHash,
      nombre: 'Juan',
      apellido: 'Pérez',
      activo: true,
      email_verificado: true,
      rol: 'CLIENTE',
    },
    {
      email: 'maria@email.com',
      password_hash: passwordHash,
      nombre: 'María',
      apellido: 'García',
      activo: true,
      email_verificado: true,
      rol: 'CLIENTE',
    },
    {
      email: 'carlos@email.com',
      password_hash: passwordHash,
      nombre: 'Carlos',
      apellido: 'López',
      activo: true,
      email_verificado: true,
      rol: 'CLIENTE',
    },
  ];

  for (const usuarioData of usuarios) {
    const { rol, ...data } = usuarioData;

    const usuario = await prisma.seg_usuarios.upsert({
      where: { email: data.email },
      update: data,
      create: data,
    });

    // Asignar rol
    const rolId = rolesCreados[rol];
    if (rolId) {
      await prisma.seg_usuario_rol.upsert({
        where: { usuario_id_rol_id: { usuario_id: usuario.id, rol_id: rolId } },
        update: {},
        create: { usuario_id: usuario.id, rol_id: rolId },
      });
    }

    // Crear cliente si es CLIENTE
    if (rol === 'CLIENTE') {
      await prisma.cli_clientes.upsert({
        where: { usuario_id: usuario.id },
        update: { nombre: data.nombre, apellido: data.apellido, email: data.email },
        create: {
          usuario_id: usuario.id,
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
        },
      });
    }
  }
  console.log('✅ Usuarios creados');

  // ==================== CATEGORÍAS ====================
  const categorias = [
    { nombre: 'Electrónica', descripcion: 'Productos electrónicos y gadgets' },
    { nombre: 'Ropa', descripcion: 'Vestimenta y accesorios' },
    { nombre: 'Hogar', descripcion: 'Artículos para el hogar' },
    { nombre: 'Deportes', descripcion: 'Equipamiento deportivo' },
    { nombre: 'Libros', descripcion: 'Libros físicos y digitales' },
    { nombre: 'Juguetes', descripcion: 'Juguetes y juegos' },
    { nombre: 'Alimentos', descripcion: 'Alimentos y bebidas' },
    { nombre: 'Belleza', descripcion: 'Productos de belleza y cuidado personal' },
  ];

  const categoriasCreadas: Record<string, string> = {};
  for (const cat of categorias) {
    const categoria = await prisma.cat_categorias.upsert({
      where: { nombre: cat.nombre },
      update: cat,
      create: cat,
    });
    categoriasCreadas[cat.nombre] = categoria.id;
  }
  console.log('✅ Categorías creadas');

  // ==================== SUBCATEGORÍAS ====================
  const subcategorias = [
    { nombre: 'Smartphones', categoria: 'Electrónica' },
    { nombre: 'Laptops', categoria: 'Electrónica' },
    { nombre: 'Auriculares', categoria: 'Electrónica' },
    { nombre: 'Camisetas', categoria: 'Ropa' },
    { nombre: 'Pantalones', categoria: 'Ropa' },
    { nombre: 'Zapatillas', categoria: 'Ropa' },
    { nombre: 'Muebles', categoria: 'Hogar' },
    { nombre: 'Decoración', categoria: 'Hogar' },
    { nombre: 'Fútbol', categoria: 'Deportes' },
    { nombre: 'Gimnasio', categoria: 'Deportes' },
    { nombre: 'Ficción', categoria: 'Libros' },
    { nombre: 'No Ficción', categoria: 'Libros' },
    { nombre: 'Muñecos', categoria: 'Juguetes' },
    { nombre: 'Juegos de Mesa', categoria: 'Juguetes' },
    { nombre: 'Snacks', categoria: 'Alimentos' },
    { nombre: 'Cuidado Facial', categoria: 'Belleza' },
  ];

  for (const sub of subcategorias) {
    await prisma.cat_subcategorias.upsert({
      where: { id: `${categoriasCreadas[sub.categoria]}_${sub.nombre}` },
      update: {
        nombre: sub.nombre,
        categoria_id: categoriasCreadas[sub.categoria],
      },
      create: {
        nombre: sub.nombre,
        categoria_id: categoriasCreadas[sub.categoria],
      },
    }).catch(() => {
      // Si falla el upsert con ID, crear sin ID específico
      return prisma.cat_subcategorias.create({
        data: {
          nombre: sub.nombre,
          categoria_id: categoriasCreadas[sub.categoria],
        },
      });
    });
  }
  console.log('✅ Subcategorías creadas');

  // ==================== MARCAS ====================
  const marcas = [
    { nombre: 'Samsung' },
    { nombre: 'Apple' },
    { nombre: 'Sony' },
    { nombre: 'Nike' },
    { nombre: 'Adidas' },
    { nombre: 'LG' },
    { nombre: 'Xiaomi' },
    { nombre: 'Generic' },
  ];

  const marcasCreadas: Record<string, string> = {};
  for (const marca of marcas) {
    const marcaCreada = await prisma.cat_marcas.upsert({
      where: { nombre: marca.nombre },
      update: marca,
      create: marca,
    });
    marcasCreadas[marca.nombre] = marcaCreada.id;
  }
  console.log('✅ Marcas creadas');

  // ==================== UNIDADES DE MEDIDA ====================
  const unidades = [
    { nombre: 'Unidad', abreviatura: 'UND' },
    { nombre: 'Kilogramo', abreviatura: 'KG' },
    { nombre: 'Litro', abreviatura: 'L' },
    { nombre: 'Metro', abreviatura: 'M' },
    { nombre: 'Par', abreviatura: 'PAR' },
  ];

  const unidadesCreadas: Record<string, string> = {};
  for (const unidad of unidades) {
    const unidadCreada = await prisma.cat_unidades_medida.upsert({
      where: { nombre: unidad.nombre },
      update: unidad,
      create: unidad,
    });
    unidadesCreadas[unidad.abreviatura] = unidadCreada.id;
  }
  console.log('✅ Unidades de medida creadas');

  // ==================== MÉTODOS DE ENVÍO ====================
  const metodosEnvio = [
    { nombre: 'Envío Estándar', precio: 15.00, tiempo_estimado: '3-5 días' },
    { nombre: 'Envío Express', precio: 25.00, tiempo_estimado: '1-2 días' },
    { nombre: 'Recojo en Tienda', precio: 0.00, tiempo_estimado: 'Inmediato' },
  ];

  const metodosEnvioCreados: Record<string, string> = {};
  for (const metodo of metodosEnvio) {
    const metodoCreado = await prisma.ord_metodos_envio.upsert({
      where: { id: metodo.nombre.toLowerCase().replace(/\s+/g, '-') },
      update: metodo,
      create: metodo,
    }).catch(() => prisma.ord_metodos_envio.create({ data: metodo }));
    metodosEnvioCreados[metodo.nombre] = metodoCreado.id;
  }
  console.log('✅ Métodos de envío creados');

  // ==================== ESTADOS DE ORDEN ====================
  const estadosOrden = [
    { nombre: 'pendiente_pago', descripcion: 'Pendiente de pago' },
    { nombre: 'pagada', descripcion: 'Pago confirmado' },
    { nombre: 'en_proceso', descripcion: 'En preparación' },
    { nombre: 'enviada', descripcion: 'Enviada al cliente' },
    { nombre: 'entregada', descripcion: 'Entregada al cliente' },
    { nombre: 'cancelada', descripcion: 'Cancelada' },
    { nombre: 'devuelta', descripcion: 'Devuelta por el cliente' },
  ];

  for (const estado of estadosOrden) {
    await prisma.ord_estados_orden.upsert({
      where: { nombre: estado.nombre },
      update: estado,
      create: estado,
    });
  }
  console.log('✅ Estados de orden creados');

  // ==================== CUPONES ====================
  const cupones = [
    {
      codigo: 'BIENVENIDO10',
      tipo_descuento: 'porcentaje',
      valor_descuento: 10,
      fecha_inicio: new Date('2024-01-01'),
      fecha_fin: new Date('2025-12-31'),
      usos_maximos: 100,
    },
    {
      codigo: 'DESCUENTO50',
      tipo_descuento: 'fijo',
      valor_descuento: 50,
      monto_minimo: 200,
      fecha_inicio: new Date('2024-01-01'),
      fecha_fin: new Date('2025-12-31'),
      usos_maximos: 50,
    },
  ];

  for (const cupon of cupones) {
    await prisma.ord_cupones.upsert({
      where: { codigo: cupon.codigo },
      update: cupon,
      create: cupon,
    });
  }
  console.log('✅ Cupones creados');

  // ==================== CONFIGURACIÓN DEL SISTEMA ====================
  const configuraciones = [
    { clave: 'IGV_PORCENTAJE', valor: '18', tipo: 'numero' },
    { clave: 'MONEDA_DEFECTO', valor: 'PEN', tipo: 'texto' },
    { clave: 'STOCK_RESERVA_MINUTOS', valor: '15', tipo: 'numero' },
    { clave: 'ENVIO_GRATIS_MINIMO', valor: '200', tipo: 'numero' },
  ];

  for (const config of configuraciones) {
    await prisma.configuracion_sistema.upsert({
      where: { clave: config.clave },
      update: config,
      create: config,
    });
  }
  console.log('✅ Configuración del sistema creada');

  // ==================== 20 PRODUCTOS DE EJEMPLO ====================
  const productos = [
    {
      sku: 'SAM-S24-001',
      nombre: 'Samsung Galaxy S24',
      descripcion_corta: 'Smartphone de última generación',
      descripcion_larga: 'El Samsung Galaxy S24 cuenta con pantalla Dynamic AMOLED de 6.2", procesador Exynos 2400, 8GB RAM y 256GB de almacenamiento.',
      categoria: 'Electrónica',
      marca: 'Samsung',
      unidad: 'UND',
      precio_costo: 2500.00,
      precio_venta: 3499.00,
      stock: 15,
      stock_minimo: 5,
    },
    {
      sku: 'APP-IP15-002',
      nombre: 'iPhone 15 Pro',
      descripcion_corta: 'Potencia y elegancia en tus manos',
      descripcion_larga: 'iPhone 15 Pro con chip A17 Pro, pantalla Super Retina XDR de 6.1", cámara de 48MP y USB-C.',
      categoria: 'Electrónica',
      marca: 'Apple',
      unidad: 'UND',
      precio_costo: 3800.00,
      precio_venta: 5299.00,
      precio_oferta: 4999.00,
      stock: 10,
      stock_minimo: 3,
    },
    {
      sku: 'SONY-WH1-003',
      nombre: 'Sony WH-1000XM5',
      descripcion_corta: 'Auriculares inalámbricos con cancelación de ruido',
      descripcion_larga: 'Auriculares over-ear con cancelación de ruido líder en la industria, 30 horas de batería y audio de alta resolución.',
      categoria: 'Electrónica',
      marca: 'Sony',
      unidad: 'UND',
      precio_costo: 800.00,
      precio_venta: 1299.00,
      stock: 25,
      stock_minimo: 10,
    },
    {
      sku: 'NK-AIR-004',
      nombre: 'Nike Air Max 270',
      descripcion_corta: 'Zapatillas deportivas con amortiguación Air',
      descripcion_larga: 'Zapatillas Nike Air Max 270 con unidad Air de 270 grados, parte superior de malla transpirable y suela de goma.',
      categoria: 'Ropa',
      marca: 'Nike',
      unidad: 'PAR',
      precio_costo: 250.00,
      precio_venta: 499.00,
      stock: 40,
      stock_minimo: 10,
    },
    {
      sku: 'AD-ULTR-005',
      nombre: 'Adidas Ultraboost 23',
      descripcion_corta: 'Zapatillas running con tecnología Boost',
      descripcion_larga: 'Adidas Ultraboost 23 con amortiguación Boost reactiva, upper Primeknit+ y suela Continental™.',
      categoria: 'Ropa',
      marca: 'Adidas',
      unidad: 'PAR',
      precio_costo: 300.00,
      precio_venta: 599.00,
      stock: 30,
      stock_minimo: 8,
    },
    {
      sku: 'LG-OLED-006',
      nombre: 'LG OLED TV 55" C3',
      descripcion_corta: 'Smart TV OLED 4K con IA',
      descripcion_larga: 'LG OLED C3 de 55 pulgadas con procesador α9 Gen6 AI, Dolby Vision, Dolby Atmos y webOS 23.',
      categoria: 'Electrónica',
      marca: 'LG',
      unidad: 'UND',
      precio_costo: 3200.00,
      precio_venta: 4599.00,
      stock: 8,
      stock_minimo: 2,
    },
    {
      sku: 'XM-REDN-007',
      nombre: 'Xiaomi Redmi Note 13',
      descripcion_corta: 'Smartphone con cámara de 108MP',
      descripcion_larga: 'Xiaomi Redmi Note 13 con pantalla AMOLED de 6.67", cámara principal de 108MP, batería de 5000mAh.',
      categoria: 'Electrónica',
      marca: 'Xiaomi',
      unidad: 'UND',
      precio_costo: 600.00,
      precio_venta: 899.00,
      stock: 35,
      stock_minimo: 10,
    },
    {
      sku: 'GEN-TSH-008',
      nombre: 'Camiseta Básica Algodón',
      descripcion_corta: 'Camiseta 100% algodón premium',
      descripcion_larga: 'Camiseta de algodón peinado, cuello redondo, disponible en varios colores. Ideal para uso diario.',
      categoria: 'Ropa',
      marca: 'Generic',
      unidad: 'UND',
      precio_costo: 15.00,
      precio_venta: 39.90,
      stock: 200,
      stock_minimo: 30,
    },
    {
      sku: 'GEN-PAN-009',
      nombre: 'Pantalón Jean Clásico',
      descripcion_corta: 'Jean de mezclilla de alta calidad',
      descripcion_larga: 'Pantalón jean de mezclilla stretch, corte recto, disponible en azul y negro. Resistente y cómodo.',
      categoria: 'Ropa',
      marca: 'Generic',
      unidad: 'UND',
      precio_costo: 45.00,
      precio_venta: 99.90,
      stock: 150,
      stock_minimo: 25,
    },
    {
      sku: 'GEN-MUE-010',
      nombre: 'Escritorio de Oficina',
      descripcion_corta: 'Escritorio funcional para home office',
      descripcion_larga: 'Escritorio de melamina de 120x60cm, color blanco, con cajón integrado y patas metálicas.',
      categoria: 'Hogar',
      marca: 'Generic',
      unidad: 'UND',
      precio_costo: 180.00,
      precio_venta: 349.00,
      stock: 12,
      stock_minimo: 3,
    },
    {
      sku: 'GEN-DEC-011',
      nombre: 'Lámpara de Mesa LED',
      descripcion_corta: 'Lámpara LED regulable para escritorio',
      descripcion_larga: 'Lámpara LED con brazo ajustable, 3 modos de iluminación, puerto USB y base antideslizante.',
      categoria: 'Hogar',
      marca: 'Generic',
      unidad: 'UND',
      precio_costo: 35.00,
      precio_venta: 79.90,
      stock: 60,
      stock_minimo: 15,
    },
    {
      sku: 'GEN-FUT-012',
      nombre: 'Balón de Fútbol Profesional',
      descripcion_corta: 'Balón oficial tamaño 5',
      descripcion_larga: 'Balón de fútbol cosido a máquina, cubierta de PU, cámara de butilo. Ideal para partidos y entrenamiento.',
      categoria: 'Deportes',
      marca: 'Generic',
      unidad: 'UND',
      precio_costo: 40.00,
      precio_venta: 89.90,
      stock: 45,
      stock_minimo: 10,
    },
    {
      sku: 'GEN-GYM-013',
      nombre: 'Set de Pesas 20kg',
      descripcion_corta: 'Set de mancuernas ajustables',
      descripcion_larga: 'Set de pesas con barra y discos, total 20kg. Incluye 4 discos de 2.5kg, 4 de 1.25kg y 2 barras.',
      categoria: 'Deportes',
      marca: 'Generic',
      unidad: 'UND',
      precio_costo: 80.00,
      precio_venta: 159.90,
      stock: 20,
      stock_minimo: 5,
    },
    {
      sku: 'GEN-FIC-014',
      nombre: 'Cien Años de Soledad',
      descripcion_corta: 'Obra maestra de Gabriel García Márquez',
      descripcion_larga: 'Edición conmemorativa del 50 aniversario. Tapa dura, 512 páginas. Incluye ilustraciones exclusivas.',
      categoria: 'Libros',
      marca: 'Generic',
      unidad: 'UND',
      precio_costo: 25.00,
      precio_venta: 59.90,
      stock: 80,
      stock_minimo: 20,
    },
    {
      sku: 'GEN-NOF-015',
      nombre: 'Hábitos Atómicos',
      descripcion_corta: 'James Clear - Desarrollo personal',
      descripcion_larga: 'Un método sencillo y comprobado para desarrollar buenos hábitos y eliminar los malos.',
      categoria: 'Libros',
      marca: 'Generic',
      unidad: 'UND',
      precio_costo: 20.00,
      precio_venta: 49.90,
      stock: 100,
      stock_minimo: 25,
    },
    {
      sku: 'GEN-MUN-016',
      nombre: 'Set de Muñecas Princesas',
      descripcion_corta: 'Set de 4 muñecas princesas',
      descripcion_larga: 'Incluye 4 muñecas de 30cm con vestidos intercambiables, accesorios y peines. Para niñas de 3+ años.',
      categoria: 'Juguetes',
      marca: 'Generic',
      unidad: 'UND',
      precio_costo: 30.00,
      precio_venta: 69.90,
      stock: 50,
      stock_minimo: 10,
    },
    {
      sku: 'GEN-JME-017',
      nombre: 'Juego de Mesa Monopoly',
      descripcion_corta: 'Clásico juego de negocios',
      descripcion_larga: 'Monopoly edición clásica. Incluye tablero, fichas metálicas, dinero, tarjetas de propiedades y dados.',
      categoria: 'Juguetes',
      marca: 'Generic',
      unidad: 'UND',
      precio_costo: 35.00,
      precio_venta: 79.90,
      stock: 35,
      stock_minimo: 8,
    },
    {
      sku: 'GEN-SNA-018',
      nombre: 'Mix de Frutos Secos 500g',
      descripcion_corta: 'Mezcla premium de frutos secos',
      descripcion_larga: 'Almendras, nueces, castañas, arándanos y pasas. Sin sal añadida. Envase resellable.',
      categoria: 'Alimentos',
      marca: 'Generic',
      unidad: 'UND',
      precio_costo: 12.00,
      precio_venta: 24.90,
      stock: 120,
      stock_minimo: 20,
    },
    {
      sku: 'GEN-CFA-019',
      nombre: 'Crema Hidratante Facial SPF30',
      descripcion_corta: 'Hidratante con protección solar',
      descripcion_larga: 'Crema facial con ácido hialurónico, vitamina C y SPF30. Para todo tipo de piel. 50ml.',
      categoria: 'Belleza',
      marca: 'Generic',
      unidad: 'UND',
      precio_costo: 18.00,
      precio_venta: 44.90,
      stock: 90,
      stock_minimo: 15,
    },
    {
      sku: 'SAM-TAB-020',
      nombre: 'Samsung Galaxy Tab S9',
      descripcion_corta: 'Tablet Android premium con S Pen',
      descripcion_larga: 'Tablet de 11" Dynamic AMOLED 2X, procesador Snapdragon 8 Gen 2, 12GB RAM, 256GB, S Pen incluido.',
      categoria: 'Electrónica',
      marca: 'Samsung',
      unidad: 'UND',
      precio_costo: 1800.00,
      precio_venta: 2699.00,
      precio_oferta: 2499.00,
      stock: 12,
      stock_minimo: 3,
    },
  ];

  for (const prod of productos) {
    const categoriaId = categoriasCreadas[prod.categoria];
    const marcaId = marcasCreadas[prod.marca] || marcasCreadas['Generic'];
    const unidadId = unidadesCreadas[prod.unidad];

    await prisma.cat_productos.create({
      data: {
        sku: prod.sku,
        nombre: prod.nombre,
        descripcion_corta: prod.descripcion_corta,
        descripcion_larga: prod.descripcion_larga,
        categoria_id: categoriaId,
        marca_id: marcaId,
        unidad_medida_id: unidadId,
        precio_costo: prod.precio_costo,
        precio_venta: prod.precio_venta,
        precio_oferta: prod.precio_oferta || null,
        stock_minimo: prod.stock_minimo,
        cat_imagenes_producto: {
          create: {
            url: `https://picsum.photos/seed/${prod.sku}/600/600`,
            es_principal: true,
            orden: 0,
          },
        },
        inv_stock_producto: {
          create: {
            cantidad_fisica: prod.stock,
            cantidad_reservada: 0,
          },
        },
      },
    });
  }
  console.log('✅ 20 Productos creados con stock e imágenes');

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });