import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from './errorHandler';

export enum Role {
  CLIENTE = 'CLIENTE',
  ADMINISTRADOR = 'ADMINISTRADOR',
  GERENTE_VENTAS = 'GERENTE_VENTAS',
  GERENTE_INVENTARIO = 'GERENTE_INVENTARIO',
  VENDEDOR = 'VENDEDOR',
}

export enum Accion {
  LEER = 'LEER',
  CREAR = 'CREAR',
  EDITAR = 'EDITAR',
  ELIMINAR = 'ELIMINAR',
  APROBAR = 'APROBAR',
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const userRoles = req.user.roles as Role[];
    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenError('No tienes permisos para realizar esta acción');
    }

    next();
  };
}

export function requirePermission(modulo: string, accion: Accion) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    // Verificar permisos desde la base de datos
    const prisma = (await import('../config/database')).default;
    
    const tienePermiso = await prisma.seg_usuarios.findFirst({
      where: {
        id: req.user.userId,
        seg_usuario_rol: {
          some: {
            seg_roles: {
              seg_rol_permiso: {
                some: {
                  seg_permisos: {
                    modulo,
                    accion,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tienePermiso) {
      throw new ForbiddenError(
        `No tienes permiso para ${accion.toLowerCase()} en el módulo ${modulo}`
      );
    }

    next();
  };
}