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
exports.clienteController = exports.ClienteController = void 0;
var cliente_service_1 = require("../services/cliente.service");
var response_1 = require("../utils/response");
var ClienteController = /** @class */ (function () {
    function ClienteController() {
    }
    ClienteController.prototype.listar = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, cliente_service_1.clienteService.listar(req.query)];
                    case 1:
                        result = _a.sent();
                        (0, response_1.sendPaginated)(res, result.clientes, result.total, result.page, result.limit);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        next(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ClienteController.prototype.obtener = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var cliente, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, cliente_service_1.clienteService.obtenerPorId(req.params.id)];
                    case 1:
                        cliente = _a.sent();
                        (0, response_1.sendSuccess)(res, cliente);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        next(error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ClienteController.prototype.obtenerPerfil = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var cliente, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, cliente_service_1.clienteService.obtenerPorUsuarioId(req.user.userId)];
                    case 1:
                        cliente = _a.sent();
                        (0, response_1.sendSuccess)(res, cliente);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        next(error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ClienteController.prototype.actualizarPerfil = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var cliente, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, cliente_service_1.clienteService.actualizarPerfil(req.user.userId, req.body)];
                    case 1:
                        cliente = _a.sent();
                        (0, response_1.sendSuccess)(res, cliente, 'Perfil actualizado');
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        next(error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ClienteController.prototype.obtenerDirecciones = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var direcciones, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, cliente_service_1.clienteService.obtenerDirecciones(req.user.userId)];
                    case 1:
                        direcciones = _a.sent();
                        (0, response_1.sendSuccess)(res, direcciones);
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        next(error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ClienteController.prototype.crearDireccion = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var direccion, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, cliente_service_1.clienteService.crearDireccion(req.user.userId, req.body)];
                    case 1:
                        direccion = _a.sent();
                        res.status(201).json({ success: true, data: direccion, message: 'Dirección creada' });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        next(error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ClienteController.prototype.actualizarDireccion = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var direccion, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, cliente_service_1.clienteService.actualizarDireccion(req.params.direccionId, req.user.userId, req.body)];
                    case 1:
                        direccion = _a.sent();
                        (0, response_1.sendSuccess)(res, direccion, 'Dirección actualizada');
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        next(error_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ClienteController.prototype.eliminarDireccion = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, cliente_service_1.clienteService.eliminarDireccion(req.params.direccionId, req.user.userId)];
                    case 1:
                        _a.sent();
                        (0, response_1.sendSuccess)(res, null, 'Dirección eliminada');
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        next(error_8);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ClienteController.prototype.obtenerHistorialCompras = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, cliente_service_1.clienteService.obtenerHistorialCompras(req.params.id, req.query)];
                    case 1:
                        result = _a.sent();
                        (0, response_1.sendPaginated)(res, result.ordenes, result.total, result.page, result.limit);
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        next(error_9);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ClienteController.prototype.toggleActivo = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, cliente_service_1.clienteService.toggleActivo(req.params.id, req.body.activo)];
                    case 1:
                        _a.sent();
                        (0, response_1.sendSuccess)(res, null, 'Estado del cliente actualizado');
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        next(error_10);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ClienteController.prototype.obtenerListaDeseos = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var lista, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, cliente_service_1.clienteService.obtenerListaDeseos(req.user.userId)];
                    case 1:
                        lista = _a.sent();
                        (0, response_1.sendSuccess)(res, lista);
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _a.sent();
                        next(error_11);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ClienteController.prototype.agregarAListaDeseos = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, cliente_service_1.clienteService.agregarAListaDeseos(req.user.userId, req.body.producto_id)];
                    case 1:
                        _a.sent();
                        res.status(201).json({ success: true, message: 'Producto agregado a la lista de deseos' });
                        return [3 /*break*/, 3];
                    case 2:
                        error_12 = _a.sent();
                        next(error_12);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ClienteController.prototype.eliminarDeListaDeseos = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, cliente_service_1.clienteService.eliminarDeListaDeseos(req.user.userId, req.params.productoId)];
                    case 1:
                        _a.sent();
                        (0, response_1.sendSuccess)(res, null, 'Producto eliminado de la lista de deseos');
                        return [3 /*break*/, 3];
                    case 2:
                        error_13 = _a.sent();
                        next(error_13);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ClienteController;
}());
exports.ClienteController = ClienteController;
exports.clienteController = new ClienteController();
