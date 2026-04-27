import { favoritosRepo } from '../repositories/favoritos.repository';
import { NotFoundError, ConflictError } from '../middlewares/errorHandler';
import prisma from '../config/database';

export class FavoritosService {
  async obtenerFavoritos(usuarioId: string) {
    let lista = await favoritosRepo.findByUsuario(usuarioId);

    if (!lista) {
      lista = await favoritosRepo.create(usuarioId);
    }

    return lista;
  }

  async agregarProducto(usuarioId: string, productoId: string) {
    // Verificar que el producto exista y esté activo
    const producto = await prisma.cat_productos.findUnique({
      where: { id: productoId },
    });

    if (!producto || !producto.activo) {
      throw new NotFoundError('Producto no encontrado');
    }

    // Obtener o crear la lista
    let lista = await favoritosRepo.findByUsuario(usuarioId);
    if (!lista) {
      lista = await favoritosRepo.create(usuarioId);
    }

    // Verificar si ya está en favoritos
    const itemExistente = await favoritosRepo.findItem(lista.id, productoId);
    if (itemExistente) {
      throw new ConflictError('El producto ya está en favoritos');
    }

    await favoritosRepo.addItem(lista.id, productoId);

    return this.obtenerFavoritos(usuarioId);
  }

  async eliminarProducto(usuarioId: string, productoId: string) {
    const lista = await favoritosRepo.findByUsuario(usuarioId);
    if (!lista) throw new NotFoundError('Lista de favoritos no encontrada');

    const item = await favoritosRepo.findItem(lista.id, productoId);
    if (!item) throw new NotFoundError('Producto no encontrado en favoritos');

    await favoritosRepo.removeItem(lista.id, productoId);
  }

  async vaciarFavoritos(usuarioId: string) {
    const lista = await favoritosRepo.findByUsuario(usuarioId);
    if (!lista) throw new NotFoundError('Lista de favoritos no encontrada');

    await favoritosRepo.clearLista(lista.id);
  }
}

export const favoritosService = new FavoritosService();