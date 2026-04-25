"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
function validateBody(schema) {
    return function (req, res, next) {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
function validateQuery(schema) {
    return function (req, res, next) {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
function validateParams(schema) {
    return function (req, res, next) {
        try {
            req.params = schema.parse(req.params);
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
