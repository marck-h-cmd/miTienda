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
exports.reporteController = exports.ReporteController = void 0;
var reporte_service_1 = require("../services/reporte.service");
var ReporteController = /** @class */ (function () {
    function ReporteController() {
    }
    ReporteController.prototype.reporteOrdenes = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var filtros, pdf, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        filtros = {
                            fecha_inicio: req.query.fecha_inicio,
                            fecha_fin: req.query.fecha_fin,
                            estado: req.query.estado,
                        };
                        return [4 /*yield*/, reporte_service_1.reporteService.generarReporteOrdenes(filtros)];
                    case 1:
                        pdf = _a.sent();
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', 'attachment; filename=reporte-ordenes.pdf');
                        pdf.pipe(res);
                        pdf.end();
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
    ReporteController.prototype.reporteInventario = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var pdf, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, reporte_service_1.reporteService.generarReporteInventarioValorizado()];
                    case 1:
                        pdf = _a.sent();
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', 'attachment; filename=reporte-inventario.pdf');
                        pdf.pipe(res);
                        pdf.end();
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
    ReporteController.prototype.reporteMovimientos = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var filtros, pdf, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        filtros = {
                            fecha_inicio: req.query.fecha_inicio,
                            fecha_fin: req.query.fecha_fin,
                        };
                        return [4 /*yield*/, reporte_service_1.reporteService.generarReporteMovimientos(filtros)];
                    case 1:
                        pdf = _a.sent();
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', 'attachment; filename=reporte-movimientos.pdf');
                        pdf.pipe(res);
                        pdf.end();
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
    ReporteController.prototype.reporteStockBajo = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var pdf, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, reporte_service_1.reporteService.generarReporteStockBajo()];
                    case 1:
                        pdf = _a.sent();
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', 'attachment; filename=reporte-stock-bajo.pdf');
                        pdf.pipe(res);
                        pdf.end();
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
    ReporteController.prototype.reportePagos = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var filtros, pdf, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        filtros = {
                            fecha_inicio: req.query.fecha_inicio,
                            fecha_fin: req.query.fecha_fin,
                        };
                        return [4 /*yield*/, reporte_service_1.reporteService.generarReportePagos(filtros)];
                    case 1:
                        pdf = _a.sent();
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', 'attachment; filename=reporte-pagos.pdf');
                        pdf.pipe(res);
                        pdf.end();
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
    ReporteController.prototype.reporteDevoluciones = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var filtros, pdf, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        filtros = {
                            fecha_inicio: req.query.fecha_inicio,
                            fecha_fin: req.query.fecha_fin,
                        };
                        return [4 /*yield*/, reporte_service_1.reporteService.generarReporteDevoluciones(filtros)];
                    case 1:
                        pdf = _a.sent();
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', 'attachment; filename=reporte-devoluciones.pdf');
                        pdf.pipe(res);
                        pdf.end();
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
    ReporteController.prototype.facturaOrden = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var pdf, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, reporte_service_1.reporteService.generarFacturaOrden(req.params.ordenId)];
                    case 1:
                        pdf = _a.sent();
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', "attachment; filename=factura-".concat(req.params.ordenId, ".pdf"));
                        pdf.pipe(res);
                        pdf.end();
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
    ReporteController.prototype.reporteGestionRentabilidad = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var pdf, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, reporte_service_1.reporteService.generarReporteGestionRentabilidad()];
                    case 1:
                        pdf = _a.sent();
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', 'attachment; filename=reporte-rentabilidad.pdf');
                        pdf.pipe(res);
                        pdf.end();
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
    ReporteController.prototype.reporteGestionVentas = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var pdf, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, reporte_service_1.reporteService.generarReporteGestionVentasCategoria()];
                    case 1:
                        pdf = _a.sent();
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', 'attachment; filename=reporte-ventas.pdf');
                        pdf.pipe(res);
                        pdf.end();
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
    ReporteController.prototype.reporteGestionClientes = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var pdf, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, reporte_service_1.reporteService.generarReporteGestionClientes()];
                    case 1:
                        pdf = _a.sent();
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', 'attachment; filename=reporte-clientes.pdf');
                        pdf.pipe(res);
                        pdf.end();
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
    ReporteController.prototype.reporteGestionInventario = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var pdf, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, reporte_service_1.reporteService.generarReporteGestionRotacionInventario()];
                    case 1:
                        pdf = _a.sent();
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', 'attachment; filename=reporte-rotacion.pdf');
                        pdf.pipe(res);
                        pdf.end();
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
    // Reportes de gestión avanzados (Puppeteer - HTML to PDF)
    ReporteController.prototype.reporteGestionRentabilidadHTML = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var pdf, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, reporte_service_1.reporteService.generarReporteGestionRentabilidadHTML()];
                    case 1:
                        pdf = _a.sent();
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', 'attachment; filename=reporte-rentabilidad-gestion.pdf');
                        res.send(pdf);
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
    ReporteController.prototype.reporteGestionVentasHTML = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var pdf, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, reporte_service_1.reporteService.generarReporteGestionVentasHTML()];
                    case 1:
                        pdf = _a.sent();
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', 'attachment; filename=reporte-ventas-gestion.pdf');
                        res.send(pdf);
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
    ReporteController.prototype.reporteGestionCarritosHTML = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var pdf, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, reporte_service_1.reporteService.generarReporteGestionCarritosHTML()];
                    case 1:
                        pdf = _a.sent();
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', 'attachment; filename=reporte-carritos-gestion.pdf');
                        res.send(pdf);
                        return [3 /*break*/, 3];
                    case 2:
                        error_14 = _a.sent();
                        next(error_14);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ReporteController;
}());
exports.ReporteController = ReporteController;
exports.reporteController = new ReporteController();
