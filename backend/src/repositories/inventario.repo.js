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
exports.inventarioRepo = exports.InventarioRepository = void 0;
var database_1 = require("../config/database");
var InventarioRepository = /** @class */ (function () {
    function InventarioRepository() {
    }
    InventarioRepository.prototype.findStockByProducto = function (productoId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.inv_stock_producto.findUnique({
                        where: { producto_id: productoId },
                        include: { cat_productos: { select: { nombre: true, sku: true } } },
                    })];
            });
        });
    };
    InventarioRepository.prototype.findAllStock = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.inv_stock_producto.findMany(__assign(__assign({}, options), { include: {
                            cat_productos: {
                                select: { id: true, sku: true, nombre: true, stock_minimo: true, precio_venta: true },
                            },
                        } }))];
            });
        });
    };
    InventarioRepository.prototype.countStock = function (where) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.inv_stock_producto.count({ where: where })];
            });
        });
    };
    InventarioRepository.prototype.updateStock = function (productoId, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.inv_stock_producto.update({
                        where: { producto_id: productoId },
                        data: data,
                    })];
            });
        });
    };
    InventarioRepository.prototype.createMovimiento = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.inv_movimientos_inventario.create({ data: data })];
            });
        });
    };
    InventarioRepository.prototype.findMovimientos = function (productoId, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.inv_movimientos_inventario.findMany({
                        where: { producto_id: productoId },
                        skip: options.skip,
                        take: options.take,
                        orderBy: { fecha_movimiento: 'desc' },
                    })];
            });
        });
    };
    InventarioRepository.prototype.countMovimientos = function (productoId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.inv_movimientos_inventario.count({ where: { producto_id: productoId } })];
            });
        });
    };
    InventarioRepository.prototype.createAjuste = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.inv_ajustes.create({
                        data: {
                            motivo: data.motivo,
                            usuario_id: data.usuario_id,
                            inv_detalle_ajuste: {
                                create: data.detalles,
                            },
                        },
                        include: { inv_detalle_ajuste: true },
                    })];
            });
        });
    };
    InventarioRepository.prototype.findProveedores = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.inv_proveedores.findMany(__assign(__assign({}, options), { orderBy: { nombre: 'asc' } }))];
            });
        });
    };
    InventarioRepository.prototype.countProveedores = function (where) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.inv_proveedores.count({ where: where })];
            });
        });
    };
    InventarioRepository.prototype.createProveedor = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.inv_proveedores.create({ data: data })];
            });
        });
    };
    InventarioRepository.prototype.updateProveedor = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.inv_proveedores.update({ where: { id: id }, data: data })];
            });
        });
    };
    InventarioRepository.prototype.createOrdenCompra = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.inv_ordenes_compra.create({
                        data: {
                            proveedor_id: data.proveedor_id,
                            total: data.total,
                            inv_detalle_orden_compra: {
                                create: data.detalles,
                            },
                        },
                        include: { inv_detalle_orden_compra: true },
                    })];
            });
        });
    };
    InventarioRepository.prototype.findOrdenesCompra = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.inv_ordenes_compra.findMany(__assign(__assign({}, options), { include: {
                            inv_proveedores: true,
                            inv_detalle_orden_compra: true,
                        }, orderBy: { fecha_orden: 'desc' } }))];
            });
        });
    };
    InventarioRepository.prototype.countOrdenesCompra = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.inv_ordenes_compra.count()];
            });
        });
    };
    InventarioRepository.prototype.findOrdenCompraById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.inv_ordenes_compra.findUnique({
                        where: { id: id },
                        include: { inv_detalle_orden_compra: true },
                    })];
            });
        });
    };
    InventarioRepository.prototype.createRecepcion = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.inv_recepciones.create({ data: data })];
            });
        });
    };
    return InventarioRepository;
}());
exports.InventarioRepository = InventarioRepository;
exports.inventarioRepo = new InventarioRepository();
