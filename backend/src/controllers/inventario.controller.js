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
exports.inventarioController = exports.InventarioController = void 0;
var inventario_service_1 = require("../services/inventario.service");
var response_1 = require("../utils/response");
var InventarioController = /** @class */ (function () {
    function InventarioController() {
    }
    InventarioController.prototype.obtenerStock = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, inventario_service_1.inventarioService.obtenerStock(req.query)];
                    case 1:
                        result = _a.sent();
                        (0, response_1.sendPaginated)(res, result.stock, result.total, result.page, result.limit);
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
    InventarioController.prototype.obtenerStockPorProducto = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var stock, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, inventario_service_1.inventarioService.obtenerStockPorProducto(req.params.productoId)];
                    case 1:
                        stock = _a.sent();
                        (0, response_1.sendSuccess)(res, stock);
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
    InventarioController.prototype.obtenerMovimientos = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, inventario_service_1.inventarioService.obtenerMovimientos(req.params.productoId, req.query)];
                    case 1:
                        result = _a.sent();
                        (0, response_1.sendPaginated)(res, result.movimientos, result.total, result.page, result.limit);
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
    InventarioController.prototype.ajustarStock = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var data, resultado, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        data = __assign(__assign({}, req.body), { usuario_id: req.user.userId });
                        return [4 /*yield*/, inventario_service_1.inventarioService.ajustarStock(data)];
                    case 1:
                        resultado = _a.sent();
                        (0, response_1.sendSuccess)(res, resultado, 'Stock ajustado exitosamente');
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
    InventarioController.prototype.crearAjusteInventario = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var ajuste, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, inventario_service_1.inventarioService.crearAjusteInventario(__assign(__assign({}, req.body), { usuario_id: req.user.userId }))];
                    case 1:
                        ajuste = _a.sent();
                        res.status(201).json({ success: true, data: ajuste, message: 'Ajuste de inventario creado' });
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
    InventarioController.prototype.listarProveedores = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, inventario_service_1.inventarioService.listarProveedores(req.query)];
                    case 1:
                        result = _a.sent();
                        (0, response_1.sendPaginated)(res, result.proveedores, result.total, result.page, result.limit);
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
    InventarioController.prototype.crearProveedor = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var proveedor, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, inventario_service_1.inventarioService.crearProveedor(req.body)];
                    case 1:
                        proveedor = _a.sent();
                        res.status(201).json({ success: true, data: proveedor, message: 'Proveedor creado' });
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
    InventarioController.prototype.actualizarProveedor = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var proveedor, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, inventario_service_1.inventarioService.actualizarProveedor(req.params.id, req.body)];
                    case 1:
                        proveedor = _a.sent();
                        (0, response_1.sendSuccess)(res, proveedor, 'Proveedor actualizado');
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
    InventarioController.prototype.eliminarProveedor = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, inventario_service_1.inventarioService.eliminarProveedor(req.params.id)];
                    case 1:
                        _a.sent();
                        (0, response_1.sendSuccess)(res, null, 'Proveedor desactivado');
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
    InventarioController.prototype.crearOrdenCompra = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var orden, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, inventario_service_1.inventarioService.crearOrdenCompra(req.body)];
                    case 1:
                        orden = _a.sent();
                        res.status(201).json({ success: true, data: orden, message: 'Orden de compra creada' });
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
    InventarioController.prototype.listarOrdenesCompra = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, inventario_service_1.inventarioService.listarOrdenesCompra(req.query)];
                    case 1:
                        result = _a.sent();
                        (0, response_1.sendPaginated)(res, result.ordenes, result.total, result.page, result.limit);
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
    InventarioController.prototype.recibirOrdenCompra = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var recepcion, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, inventario_service_1.inventarioService.recibirOrdenCompra(req.params.id, req.user.userId)];
                    case 1:
                        recepcion = _a.sent();
                        (0, response_1.sendSuccess)(res, recepcion, 'Recepción registrada exitosamente');
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
    InventarioController.prototype.productosStockBajo = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var productos, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, inventario_service_1.inventarioService.productosStockBajo()];
                    case 1:
                        productos = _a.sent();
                        (0, response_1.sendSuccess)(res, productos);
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
    return InventarioController;
}());
exports.InventarioController = InventarioController;
exports.inventarioController = new InventarioController();
