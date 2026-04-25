"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filtroOrdenesCompraSchema = exports.filtroProveedoresSchema = exports.filtroMovimientosSchema = exports.filtroStockSchema = exports.crearOrdenCompraSchema = exports.actualizarProveedorSchema = exports.crearProveedorSchema = exports.ajusteInventarioSchema = exports.ajusteStockSchema = void 0;
var zod_1 = require("zod");
exports.ajusteStockSchema = zod_1.z.object({
    producto_id: zod_1.z.string().uuid('ID de producto inválido'),
    cantidad: zod_1.z.number().int('La cantidad debe ser un número entero'),
    tipo: zod_1.z.enum(['positivo', 'negativo'], {
        errorMap: function () { return ({ message: 'El tipo debe ser positivo o negativo' }); },
    }),
    motivo: zod_1.z.string().min(5, 'El motivo debe tener al menos 5 caracteres'),
});
exports.ajusteInventarioSchema = zod_1.z.object({
    motivo: zod_1.z.string().min(5, 'El motivo debe tener al menos 5 caracteres'),
    detalles: zod_1.z.array(zod_1.z.object({
        producto_id: zod_1.z.string().uuid('ID de producto inválido'),
        cantidad: zod_1.z.number().int().positive('La cantidad debe ser positiva'),
        tipo: zod_1.z.enum(['positivo', 'negativo']),
    })).min(1, 'Debe incluir al menos un detalle'),
});
exports.crearProveedorSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    ruc: zod_1.z.string().optional(),
    contacto: zod_1.z.string().optional(),
    telefono: zod_1.z.string().optional(),
    email: zod_1.z.string().email('Email inválido').optional().or(zod_1.z.literal('')),
    direccion: zod_1.z.string().optional(),
});
exports.actualizarProveedorSchema = exports.crearProveedorSchema.partial();
exports.crearOrdenCompraSchema = zod_1.z.object({
    proveedor_id: zod_1.z.string().uuid('ID de proveedor inválido'),
    detalles: zod_1.z.array(zod_1.z.object({
        producto_id: zod_1.z.string().uuid('ID de producto inválido'),
        cantidad: zod_1.z.number().int().positive('La cantidad debe ser positiva'),
        precio_unitario: zod_1.z.number().positive('El precio debe ser positivo'),
    })).min(1, 'Debe incluir al menos un detalle'),
});
exports.filtroStockSchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1'),
    limit: zod_1.z.string().optional().default('20'),
    stock_bajo: zod_1.z.string().optional(),
    producto_id: zod_1.z.string().optional(),
});
exports.filtroMovimientosSchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1'),
    limit: zod_1.z.string().optional().default('20'),
});
exports.filtroProveedoresSchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1'),
    limit: zod_1.z.string().optional().default('20'),
});
exports.filtroOrdenesCompraSchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1'),
    limit: zod_1.z.string().optional().default('20'),
});
