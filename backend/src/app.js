"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var helmet_1 = require("helmet");
var morgan_1 = require("morgan");
var swagger_ui_express_1 = require("swagger-ui-express");
var config_1 = require("./config");
var errorHandler_1 = require("./middlewares/errorHandler");
var rateLimiter_1 = require("./middlewares/rateLimiter");
var routes_1 = require("./routes");
var swagger_1 = require("./utils/swagger");
var app = (0, express_1.default)();
// Middlewares globales
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.app.frontendUrl,
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('combined'));
app.use(rateLimiter_1.generalLimiter);
// Ruta de health check
app.get('/health', function (_req, res) {
    res.json({ success: true, message: 'API funcionando correctamente' });
});
// Documentación Swagger
app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// Rutas de la API
app.use('/api/v1', routes_1.default);
// Middleware de manejo de errores
app.use(errorHandler_1.errorHandler);
exports.default = app;
