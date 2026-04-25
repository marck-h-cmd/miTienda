"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.reporteService = exports.ReporteService = void 0;
var pdfkit_1 = require("pdfkit");
var database_1 = require("../config/database");
var config_1 = require("../config");
var dateHelpers_1 = require("../utils/dateHelpers");
var errorHandler_1 = require("../middlewares/errorHandler");
var pdfGestion_1 = require("../utils/pdfGestion");
var ReporteService = /** @class */ (function () {
    function ReporteService() {
    }
    // ============================================
    // REPORTES OPERACIONALES (PDFKit)
    // ============================================
    ReporteService.prototype.crearDocumentoBase = function () {
        var doc = new pdfkit_1.default({
            size: 'A4',
            margin: 50,
            info: {
                Title: 'Reporte',
                Author: config_1.config.empresa.nombre,
                Creator: 'Sistema de E-Commerce',
            },
        });
        // Encabezado
        doc.fontSize(10)
            .text(config_1.config.empresa.nombre, { align: 'center' })
            .text("RUC: ".concat(config_1.config.empresa.ruc), { align: 'center' })
            .text(config_1.config.empresa.direccion, { align: 'center' })
            .moveDown();
        return doc;
    };
    ReporteService.prototype.agregarPiePagina = function (doc) {
        var totalPages = doc.bufferedPageRange().count;
        for (var i = 0; i < totalPages; i++) {
            doc.switchToPage(i);
            doc.fontSize(8)
                .text("Generado: ".concat((0, dateHelpers_1.formatearFechaHora)(new Date()), " | P\u00E1gina ").concat(i + 1, " de ").concat(totalPages), 50, doc.page.height - 50, { align: 'center' });
        }
    };
    ReporteService.prototype.generarReporteOrdenes = function (filtros) {
        return __awaiter(this, void 0, void 0, function () {
            var where, ordenes, doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        where = {};
                        if (filtros.fecha_inicio)
                            where.fecha_pedido = { gte: new Date(filtros.fecha_inicio) };
                        if (filtros.fecha_fin)
                            where.fecha_pedido = __assign(__assign({}, where.fecha_pedido), { lte: new Date(filtros.fecha_fin) });
                        if (filtros.estado)
                            where.estado = filtros.estado;
                        return [4 /*yield*/, database_1.default.ord_ordenes.findMany({
                                where: where,
                                include: {
                                    cli_clientes: { select: { nombre: true, apellido: true, email: true } },
                                    ord_items_orden: { include: { cat_productos: { select: { nombre: true } } } },
                                    ord_historial_estados: { orderBy: { fecha_cambio: 'desc' }, take: 1 },
                                },
                                orderBy: { fecha_pedido: 'desc' },
                            })];
                    case 1:
                        ordenes = _a.sent();
                        doc = this.crearDocumentoBase();
                        doc.fontSize(16).text('REPORTE DE ÓRDENES', { align: 'center' }).moveDown();
                        doc.fontSize(10).text("Fecha: ".concat((0, dateHelpers_1.formatearFecha)(new Date()))).moveDown();
                        // Tabla de órdenes
                        doc.fontSize(9);
                        ordenes.forEach(function (orden, index) {
                            if (index > 0)
                                doc.moveDown(0.5);
                            doc.font('Helvetica-Bold').text("Orden #".concat(orden.id.slice(0, 8)));
                            doc.font('Helvetica')
                                .text("Cliente: ".concat(orden.cli_clientes.nombre, " ").concat(orden.cli_clientes.apellido))
                                .text("Email: ".concat(orden.cli_clientes.email))
                                .text("Total: ".concat(config_1.config.negocio.monedaDefecto, " ").concat(Number(orden.total).toFixed(2)))
                                .text("Estado: ".concat(orden.estado))
                                .text("Items: ".concat(orden.ord_items_orden.length, " | Fecha: ").concat((0, dateHelpers_1.formatearFecha)(orden.fecha_pedido)));
                            doc.moveDown(0.3).text('---', { align: 'center' });
                        });
                        this.agregarPiePagina(doc);
                        return [2 /*return*/, doc];
                }
            });
        });
    };
    ReporteService.prototype.generarReporteInventarioValorizado = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stock, doc, totalCosto, totalVenta;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.inv_stock_producto.findMany({
                            include: {
                                cat_productos: {
                                    select: { nombre: true, sku: true, precio_costo: true, precio_venta: true },
                                },
                            },
                        })];
                    case 1:
                        stock = _a.sent();
                        doc = this.crearDocumentoBase();
                        doc.fontSize(16).text('INVENTARIO VALORIZADO', { align: 'center' }).moveDown();
                        totalCosto = 0;
                        totalVenta = 0;
                        stock.forEach(function (item) {
                            var costoTotal = Number(item.cat_productos.precio_costo) * item.cantidad_fisica;
                            var ventaTotal = Number(item.cat_productos.precio_venta) * item.cantidad_fisica;
                            totalCosto += costoTotal;
                            totalVenta += ventaTotal;
                            doc.fontSize(9)
                                .text("".concat(item.cat_productos.sku, " - ").concat(item.cat_productos.nombre))
                                .text("Stock: ".concat(item.cantidad_fisica, " | Costo: ").concat(config_1.config.negocio.monedaDefecto, " ").concat(costoTotal.toFixed(2), " | Venta: ").concat(config_1.config.negocio.monedaDefecto, " ").concat(ventaTotal.toFixed(2)));
                            doc.moveDown(0.3);
                        });
                        doc.moveDown();
                        doc.font('Helvetica-Bold').fontSize(11);
                        doc.text("TOTAL COSTO: ".concat(config_1.config.negocio.monedaDefecto, " ").concat(totalCosto.toFixed(2)));
                        doc.text("TOTAL VENTA: ".concat(config_1.config.negocio.monedaDefecto, " ").concat(totalVenta.toFixed(2)));
                        doc.text("MARGEN: ".concat(config_1.config.negocio.monedaDefecto, " ").concat((totalVenta - totalCosto).toFixed(2)));
                        this.agregarPiePagina(doc);
                        return [2 /*return*/, doc];
                }
            });
        });
    };
    ReporteService.prototype.generarReporteMovimientos = function (filtros) {
        return __awaiter(this, void 0, void 0, function () {
            var where, movimientos, doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        where = {};
                        if (filtros.fecha_inicio)
                            where.fecha_movimiento = { gte: new Date(filtros.fecha_inicio) };
                        if (filtros.fecha_fin)
                            where.fecha_movimiento = __assign(__assign({}, where.fecha_movimiento), { lte: new Date(filtros.fecha_fin) });
                        return [4 /*yield*/, database_1.default.inv_movimientos_inventario.findMany({
                                where: where,
                                include: {
                                    cat_productos: { select: { nombre: true, sku: true } },
                                },
                                orderBy: { fecha_movimiento: 'desc' },
                            })];
                    case 1:
                        movimientos = _a.sent();
                        doc = this.crearDocumentoBase();
                        doc.fontSize(16).text('MOVIMIENTOS DE INVENTARIO', { align: 'center' }).moveDown();
                        movimientos.forEach(function (mov) {
                            doc.fontSize(9)
                                .font('Helvetica-Bold').text("".concat(mov.cat_productos.sku, " - ").concat(mov.cat_productos.nombre))
                                .font('Helvetica')
                                .text("Tipo: ".concat(mov.tipo_movimiento, " | Cantidad: ").concat(mov.cantidad, " | Motivo: ").concat(mov.motivo))
                                .text("Fecha: ".concat((0, dateHelpers_1.formatearFechaHora)(mov.fecha_movimiento)));
                            doc.moveDown(0.3);
                        });
                        this.agregarPiePagina(doc);
                        return [2 /*return*/, doc];
                }
            });
        });
    };
    ReporteService.prototype.generarReporteStockBajo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var productos, doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.inv_stock_producto.findMany({
                            where: {
                                cat_productos: {
                                    stock_minimo: {
                                        gte: database_1.default.inv_stock_producto.fields.cantidad_fisica,
                                    },
                                },
                            },
                            include: {
                                cat_productos: {
                                    select: { nombre: true, sku: true, stock_minimo: true, precio_venta: true },
                                },
                            },
                        })];
                    case 1:
                        productos = _a.sent();
                        doc = this.crearDocumentoBase();
                        doc.fontSize(16).text('PRODUCTOS CON STOCK BAJO', { align: 'center' }).moveDown();
                        productos.forEach(function (item) {
                            doc.fontSize(9)
                                .text("".concat(item.cat_productos.sku, " - ").concat(item.cat_productos.nombre))
                                .text("Stock Actual: ".concat(item.cantidad_fisica, " | Stock M\u00EDnimo: ").concat(item.cat_productos.stock_minimo, " | Diferencia: ").concat(item.cat_productos.stock_minimo - item.cantidad_fisica));
                            doc.moveDown(0.3);
                        });
                        this.agregarPiePagina(doc);
                        return [2 /*return*/, doc];
                }
            });
        });
    };
    ReporteService.prototype.generarReportePagos = function (filtros) {
        return __awaiter(this, void 0, void 0, function () {
            var where, pagos, doc, totalPagos;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        where = {};
                        if (filtros.fecha_inicio)
                            where.fecha_creacion = { gte: new Date(filtros.fecha_inicio) };
                        if (filtros.fecha_fin)
                            where.fecha_creacion = __assign(__assign({}, where.fecha_creacion), { lte: new Date(filtros.fecha_fin) });
                        return [4 /*yield*/, database_1.default.ord_transacciones_pago.findMany({
                                where: where,
                                include: {
                                    ord_ordenes: {
                                        include: {
                                            cli_clientes: { select: { nombre: true, apellido: true } },
                                        },
                                    },
                                },
                                orderBy: { fecha_creacion: 'desc' },
                            })];
                    case 1:
                        pagos = _a.sent();
                        doc = this.crearDocumentoBase();
                        doc.fontSize(16).text('REPORTE DE PAGOS', { align: 'center' }).moveDown();
                        totalPagos = 0;
                        pagos.forEach(function (pago) {
                            totalPagos += Number(pago.monto);
                            doc.fontSize(9)
                                .text("Pago ID: ".concat(pago.id.slice(0, 8), " | Estado: ").concat(pago.estado))
                                .text("Monto: ".concat(pago.moneda, " ").concat(Number(pago.monto).toFixed(2), " | M\u00E9todo: ").concat(pago.tipo_pago))
                                .text("Fecha: ".concat((0, dateHelpers_1.formatearFechaHora)(pago.fecha_creacion)));
                            doc.moveDown(0.3);
                        });
                        doc.moveDown();
                        doc.font('Helvetica-Bold').text("TOTAL: ".concat(config_1.config.negocio.monedaDefecto, " ").concat(totalPagos.toFixed(2)));
                        this.agregarPiePagina(doc);
                        return [2 /*return*/, doc];
                }
            });
        });
    };
    ReporteService.prototype.generarReporteDevoluciones = function (filtros) {
        return __awaiter(this, void 0, void 0, function () {
            var where, devoluciones, doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        where = { estado: 'devuelta' };
                        if (filtros.fecha_inicio)
                            where.fecha_pedido = { gte: new Date(filtros.fecha_inicio) };
                        if (filtros.fecha_fin)
                            where.fecha_pedido = __assign(__assign({}, where.fecha_pedido), { lte: new Date(filtros.fecha_fin) });
                        return [4 /*yield*/, database_1.default.ord_ordenes.findMany({
                                where: where,
                                include: {
                                    cli_clientes: { select: { nombre: true, apellido: true } },
                                    ord_items_orden: true,
                                },
                                orderBy: { fecha_actualizacion: 'desc' },
                            })];
                    case 1:
                        devoluciones = _a.sent();
                        doc = this.crearDocumentoBase();
                        doc.fontSize(16).text('REPORTE DE DEVOLUCIONES', { align: 'center' }).moveDown();
                        devoluciones.forEach(function (dev) {
                            doc.fontSize(9)
                                .text("Orden: ".concat(dev.id.slice(0, 8), " | Cliente: ").concat(dev.cli_clientes.nombre))
                                .text("Total: ".concat(config_1.config.negocio.monedaDefecto, " ").concat(Number(dev.total).toFixed(2)))
                                .text("Fecha Devoluci\u00F3n: ".concat((0, dateHelpers_1.formatearFecha)(dev.fecha_actualizacion)));
                            doc.moveDown(0.3);
                        });
                        this.agregarPiePagina(doc);
                        return [2 /*return*/, doc];
                }
            });
        });
    };
    ReporteService.prototype.generarFacturaOrden = function (ordenId) {
        return __awaiter(this, void 0, void 0, function () {
            var orden, doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.ord_ordenes.findUnique({
                            where: { id: ordenId },
                            include: {
                                cli_clientes: { select: { nombre: true, apellido: true, email: true } },
                                ord_items_orden: { include: { cat_productos: { select: { nombre: true, sku: true } } } },
                                ord_direcciones_envio: true,
                            },
                        })];
                    case 1:
                        orden = _a.sent();
                        if (!orden)
                            throw new errorHandler_1.NotFoundError('Orden no encontrada');
                        doc = this.crearDocumentoBase();
                        doc.fontSize(18).text('FACTURA', { align: 'center' }).moveDown();
                        doc.fontSize(10)
                            .text("Factura N\u00B0: ".concat(orden.id.slice(0, 8).toUpperCase()))
                            .text("Fecha: ".concat((0, dateHelpers_1.formatearFecha)(orden.fecha_pedido)))
                            .text("Cliente: ".concat(orden.cli_clientes.nombre, " ").concat(orden.cli_clientes.apellido))
                            .text("Email: ".concat(orden.cli_clientes.email))
                            .moveDown();
                        // Items
                        doc.font('Helvetica-Bold').text('Producto          Cant.    P.Unit.    Subtotal');
                        doc.font('Helvetica');
                        orden.ord_items_orden.forEach(function (item) {
                            doc.text("".concat(item.cat_productos.nombre.substring(0, 20).padEnd(20), " ").concat(String(item.cantidad).padStart(5), " ").concat(Number(item.precio_unitario).toFixed(2).padStart(8), " ").concat(Number(item.subtotal).toFixed(2).padStart(10)));
                        });
                        doc.moveDown();
                        doc.font('Helvetica-Bold');
                        doc.text("Subtotal: ".concat(config_1.config.negocio.monedaDefecto, " ").concat(Number(orden.subtotal).toFixed(2)));
                        doc.text("Descuento: ".concat(config_1.config.negocio.monedaDefecto, " ").concat(Number(orden.descuento).toFixed(2)));
                        doc.text("IGV: ".concat(config_1.config.negocio.monedaDefecto, " ").concat(Number(orden.impuesto).toFixed(2)));
                        doc.text("Env\u00EDo: ".concat(config_1.config.negocio.monedaDefecto, " ").concat(Number(orden.costo_envio).toFixed(2)));
                        doc.fontSize(12).text("TOTAL: ".concat(orden.moneda, " ").concat(Number(orden.total).toFixed(2)));
                        this.agregarPiePagina(doc);
                        return [2 /*return*/, doc];
                }
            });
        });
    };
    // ============================================
    // REPORTES DE GESTIÓN (PDFKit básicos)
    // ============================================
    ReporteService.prototype.generarReporteGestionRentabilidad = function () {
        return __awaiter(this, void 0, void 0, function () {
            var productos, doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      SELECT \n        p.nombre, p.sku,\n        p.precio_costo, p.precio_venta,\n        COALESCE(SUM(oi.cantidad), 0) as unidades_vendidas,\n        COALESCE(SUM(oi.subtotal), 0) as ingresos,\n        (COALESCE(SUM(oi.subtotal), 0) - (p.precio_costo * COALESCE(SUM(oi.cantidad), 0))) as margen\n      FROM cat_productos p\n      LEFT JOIN ord_items_orden oi ON oi.producto_id = p.id\n      LEFT JOIN ord_ordenes o ON oi.orden_id = o.id AND o.estado NOT IN ('cancelada', 'devuelta')\n      GROUP BY p.id, p.nombre, p.sku, p.precio_costo, p.precio_venta\n      ORDER BY ingresos DESC\n    "], ["\n      SELECT \n        p.nombre, p.sku,\n        p.precio_costo, p.precio_venta,\n        COALESCE(SUM(oi.cantidad), 0) as unidades_vendidas,\n        COALESCE(SUM(oi.subtotal), 0) as ingresos,\n        (COALESCE(SUM(oi.subtotal), 0) - (p.precio_costo * COALESCE(SUM(oi.cantidad), 0))) as margen\n      FROM cat_productos p\n      LEFT JOIN ord_items_orden oi ON oi.producto_id = p.id\n      LEFT JOIN ord_ordenes o ON oi.orden_id = o.id AND o.estado NOT IN ('cancelada', 'devuelta')\n      GROUP BY p.id, p.nombre, p.sku, p.precio_costo, p.precio_venta\n      ORDER BY ingresos DESC\n    "])))];
                    case 1:
                        productos = _a.sent();
                        doc = this.crearDocumentoBase();
                        doc.fontSize(16).text('RENTABILIDAD POR PRODUCTO', { align: 'center' }).moveDown();
                        productos.forEach(function (p) {
                            doc.fontSize(9)
                                .text("".concat(p.sku, " - ").concat(p.nombre))
                                .text("Vendidos: ".concat(p.unidades_vendidas, " | Ingresos: ").concat(config_1.config.negocio.monedaDefecto, " ").concat(Number(p.ingresos).toFixed(2)))
                                .text("Margen: ".concat(config_1.config.negocio.monedaDefecto, " ").concat(Number(p.margen).toFixed(2)));
                            doc.moveDown(0.3);
                        });
                        this.agregarPiePagina(doc);
                        return [2 /*return*/, doc];
                }
            });
        });
    };
    ReporteService.prototype.generarReporteGestionVentasCategoria = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ventas, doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.$queryRaw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      SELECT \n        c.nombre as categoria,\n        COUNT(DISTINCT o.id) as total_ordenes,\n        COALESCE(SUM(o.total), 0) as total_ventas\n      FROM cat_categorias c\n      JOIN cat_productos p ON p.categoria_id = c.id\n      LEFT JOIN ord_items_orden oi ON oi.producto_id = p.id\n      LEFT JOIN ord_ordenes o ON oi.orden_id = o.id AND o.estado NOT IN ('cancelada', 'devuelta')\n      GROUP BY c.id, c.nombre\n      ORDER BY total_ventas DESC\n    "], ["\n      SELECT \n        c.nombre as categoria,\n        COUNT(DISTINCT o.id) as total_ordenes,\n        COALESCE(SUM(o.total), 0) as total_ventas\n      FROM cat_categorias c\n      JOIN cat_productos p ON p.categoria_id = c.id\n      LEFT JOIN ord_items_orden oi ON oi.producto_id = p.id\n      LEFT JOIN ord_ordenes o ON oi.orden_id = o.id AND o.estado NOT IN ('cancelada', 'devuelta')\n      GROUP BY c.id, c.nombre\n      ORDER BY total_ventas DESC\n    "])))];
                    case 1:
                        ventas = _a.sent();
                        doc = this.crearDocumentoBase();
                        doc.fontSize(16).text('VENTAS POR CATEGORÍA', { align: 'center' }).moveDown();
                        ventas.forEach(function (v) {
                            doc.fontSize(10)
                                .text("".concat(v.categoria, ": ").concat(config_1.config.negocio.monedaDefecto, " ").concat(Number(v.total_ventas).toFixed(2), " (").concat(v.total_ordenes, " \u00F3rdenes)"));
                        });
                        this.agregarPiePagina(doc);
                        return [2 /*return*/, doc];
                }
            });
        });
    };
    ReporteService.prototype.generarReporteGestionClientes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var clientes, doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.$queryRaw(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n      SELECT \n        c.nombre, c.apellido, c.email,\n        COUNT(o.id) as total_compras,\n        COALESCE(SUM(o.total), 0) as total_gastado,\n        MAX(o.fecha_pedido) as ultima_compra\n      FROM cli_clientes c\n      LEFT JOIN ord_ordenes o ON o.cliente_id = c.id AND o.estado NOT IN ('cancelada', 'devuelta')\n      GROUP BY c.id, c.nombre, c.apellido, c.email\n      ORDER BY total_gastado DESC\n    "], ["\n      SELECT \n        c.nombre, c.apellido, c.email,\n        COUNT(o.id) as total_compras,\n        COALESCE(SUM(o.total), 0) as total_gastado,\n        MAX(o.fecha_pedido) as ultima_compra\n      FROM cli_clientes c\n      LEFT JOIN ord_ordenes o ON o.cliente_id = c.id AND o.estado NOT IN ('cancelada', 'devuelta')\n      GROUP BY c.id, c.nombre, c.apellido, c.email\n      ORDER BY total_gastado DESC\n    "])))];
                    case 1:
                        clientes = _a.sent();
                        doc = this.crearDocumentoBase();
                        doc.fontSize(16).text('ANÁLISIS DE CLIENTES', { align: 'center' }).moveDown();
                        clientes.forEach(function (c) {
                            doc.fontSize(9)
                                .text("".concat(c.nombre, " ").concat(c.apellido, " (").concat(c.email, ")"))
                                .text("Compras: ".concat(c.total_compras, " | Total: ").concat(config_1.config.negocio.monedaDefecto, " ").concat(Number(c.total_gastado).toFixed(2), " | \u00DAltima: ").concat(c.ultima_compra ? (0, dateHelpers_1.formatearFecha)(new Date(c.ultima_compra)) : 'N/A'));
                            doc.moveDown(0.3);
                        });
                        this.agregarPiePagina(doc);
                        return [2 /*return*/, doc];
                }
            });
        });
    };
    ReporteService.prototype.generarReporteGestionRotacionInventario = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rotacion, doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.$queryRaw(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n      SELECT \n        p.nombre, p.sku,\n        COALESCE(s.cantidad_fisica, 0) as stock_actual,\n        COALESCE(SUM(oi.cantidad), 0) as total_vendido\n      FROM cat_productos p\n      LEFT JOIN inv_stock_producto s ON s.producto_id = p.id\n      LEFT JOIN ord_items_orden oi ON oi.producto_id = p.id\n      LEFT JOIN ord_ordenes o ON oi.orden_id = o.id AND o.estado NOT IN ('cancelada', 'devuelta')\n      GROUP BY p.id, p.nombre, p.sku, s.cantidad_fisica\n      ORDER BY total_vendido DESC\n    "], ["\n      SELECT \n        p.nombre, p.sku,\n        COALESCE(s.cantidad_fisica, 0) as stock_actual,\n        COALESCE(SUM(oi.cantidad), 0) as total_vendido\n      FROM cat_productos p\n      LEFT JOIN inv_stock_producto s ON s.producto_id = p.id\n      LEFT JOIN ord_items_orden oi ON oi.producto_id = p.id\n      LEFT JOIN ord_ordenes o ON oi.orden_id = o.id AND o.estado NOT IN ('cancelada', 'devuelta')\n      GROUP BY p.id, p.nombre, p.sku, s.cantidad_fisica\n      ORDER BY total_vendido DESC\n    "])))];
                    case 1:
                        rotacion = _a.sent();
                        doc = this.crearDocumentoBase();
                        doc.fontSize(16).text('ROTACIÓN DE INVENTARIO', { align: 'center' }).moveDown();
                        rotacion.forEach(function (r) {
                            var rot = Number(r.stock_actual) > 0 ? Number(r.total_vendido) / Number(r.stock_actual) : 0;
                            doc.fontSize(9)
                                .text("".concat(r.sku, " - ").concat(r.nombre))
                                .text("Stock: ".concat(r.stock_actual, " | Vendido: ").concat(r.total_vendido, " | Rotaci\u00F3n: ").concat(rot.toFixed(2)));
                            doc.moveDown(0.3);
                        });
                        this.agregarPiePagina(doc);
                        return [2 /*return*/, doc];
                }
            });
        });
    };
    // ============================================
    // REPORTES DE GESTIÓN AVANZADOS (Puppeteer)
    // ============================================
    ReporteService.prototype.generarReporteGestionRentabilidadHTML = function () {
        return __awaiter(this, void 0, void 0, function () {
            var productos;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.$queryRaw(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n      SELECT p.nombre, p.sku, p.precio_costo, p.precio_venta,\n        COALESCE(SUM(oi.cantidad), 0) as unidades_vendidas,\n        COALESCE(SUM(oi.subtotal), 0) as ingresos\n      FROM cat_productos p\n      LEFT JOIN ord_items_orden oi ON oi.producto_id = p.id\n      LEFT JOIN ord_ordenes o ON oi.orden_id = o.id\n      GROUP BY p.id\n      ORDER BY ingresos DESC\n    "], ["\n      SELECT p.nombre, p.sku, p.precio_costo, p.precio_venta,\n        COALESCE(SUM(oi.cantidad), 0) as unidades_vendidas,\n        COALESCE(SUM(oi.subtotal), 0) as ingresos\n      FROM cat_productos p\n      LEFT JOIN ord_items_orden oi ON oi.producto_id = p.id\n      LEFT JOIN ord_ordenes o ON oi.orden_id = o.id\n      GROUP BY p.id\n      ORDER BY ingresos DESC\n    "])))];
                    case 1:
                        productos = _a.sent();
                        return [2 /*return*/, (0, pdfGestion_1.generarPDFGestion)('Reporte de Rentabilidad por Producto', productos, ['Producto', 'Unidades Vendidas', 'Ingresos', 'Costo Unit.', 'Margen'], ['nombre', 'unidades_vendidas', 'ingresos', 'precio_costo', 'margen'], 'ingresos')];
                }
            });
        });
    };
    ReporteService.prototype.generarReporteGestionVentasHTML = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ventas;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.$queryRaw(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n      SELECT c.nombre as categoria, COUNT(DISTINCT o.id) as total_ordenes, SUM(o.total) as total_ventas\n      FROM cat_categorias c\n      JOIN cat_productos p ON p.categoria_id = c.id\n      LEFT JOIN ord_items_orden oi ON oi.producto_id = p.id\n      LEFT JOIN ord_ordenes o ON oi.orden_id = o.id\n      GROUP BY c.id, c.nombre\n    "], ["\n      SELECT c.nombre as categoria, COUNT(DISTINCT o.id) as total_ordenes, SUM(o.total) as total_ventas\n      FROM cat_categorias c\n      JOIN cat_productos p ON p.categoria_id = c.id\n      LEFT JOIN ord_items_orden oi ON oi.producto_id = p.id\n      LEFT JOIN ord_ordenes o ON oi.orden_id = o.id\n      GROUP BY c.id, c.nombre\n    "])))];
                    case 1:
                        ventas = _a.sent();
                        return [2 /*return*/, (0, pdfGestion_1.generarPDFGestion)('Reporte de Ventas por Categoría', ventas, ['Categoría', 'Órdenes', 'Total Ventas'], ['categoria', 'total_ordenes', 'total_ventas'], 'total_ventas')];
                }
            });
        });
    };
    ReporteService.prototype.generarReporteGestionCarritosHTML = function () {
        return __awaiter(this, void 0, void 0, function () {
            var carritos;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.default.$queryRaw(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n      SELECT \n        DATE(c.created_at) as fecha,\n        COUNT(*) as carritos_creados,\n        COUNT(DISTINCT o.id) as ordenes\n      FROM ord_carritos c\n      LEFT JOIN ord_ordenes o ON o.cliente_id = c.usuario_id\n        AND DATE(o.fecha_pedido) = DATE(c.created_at)\n      GROUP BY DATE(c.created_at)\n      ORDER BY fecha DESC\n      LIMIT 30\n    "], ["\n      SELECT \n        DATE(c.created_at) as fecha,\n        COUNT(*) as carritos_creados,\n        COUNT(DISTINCT o.id) as ordenes\n      FROM ord_carritos c\n      LEFT JOIN ord_ordenes o ON o.cliente_id = c.usuario_id\n        AND DATE(o.fecha_pedido) = DATE(c.created_at)\n      GROUP BY DATE(c.created_at)\n      ORDER BY fecha DESC\n      LIMIT 30\n    "])))];
                    case 1:
                        carritos = _a.sent();
                        return [2 /*return*/, (0, pdfGestion_1.generarPDFGestion)('Reporte de Comportamiento de Carritos', carritos, ['Fecha', 'Carritos', 'Órdenes', 'Tasa Conversión'], ['fecha', 'carritos_creados', 'ordenes', 'conversion'], 'carritos_creados')];
                }
            });
        });
    };
    return ReporteService;
}());
exports.ReporteService = ReporteService;
exports.reporteService = new ReporteService();
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7;
