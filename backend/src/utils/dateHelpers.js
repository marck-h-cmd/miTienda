"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatearFecha = formatearFecha;
exports.formatearFechaHora = formatearFechaHora;
exports.calcularFechaExpiracion = calcularFechaExpiracion;
exports.esFechaExpirada = esFechaExpirada;
exports.obtenerRangoFechas = obtenerRangoFechas;
exports.obtenerInicioMes = obtenerInicioMes;
exports.obtenerFinMes = obtenerFinMes;
function formatearFecha(fecha) {
    return fecha.toISOString().split('T')[0];
}
function formatearFechaHora(fecha) {
    return fecha.toISOString().replace('T', ' ').split('.')[0];
}
function calcularFechaExpiracion(minutos) {
    return new Date(Date.now() + minutos * 60 * 1000);
}
function esFechaExpirada(fecha) {
    return new Date() > fecha;
}
function obtenerRangoFechas(dias) {
    var fin = new Date();
    var inicio = new Date();
    inicio.setDate(inicio.getDate() - dias);
    return { inicio: inicio, fin: fin };
}
function obtenerInicioMes() {
    var fecha = new Date();
    return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
}
function obtenerFinMes() {
    var fecha = new Date();
    return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
}
