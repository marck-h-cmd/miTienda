"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearOrdenSchema = exports.checkoutSchema = void 0;
var zod_1 = require("zod");
exports.checkoutSchema = zod_1.z.object({
    direccionEnvioId: zod_1.z.string().uuid('ID de dirección inválido'),
    metodoEnvioId: zod_1.z.string().uuid('ID de método de envío inválido'),
    cuponCodigo: zod_1.z.string().optional(),
});
exports.crearOrdenSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        productoId: zod_1.z.string().uuid(),
        cantidad: zod_1.z.number().int().positive(),
    })),
    direccionEnvioId: zod_1.z.string().uuid(),
    metodoPago: zod_1.z.string(),
});
