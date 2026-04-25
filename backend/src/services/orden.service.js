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
exports.ordenService = exports.OrdenService = void 0;
var database_1 = require("../config/database");
var errorHandler_1 = require("../middlewares/errorHandler");
var mercadopago_service_1 = require("./mercadopago.service");
var config_1 = require("../config");
var logger_1 = require("../utils/logger");
var OrdenService = /** @class */ (function () {
    function OrdenService() {
    }
    /**
     * Inicia el proceso de checkout creando la orden y la preferencia de pago
     */
    OrdenService.prototype.iniciarCheckout = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var result, cliente, preferencia;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var carrito, _i, _a, item, stock, subtotal, descuento, cupon, subtotalConDescuento, impuesto, metodoEnvio, costoEnvio, total, orden, items, fechaExpiracionReserva;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, tx.ord_carritos.findFirst({
                                            where: { usuario_id: data.usuarioId },
                                            include: {
                                                ord_items_carrito: {
                                                    include: {
                                                        cat_productos: true,
                                                    },
                                                },
                                            },
                                        })];
                                    case 1:
                                        carrito = _b.sent();
                                        if (!carrito || carrito.ord_items_carrito.length === 0) {
                                            throw new errorHandler_1.ConflictError('El carrito está vacío');
                                        }
                                        _i = 0, _a = carrito.ord_items_carrito;
                                        _b.label = 2;
                                    case 2:
                                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                                        item = _a[_i];
                                        return [4 /*yield*/, tx.inv_stock_producto.findFirst({
                                                where: {
                                                    producto_id: item.producto_id,
                                                    cantidad_fisica: { gte: item.cantidad },
                                                },
                                            })];
                                    case 3:
                                        stock = _b.sent();
                                        if (!stock) {
                                            throw new errorHandler_1.ConflictError("Stock insuficiente para el producto: ".concat(item.cat_productos.nombre));
                                        }
                                        _b.label = 4;
                                    case 4:
                                        _i++;
                                        return [3 /*break*/, 2];
                                    case 5:
                                        subtotal = carrito.ord_items_carrito.reduce(function (sum, item) { return sum + item.precio_unitario * item.cantidad; }, 0);
                                        descuento = 0;
                                        if (!data.cuponCodigo) return [3 /*break*/, 8];
                                        return [4 /*yield*/, tx.ord_cupones.findFirst({
                                                where: {
                                                    codigo: data.cuponCodigo,
                                                    fecha_inicio: { lte: new Date() },
                                                    fecha_fin: { gte: new Date() },
                                                    usos_actuales: { lt: database_1.default.ord_cupones.fields.usos_maximos },
                                                    activo: true,
                                                },
                                            })];
                                    case 6:
                                        cupon = _b.sent();
                                        if (!cupon) return [3 /*break*/, 8];
                                        descuento = cupon.tipo_descuento === 'porcentaje'
                                            ? (subtotal * cupon.valor_descuento) / 100
                                            : cupon.valor_descuento;
                                        return [4 /*yield*/, tx.ord_cupones.update({
                                                where: { id: cupon.id },
                                                data: { usos_actuales: { increment: 1 } },
                                            })];
                                    case 7:
                                        _b.sent();
                                        _b.label = 8;
                                    case 8:
                                        subtotalConDescuento = subtotal - descuento;
                                        impuesto = (subtotalConDescuento * config_1.config.negocio.igvPorcentaje) / 100;
                                        return [4 /*yield*/, tx.ord_metodos_envio.findUnique({
                                                where: { id: data.metodoEnvioId },
                                            })];
                                    case 9:
                                        metodoEnvio = _b.sent();
                                        if (!metodoEnvio) {
                                            throw new errorHandler_1.NotFoundError('Método de envío no encontrado');
                                        }
                                        costoEnvio = metodoEnvio.precio;
                                        total = subtotalConDescuento + impuesto + costoEnvio;
                                        return [4 /*yield*/, tx.ord_ordenes.create({
                                                data: {
                                                    cliente_id: data.usuarioId,
                                                    direccion_envio_id: data.direccionEnvioId,
                                                    metodo_envio_id: data.metodoEnvioId,
                                                    subtotal: subtotal,
                                                    descuento: descuento,
                                                    impuesto: impuesto,
                                                    costo_envio: costoEnvio,
                                                    total: total,
                                                    estado: 'pendiente_pago',
                                                    moneda: config_1.config.negocio.monedaDefecto,
                                                    fecha_pedido: new Date(),
                                                },
                                            })];
                                    case 10:
                                        orden = _b.sent();
                                        return [4 /*yield*/, Promise.all(carrito.ord_items_carrito.map(function (item) {
                                                return tx.ord_items_orden.create({
                                                    data: {
                                                        orden_id: orden.id,
                                                        producto_id: item.producto_id,
                                                        nombre_producto: item.cat_productos.nombre,
                                                        cantidad: item.cantidad,
                                                        precio_unitario: item.precio_unitario,
                                                        subtotal: item.precio_unitario * item.cantidad,
                                                    },
                                                });
                                            }))];
                                    case 11:
                                        items = _b.sent();
                                        fechaExpiracionReserva = new Date(Date.now() + config_1.config.negocio.stockReservaTimeout * 60 * 1000);
                                        return [4 /*yield*/, Promise.all(carrito.ord_items_carrito.map(function (item) {
                                                return tx.inv_stock_producto.updateMany({
                                                    where: { producto_id: item.producto_id },
                                                    data: {
                                                        cantidad_reservada: { increment: item.cantidad },
                                                        fecha_reserva: new Date(),
                                                        fecha_expiracion_reserva: fechaExpiracionReserva,
                                                    },
                                                });
                                            }))];
                                    case 12:
                                        _b.sent();
                                        // Registrar historial de estados
                                        return [4 /*yield*/, tx.ord_historial_estados.create({
                                                data: {
                                                    orden_id: orden.id,
                                                    estado_anterior: null,
                                                    estado_nuevo: 'pendiente_pago',
                                                    comentario: 'Orden creada',
                                                    fecha_cambio: new Date(),
                                                },
                                            })];
                                    case 13:
                                        // Registrar historial de estados
                                        _b.sent();
                                        return [2 /*return*/, { orden: orden, items: items }];
                                }
                            });
                        }); })];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, database_1.default.seg_usuarios.findUnique({
                                where: { id: data.usuarioId },
                            })];
                    case 2:
                        cliente = _a.sent();
                        if (!cliente) {
                            throw new errorHandler_1.NotFoundError('Cliente no encontrado');
                        }
                        return [4 /*yield*/, mercadopago_service_1.mercadopagoService.crearPreferencia({
                                ordenId: result.orden.id,
                                items: result.items.map(function (item) { return ({
                                    titulo: item.nombre_producto,
                                    cantidad: item.cantidad,
                                    precioUnitario: item.precio_unitario,
                                }); }),
                                cliente: {
                                    email: cliente.email,
                                    nombre: cliente.nombre,
                                    apellido: cliente.apellido,
                                },
                            })];
                    case 3:
                        preferencia = _a.sent();
                        // Guardar la preferencia de pago
                        return [4 /*yield*/, database_1.default.ord_transacciones_pago.create({
                                data: {
                                    orden_id: result.orden.id,
                                    tipo_pago: 'mercadopago',
                                    estado: 'pendiente',
                                    monto: result.orden.total,
                                    moneda: result.orden.moneda,
                                    preferencia_id: preferencia.preferenceId,
                                    init_point: preferencia.initPoint,
                                },
                            })];
                    case 4:
                        // Guardar la preferencia de pago
                        _a.sent();
                        // Limpiar el carrito después del checkout
                        return [4 /*yield*/, database_1.default.ord_items_carrito.deleteMany({
                                where: { carrito_id: result.orden.cliente_id },
                            })];
                    case 5:
                        // Limpiar el carrito después del checkout
                        _a.sent();
                        logger_1.default.info("Checkout iniciado: Orden #".concat(result.orden.id));
                        return [2 /*return*/, {
                                ordenId: result.orden.id,
                                total: result.orden.total,
                                initPoint: preferencia.initPoint,
                                sandboxInitPoint: preferencia.sandboxInitPoint,
                            }];
                }
            });
        });
    };
    OrdenService.prototype.obtenerOrden = function (ordenId, usuarioId) {
        return __awaiter(this, void 0, void 0, function () {
            var orden;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.ord_ordenes.findFirst({
                            where: {
                                id: ordenId,
                                cliente_id: usuarioId,
                            },
                            include: {
                                ord_items_orden: true,
                                ord_direcciones_envio: true,
                                ord_metodos_envio: true,
                                ord_historial_estados: true,
                                ord_transacciones_pago: true,
                            },
                        })];
                    case 1:
                        orden = _a.sent();
                        if (!orden) {
                            throw new errorHandler_1.NotFoundError('Orden no encontrada');
                        }
                        return [2 /*return*/, orden];
                }
            });
        });
    };
    OrdenService.prototype.cancelarOrden = function (ordenId, usuarioId) {
        return __awaiter(this, void 0, void 0, function () {
            var orden, transaccion, items;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.obtenerOrden(ordenId, usuarioId)];
                    case 1:
                        orden = _a.sent();
                        if (!['pendiente_pago', 'pagada'].includes(orden.estado)) {
                            throw new errorHandler_1.ConflictError('La orden no puede ser cancelada en su estado actual');
                        }
                        if (!(orden.estado === 'pagada')) return [3 /*break*/, 4];
                        return [4 /*yield*/, database_1.default.ord_transacciones_pago.findFirst({
                                where: { orden_id: ordenId, estado: 'aprobado' },
                            })];
                    case 2:
                        transaccion = _a.sent();
                        if (!(transaccion === null || transaccion === void 0 ? void 0 : transaccion.referencia_externa)) return [3 /*break*/, 4];
                        return [4 /*yield*/, mercadopago_service_1.mercadopagoService.reembolsarPago(transaccion.referencia_externa)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, database_1.default.ord_items_orden.findMany({
                            where: { orden_id: ordenId },
                        })];
                    case 5:
                        items = _a.sent();
                        return [4 /*yield*/, Promise.all(items.map(function (item) {
                                return database_1.default.inv_stock_producto.updateMany({
                                    where: { producto_id: item.producto_id },
                                    data: {
                                        cantidad_reservada: { decrement: item.cantidad },
                                    },
                                });
                            }))];
                    case 6:
                        _a.sent();
                        // Actualizar orden
                        return [4 /*yield*/, database_1.default.ord_ordenes.update({
                                where: { id: ordenId },
                                data: { estado: 'cancelada' },
                            })];
                    case 7:
                        // Actualizar orden
                        _a.sent();
                        // Registrar en historial
                        return [4 /*yield*/, database_1.default.ord_historial_estados.create({
                                data: {
                                    orden_id: ordenId,
                                    estado_anterior: orden.estado,
                                    estado_nuevo: 'cancelada',
                                    comentario: 'Cancelada por el cliente',
                                    fecha_cambio: new Date(),
                                },
                            })];
                    case 8:
                        // Registrar en historial
                        _a.sent();
                        logger_1.default.info("Orden #".concat(ordenId, " cancelada"));
                        return [2 /*return*/, { mensaje: 'Orden cancelada exitosamente' }];
                }
            });
        });
    };
    return OrdenService;
}());
exports.OrdenService = OrdenService;
exports.ordenService = new OrdenService();
