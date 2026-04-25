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
exports.Accion = exports.Role = void 0;
exports.requireRole = requireRole;
exports.requirePermission = requirePermission;
var errorHandler_1 = require("./errorHandler");
var Role;
(function (Role) {
    Role["CLIENTE"] = "CLIENTE";
    Role["ADMINISTRADOR"] = "ADMINISTRADOR";
    Role["GERENTE_VENTAS"] = "GERENTE_VENTAS";
    Role["GERENTE_INVENTARIO"] = "GERENTE_INVENTARIO";
    Role["VENDEDOR"] = "VENDEDOR";
})(Role || (exports.Role = Role = {}));
var Accion;
(function (Accion) {
    Accion["LEER"] = "LEER";
    Accion["CREAR"] = "CREAR";
    Accion["EDITAR"] = "EDITAR";
    Accion["ELIMINAR"] = "ELIMINAR";
    Accion["APROBAR"] = "APROBAR";
})(Accion || (exports.Accion = Accion = {}));
function requireRole() {
    var roles = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        roles[_i] = arguments[_i];
    }
    return function (req, res, next) {
        if (!req.user) {
            throw new errorHandler_1.UnauthorizedError('Usuario no autenticado');
        }
        var userRoles = req.user.roles;
        var hasRole = roles.some(function (role) { return userRoles.includes(role); });
        if (!hasRole) {
            throw new errorHandler_1.ForbiddenError('No tienes permisos para realizar esta acción');
        }
        next();
    };
}
function requirePermission(modulo, accion) {
    var _this = this;
    return function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var prisma, tienePermiso;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.user) {
                        throw new errorHandler_1.UnauthorizedError('Usuario no autenticado');
                    }
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../config/database'); })];
                case 1:
                    prisma = (_a.sent()).default;
                    return [4 /*yield*/, prisma.seg_usuarios.findFirst({
                            where: {
                                id: req.user.userId,
                                seg_usuario_rol: {
                                    some: {
                                        seg_roles: {
                                            seg_rol_permiso: {
                                                some: {
                                                    seg_permisos: {
                                                        modulo: modulo,
                                                        accion: accion,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        })];
                case 2:
                    tienePermiso = _a.sent();
                    if (!tienePermiso) {
                        throw new errorHandler_1.ForbiddenError("No tienes permiso para ".concat(accion.toLowerCase(), " en el m\u00F3dulo ").concat(modulo));
                    }
                    next();
                    return [2 /*return*/];
            }
        });
    }); };
}
