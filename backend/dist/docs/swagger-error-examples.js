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
    payloadInvalido: {
        summary: 'Payload invalido',
        value: {
            statusCode: 400,
            message: ['email must be an email', 'password must be longer than or equal to 6 characters'],
            error: 'Bad Request',
        },
    },
    emailEmUso: {
        summary: 'Email ja cadastrado',
        value: {
            statusCode: 409,
            message: 'Este email ja esta em uso.',
            error: 'Conflict',
        },
    },
    credenciaisInvalidas: {
        summary: 'Credenciais invalidas',
        value: {
            statusCode: 401,
            message: 'Email ou senha invalidos.',
            error: 'Unauthorized',
        },
    },
    refreshInvalido: {
        summary: 'Refresh token invalido',
        value: {
            statusCode: 401,
            message: 'Refresh token invalido ou expirado.',
            error: 'Unauthorized',
        },
    },
    accessTokenInvalido: {
        summary: 'Access token invalido',
        value: {
            statusCode: 401,
            message: 'Unauthorized',
            error: 'Unauthorized',
        },
    },
    rateLimitAuth: {
        summary: 'Rate limit de autenticacao',
        value: {
            statusCode: 429,
            message: 'Muitas tentativas de login. Tente novamente em 60s.',
            error: 'Too Many Requests',
        },
    },
    rateLimitRota: {
        summary: 'Rate limit da rota',
        value: {
            statusCode: 429,
            message: 'ThrottlerException: Too Many Requests',
            error: 'Too Many Requests',
        },
    },
};
//# sourceMappingURL=swagger-error-examples.js.map