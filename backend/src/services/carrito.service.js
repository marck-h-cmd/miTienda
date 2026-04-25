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
exports.carritoService = exports.CarritoService = void 0;
var database_1 = require("../config/database");
var errorHandler_1 = require("../middlewares/errorHandler");
var CarritoService = /** @class */ (function () {
    function CarritoService() {
    }
    CarritoService.prototype.obtenerCarrito = function (usuarioId, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var carrito;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!usuarioId) return [3 /*break*/, 2];
                        return [4 /*yield*/, database_1.default.ord_carritos.findFirst({
                                where: { usuario_id: usuarioId },
                                include: {
                                    ord_items_carrito: {
                                        include: {
                                            cat_productos: {
                                                include: {
                                                    cat_imagenes_producto: { where: { es_principal: true }, take: 1 },
                                                    inv_stock_producto: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            })];
                    case 1:
                        carrito = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!sessionId) return [3 /*break*/, 4];
                        return [4 /*yield*/, database_1.default.ord_carritos.findFirst({
                                where: { session_id: sessionId },
                                include: {
                                    ord_items_carrito: {
                                        include: {
                                            cat_productos: {
                                                include: {
                                                    cat_imagenes_producto: { where: { es_principal: true }, take: 1 },
                                                    inv_stock_producto: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            })];
                    case 3:
                        carrito = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!(!carrito && (usuarioId || sessionId))) return [3 /*break*/, 6];
                        return [4 /*yield*/, database_1.default.ord_carritos.create({
                                data: {
                                    usuario_id: usuarioId,
                                    session_id: sessionId,
                                },
                                include: { ord_items_carrito: true },
                            })];
                    case 5:
                        carrito = _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/, carrito || { ord_items_carrito: [] }];
                }
            });
        });
    };
    CarritoService.prototype.agregarItem = function (usuarioId, sessionId, producto_id, cantidad) {
        return __awaiter(this, void 0, void 0, function () {
            var producto, carrito, itemExistente;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.cat_productos.findUnique({
                            where: { id: producto_id },
                            include: { inv_stock_producto: true },
                        })];
                    case 1:
                        producto = _a.sent();
                        if (!producto || !producto.activo)
                            throw new errorHandler_1.NotFoundError('Producto no encontrado');
                        if (!producto.inv_stock_producto.length || producto.inv_stock_producto[0].cantidad_fisica < cantidad) {
                            throw new errorHandler_1.ConflictError('Stock insuficiente');
                        }
                        return [4 /*yield*/, database_1.default.ord_carritos.findFirst({
                                where: usuarioId ? { usuario_id: usuarioId } : { session_id: sessionId },
                            })];
                    case 2:
                        carrito = _a.sent();
                        if (!!carrito) return [3 /*break*/, 4];
                        return [4 /*yield*/, database_1.default.ord_carritos.create({
                                data: { usuario_id: usuarioId, session_id: sessionId },
                            })];
                    case 3:
                        carrito = _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, database_1.default.ord_items_carrito.findFirst({
                            where: { carrito_id: carrito.id, producto_id: producto_id },
                        })];
                    case 5:
                        itemExistente = _a.sent();
                        if (!itemExistente) return [3 /*break*/, 7];
                        return [4 /*yield*/, database_1.default.ord_items_carrito.update({
                                where: { id: itemExistente.id },
                                data: { cantidad: itemExistente.cantidad + cantidad },
                            })];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, database_1.default.ord_items_carrito.create({
                            data: {
                                carrito_id: carrito.id,
                                producto_id: producto_id,
                                cantidad: cantidad,
                                precio_unitario: producto.precio_oferta || producto.precio_venta,
                            },
                        })];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [2 /*return*/, this.obtenerCarrito(usuarioId, sessionId)];
                }
            });
        });
    };
    CarritoService.prototype.actualizarItem = function (itemId, cantidad) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(cantidad <= 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, database_1.default.ord_items_carrito.delete({ where: { id: itemId } })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, { mensaje: 'Item eliminado' }];
                    case 2: return [2 /*return*/, database_1.default.ord_items_carrito.update({
                            where: { id: itemId },
                            data: { cantidad: cantidad },
                        })];
                }
            });
        });
    };
    CarritoService.prototype.eliminarItem = function (itemId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.ord_items_carrito.delete({ where: { id: itemId } })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CarritoService.prototype.vaciarCarrito = function (carritoId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.ord_items_carrito.deleteMany({ where: { carrito_id: carritoId } })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CarritoService.prototype.mergeCarrito = function (usuarioId, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var carritoSesion, carritoUsuario, _i, _a, item, itemExistente;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, database_1.default.ord_carritos.findFirst({
                            where: { session_id: sessionId },
                            include: { ord_items_carrito: true },
                        })];
                    case 1:
                        carritoSesion = _b.sent();
                        if (!carritoSesion || carritoSesion.ord_items_carrito.length === 0)
                            return [2 /*return*/];
                        return [4 /*yield*/, database_1.default.ord_carritos.findFirst({
                                where: { usuario_id: usuarioId },
                            })];
                    case 2:
                        carritoUsuario = _b.sent();
                        if (!!carritoUsuario) return [3 /*break*/, 4];
                        return [4 /*yield*/, database_1.default.ord_carritos.update({
                                where: { id: carritoSesion.id },
                                data: { usuario_id: usuarioId, session_id: null },
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                    case 4:
                        _i = 0, _a = carritoSesion.ord_items_carrito;
                        _b.label = 5;
                    case 5:
                        if (!(_i < _a.length)) return [3 /*break*/, 11];
                        item = _a[_i];
                        return [4 /*yield*/, database_1.default.ord_items_carrito.findFirst({
                                where: { carrito_id: carritoUsuario.id, producto_id: item.producto_id },
                            })];
                    case 6:
                        itemExistente = _b.sent();
                        if (!itemExistente) return [3 /*break*/, 8];
                        return [4 /*yield*/, database_1.default.ord_items_carrito.update({
                                where: { id: itemExistente.id },
                                data: { cantidad: itemExistente.cantidad + item.cantidad },
                            })];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 8: return [4 /*yield*/, database_1.default.ord_items_carrito.create({
                            data: {
                                carrito_id: carritoUsuario.id,
                                producto_id: item.producto_id,
                                cantidad: item.cantidad,
                                precio_unitario: item.precio_unitario,
                            },
                        })];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10:
                        _i++;
                        return [3 /*break*/, 5];
                    case 11: 
                    // Eliminar carrito de sesión
                    return [4 /*yield*/, database_1.default.ord_carritos.delete({ where: { id: carritoSesion.id } })];
                    case 12:
                        // Eliminar carrito de sesión
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return CarritoService;
}());
exports.CarritoService = CarritoService;
exports.carritoService = new CarritoService();
