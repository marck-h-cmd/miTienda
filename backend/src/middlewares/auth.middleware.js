"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.optionalAuth = optionalAuth;
var jwt_1 = require("../utils/jwt");
var errorHandler_1 = require("./errorHandler");
function authenticate(req, res, next) {
    try {
        var authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.UnauthorizedError('Token no proporcionado');
        }
        var token = authHeader.split(' ')[1];
        var decoded = (0, jwt_1.verifyAccessToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_1.UnauthorizedError) {
            next(error);
        }
        else {
            next(new errorHandler_1.UnauthorizedError('Token inválido o expirado'));
        }
    }
}
function optionalAuth(req, res, next) {
    try {
        var authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            var token = authHeader.split(' ')[1];
            var decoded = (0, jwt_1.verifyAccessToken)(token);
            req.user = decoded;
        }
        next();
    }
    catch (error) {
        // Si el token es inválido, simplemente continuar sin usuario
        next();
    }
}
