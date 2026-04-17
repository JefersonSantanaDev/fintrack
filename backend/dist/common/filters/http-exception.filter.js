"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
function statusErrorLabel(statusCode) {
    switch (statusCode) {
        case common_1.HttpStatus.BAD_REQUEST:
            return 'Requisicao invalida';
        case common_1.HttpStatus.UNAUTHORIZED:
            return 'Nao autorizado';
        case common_1.HttpStatus.FORBIDDEN:
            return 'Acesso negado';
        case common_1.HttpStatus.NOT_FOUND:
            return 'Nao encontrado';
        case common_1.HttpStatus.CONFLICT:
            return 'Conflito';
        case common_1.HttpStatus.TOO_MANY_REQUESTS:
            return 'Muitas requisicoes';
        case common_1.HttpStatus.INTERNAL_SERVER_ERROR:
            return 'Erro interno';
        default:
            return 'Erro HTTP';
    }
}
function translateKnownMessage(message) {
    if (message === 'Bad Request') {
        return 'Requisicao invalida.';
    }
    if (message === 'Unauthorized') {
        return 'Nao autorizado.';
    }
    if (message === 'Forbidden resource') {
        return 'Acesso negado.';
    }
    if (message === 'Not Found') {
        return 'Nao encontrado.';
    }
    if (message === 'Conflict') {
        return 'Conflito.';
    }
    if (message === 'Too Many Requests') {
        return 'Muitas requisicoes.';
    }
    if (message === 'Internal Server Error') {
        return 'Erro interno do servidor.';
    }
    return message;
}
function normalizeMessage(value) {
    if (!value) {
        return 'Erro inesperado.';
    }
    if (Array.isArray(value)) {
        return value.map(translateKnownMessage);
    }
    return translateKnownMessage(value);
}
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const http = host.switchToHttp();
        const response = http.getResponse();
        const request = http.getRequest();
        const statusCode = exception.getStatus();
        const payload = exception.getResponse();
        const normalizedPayload = typeof payload === 'string'
            ? {
                statusCode,
                message: normalizeMessage(payload),
                error: statusErrorLabel(statusCode),
            }
            : {
                statusCode,
                message: normalizeMessage(payload.message),
                error: statusErrorLabel(statusCode),
            };
        response.status(statusCode).send({
            ...normalizedPayload,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(common_1.HttpException)
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map