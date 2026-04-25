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
exports.generarPDFGestion = generarPDFGestion;
var puppeteer_1 = require("puppeteer");
var config_1 = require("../config");
var dateHelpers_1 = require("./dateHelpers");
var logger_1 = require("./logger");
/**
 * Genera un PDF de gestión usando Puppeteer con HTML y gráficos embebidos
 */
function generarPDFGestion(titulo, datos, columnas, campos, campoGrafico) {
    return __awaiter(this, void 0, void 0, function () {
        var browser, page, html, pdf, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, puppeteer_1.default.launch({
                        headless: true,
                        args: ['--no-sandbox', '--disable-setuid-sandbox'],
                    })];
                case 1:
                    browser = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, 7, 9]);
                    return [4 /*yield*/, browser.newPage()];
                case 3:
                    page = _a.sent();
                    html = generarHTMLReporte(titulo, datos, columnas, campos);
                    return [4 /*yield*/, page.setContent(html, { waitUntil: 'networkidle0' })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, page.pdf({
                            format: 'A4',
                            margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
                            printBackground: true,
                            displayHeaderFooter: true,
                            headerTemplate: "\n        <div style=\"font-size:10px; text-align:center; width:100%;\">\n          ".concat(config_1.config.empresa.nombre, " - ").concat(titulo, "\n        </div>\n      "),
                            footerTemplate: "\n        <div style=\"font-size:8px; text-align:center; width:100%;\">\n          P\u00E1gina <span class=\"pageNumber\"></span> de <span class=\"totalPages\"></span> | Generado: ".concat((0, dateHelpers_1.formatearFecha)(new Date()), "\n        </div>\n      "),
                        })];
                case 5:
                    pdf = _a.sent();
                    return [2 /*return*/, Buffer.from(pdf)];
                case 6:
                    error_1 = _a.sent();
                    logger_1.default.error('Error generando PDF de gestión:', error_1);
                    throw new Error('Error al generar el reporte PDF');
                case 7: return [4 /*yield*/, browser.close()];
                case 8:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function generarHTMLReporte(titulo, datos, columnas, campos) {
    var filas = datos.map(function (dato) {
        return "\n      <tr>\n        ".concat(campos.map(function (campo) { return "<td>".concat(dato[campo] || '-', "</td>"); }).join(''), "\n      </tr>\n    ");
    }).join('');
    // Calcular totales si hay campo numérico
    var resumenHTML = '';
    if (campos.length > 1) {
        var totales = campos.map(function (campo) {
            var total = datos.reduce(function (sum, d) { return sum + (Number(d[campo]) || 0); }, 0);
            return "<td><strong>".concat(total.toFixed(2), "</strong></td>");
        }).join('');
        resumenHTML = "\n      <tfoot>\n        <tr style=\"background-color: #e0e0e0;\">\n          <td><strong>TOTALES</strong></td>\n          ".concat(totales, "\n        </tr>\n      </tfoot>\n    ");
    }
    return "\n    <!DOCTYPE html>\n    <html>\n    <head>\n      <meta charset=\"UTF-8\">\n      <style>\n        body {\n          font-family: Arial, sans-serif;\n          margin: 0;\n          padding: 20px;\n          color: #333;\n        }\n        .header {\n          text-align: center;\n          margin-bottom: 30px;\n          border-bottom: 2px solid #2c3e50;\n          padding-bottom: 15px;\n        }\n        .header h1 {\n          color: #2c3e50;\n          font-size: 24px;\n          margin: 0 0 10px 0;\n        }\n        .header .empresa {\n          font-size: 14px;\n          color: #666;\n        }\n        table {\n          width: 100%;\n          border-collapse: collapse;\n          margin-bottom: 20px;\n        }\n        th {\n          background-color: #2c3e50;\n          color: white;\n          padding: 10px;\n          font-size: 11px;\n          text-align: left;\n        }\n        td {\n          padding: 8px;\n          font-size: 10px;\n          border-bottom: 1px solid #ddd;\n        }\n        tr:nth-child(even) {\n          background-color: #f9f9f9;\n        }\n        .resumen {\n          margin-top: 30px;\n          padding: 15px;\n          background-color: #f0f7ff;\n          border-radius: 5px;\n        }\n        .footer {\n          margin-top: 40px;\n          text-align: center;\n          font-size: 9px;\n          color: #999;\n          border-top: 1px solid #ddd;\n          padding-top: 10px;\n        }\n      </style>\n    </head>\n    <body>\n      <div class=\"header\">\n        <h1>".concat(titulo, "</h1>\n        <div class=\"empresa\">\n          ").concat(config_1.config.empresa.nombre, " | RUC: ").concat(config_1.config.empresa.ruc, " | ").concat(config_1.config.empresa.direccion, "\n        </div>\n      </div>\n\n      <table>\n        <thead>\n          <tr>\n            <th>#</th>\n            ").concat(columnas.map(function (col) { return "<th>".concat(col, "</th>"); }).join(''), "\n          </tr>\n        </thead>\n        <tbody>\n          ").concat(datos.map(function (dato, index) { return "\n            <tr>\n              <td>".concat(index + 1, "</td>\n              ").concat(campos.map(function (campo) {
        var valor = dato[campo];
        if (typeof valor === 'number') {
            return "<td style=\"text-align: right;\">".concat(config_1.config.negocio.monedaDefecto, " ").concat(valor.toFixed(2), "</td>");
        }
        return "<td>".concat(valor || '-', "</td>");
    }).join(''), "\n            </tr>\n          "); }).join(''), "\n        </tbody>\n        <tfoot>\n          <tr style=\"background-color: #e0e0e0; font-weight: bold;\">\n            <td colspan=\"1\">TOTAL</td>\n            ").concat(campos.slice(1).map(function (campo) {
        var total = datos.reduce(function (sum, d) { return sum + (Number(d[campo]) || 0); }, 0);
        return "<td style=\"text-align: right;\">".concat(config_1.config.negocio.monedaDefecto, " ").concat(total.toFixed(2), "</td>");
    }).join(''), "\n          </tr>\n        </tfoot>\n      </table>\n\n      <div class=\"resumen\">\n        <strong>Resumen Ejecutivo</strong>\n        <p>Total de registros: ").concat(datos.length, "</p>\n        <p>Per\u00EDodo: ").concat((0, dateHelpers_1.formatearFecha)(new Date()), "</p>\n      </div>\n\n      <div class=\"footer\">\n        Este reporte fue generado autom\u00E1ticamente por el Sistema de E-Commerce.\n        Para cualquier consulta, contactar a ").concat(config_1.config.empresa.email, "\n      </div>\n    </body>\n    </html>\n  ");
}
