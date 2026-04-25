import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class OrdenRepository {
  async create(data: Prisma.ord_ordenesCreateInput) {
    return prisma.ord_ordenes.create({ data });
  }

  async findById(id: string, include?: Prisma.ord_ordenesInclude) {
    return prisma.ord_ordenes.findUnique({ where: { id }, include });
  }

  async findByCliente(clienteId: string, options: { skip?: number; take?: number }) {
    return prisma.ord_ordenes.findMany({
      where: { cliente_id: clienteId },
      skip: options.skip,
      take: options.take,
      orderBy: { fecha_pedido: 'desc' },
      include: {
        ord_items_orden: true,
        ord_historial_estados: true,
      },
    });
  }

  async countByCliente(clienteId: string) {
    return prisma.ord_ordenes.count({ where: { cliente_id: clienteId } });
  }

  async findAll(options: {
    skip?: number;
    take?: number;
    where?: Prisma.ord_ordenesWhereInput;
    orderBy?: Prisma.ord_ordenesOrderByWithRelationInput;
  }) {
    return prisma.ord_ordenes.findMany({
      ...options,
      include: {
        ord_items_orden: true,
        seg_usuarios: { select: { nombre: true, apellido: true, email: true } },
        ord_historial_estados: { orderBy: { fecha_cambio: 'desc' }, take: 1 },
      },
    });
  }

  async count(where?: Prisma.ord_ordenesWhereInput) {
    return prisma.ord_ordenes.count({ where });
  }

  async updateEstado(id: string, estado: string) {
    return prisma.ord_ordenes.update({
      where: { id },
      data: { estado, fecha_actualizacion: new Date() },
    });
  }

  async update(id: string, data: Prisma.ord_ordenesUpdateInput) {
    return prisma.ord_ordenes.update({ where: { id }, data });
  }

  async addHistorialEstado(data: {
    orden_id: string;
    estado_anterior?: string;
    estado_nuevo: string;
    comentario?: string;
    usuario_id?: string;
  }) {
    return prisma.ord_historial_estados.create({ data });
  }

  async crearTransaccionPago(data: Prisma.ord_transacciones_pagoCreateInput) {
    return prisma.ord_transacciones_pago.create({ data });
  }

  async actualizarTransaccionPago(id: string, data: Prisma.ord_transacciones_pagoUpdateInput) {
    return prisma.ord_transacciones_pago.update({ where: { id }, data });
  }

  async crearItemsOrden(items: Prisma.ord_items_ordenCreateManyInput[]) {
    return prisma.ord_items_orden.createMany({ data: items });
  }
}

export const ordenRepo = new OrdenRepository();
