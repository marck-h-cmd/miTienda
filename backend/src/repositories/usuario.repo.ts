import prisma from '../config/database';

export class UsuarioRepository {
  async findByEmail(email: string) {
    return prisma.seg_usuarios.findUnique({
      where: { email },
      include: {
        seg_usuario_rol: {
          include: { seg_roles: true },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.seg_usuarios.findUnique({
      where: { id },
      include: {
        seg_usuario_rol: {
          include: { seg_roles: true },
        },
      },
    });
  }

  async create(data: { email: string; password_hash: string; nombre: string; apellido: string }) {
    return prisma.seg_usuarios.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.seg_usuarios.update({ where: { id }, data });
  }

  async createRefreshToken(data: { token: string; usuario_id: string; expiracion: Date }) {
    return prisma.seg_refresh_tokens.create({ data });
  }

  async findRefreshToken(token: string) {
    return prisma.seg_refresh_tokens.findFirst({
      where: { token, revocado: false, expiracion: { gt: new Date() } },
    });
  }

  async revokeRefreshToken(id: string) {
    return prisma.seg_refresh_tokens.update({
      where: { id },
      data: { revocado: true },
    });
  }

  async revokeAllUserTokens(usuarioId: string) {
    return prisma.seg_refresh_tokens.updateMany({
      where: { usuario_id: usuarioId, revocado: false },
      data: { revocado: true },
    });
  }

  async assignRole(usuarioId: string, rolId: string) {
    return prisma.seg_usuario_rol.create({
      data: { usuario_id: usuarioId, rol_id: rolId },
    });
  }

  async findRoleByName(nombre: string) {
    return prisma.seg_roles.findFirst({ where: { nombre } });
  }
}

export const usuarioRepo = new UsuarioRepository();