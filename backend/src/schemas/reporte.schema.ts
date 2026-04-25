import { z } from 'zod';

export const filtroFechasSchema = z.object({
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
});

export const filtroReporteOrdenesSchema = z.object({
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  estado: z.string().optional(),
});

export const reporteFacturaSchema = z.object({
  ordenId: z.string().uuid('ID de orden inválido'),
});