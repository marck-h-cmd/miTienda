"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutLimiter = exports.authLimiter = exports.generalLimiter = void 0;
var express_rate_limit_1 = require("express-rate-limit");
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 peticiones por ventana
    message: {
        success: false,
        message: 'Demasiadas peticiones, intenta de nuevo más tarde',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Demasiados intentos de autenticación',
    },
});
exports.checkoutLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: 'Demasiadas solicitudes de pago, espera un momento',
    },
});
