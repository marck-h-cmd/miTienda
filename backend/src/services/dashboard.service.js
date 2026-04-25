"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
exports.dashboardService = exports.DashboardService = void 0;
var database_1 = require("../config/database");
var dateHelpers_1 = require("../utils/dateHelpers");
var DashboardService = /** @class */ (function () {
    function DashboardService() {
    }
    DashboardService.prototype.obtenerKPIs = function () {
        return __awaiter(this, arguments, void 0, function (dias) {
            var _a, inicio, fin, _b, ventasPeriodo, totalOrdenes, carritosCreados, productosAgotados, productosStockBajo, ordenesPendientes, clientesNuevos, ventasTotales, ticketPromedio, tasaConversion, tasaAbandono;
            if (dias === void 0) { dias = 30; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = (0, dateHelpers_1.obtenerRangoFechas)(dias), inicio = _a.inicio, fin = _a.fin;
                        return [4 /*yield*/, Promise.all([
                                // Ventas totales
                                database_1.default.ord_ordenes.aggregate({
                                    where: { fecha_pedido: { gte: inicio, lte: fin }, estado: { notIn: ['cancelada', 'devuelta'] } },
                                    _sum: { total: true },
                                }),
                                // Total órdenes
                                database_1.default.ord_ordenes.count({
                                    where: { fecha_pedido: { gte: inicio, lte: fin } },
                                }),
                                // Carritos creados
                                database_1.default.ord_carritos.count({
                                    where: { created_at: { gte: inicio, lte: fin } },
                                }),
                                // Productos agotados
                                database_1.default.inv_stock_producto.count({
                                    where: { cantidad_fisica: 0 },
                                }),
                                // Stock bajo
                                database_1.default.inv_stock_producto.count({
                                    where: {
                                        cat_productos: { stock_minimo: { gte: database_1.default.inv_stock_producto.fields.cantidad_fisica } },
                                        cantidad_fisica: { gt: 0 },
                                    },
                                }),
                                // Órdenes pendientes
                                database_1.default.ord_ordenes.count({
                                    where: { estado: 'pendiente_pago' },
                                }),
                                // Clientes nuevos
                                database_1.default.cli_clientes.count({
                                    where: { created_at: { gte: inicio, lte: fin } },
                                }),
                            ])];
                    case 1:
                        _b = _c.sent(), ventasPeriodo = _b[0], totalOrdenes = _b[1], carritosCreados = _b[2], productosAgotados = _b[3], productosStockBajo = _b[4], ordenesPendientes = _b[5], clientesNuevos = _b[6];
                        ventasTotales = ventasPeriodo._sum.total || 0;
                        ticketPromedio = totalOrdenes > 0 ? Number(ventasTotales) / totalOrdenes : 0;
                        tasaConversion = carritosCreados > 0 ? (totalOrdenes / carritosCreados) * 100 : 0;
                        tasaAbandono = carritosCreados > 0 ? ((carritosCreados - totalOrdenes) / carritosCreados) * 100 : 0;
                        return [2 /*return*/, {
                                ventas_totales: Number(ventasTotales),
                                total_ordenes: totalOrdenes,
                                ticket_promedio: ticketPromedio,
                                tasa_conversion: tasaConversion,
                                tasa_abandono: tasaAbandono,
                                productos_agotados: productosAgotados,
                                productos_stock_bajo: productosStockBajo,
                                clientes_nuevos: clientesNuevos,
                                ordenes_pendientes: ordenesPendientes,
                            }];
                }
            });
        });
    };
    DashboardService.prototype.obtenerVentasDiarias = function () {
        return __awaiter(this, arguments, void 0, function (dias) {
            var _a, inicio, fin, ventas;
            if (dias === void 0) { dias = 30; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = (0, dateHelpers_1.obtenerRangoFechas)(dias), inicio = _a.inicio, fin = _a.fin;
                        return [4 /*yield*/, database_1.default.$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      SELECT \n        DATE(fecha_pedido) as fecha,\n        SUM(total) as total,\n        COUNT(*) as cantidad_ordenes\n      FROM ord_ordenes\n      WHERE fecha_pedido >= ", "\n        AND fecha_pedido <= ", "\n        AND estado NOT IN ('cancelada', 'devuelta')\n      GROUP BY DATE(fecha_pedido)\n      ORDER BY fecha\n    "], ["\n      SELECT \n        DATE(fecha_pedido) as fecha,\n        SUM(total) as total,\n        COUNT(*) as cantidad_ordenes\n      FROM ord_ordenes\n      WHERE fecha_pedido >= ", "\n        AND fecha_pedido <= ", "\n        AND estado NOT IN ('cancelada', 'devuelta')\n      GROUP BY DATE(fecha_pedido)\n      ORDER BY fecha\n    "])), inicio, fin)];
                    case 1:
                        ventas = _b.sent();
                        return [2 /*return*/, ventas];
                }
            });
        });
    };
    DashboardService.prototype.obtenerVentasPorCategoria = function () {
        return __awaiter(this, arguments, void 0, function (dias) {
            var _a, inicio, fin, ventas;
            if (dias === void 0) { dias = 30; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = (0, dateHelpers_1.obtenerRangoFechas)(dias), inicio = _a.inicio, fin = _a.fin;
                        return [4 /*yield*/, database_1.default.$queryRaw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      SELECT \n        c.nombre as categoria,\n        SUM(oi.subtotal) as total\n      FROM ord_items_orden oi\n      JOIN ord_ordenes o ON oi.orden_id = o.id\n      JOIN cat_productos p ON oi.producto_id = p.id\n      JOIN cat_categorias c ON p.categoria_id = c.id\n      WHERE o.fecha_pedido >= ", "\n        AND o.fecha_pedido <= ", "\n        AND o.estado NOT IN ('cancelada', 'devuelta')\n      GROUP BY c.nombre\n      ORDER BY total DESC\n      LIMIT 5\n    "], ["\n      SELECT \n        c.nombre as categoria,\n        SUM(oi.subtotal) as total\n      FROM ord_items_orden oi\n      JOIN ord_ordenes o ON oi.orden_id = o.id\n      JOIN cat_productos p ON oi.producto_id = p.id\n      JOIN cat_categorias c ON p.categoria_id = c.id\n      WHERE o.fecha_pedido >= ", "\n        AND o.fecha_pedido <= ", "\n        AND o.estado NOT IN ('cancelada', 'devuelta')\n      GROUP BY c.nombre\n      ORDER BY total DESC\n      LIMIT 5\n    "])), inicio, fin)];
                    case 1:
                        ventas = _b.sent();
                        return [2 /*return*/, ventas];
                }
            });
        });
    };
    DashboardService.prototype.obtenerTopProductos = function () {
        return __awaiter(this, arguments, void 0, function (dias) {
            var _a, inicio, fin, productos;
            if (dias === void 0) { dias = 30; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = (0, dateHelpers_1.obtenerRangoFechas)(dias), inicio = _a.inicio, fin = _a.fin;
                        return [4 /*yield*/, database_1.default.$queryRaw(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n      SELECT \n        p.nombre,\n        SUM(oi.cantidad) as cantidad_vendida\n      FROM ord_items_orden oi\n      JOIN ord_ordenes o ON oi.orden_id = o.id\n      JOIN cat_productos p ON oi.producto_id = p.id\n      WHERE o.fecha_pedido >= ", "\n        AND o.fecha_pedido <= ", "\n        AND o.estado NOT IN ('cancelada', 'devuelta')\n      GROUP BY p.id, p.nombre\n      ORDER BY cantidad_vendida DESC\n      LIMIT 10\n    "], ["\n      SELECT \n        p.nombre,\n        SUM(oi.cantidad) as cantidad_vendida\n      FROM ord_items_orden oi\n      JOIN ord_ordenes o ON oi.orden_id = o.id\n      JOIN cat_productos p ON oi.producto_id = p.id\n      WHERE o.fecha_pedido >= ", "\n        AND o.fecha_pedido <= ", "\n        AND o.estado NOT IN ('cancelada', 'devuelta')\n      GROUP BY p.id, p.nombre\n      ORDER BY cantidad_vendida DESC\n      LIMIT 10\n    "])), inicio, fin)];
                    case 1:
                        productos = _b.sent();
                        return [2 /*return*/, productos];
                }
            });
        });
    };
    return DashboardService;
}());
exports.DashboardService = DashboardService;
exports.dashboardService = new DashboardService();
var templateObject_1, templateObject_2, templateObject_3;
