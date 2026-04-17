"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerErrorExamples = void 0;
exports.apiErrorContent = apiErrorContent;
exports.apiValidationErrorContent = apiValidationErrorContent;
const swagger_1 = require("@nestjs/swagger");
const auth_response_dto_1 = require("../auth/dto/auth-response.dto");
function buildContent(schemaRef, examples) {
    return {
        'application/json': {
            schema: { $ref: schemaRef },
            examples,
        },
    };
}
function apiErrorContent(examples) {
    return buildContent((0, swagger_1.getSchemaPath)(auth_response_dto_1.ApiErrorResponseDto), examples);
}
function apiValidationErrorContent(examples) {
    return buildContent((0, swagger_1.getSchemaPath)(auth_response_dto_1.ApiValidationErrorResponseDto), examples);
}
exports.swaggerErrorExamples = {
    payloadInvalidoSignUp: {
        summary: 'Payload invalido (signup)',
        value: {
            statusCode: 400,
            message: ['Email deve ser um email valido.', 'Senha deve ter no minimo 6 caracteres.'],
            error: 'Requisicao invalida',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/signup',
        },
    },
    payloadInvalidoLogin: {
        summary: 'Payload invalido (login)',
        value: {
            statusCode: 400,
            message: ['Email deve ser um email valido.', 'Senha deve ter no minimo 6 caracteres.'],
            error: 'Requisicao invalida',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/login',
        },
    },
    payloadInvalidoRefresh: {
        summary: 'Payload invalido (refresh)',
        value: {
            statusCode: 400,
            message: ['Refresh token deve ter no minimo 16 caracteres.'],
            error: 'Requisicao invalida',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/refresh',
        },
    },
    payloadInvalidoLogout: {
        summary: 'Payload invalido (logout)',
        value: {
            statusCode: 400,
            message: ['Refresh token deve ter no minimo 16 caracteres.'],
            error: 'Requisicao invalida',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/logout',
        },
    },
    emailEmUso: {
        summary: 'Email ja cadastrado',
        value: {
            statusCode: 409,
            message: 'Este email ja esta em uso.',
            error: 'Conflito',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/signup',
        },
    },
    credenciaisInvalidas: {
        summary: 'Credenciais invalidas',
        value: {
            statusCode: 401,
            message: 'Email ou senha invalidos.',
            error: 'Nao autorizado',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/login',
        },
    },
    refreshInvalido: {
        summary: 'Token de refresh invalido',
        value: {
            statusCode: 401,
            message: 'Refresh token invalido ou expirado.',
            error: 'Nao autorizado',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/refresh',
        },
    },
    accessTokenInvalido: {
        summary: 'Token de acesso invalido',
        value: {
            statusCode: 401,
            message: 'Nao autorizado.',
            error: 'Nao autorizado',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/me',
        },
    },
    rateLimitAuth: {
        summary: 'Limite de requisicoes de autenticacao',
        value: {
            statusCode: 429,
            message: 'Muitas tentativas de login. Tente novamente em 60s.',
            error: 'Muitas requisicoes',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/login',
        },
    },
    rateLimitRota: {
        summary: 'Limite de requisicoes da rota',
        value: {
            statusCode: 429,
            message: 'Muitas requisicoes. Tente novamente em 60s.',
            error: 'Muitas requisicoes',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/signup',
        },
    },
};
//# sourceMappingURL=swagger-error-examples.js.map