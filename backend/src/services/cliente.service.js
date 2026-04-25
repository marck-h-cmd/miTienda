"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.clienteService = exports.ClienteService = void 0;
var database_1 = require("../config/database");
var errorHandler_1 = require("../middlewares/errorHandler");
var cliente_repo_1 = require("../repositories/cliente.repo");
var ClienteService = /** @class */ (function () {
    function ClienteService() {
    }
    ClienteService.prototype.listar = function (filtros) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, limit, busqueda, skip, where, _c, clientes, total;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = filtros.page, page = _a === void 0 ? 1 : _a, _b = filtros.limit, limit = _b === void 0 ? 20 : _b, busqueda = filtros.busqueda;
                        skip = (Number(page) - 1) * Number(limit);
                        where = {};
                        if (busqueda) {
                            where.OR = [
                                { nombre: { contains: busqueda, mode: 'insensitive' } },
                                { email: { contains: busqueda, mode: 'insensitive' } },
                            ];
                        }
                        return [4 /*yield*/, Promise.all([
                                cliente_repo_1.clienteRepo.findAll({ skip: skip, take: Number(limit), where: where }),
                                cliente_repo_1.clienteRepo.count(where),
                            ])];
                    case 1:
                        _c = _d.sent(), clientes = _c[0], total = _c[1];
                        return [2 /*return*/, { clientes: clientes, total: total, page: Number(page), limit: Number(limit) }];
                }
            });
        });
    };
    ClienteService.prototype.obtenerPorId = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var cliente;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cliente_repo_1.clienteRepo.findById(id)];
                    case 1:
                        cliente = _a.sent();
                        if (!cliente)
                            throw new errorHandler_1.NotFoundError('Cliente no encontrado');
                        return [2 /*return*/, cliente];
                }
            });
        });
    };
    ClienteService.prototype.obtenerPorUsuarioId = function (usuarioId) {
        return __awaiter(this, void 0, void 0, function () {
            var cliente;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cliente_repo_1.clienteRepo.findByUsuarioId(usuarioId)];
                    case 1:
                        cliente = _a.sent();
                        if (!cliente)
                            throw new errorHandler_1.NotFoundError('Cliente no encontrado');
                        return [2 /*return*/, cliente];
                }
            });
        });
    };
    ClienteService.prototype.actualizarPerfil = function (usuarioId, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, cliente_repo_1.clienteRepo.updateByUsuarioId(usuarioId, data)];
            });
        });
    };
    ClienteService.prototype.toggleActivo = function (clienteId, activo) {
        return __awaiter(this, void 0, void 0, function () {
            var cliente;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.obtenerPorId(clienteId)];
                    case 1:
                        cliente = _a.sent();
                        return [2 /*return*/, cliente_repo_1.clienteRepo.toggleActivo(cliente.usuario_id, activo)];
                }
            });
        });
    };
    ClienteService.prototype.obtenerDirecciones = function (usuarioId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, cliente_repo_1.clienteRepo.findDirecciones(usuarioId)];
            });
        });
    };
    ClienteService.prototype.crearDireccion = function (usuarioId, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, cliente_repo_1.clienteRepo.createDireccion(__assign(__assign({}, data), { usuario_id: usuarioId }))];
            });
        });
    };
    ClienteService.prototype.actualizarDireccion = function (direccionId, usuarioId, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, cliente_repo_1.clienteRepo.updateDireccion(direccionId, data)];
            });
        });
    };
    ClienteService.prototype.eliminarDireccion = function (direccionId, usuarioId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, cliente_repo_1.clienteRepo.deleteDireccion(direccionId)];
            });
        });
    };
    ClienteService.prototype.obtenerHistorialCompras = function (clienteId, filtros) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, limit, skip, where, _c, ordenes, total;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = filtros.page, page = _a === void 0 ? 1 : _a, _b = filtros.limit, limit = _b === void 0 ? 10 : _b;
                        skip = (Number(page) - 1) * Number(limit);
                        where = { cliente_id: clienteId };
                        return [4 /*yield*/, Promise.all([
                                database_1.default.ord_ordenes.findMany({
                                    where: where,
                                    skip: skip,
                                    take: Number(limit),
                                    orderBy: { fecha_pedido: 'desc' },
                                    include: { ord_items_orden: true },
                                }),
                                database_1.default.ord_ordenes.count({ where: where }),
                            ])];
                    case 1:
                        _c = _d.sent(), ordenes = _c[0], total = _c[1];
                        return [2 /*return*/, { ordenes: ordenes, total: total, page: Number(page), limit: Number(limit) }];
                }
            });
        });
    };
    ClienteService.prototype.obtenerListaDeseos = function (usuarioId) {
        return __awaiter(this, void 0, void 0, function () {
            var lista;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cliente_repo_1.clienteRepo.findListaDeseos(usuarioId)];
                    case 1:
                        lista = _a.sent();
                        if (!!lista) return [3 /*break*/, 3];
                        return [4 /*yield*/, cliente_repo_1.clienteRepo.createListaDeseos(usuarioId)];
                    case 2:
                        lista = _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, lista];
                }
            });
        });
    };
    ClienteService.prototype.agregarAListaDeseos = function (usuarioId, productoId) {
        return __awaiter(this, void 0, void 0, function () {
            var lista;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cliente_repo_1.clienteRepo.findListaDeseos(usuarioId)];
                    case 1:
                        lista = _a.sent();
                        if (!!lista) return [3 /*break*/, 3];
                        return [4 /*yield*/, cliente_repo_1.clienteRepo.createListaDeseos(usuarioId)];
                    case 2:
                        lista = _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, cliente_repo_1.clienteRepo.addToListaDeseos(lista.id, productoId)];
                }
            });
        });
    };
    ClienteService.prototype.eliminarDeListaDeseos = function (usuarioId, productoId) {
        return __awaiter(this, void 0, void 0, function () {
            var lista;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cliente_repo_1.clienteRepo.findListaDeseos(usuarioId)];
                    case 1:
                        lista = _a.sent();
                        if (!lista)
                            throw new errorHandler_1.NotFoundError('Lista de deseos no encontrada');
                        return [2 /*return*/, cliente_repo_1.clienteRepo.removeFromListaDeseos(lista.id, productoId)];
                }
            });
        });
    };
    return ClienteService;
}());
exports.ClienteService = ClienteService;
exports.clienteService = new ClienteService();
