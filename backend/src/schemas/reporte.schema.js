"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reporteFacturaSchema = exports.filtroReporteOrdenesSchema = exports.filtroFechasSchema = void 0;
var zod_1 = require("zod");
exports.filtroFechasSchema = zod_1.z.object({
    fecha_inicio: zod_1.z.string().optional(),
    fecha_fin: zod_1.z.string().optional(),
});
exports.filtroReporteOrdenesSchema = zod_1.z.object({
    fecha_inicio: zod_1.z.string().optional(),
    fecha_fin: zod_1.z.string().optional(),
    estado: zod_1.z.string().optional(),
});
exports.reporteFacturaSchema = zod_1.z.object({
    ordenId: zod_1.z.string().uuid('ID de orden inválido'),
});
