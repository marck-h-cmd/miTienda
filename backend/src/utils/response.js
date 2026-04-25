"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendPaginated = sendPaginated;
exports.sendError = sendError;
function sendSuccess(res, data, message, statusCode) {
    if (message === void 0) { message = 'Operación exitosa'; }
    if (statusCode === void 0) { statusCode = 200; }
    return res.status(statusCode).json({
        success: true,
        message: message,
        data: data,
    });
}
function sendPaginated(res, data, total, page, limit) {
    return res.status(200).json({
        success: true,
        total: total,
        page: page,
        limit: limit,
        data: data,
    });
}
function sendError(res, message, statusCode, errors) {
    if (statusCode === void 0) { statusCode = 500; }
    return res.status(statusCode).json({
        success: false,
        message: message,
        errors: errors,
    });
}
