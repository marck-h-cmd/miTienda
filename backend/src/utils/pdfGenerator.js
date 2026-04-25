"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearDocumentoPDF = crearDocumentoPDF;
exports.agregarPiePagina = agregarPiePagina;
exports.agregarTablaPDF = agregarTablaPDF;
var pdfkit_1 = require("pdfkit");
var config_1 = require("../config");
var dateHelpers_1 = require("./dateHelpers");
/**
 * Crea un documento PDF base con encabezado y pie de página
 */
function crearDocumentoPDF(options) {
    var doc = new pdfkit_1.default({
        size: 'A4',
        layout: (options === null || options === void 0 ? void 0 : options.orientacion) || 'portrait',
        margin: 50,
        info: {
            Title: (options === null || options === void 0 ? void 0 : options.titulo) || 'Reporte',
            Author: config_1.config.empresa.nombre,
            Creator: 'Sistema E-Commerce',
        },
    });
    // Encabezado
    doc.fontSize(10)
        .text(config_1.config.empresa.nombre, { align: 'center' })
        .text("RUC: ".concat(config_1.config.empresa.ruc), { align: 'center' })
        .text(config_1.config.empresa.direccion, { align: 'center' });
    if (options === null || options === void 0 ? void 0 : options.titulo) {
        doc.moveDown()
            .fontSize(14)
            .text(options.titulo, { align: 'center' });
    }
    doc.moveDown();
    return doc;
}
/**
 * Agrega pie de página con número de página
 */
function agregarPiePagina(doc) {
    var range = doc.bufferedPageRange();
    for (var i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).text("Generado: ".concat((0, dateHelpers_1.formatearFechaHora)(new Date()), " | P\u00E1gina ").concat(i + 1, " de ").concat(range.count), 50, doc.page.height - 50, { align: 'center', width: doc.page.width - 100 });
    }
}
/**
 * Agrega una tabla simple al PDF
 */
function agregarTablaPDF(doc, headers, rows, columnWidths) {
    var startX = 50;
    var pageWidth = doc.page.width - 100;
    var colWidth = columnWidths || headers.map(function () { return pageWidth / headers.length; });
    // Headers
    doc.font('Helvetica-Bold').fontSize(8);
    var x = startX;
    headers.forEach(function (header, i) {
        doc.text(header, x, doc.y, { width: colWidth[i], align: 'left' });
        x += colWidth[i];
    });
    doc.moveDown(0.5);
    // Rows
    doc.font('Helvetica').fontSize(7);
    rows.forEach(function (row) {
        x = startX;
        row.forEach(function (cell, i) {
            doc.text(String(cell || ''), x, doc.y, { width: colWidth[i], align: 'left' });
            x += colWidth[i];
        });
        doc.moveDown(0.3);
        // Nueva página si es necesario
        if (doc.y > doc.page.height - 100) {
            doc.addPage();
        }
    });
}
