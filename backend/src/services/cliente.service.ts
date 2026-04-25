import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../middlewares/errorHandler';
import { clienteRepo } from '../repositories/cliente.repo';

export class ClienteService {
  async listar(filtros: any) {
    const { page = 1, limit = 20, busqueda } = filtros;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { email: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    const [clientes, total] = await Promise.all([
      clienteRepo.findAll({ skip, take: Number(limit), where }),
      clienteRepo.count(where),
    ]);

    return { clientes, total, page: Number(page), limit: Number(limit) };
  }

  async obtenerPorId(id: string) {
    const cliente = await clienteRepo.findById(id);
    if (!cliente) throw new NotFoundError('Cliente no encontrado');
    return cliente;
  }

  async obtenerPorUsuarioId(usuarioId: string) {
    const cliente = await clienteRepo.findByUsuarioId(usuarioId);
    if (!cliente) throw new NotFoundError('Cliente no encontrado');
    return cliente;
  }

  async actualizarPerfil(usuarioId: string, data: any) {
    return clienteRepo.updateByUsuarioId(usuarioId, data);
  }

  async toggleActivo(clienteId: string, activo: boolean) {
    const cliente = await this.obtenerPorId(clienteId);
    return clienteRepo.toggleActivo(cliente.usuario_id, activo);
  }

  async obtenerDirecciones(usuarioId: string) {
    return clienteRepo.findDirecciones(usuarioId);
  }

  async crearDireccion(usuarioId: string, data: any) {
    return clienteRepo.createDireccion({ ...data, usuario_id: usuarioId });
  }

  async actualizarDireccion(direccionId: string, usuarioId: string, data: any) {
    return clienteRepo.updateDireccion(direccionId, data);
  }

  async eliminarDireccion(direccionId: string, usuarioId: string) {
    return clienteRepo.deleteDireccion(direccionId);
  }

  async obtenerHistorialCompras(clienteId: string, filtros: any) {
    const { page = 1, limit = 10 } = filtros;
    const skip = (Number(page) - 1) * Number(limit);

    const where = { cliente_id: clienteId };
    const [ordenes, total] = await Promise.all([
      prisma.ord_ordenes.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { fecha_pedido: 'desc' },
        include: { ord_items_orden: true },
      }),
      prisma.ord_ordenes.count({ where }),
    ]);

    return { ordenes, total, page: Number(page), limit: Number(limit) };
  }

  async obtenerListaDeseos(usuarioId: string) {
    let lista = await clienteRepo.findListaDeseos(usuarioId);
    if (!lista) {
      lista = await clienteRepo.createListaDeseos(usuarioId);
    }
    return lista;
  }

  async agregarAListaDeseos(usuarioId: string, productoId: string) {
    let lista = await clienteRepo.findListaDeseos(usuarioId);
    if (!lista) {
      lista = await clienteRepo.createListaDeseos(usuarioId);
    }
    return clienteRepo.addToListaDeseos(lista.id, productoId);
  }

  async eliminarDeListaDeseos(usuarioId: string, productoId: string) {
    const lista = await clienteRepo.findListaDeseos(usuarioId);
    if (!lista) throw new NotFoundError('Lista de deseos no encontrada');
    return clienteRepo.removeFromListaDeseos(lista.id, productoId);
  }
}

export const clienteService = new ClienteService();