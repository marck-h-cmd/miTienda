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
exports.productoService = exports.ProductoService = void 0;
var database_1 = require("../config/database");
var errorHandler_1 = require("../middlewares/errorHandler");
var ProductoService = /** @class */ (function () {
    function ProductoService() {
    }
    ProductoService.prototype.listar = function (filtros) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, limit, categoria, marca, precio_min, precio_max, busqueda, ordenar_por, skip, where, orderBy, _c, productos, total;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = filtros.page, page = _a === void 0 ? 1 : _a, _b = filtros.limit, limit = _b === void 0 ? 12 : _b, categoria = filtros.categoria, marca = filtros.marca, precio_min = filtros.precio_min, precio_max = filtros.precio_max, busqueda = filtros.busqueda, ordenar_por = filtros.ordenar_por;
                        skip = (Number(page) - 1) * Number(limit);
                        where = __assign(__assign(__assign(__assign(__assign({ activo: true, estado: 'activo' }, (categoria && { categoria_id: categoria })), (marca && { marca_id: marca })), (precio_min && { precio_venta: { gte: Number(precio_min) } })), (precio_max && { precio_venta: { lte: Number(precio_max) } })), (busqueda && {
                            OR: [
                                { nombre: { contains: busqueda, mode: 'insensitive' } },
                                { descripcion_corta: { contains: busqueda, mode: 'insensitive' } },
                            ],
                        }));
                        orderBy = { created_at: 'desc' };
                        switch (ordenar_por) {
                            case 'precio':
                                orderBy = { precio_venta: 'asc' };
                                break;
                            case 'nombre':
                                orderBy = { nombre: 'asc' };
                                break;
                            case 'fecha':
                                orderBy = { created_at: 'desc' };
                                break;
                        }
                        return [4 /*yield*/, Promise.all([
                                database_1.default.cat_productos.findMany({
                                    where: where,
                                    skip: skip,
                                    take: Number(limit),
                                    orderBy: orderBy,
                                    include: {
                                        cat_categorias: true,
                                        cat_marcas: true,
                                        cat_imagenes_producto: { where: { es_principal: true }, take: 1 },
                                        inv_stock_producto: true,
                                    },
                                }),
                                database_1.default.cat_productos.count({ where: where }),
                            ])];
                    case 1:
                        _c = _d.sent(), productos = _c[0], total = _c[1];
                        return [2 /*return*/, { productos: productos, total: total, page: Number(page), limit: Number(limit) }];
                }
            });
        });
    };
    ProductoService.prototype.obtenerPorId = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var producto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.cat_productos.findUnique({
                            where: { id: id },
                            include: {
                                cat_categorias: true,
                                cat_subcategorias: true,
                                cat_marcas: true,
                                cat_unidades_medida: true,
                                cat_imagenes_producto: true,
                                cat_producto_atributo: { include: { cat_valores_atributo: { include: { cat_atributos: true } } } },
                                inv_stock_producto: true,
                                cli_resenas_producto: { include: { seg_usuarios: { select: { nombre: true, apellido: true } } } },
                            },
                        })];
                    case 1:
                        producto = _a.sent();
                        if (!producto)
                            throw new errorHandler_1.NotFoundError('Producto no encontrado');
                        return [2 /*return*/, producto];
                }
            });
        });
    };
    ProductoService.prototype.crear = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var producto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.cat_productos.create({ data: data })];
                    case 1:
                        producto = _a.sent();
                        // Crear registro de stock inicial
                        return [4 /*yield*/, database_1.default.inv_stock_producto.create({
                                data: {
                                    producto_id: producto.id,
                                    cantidad_fisica: 0,
                                    cantidad_reservada: 0,
                                },
                            })];
                    case 2:
                        // Crear registro de stock inicial
                        _a.sent();
                        return [2 /*return*/, producto];
                }
            });
        });
    };
    ProductoService.prototype.actualizar = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.obtenerPorId(id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, database_1.default.cat_productos.update({ where: { id: id }, data: data })];
                }
            });
        });
    };
    ProductoService.prototype.eliminar = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.obtenerPorId(id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, database_1.default.cat_productos.update({
                                where: { id: id },
                                data: { activo: false, estado: 'inactivo' },
                            })];
                }
            });
        });
    };
    ProductoService.prototype.listarAdmin = function (filtros) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, limit, estado, categoria, skip, where, _c, productos, total;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = filtros.page, page = _a === void 0 ? 1 : _a, _b = filtros.limit, limit = _b === void 0 ? 20 : _b, estado = filtros.estado, categoria = filtros.categoria;
                        skip = (Number(page) - 1) * Number(limit);
                        where = {};
                        if (estado)
                            where.estado = estado;
                        if (categoria)
                            where.categoria_id = categoria;
                        return [4 /*yield*/, Promise.all([
                                database_1.default.cat_productos.findMany({
                                    where: where,
                                    skip: skip,
                                    take: Number(limit),
                                    orderBy: { created_at: 'desc' },
                                    include: {
                                        cat_categorias: true,
                                        inv_stock_producto: true,
                                    },
                                }),
                                database_1.default.cat_productos.count({ where: where }),
                            ])];
                    case 1:
                        _c = _d.sent(), productos = _c[0], total = _c[1];
                        return [2 /*return*/, { productos: productos, total: total, page: Number(page), limit: Number(limit) }];
                }
            });
        });
    };
    return ProductoService;
}());
exports.ProductoService = ProductoService;
exports.productoService = new ProductoService();
