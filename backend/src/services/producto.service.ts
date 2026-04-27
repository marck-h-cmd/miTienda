import fs from 'fs';
import path from 'path';
import { seg_usuarios } from './../../node_modules/.prisma/client/default';
import prisma from '../config/database';
import { NotFoundError } from '../middlewares/errorHandler';
import { Prisma } from '@prisma/client';
import { config } from '../config';

const productoUploadsPath = path.join(process.cwd(), 'uploads', 'productos');
fs.mkdirSync(productoUploadsPath, { recursive: true });

export class ProductoService {
  private parseImageBase64(imagenBase64: string) {
    const match = imagenBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      throw new Error('Formato de imagen inválido');
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const ext = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
    return { ext, base64Data };
  }

  private async saveProductImage(imagenBase64: string) {
    const { ext, base64Data } = this.parseImageBase64(imagenBase64);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const imagePath = path.join(productoUploadsPath, filename);
    const buffer = Buffer.from(base64Data, 'base64');
    await fs.promises.writeFile(imagePath, buffer);
    return `${config.app.apiUrl}/uploads/productos/${filename}`;
  }
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
    const imagenBase64 = data.imagenBase64;
    const createData: any = { ...data };
    delete createData.imagenBase64;

    if (imagenBase64) {
      const imageUrl = await this.saveProductImage(imagenBase64);
      createData.cat_imagenes_producto = {
        create: {
          url: imageUrl,
          es_principal: true,
          orden: 0,
        },
      };
    }

    const producto = await prisma.cat_productos.create({ data: createData });

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

    const imagenBase64 = data.imagenBase64;
    const updateData: any = { ...data };
    delete updateData.imagenBase64;

    if (imagenBase64) {
      const imageUrl = await this.saveProductImage(imagenBase64);
      await prisma.cat_imagenes_producto.updateMany({
        where: { producto_id: id, es_principal: true },
        data: { es_principal: false },
      });

      updateData.cat_imagenes_producto = {
        create: {
          url: imageUrl,
          es_principal: true,
          orden: 0,
        },
      };
    }

    return prisma.cat_productos.update({ where: { id }, data: updateData });
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