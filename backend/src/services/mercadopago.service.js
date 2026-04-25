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
exports.mercadopagoService = exports.MercadoPagoService = void 0;
var mercadopago_1 = require("../config/mercadopago");
var config_1 = require("../config");
var errorHandler_1 = require("../middlewares/errorHandler");
var logger_1 = require("../utils/logger");
var MercadoPagoService = /** @class */ (function () {
    function MercadoPagoService() {
    }
    /**
     * Crea una preferencia de pago en Mercado Pago
     */
    MercadoPagoService.prototype.crearPreferencia = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var preferenceData, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        preferenceData = {
                            items: data.items.map(function (item) { return ({
                                id: item.titulo,
                                title: item.titulo,
                                quantity: item.cantidad,
                                unit_price: item.precioUnitario,
                                currency_id: config_1.config.negocio.monedaDefecto,
                            }); }),
                            payer: {
                                email: data.cliente.email,
                                name: data.cliente.nombre,
                                surname: data.cliente.apellido,
                            },
                            back_urls: {
                                success: "".concat(config_1.config.app.frontendUrl, "/ordenes/").concat(data.ordenId, "/pago-exitoso"),
                                failure: "".concat(config_1.config.app.frontendUrl, "/ordenes/").concat(data.ordenId, "/pago-fallido"),
                                pending: "".concat(config_1.config.app.frontendUrl, "/ordenes/").concat(data.ordenId, "/pago-pendiente"),
                            },
                            auto_return: 'approved',
                            external_reference: data.ordenId,
                            notification_url: "".concat(config_1.config.app.apiUrl, "/api/v1/webhooks/mercadopago"),
                            statement_descriptor: config_1.config.empresa.nombre.substring(0, 22),
                            payment_methods: {
                                excluded_payment_methods: [],
                                excluded_payment_types: [],
                                installments: 12, // Hasta 12 cuotas
                            },
                        };
                        return [4 /*yield*/, mercadopago_1.preferenceClient.create({ body: preferenceData })];
                    case 1:
                        response = _a.sent();
                        if (!response.id || !response.init_point) {
                            throw new errorHandler_1.AppError('Error al crear preferencia de pago', 500);
                        }
                        logger_1.default.info("Preferencia creada: ".concat(response.id, " para orden ").concat(data.ordenId));
                        return [2 /*return*/, {
                                preferenceId: response.id,
                                initPoint: response.init_point,
                                sandboxInitPoint: response.sandbox_init_point,
                            }];
                    case 2:
                        error_1 = _a.sent();
                        logger_1.default.error('Error en Mercado Pago:', error_1);
                        throw new errorHandler_1.AppError('Error al procesar el pago con Mercado Pago', 500);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Obtiene el estado de un pago por su ID
     */
    MercadoPagoService.prototype.obtenerPago = function (paymentId) {
        return __awaiter(this, void 0, void 0, function () {
            var payment, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, mercadopago_1.paymentClient.get({ id: paymentId })];
                    case 1:
                        payment = _b.sent();
                        return [2 /*return*/, {
                                id: ((_a = payment.id) === null || _a === void 0 ? void 0 : _a.toString()) || '',
                                estado: payment.status || 'desconocido',
                                metodoPago: payment.payment_method_id || 'no especificado',
                                monto: payment.transaction_amount || 0,
                                moneda: payment.currency_id || config_1.config.negocio.monedaDefecto,
                                fechaAprobacion: payment.date_approved
                                    ? new Date(payment.date_approved)
                                    : null,
                            }];
                    case 2:
                        error_2 = _b.sent();
                        logger_1.default.error('Error al obtener pago:', error_2);
                        throw new errorHandler_1.AppError('Error al obtener información del pago', 500);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Procesa la notificación webhook de Mercado Pago
     */
    MercadoPagoService.prototype.procesarWebhook = function (topic, id) {
        return __awaiter(this, void 0, void 0, function () {
            var pago, prisma, orden, nuevoEstado, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        logger_1.default.info("Webhook recibido: topic=".concat(topic, ", id=").concat(id));
                        if (!(topic === 'payment')) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.obtenerPago(id)];
                    case 1:
                        pago = _a.sent();
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../config/database'); })];
                    case 2:
                        prisma = (_a.sent()).default;
                        return [4 /*yield*/, prisma.ord_ordenes.findFirst({
                                where: {
                                    ord_transacciones_pago: {
                                        some: {
                                            referencia_externa: id,
                                        },
                                    },
                                },
                                include: {
                                    ord_items_orden: true,
                                },
                            })];
                    case 3:
                        orden = _a.sent();
                        if (!orden) {
                            logger_1.default.warn("No se encontr\u00F3 orden para el pago ".concat(id));
                            return [2 /*return*/, { procesado: false, mensaje: 'Orden no encontrada' }];
                        }
                        // Actualizar transacción y orden según el estado del pago
                        return [4 /*yield*/, prisma.ord_transacciones_pago.updateMany({
                                where: {
                                    orden_id: orden.id,
                                    referencia_externa: id,
                                },
                                data: {
                                    estado: this.mapearEstado(pago.estado),
                                    fecha_procesamiento: pago.fechaAprobacion,
                                    metadata: JSON.stringify(pago),
                                },
                            })];
                    case 4:
                        // Actualizar transacción y orden según el estado del pago
                        _a.sent();
                        nuevoEstado = this.obtenerEstadoOrden(pago.estado);
                        if (!nuevoEstado) return [3 /*break*/, 7];
                        return [4 /*yield*/, prisma.ord_ordenes.update({
                                where: { id: orden.id },
                                data: { estado: nuevoEstado },
                            })];
                    case 5:
                        _a.sent();
                        if (!(pago.estado === 'approved')) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.descontarInventario(orden.id)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/, { procesado: true, ordenId: orden.id }];
                    case 8: return [2 /*return*/, { procesado: false, mensaje: 'Topic no procesado' }];
                    case 9:
                        error_3 = _a.sent();
                        logger_1.default.error('Error al procesar webhook:', error_3);
                        throw new errorHandler_1.AppError('Error al procesar notificación de pago', 500);
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Mapea el estado de Mercado Pago a nuestro estado interno
     */
    MercadoPagoService.prototype.mapearEstado = function (estadoMP) {
        var mapa = {
            approved: 'aprobado',
            pending: 'pendiente',
            in_process: 'en_proceso',
            rejected: 'rechazado',
            refunded: 'reembolsado',
            cancelled: 'cancelado',
            charged_back: 'contracargo',
        };
        return mapa[estadoMP] || 'pendiente';
    };
    /**
     * Obtiene el estado de la orden según el estado del pago
     */
    MercadoPagoService.prototype.obtenerEstadoOrden = function (estadoPago) {
        var mapa = {
            approved: 'pagada',
            rejected: 'cancelada',
            cancelled: 'cancelada',
            refunded: 'devuelta',
            charged_back: 'devuelta',
        };
        return mapa[estadoPago] || null;
    };
    /**
     * Descuenta el inventario cuando un pago es aprobado
     */
    MercadoPagoService.prototype.descontarInventario = function (ordenId) {
        return __awaiter(this, void 0, void 0, function () {
            var prisma, items, _i, items_1, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../config/database'); })];
                    case 1:
                        prisma = (_a.sent()).default;
                        return [4 /*yield*/, prisma.ord_items_orden.findMany({
                                where: { orden_id: ordenId },
                            })];
                    case 2:
                        items = _a.sent();
                        _i = 0, items_1 = items;
                        _a.label = 3;
                    case 3:
                        if (!(_i < items_1.length)) return [3 /*break*/, 7];
                        item = items_1[_i];
                        // Descontar del stock físico
                        return [4 /*yield*/, prisma.inv_stock_producto.updateMany({
                                where: {
                                    producto_id: item.producto_id,
                                    cantidad_fisica: { gte: item.cantidad },
                                },
                                data: {
                                    cantidad_fisica: { decrement: item.cantidad },
                                    cantidad_reservada: { decrement: item.cantidad },
                                },
                            })];
                    case 4:
                        // Descontar del stock físico
                        _a.sent();
                        // Registrar movimiento de inventario
                        return [4 /*yield*/, prisma.inv_movimientos_inventario.create({
                                data: {
                                    producto_id: item.producto_id,
                                    tipo_movimiento: 'salida',
                                    cantidad: item.cantidad,
                                    motivo: "Venta - Orden #".concat(ordenId),
                                    fecha_movimiento: new Date(),
                                },
                            })];
                    case 5:
                        // Registrar movimiento de inventario
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 3];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Genera un reembolso total o parcial
     */
    MercadoPagoService.prototype.reembolsarPago = function (paymentId, monto) {
        return __awaiter(this, void 0, void 0, function () {
            var payment, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, mercadopago_1.paymentClient.refund({
                                id: paymentId,
                                body: monto ? { amount: monto } : undefined,
                            })];
                    case 1:
                        payment = _a.sent();
                        return [2 /*return*/, {
                                reembolsoId: payment.id,
                                estado: payment.status,
                                montoReembolsado: payment.transaction_amount,
                            }];
                    case 2:
                        error_4 = _a.sent();
                        logger_1.default.error('Error al reembolsar pago:', error_4);
                        throw new errorHandler_1.AppError('Error al procesar el reembolso', 500);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return MercadoPagoService;
}());
exports.MercadoPagoService = MercadoPagoService;
exports.mercadopagoService = new MercadoPagoService();
