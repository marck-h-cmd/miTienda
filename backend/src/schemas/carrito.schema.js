"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aplicarCuponSchema = exports.actualizarItemSchema = exports.agregarItemSchema = void 0;
var zod_1 = require("zod");
exports.agregarItemSchema = zod_1.z.object({
    producto_id: zod_1.z.string().uuid(),
    cantidad: zod_1.z.number().int().positive(),
});
exports.actualizarItemSchema = zod_1.z.object({
    cantidad: zod_1.z.number().int().positive(),
});
exports.aplicarCuponSchema = zod_1.z.object({
    codigo: zod_1.z.string().min(3),
});
