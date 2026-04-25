"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutSchema = void 0;
var zod_1 = require("zod");
exports.checkoutSchema = zod_1.z.object({
    direccionEnvioId: zod_1.z.string().uuid('ID de dirección inválido'),
    metodoEnvioId: zod_1.z.string().uuid('ID de método de envío inválido'),
    cuponCodigo: zod_1.z.string().optional(),
});
