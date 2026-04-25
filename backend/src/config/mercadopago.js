"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentClient = exports.preferenceClient = void 0;
var mercadopago_1 = require("mercadopago");
var index_1 = require("./index");
// Configuración del cliente de Mercado Pago
var client = new mercadopago_1.MercadoPagoConfig({
    accessToken: index_1.config.mercadopago.accessToken,
    options: { timeout: 5000 },
});
// Instancias de los recursos de Mercado Pago
exports.preferenceClient = new mercadopago_1.Preference(client);
exports.paymentClient = new mercadopago_1.Payment(client);
exports.default = client;
