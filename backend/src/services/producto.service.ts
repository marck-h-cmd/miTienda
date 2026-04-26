import { seg_usuarios } from './../../node_modules/.prisma/client/default';
import prisma from '../config/database';
import { NotFoundError } from '../middlewares/errorHandler';
import { Prisma } from '@prisma/client';

export class ProductoService {
  async listar(filtros: any) {
    const { page = 1, limit = 12, categoria, marca, precio_min, precio_max, busqueda, ordenar_por } = filtros;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.cat_productosWhereInput = {
      activo: true,
      estado: 'activo',
      ...(categoria && { categoria_id: categoria }),
      ...(marca && { marca_id: marca }),
      ...(precio_min && { precio_venta: { gte: Number(precio_min) } }),
      ...(precio_max && { precio_venta: { lte: Number(precio_max) } }),
      ...(busqueda && {
        OR: [
          { nombre: { contains: busqueda, mode: 'insensitive' } },
          { descripcion_corta: { contains: busqueda, mode: 'insensitive' } },
        ],
      }),
    };

    let orderBy: Prisma.cat_productosOrderByWithRelationInput = { created_at: 'desc' };
    switch (ordenar_por) {
      case 'precio': orderBy = { precio_venta: 'asc' }; break;
      case 'nombre': orderBy = { nombre: 'asc' }; break;
      case 'fecha': orderBy = { created_at: 'desc' }; break;
    }

    const [productos, total] = await Promise.all([
      prisma.cat_productos.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
          cat_categorias: true,
          cat_marcas: true,
          cat_imagenes_producto: { where: { es_principal: true }, take: 1 },
          inv_stock_producto: true,
        },
      }),
      prisma.cat_productos.count({ where }),
    ]);

    return { productos, total, page: Number(page), limit: Number(limit) };
  }

  async obtenerPorId(id: string) {
    const producto = await prisma.cat_productos.findUnique({
      where: { id },
      include: {
        cat_categorias: true,
        cat_subcategorias: true,
        cat_marcas: true,
        cat_unidades_medida: true,
        cat_imagenes_producto: true,
        cat_producto_atributo: { include: { cat_valores_atributo: { include: { cat_atributos: true } } } },
        inv_stock_producto: true,
        cli_resenas_producto: { include: { seg_usuarios: { select: { nombre: true, apellido: true } } } },
      },
    });

    if (!producto) throw new NotFoundError('Producto no encontrado');
    return producto;
  }

  async crear(data: any) {
    const producto = await prisma.cat_productos.create({ data });
    // Crear registro de stock inicial
    await prisma.inv_stock_producto.create({
      data: {
        producto_id: producto.id,
        cantidad_fisica: 0,
        cantidad_reservada: 0,
      },
    });
    return producto;
  }

  async actualizar(id: string, data: any) {
    await this.obtenerPorId(id);
    return prisma.cat_productos.update({ where: { id }, data });
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);
    return prisma.cat_productos.update({
      where: { id },
      data: { activo: false, estado: 'inactivo' },
    });
  }

  async listarAdmin(filtros: any) {
    const { page = 1, limit = 20, estado, categoria } = filtros;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (estado) where.estado = estado;
    if (categoria) where.categoria_id = categoria;

    const [productos, total] = await Promise.all([
      prisma.cat_productos.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: {
          cat_categorias: true,
          inv_stock_producto: true,
        },
      }),
      prisma.cat_productos.count({ where }),
    ]);

    return { productos, total, page: Number(page), limit: Number(limit) };
  }
}

export const productoService = new ProductoService();