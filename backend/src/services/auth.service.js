"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
var bcrypt_1 = require("bcrypt");
var database_1 = require("../config/database");
var jwt_1 = require("../utils/jwt");
var errorHandler_1 = require("../middlewares/errorHandler");
var logger_1 = require("../utils/logger");
var AuthService = /** @class */ (function () {
    function AuthService() {
    }
    AuthService.prototype.register = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var usuarioExistente, hashedPassword, rolCliente, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.seg_usuarios.findUnique({
                            where: { email: data.email },
                        })];
                    case 1:
                        usuarioExistente = _a.sent();
                        if (usuarioExistente) {
                            throw new errorHandler_1.ConflictError('El email ya está registrado');
                        }
                        return [4 /*yield*/, bcrypt_1.default.hash(data.password, 12)];
                    case 2:
                        hashedPassword = _a.sent();
                        return [4 /*yield*/, database_1.default.seg_roles.findFirst({
                                where: { nombre: 'CLIENTE' },
                            })];
                    case 3:
                        rolCliente = _a.sent();
                        if (!rolCliente) {
                            throw new errorHandler_1.AppError('Rol de cliente no encontrado', 500);
                        }
                        return [4 /*yield*/, database_1.default.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var usuario;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, tx.seg_usuarios.create({
                                                data: {
                                                    email: data.email,
                                                    password_hash: hashedPassword,
                                                    nombre: data.nombre,
                                                    apellido: data.apellido,
                                                    activo: true,
                                                },
                                            })];
                                        case 1:
                                            usuario = _a.sent();
                                            return [4 /*yield*/, tx.seg_usuario_rol.create({
                                                    data: {
                                                        usuario_id: usuario.id,
                                                        rol_id: rolCliente.id,
                                                    },
                                                })];
                                        case 2:
                                            _a.sent();
                                            return [4 /*yield*/, tx.cli_clientes.create({
                                                    data: {
                                                        usuario_id: usuario.id,
                                                        nombre: data.nombre,
                                                        apellido: data.apellido,
                                                        email: data.email,
                                                    },
                                                })];
                                        case 3:
                                            _a.sent();
                                            return [2 /*return*/, usuario];
                                    }
                                });
                            }); })];
                    case 4:
                        result = _a.sent();
                        logger_1.default.info("Usuario registrado: ".concat(data.email));
                        return [2 /*return*/, { id: result.id, email: result.email }];
                }
            });
        });
    };
    AuthService.prototype.login = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var usuario, passwordValida, roles, tokenPayload, accessToken, refreshToken;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.seg_usuarios.findUnique({
                            where: { email: data.email },
                            include: {
                                seg_usuario_rol: {
                                    include: {
                                        seg_roles: true,
                                    },
                                },
                            },
                        })];
                    case 1:
                        usuario = _a.sent();
                        if (!usuario || !usuario.activo) {
                            throw new errorHandler_1.UnauthorizedError('Credenciales inválidas');
                        }
                        return [4 /*yield*/, bcrypt_1.default.compare(data.password, usuario.password_hash)];
                    case 2:
                        passwordValida = _a.sent();
                        if (!passwordValida) {
                            throw new errorHandler_1.UnauthorizedError('Credenciales inválidas');
                        }
                        roles = usuario.seg_usuario_rol.map(function (ur) { return ur.seg_roles.nombre; });
                        tokenPayload = {
                            userId: usuario.id,
                            email: usuario.email,
                            roles: roles,
                        };
                        accessToken = (0, jwt_1.generateAccessToken)(tokenPayload);
                        refreshToken = (0, jwt_1.generateRefreshToken)(tokenPayload);
                        // Guardar refresh token
                        return [4 /*yield*/, database_1.default.seg_refresh_tokens.create({
                                data: {
                                    token: refreshToken,
                                    usuario_id: usuario.id,
                                    expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                                },
                            })];
                    case 3:
                        // Guardar refresh token
                        _a.sent();
                        logger_1.default.info("Usuario logueado: ".concat(data.email));
                        return [2 /*return*/, {
                                accessToken: accessToken,
                                refreshToken: refreshToken,
                                usuario: {
                                    id: usuario.id,
                                    email: usuario.email,
                                    nombre: usuario.nombre,
                                    apellido: usuario.apellido,
                                    roles: roles,
                                },
                            }];
                }
            });
        });
    };
    AuthService.prototype.refreshToken = function (refreshToken) {
        return __awaiter(this, void 0, void 0, function () {
            var storedToken, _a, verifyRefreshToken, generateAccessToken, generateRefreshToken, decoded, tokenPayload, newAccessToken, newRefreshToken;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, database_1.default.seg_refresh_tokens.findFirst({
                            where: {
                                token: refreshToken,
                                revocado: false,
                                expiracion: { gt: new Date() },
                            },
                        })];
                    case 1:
                        storedToken = _b.sent();
                        if (!storedToken) {
                            throw new errorHandler_1.UnauthorizedError('Refresh token inválido o expirado');
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/jwt'); })];
                    case 2:
                        _a = _b.sent(), verifyRefreshToken = _a.verifyRefreshToken, generateAccessToken = _a.generateAccessToken, generateRefreshToken = _a.generateRefreshToken;
                        decoded = verifyRefreshToken(refreshToken);
                        // Revocar token anterior
                        return [4 /*yield*/, database_1.default.seg_refresh_tokens.update({
                                where: { id: storedToken.id },
                                data: { revocado: true },
                            })];
                    case 3:
                        // Revocar token anterior
                        _b.sent();
                        tokenPayload = {
                            userId: decoded.userId,
                            email: decoded.email,
                            roles: decoded.roles,
                        };
                        newAccessToken = generateAccessToken(tokenPayload);
                        newRefreshToken = generateRefreshToken(tokenPayload);
                        // Guardar nuevo refresh token
                        return [4 /*yield*/, database_1.default.seg_refresh_tokens.create({
                                data: {
                                    token: newRefreshToken,
                                    usuario_id: decoded.userId,
                                    expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                                },
                            })];
                    case 4:
                        // Guardar nuevo refresh token
                        _b.sent();
                        return [2 /*return*/, {
                                accessToken: newAccessToken,
                                refreshToken: newRefreshToken,
                            }];
                }
            });
        });
    };
    AuthService.prototype.logout = function (refreshToken) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.seg_refresh_tokens.updateMany({
                            where: { token: refreshToken },
                            data: { revocado: true },
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return AuthService;
}());
exports.AuthService = AuthService;
exports.authService = new AuthService();
