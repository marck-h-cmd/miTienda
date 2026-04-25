import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '../utils/jwt';
import { AppError, ConflictError, NotFoundError, UnauthorizedError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

interface RegisterDTO {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterDTO) {
    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.seg_usuarios.findUnique({
      where: { email: data.email },
    });

    if (usuarioExistente) {
      throw new ConflictError('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Obtener rol de cliente
    const rolCliente = await prisma.seg_roles.findFirst({
      where: { nombre: 'CLIENTE' },
    });

    if (!rolCliente) {
      throw new AppError('Rol de cliente no encontrado', 500);
    }

    // Crear usuario y cliente en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const usuario = await tx.seg_usuarios.create({
        data: {
          email: data.email,
          password_hash: hashedPassword,
          nombre: data.nombre,
          apellido: data.apellido,
          activo: true,
        },
      });

      await tx.seg_usuario_rol.create({
        data: {
          usuario_id: usuario.id,
          rol_id: rolCliente.id,
        },
      });

      await tx.cli_clientes.create({
        data: {
          usuario_id: usuario.id,
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
        },
      });

      return usuario;
    });

    logger.info(`Usuario registrado: ${data.email}`);
    return { id: result.id, email: result.email };
  }

  async login(data: LoginDTO) {
    const usuario = await prisma.seg_usuarios.findUnique({
      where: { email: data.email },
      include: {
        seg_usuario_rol: {
          include: {
            seg_roles: true,
          },
        },
      },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(data.password, usuario.password_hash);
    if (!passwordValida) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const roles = usuario.seg_usuario_rol.map((ur) => ur.seg_roles.nombre);

    const tokenPayload: TokenPayload = {
      userId: usuario.id,
      email: usuario.email,
      roles,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Guardar refresh token
    await prisma.seg_refresh_tokens.create({
      data: {
        token: refreshToken,
        usuario_id: usuario.id,
        expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    logger.info(`Usuario logueado: ${data.email}`);
    return {
      accessToken,
      refreshToken,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        roles,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    // Verificar que el token existe en la BD
    const storedToken = await prisma.seg_refresh_tokens.findFirst({
      where: {
        token: refreshToken,
        revocado: false,
        expiracion: { gt: new Date() },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token inválido o expirado');
    }

    const { verifyRefreshToken, generateAccessToken, generateRefreshToken } = await import('../utils/jwt');
    const decoded = verifyRefreshToken(refreshToken);

    // Revocar token anterior
    await prisma.seg_refresh_tokens.update({
      where: { id: storedToken.id },
      data: { revocado: true },
    });

    // Generar nuevos tokens
    const tokenPayload: TokenPayload = {
      userId: decoded.userId,
      email: decoded.email,
      roles: decoded.roles,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Guardar nuevo refresh token
    await prisma.seg_refresh_tokens.create({
      data: {
        token: newRefreshToken,
        usuario_id: decoded.userId,
        expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    await prisma.seg_refresh_tokens.updateMany({
      where: { token: refreshToken },
      data: { revocado: true },
    });
  }
}

export const authService = new AuthService();