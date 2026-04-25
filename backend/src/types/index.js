"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetodoPago = exports.TipoMovimientoInventario = exports.EstadoProducto = exports.EstadoOrden = void 0;
var EstadoOrden;
(function (EstadoOrden) {
    EstadoOrden["PENDIENTE_PAGO"] = "pendiente_pago";
    EstadoOrden["PAGADA"] = "pagada";
    EstadoOrden["EN_PROCESO"] = "en_proceso";
    EstadoOrden["ENVIADA"] = "enviada";
    EstadoOrden["ENTREGADA"] = "entregada";
    EstadoOrden["CANCELADA"] = "cancelada";
    EstadoOrden["DEVUELTA"] = "devuelta";
})(EstadoOrden || (exports.EstadoOrden = EstadoOrden = {}));
var EstadoProducto;
(function (EstadoProducto) {
    EstadoProducto["ACTIVO"] = "activo";
    EstadoProducto["INACTIVO"] = "inactivo";
    EstadoProducto["BORRADOR"] = "borrador";
})(EstadoProducto || (exports.EstadoProducto = EstadoProducto = {}));
var TipoMovimientoInventario;
(function (TipoMovimientoInventario) {
    TipoMovimientoInventario["ENTRADA"] = "entrada";
    TipoMovimientoInventario["SALIDA"] = "salida";
    TipoMovimientoInventario["AJUSTE"] = "ajuste";
})(TipoMovimientoInventario || (exports.TipoMovimientoInventario = TipoMovimientoInventario = {}));
var MetodoPago;
(function (MetodoPago) {
    MetodoPago["MERCADOPAGO"] = "mercadopago";
    MetodoPago["TRANSFERENCIA"] = "transferencia";
    MetodoPago["CONTRA_ENTREGA"] = "contra_entrega";
})(MetodoPago || (exports.MetodoPago = MetodoPago = {}));
