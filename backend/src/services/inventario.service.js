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
exports.inventarioService = exports.InventarioService = void 0;
var database_1 = require("../config/database");
var errorHandler_1 = require("../middlewares/errorHandler");
var inventario_repo_1 = require("../repositories/inventario.repo");
var InventarioService = /** @class */ (function () {
    function InventarioService() {
    }
    InventarioService.prototype.obtenerStock = function (filtros) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, limit, stock_bajo, skip, where, _c, stock, total;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = filtros.page, page = _a === void 0 ? 1 : _a, _b = filtros.limit, limit = _b === void 0 ? 20 : _b, stock_bajo = filtros.stock_bajo;
                        skip = (Number(page) - 1) * Number(limit);
                        where = {};
                        if (stock_bajo === 'true') {
                            where.cat_productos = {
                                stock_minimo: { gte: 1 },
                            };
                            where.cantidad_fisica = { lte: database_1.default.inv_stock_producto.fields.stock_minimo || 5 };
                        }
                        return [4 /*yield*/, Promise.all([
                                inventario_repo_1.inventarioRepo.findAllStock({ skip: skip, take: Number(limit), where: where }),
                                inventario_repo_1.inventarioRepo.countStock(where),
                            ])];
                    case 1:
                        _c = _d.sent(), stock = _c[0], total = _c[1];
                        return [2 /*return*/, { stock: stock, total: total, page: Number(page), limit: Number(limit) }];
                }
            });
        });
    };
    InventarioService.prototype.obtenerStockPorProducto = function (productoId) {
        return __awaiter(this, void 0, void 0, function () {
            var stock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inventario_repo_1.inventarioRepo.findStockByProducto(productoId)];
                    case 1:
                        stock = _a.sent();
                        if (!stock)
                            throw new errorHandler_1.NotFoundError('Stock no encontrado');
                        return [2 /*return*/, stock];
                }
            });
        });
    };
    InventarioService.prototype.obtenerMovimientos = function (productoId, filtros) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, limit, skip, _c, movimientos, total;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = filtros.page, page = _a === void 0 ? 1 : _a, _b = filtros.limit, limit = _b === void 0 ? 20 : _b;
                        skip = (Number(page) - 1) * Number(limit);
                        return [4 /*yield*/, Promise.all([
                                inventario_repo_1.inventarioRepo.findMovimientos(productoId, { skip: skip, take: Number(limit) }),
                                inventario_repo_1.inventarioRepo.countMovimientos(productoId),
                            ])];
                    case 1:
                        _c = _d.sent(), movimientos = _c[0], total = _c[1];
                        return [2 /*return*/, { movimientos: movimientos, total: total, page: Number(page), limit: Number(limit) }];
                }
            });
        });
    };
    InventarioService.prototype.ajustarStock = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var stock, nuevaCantidad;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inventario_repo_1.inventarioRepo.findStockByProducto(data.producto_id)];
                    case 1:
                        stock = _a.sent();
                        if (!stock)
                            throw new errorHandler_1.NotFoundError('Stock no encontrado');
                        nuevaCantidad = data.tipo === 'positivo'
                            ? stock.cantidad_fisica + data.cantidad
                            : stock.cantidad_fisica - data.cantidad;
                        if (nuevaCantidad < 0)
                            throw new errorHandler_1.ConflictError('Stock insuficiente para el ajuste');
                        return [4 /*yield*/, database_1.default.$transaction([
                                inventario_repo_1.inventarioRepo.updateStock(data.producto_id, { cantidad_fisica: nuevaCantidad }),
                                inventario_repo_1.inventarioRepo.createMovimiento({
                                    producto_id: data.producto_id,
                                    tipo_movimiento: 'ajuste',
                                    cantidad: data.cantidad,
                                    motivo: data.motivo,
                                }),
                            ])];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, { mensaje: 'Stock ajustado exitosamente', cantidad_actual: nuevaCantidad }];
                }
            });
        });
    };
    InventarioService.prototype.crearAjusteInventario = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, detalle, stock, ajuste, _b, _c, detalle, stock, nuevaCantidad;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _i = 0, _a = data.detalles;
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        detalle = _a[_i];
                        if (!(detalle.tipo === 'negativo')) return [3 /*break*/, 3];
                        return [4 /*yield*/, inventario_repo_1.inventarioRepo.findStockByProducto(detalle.producto_id)];
                    case 2:
                        stock = _d.sent();
                        if (!stock || stock.cantidad_fisica < detalle.cantidad) {
                            throw new errorHandler_1.ConflictError("Stock insuficiente para el producto ".concat(detalle.producto_id));
                        }
                        _d.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [4 /*yield*/, inventario_repo_1.inventarioRepo.createAjuste(data)];
                    case 5:
                        ajuste = _d.sent();
                        _b = 0, _c = data.detalles;
                        _d.label = 6;
                    case 6:
                        if (!(_b < _c.length)) return [3 /*break*/, 11];
                        detalle = _c[_b];
                        return [4 /*yield*/, inventario_repo_1.inventarioRepo.findStockByProducto(detalle.producto_id)];
                    case 7:
                        stock = _d.sent();
                        if (!stock) return [3 /*break*/, 10];
                        nuevaCantidad = detalle.tipo === 'positivo'
                            ? stock.cantidad_fisica + detalle.cantidad
                            : stock.cantidad_fisica - detalle.cantidad;
                        return [4 /*yield*/, inventario_repo_1.inventarioRepo.updateStock(detalle.producto_id, { cantidad_fisica: nuevaCantidad })];
                    case 8:
                        _d.sent();
                        return [4 /*yield*/, inventario_repo_1.inventarioRepo.createMovimiento({
                                producto_id: detalle.producto_id,
                                tipo_movimiento: 'ajuste',
                                cantidad: detalle.cantidad,
                                motivo: data.motivo,
                                referencia_id: ajuste.id,
                            })];
                    case 9:
                        _d.sent();
                        _d.label = 10;
                    case 10:
                        _b++;
                        return [3 /*break*/, 6];
                    case 11: return [2 /*return*/, ajuste];
                }
            });
        });
    };
    InventarioService.prototype.listarProveedores = function (filtros) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, limit, skip, where, _c, proveedores, total;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = filtros.page, page = _a === void 0 ? 1 : _a, _b = filtros.limit, limit = _b === void 0 ? 20 : _b;
                        skip = (Number(page) - 1) * Number(limit);
                        where = { activo: true };
                        return [4 /*yield*/, Promise.all([
                                inventario_repo_1.inventarioRepo.findProveedores({ skip: skip, take: Number(limit), where: where }),
                                inventario_repo_1.inventarioRepo.countProveedores(where),
                            ])];
                    case 1:
                        _c = _d.sent(), proveedores = _c[0], total = _c[1];
                        return [2 /*return*/, { proveedores: proveedores, total: total, page: Number(page), limit: Number(limit) }];
                }
            });
        });
    };
    InventarioService.prototype.crearProveedor = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, inventario_repo_1.inventarioRepo.createProveedor(data)];
            });
        });
    };
    InventarioService.prototype.actualizarProveedor = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, inventario_repo_1.inventarioRepo.updateProveedor(id, data)];
            });
        });
    };
    InventarioService.prototype.eliminarProveedor = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, inventario_repo_1.inventarioRepo.updateProveedor(id, { activo: false })];
            });
        });
    };
    InventarioService.prototype.crearOrdenCompra = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var total;
            return __generator(this, function (_a) {
                total = data.detalles.reduce(function (sum, d) { return sum + d.cantidad * d.precio_unitario; }, 0);
                return [2 /*return*/, inventario_repo_1.inventarioRepo.createOrdenCompra({
                        proveedor_id: data.proveedor_id,
                        total: total,
                        detalles: data.detalles.map(function (d) { return (__assign(__assign({}, d), { subtotal: d.cantidad * d.precio_unitario })); }),
                    })];
            });
        });
    };
    InventarioService.prototype.listarOrdenesCompra = function (filtros) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, limit, skip, _c, ordenes, total;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = filtros.page, page = _a === void 0 ? 1 : _a, _b = filtros.limit, limit = _b === void 0 ? 20 : _b;
                        skip = (Number(page) - 1) * Number(limit);
                        return [4 /*yield*/, Promise.all([
                                inventario_repo_1.inventarioRepo.findOrdenesCompra({ skip: skip, take: Number(limit) }),
                                inventario_repo_1.inventarioRepo.countOrdenesCompra(),
                            ])];
                    case 1:
                        _c = _d.sent(), ordenes = _c[0], total = _c[1];
                        return [2 /*return*/, { ordenes: ordenes, total: total, page: Number(page), limit: Number(limit) }];
                }
            });
        });
    };
    InventarioService.prototype.recibirOrdenCompra = function (ordenCompraId, usuarioId) {
        return __awaiter(this, void 0, void 0, function () {
            var ordenCompra;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inventario_repo_1.inventarioRepo.findOrdenCompraById(ordenCompraId)];
                    case 1:
                        ordenCompra = _a.sent();
                        if (!ordenCompra)
                            throw new errorHandler_1.NotFoundError('Orden de compra no encontrada');
                        if (ordenCompra.estado !== 'pendiente')
                            throw new errorHandler_1.ConflictError('La orden ya fue recibida');
                        return [4 /*yield*/, database_1.default.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var _i, _a, detalle, stock;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _i = 0, _a = ordenCompra.inv_detalle_orden_compra;
                                            _b.label = 1;
                                        case 1:
                                            if (!(_i < _a.length)) return [3 /*break*/, 9];
                                            detalle = _a[_i];
                                            return [4 /*yield*/, tx.inv_stock_producto.findUnique({
                                                    where: { producto_id: detalle.producto_id },
                                                })];
                                        case 2:
                                            stock = _b.sent();
                                            if (!stock) return [3 /*break*/, 4];
                                            return [4 /*yield*/, tx.inv_stock_producto.update({
                                                    where: { producto_id: detalle.producto_id },
                                                    data: { cantidad_fisica: { increment: detalle.cantidad } },
                                                })];
                                        case 3:
                                            _b.sent();
                                            return [3 /*break*/, 6];
                                        case 4: return [4 /*yield*/, tx.inv_stock_producto.create({
                                                data: {
                                                    producto_id: detalle.producto_id,
                                                    cantidad_fisica: detalle.cantidad,
                                                },
                                            })];
                                        case 5:
                                            _b.sent();
                                            _b.label = 6;
                                        case 6: return [4 /*yield*/, tx.inv_movimientos_inventario.create({
                                                data: {
                                                    producto_id: detalle.producto_id,
                                                    tipo_movimiento: 'entrada',
                                                    cantidad: detalle.cantidad,
                                                    motivo: "Recepci\u00F3n orden compra #".concat(ordenCompraId),
                                                    referencia_id: ordenCompraId,
                                                },
                                            })];
                                        case 7:
                                            _b.sent();
                                            _b.label = 8;
                                        case 8:
                                            _i++;
                                            return [3 /*break*/, 1];
                                        case 9: 
                                        // Actualizar estado de la orden
                                        return [4 /*yield*/, tx.inv_ordenes_compra.update({
                                                where: { id: ordenCompraId },
                                                data: { estado: 'recibida', updated_at: new Date() },
                                            })];
                                        case 10:
                                            // Actualizar estado de la orden
                                            _b.sent();
                                            // Crear recepción
                                            return [4 /*yield*/, tx.inv_recepciones.create({
                                                    data: { orden_compra_id: ordenCompraId, estado: 'completa' },
                                                })];
                                        case 11:
                                            // Crear recepción
                                            _b.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, { mensaje: 'Recepción registrada exitosamente' }];
                }
            });
        });
    };
    InventarioService.prototype.productosStockBajo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, inventario_repo_1.inventarioRepo.findAllStock({
                        where: {
                            cat_productos: { estado: 'activo' },
                        },
                    })];
            });
        });
    };
    return InventarioService;
}());
exports.InventarioService = InventarioService;
exports.inventarioService = new InventarioService();
