"use strict";
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
exports.clienteRepo = exports.ClienteRepository = void 0;
var database_1 = require("../config/database");
var ClienteRepository = /** @class */ (function () {
    function ClienteRepository() {
    }
    ClienteRepository.prototype.findAll = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.cli_clientes.findMany(__assign(__assign({}, options), { include: {
                            seg_usuarios: { select: { email: true, activo: true, created_at: true } },
                        } }))];
            });
        });
    };
    ClienteRepository.prototype.count = function (where) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.cli_clientes.count({ where: where })];
            });
        });
    };
    ClienteRepository.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.cli_clientes.findUnique({
                        where: { id: id },
                        include: {
                            seg_usuarios: { select: { email: true, activo: true, email_verificado: true } },
                        },
                    })];
            });
        });
    };
    ClienteRepository.prototype.findByUsuarioId = function (usuarioId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.cli_clientes.findUnique({
                        where: { usuario_id: usuarioId },
                        include: {
                            seg_usuarios: { select: { email: true } },
                        },
                    })];
            });
        });
    };
    ClienteRepository.prototype.updateByUsuarioId = function (usuarioId, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.cli_clientes.update({
                        where: { usuario_id: usuarioId },
                        data: data,
                    })];
            });
        });
    };
    ClienteRepository.prototype.toggleActivo = function (id, activo) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.seg_usuarios.update({
                        where: { id: id },
                        data: { activo: activo },
                    })];
            });
        });
    };
    ClienteRepository.prototype.findDirecciones = function (usuarioId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.cli_direcciones.findMany({
                        where: { usuario_id: usuarioId },
                    })];
            });
        });
    };
    ClienteRepository.prototype.createDireccion = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.cli_direcciones.create({ data: data })];
            });
        });
    };
    ClienteRepository.prototype.updateDireccion = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.cli_direcciones.update({ where: { id: id }, data: data })];
            });
        });
    };
    ClienteRepository.prototype.deleteDireccion = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.cli_direcciones.delete({ where: { id: id } })];
            });
        });
    };
    ClienteRepository.prototype.findListaDeseos = function (usuarioId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.cli_lista_deseos.findUnique({
                        where: { usuario_id: usuarioId },
                        include: {
                            cli_items_lista_deseos: {
                                include: {
                                    cat_productos: {
                                        include: {
                                            cat_imagenes_producto: { where: { es_principal: true }, take: 1 },
                                        },
                                    },
                                },
                            },
                        },
                    })];
            });
        });
    };
    ClienteRepository.prototype.createListaDeseos = function (usuarioId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.cli_lista_deseos.create({
                        data: { usuario_id: usuarioId },
                        include: { cli_items_lista_deseos: true },
                    })];
            });
        });
    };
    ClienteRepository.prototype.addToListaDeseos = function (listaId, productoId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.cli_items_lista_deseos.create({
                        data: { lista_id: listaId, producto_id: productoId },
                    })];
            });
        });
    };
    ClienteRepository.prototype.removeFromListaDeseos = function (listaId, productoId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, database_1.default.cli_items_lista_deseos.deleteMany({
                        where: { lista_id: listaId, producto_id: productoId },
                    })];
            });
        });
    };
    return ClienteRepository;
}());
exports.ClienteRepository = ClienteRepository;
exports.clienteRepo = new ClienteRepository();
