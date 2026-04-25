import prisma from '../config/database';

export class ClienteRepository {
  async findAll(options: { skip?: number; take?: number; where?: any }) {
    return prisma.cli_clientes.findMany({
      ...options,
      include: {
        seg_usuarios: { select: { email: true, activo: true, created_at: true } },
      },
    });
  }

  async count(where?: any) {
    return prisma.cli_clientes.count({ where });
  }

  async findById(id: string) {
    return prisma.cli_clientes.findUnique({
      where: { id },
      include: {
        seg_usuarios: { select: { email: true, activo: true, email_verificado: true } },
      },
    });
  }

  async findByUsuarioId(usuarioId: string) {
    return prisma.cli_clientes.findUnique({
      where: { usuario_id: usuarioId },
      include: {
        seg_usuarios: { select: { email: true } },
      },
    });
  }

  async updateByUsuarioId(usuarioId: string, data: any) {
    return prisma.cli_clientes.update({
      where: { usuario_id: usuarioId },
      data,
    });
  }

  async toggleActivo(id: string, activo: boolean) {
    return prisma.seg_usuarios.update({
      where: { id },
      data: { activo },
    });
  }

  async findDirecciones(usuarioId: string) {
    return prisma.cli_direcciones.findMany({
      where: { usuario_id: usuarioId },
    });
  }

  async createDireccion(data: any) {
    return prisma.cli_direcciones.create({ data });
  }

  async updateDireccion(id: string, data: any) {
    return prisma.cli_direcciones.update({ where: { id }, data });
  }

  async deleteDireccion(id: string) {
    return prisma.cli_direcciones.delete({ where: { id } });
  }

  async findListaDeseos(usuarioId: string) {
    return prisma.cli_lista_deseos.findUnique({
      where: { usuario_id: usuarioId },
      include: {
        cli_items_lista_deseos: {
          include: {
            cat_productos: {
              include: {
                cat_imagenes_producto: { where: { es_principal: true }, take: 1 },
              },
            },
          },
        },
      },
    });
  }

  async createListaDeseos(usuarioId: string) {
    return prisma.cli_lista_deseos.create({
      data: { usuario_id: usuarioId },
      include: {
        cli_items_lista_deseos: {
          include: {
            cat_productos: {
              include: {
                cat_imagenes_producto: { where: { es_principal: true }, take: 1 },
              },
            },
          },
        },
      },
    });
  }

  async addToListaDeseos(listaId: string, productoId: string) {
    return prisma.cli_items_lista_deseos.create({
      data: { lista_id: listaId, producto_id: productoId },
    });
  }

  async removeFromListaDeseos(listaId: string, productoId: string) {
    return prisma.cli_items_lista_deseos.deleteMany({
      where: { lista_id: listaId, producto_id: productoId },
    });
  }
}

export const clienteRepo = new ClienteRepository();
