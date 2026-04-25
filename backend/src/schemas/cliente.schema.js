"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filtroClienteSchema = exports.listaDeseosSchema = exports.toggleActivoSchema = exports.actualizarDireccionSchema = exports.crearDireccionSchema = exports.actualizarPerfilSchema = void 0;
var zod_1 = require("zod");
exports.actualizarPerfilSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(2).optional(),
    apellido: zod_1.z.string().min(2).optional(),
    telefono: zod_1.z.string().optional(),
    fecha_nacimiento: zod_1.z.string().optional(),
    genero: zod_1.z.enum(['M', 'F', 'Otro']).optional(),
});
exports.crearDireccionSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(2, 'El nombre es requerido'),
    apellido: zod_1.z.string().min(2, 'El apellido es requerido'),
    direccion: zod_1.z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
    ciudad: zod_1.z.string().min(2, 'La ciudad es requerida'),
    departamento: zod_1.z.string().min(2, 'El departamento es requerido'),
    codigo_postal: zod_1.z.string().optional(),
    telefono: zod_1.z.string().min(6, 'El teléfono es requerido'),
    es_principal: zod_1.z.boolean().optional().default(false),
});
exports.actualizarDireccionSchema = exports.crearDireccionSchema.partial();
exports.toggleActivoSchema = zod_1.z.object({
    activo: zod_1.z.boolean(),
});
exports.listaDeseosSchema = zod_1.z.object({
    producto_id: zod_1.z.string().uuid('ID de producto inválido'),
});
exports.filtroClienteSchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1'),
    limit: zod_1.z.string().optional().default('20'),
    busqueda: zod_1.z.string().optional(),
    segmento: zod_1.z.enum(['nuevos', 'recurrentes', 'inactivos', 'vip']).optional(),
});
