"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filtroProductoSchema = exports.actualizarProductoSchema = exports.crearProductoSchema = void 0;
var zod_1 = require("zod");
exports.crearProductoSchema = zod_1.z.object({
    sku: zod_1.z.string().min(3),
    nombre: zod_1.z.string().min(3),
    descripcion_corta: zod_1.z.string().optional(),
    descripcion_larga: zod_1.z.string().optional(),
    categoria_id: zod_1.z.string().uuid(),
    subcategoria_id: zod_1.z.string().uuid().optional(),
    marca_id: zod_1.z.string().uuid().optional(),
    unidad_medida_id: zod_1.z.string().uuid().optional(),
    precio_costo: zod_1.z.number().positive(),
    precio_venta: zod_1.z.number().positive(),
    precio_oferta: zod_1.z.number().positive().optional(),
    peso: zod_1.z.number().positive().optional(),
    stock_minimo: zod_1.z.number().int().positive().default(5),
    estado: zod_1.z.enum(['activo', 'inactivo', 'borrador']).default('activo'),
});
exports.actualizarProductoSchema = exports.crearProductoSchema.partial();
exports.filtroProductoSchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1'),
    limit: zod_1.z.string().optional().default('12'),
    categoria: zod_1.z.string().optional(),
    marca: zod_1.z.string().optional(),
    precio_min: zod_1.z.string().optional(),
    precio_max: zod_1.z.string().optional(),
    busqueda: zod_1.z.string().optional(),
    ordenar_por: zod_1.z.enum(['nombre', 'precio', 'fecha', 'popularidad']).optional(),
});
