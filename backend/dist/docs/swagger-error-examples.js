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
        summary: 'Payload invalido (signup/start)',
        value: {
            statusCode: 400,
            message: ['Email deve ser um email valido.', 'Senha deve ter no minimo 6 caracteres.'],
            error: 'Requisicao invalida',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/signup/start',
        },
    },
    payloadInvalidoSignUpVerify: {
        summary: 'Payload invalido (signup/verify)',
        value: {
            statusCode: 400,
            message: ['Codigo deve ter 6 digitos.', 'Codigo deve conter apenas numeros.'],
            error: 'Requisicao invalida',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/signup/verify',
        },
    },
    payloadInvalidoSignUpResend: {
        summary: 'Payload invalido (signup/resend)',
        value: {
            statusCode: 400,
            message: ['Email deve ser um email valido.'],
            error: 'Requisicao invalida',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/signup/resend',
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
    payloadInvalidoForgotPasswordRequest: {
        summary: 'Payload invalido (forgot-password/request)',
        value: {
            statusCode: 400,
            message: ['Email deve ser um email valido.'],
            error: 'Requisicao invalida',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/forgot-password/request',
        },
    },
    payloadInvalidoForgotPasswordConfirm: {
        summary: 'Payload invalido (forgot-password/confirm)',
        value: {
            statusCode: 400,
            message: ['Token invalido.', 'Senha deve ter no minimo 6 caracteres.'],
            error: 'Requisicao invalida',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/forgot-password/confirm',
        },
    },
    payloadInvalidoOnboardingInvites: {
        summary: 'Payload invalido (onboarding/family/invitations)',
        value: {
            statusCode: 400,
            message: [
                'Adicione ao menos 1 membro para convidar.',
                'Email do membro deve ser um email valido.',
            ],
            error: 'Requisicao invalida',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/onboarding/family/invitations',
        },
    },
    payloadInvalidoFamilyInvites: {
        summary: 'Payload invalido (family/invitations)',
        value: {
            statusCode: 400,
            message: [
                'Adicione ao menos 1 membro para convidar.',
                'Email do membro deve ser um email valido.',
            ],
            error: 'Requisicao invalida',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/family/invitations',
        },
    },
    payloadInvalidoFamilyRole: {
        summary: 'Payload invalido (family/members/:id/role)',
        value: {
            statusCode: 400,
            message: ['Papel deve ser admin ou viewer.'],
            error: 'Requisicao invalida',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/family/members/4c66fc27-37f6-4fdd-b9de-36db78350d7f/role',
        },
    },
    emailEmUso: {
        summary: 'Email ja cadastrado',
        value: {
            statusCode: 409,
            message: 'Este email ja esta em uso.',
            error: 'Conflito',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/signup/start',
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
    linkRecuperacaoInvalido: {
        summary: 'Link de recuperacao invalido ou expirado',
        value: {
            statusCode: 401,
            message: 'Link de recuperacao invalido ou expirado.',
            error: 'Nao autorizado',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/forgot-password/confirm',
        },
    },
    codigoInvalido: {
        summary: 'Codigo de verificacao invalido',
        value: {
            statusCode: 401,
            message: 'Codigo de verificacao invalido.',
            error: 'Nao autorizado',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/signup/verify',
        },
    },
    codigoExpirado: {
        summary: 'Codigo expirado',
        value: {
            statusCode: 401,
            message: 'Codigo expirado. Solicite um novo codigo para continuar.',
            error: 'Nao autorizado',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/signup/verify',
        },
    },
    cadastroPendenteNaoEncontrado: {
        summary: 'Cadastro pendente nao encontrado',
        value: {
            statusCode: 400,
            message: 'Nao existe cadastro pendente para este email.',
            error: 'Requisicao invalida',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/signup/resend',
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
    semPermissaoFamilia: {
        summary: 'Perfil sem permissao para esta operacao',
        value: {
            statusCode: 403,
            message: 'Apenas owners podem gerenciar membros da familia.',
            error: 'Proibido',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/family/members/4c66fc27-37f6-4fdd-b9de-36db78350d7f/role',
        },
    },
    conviteNaoEncontrado: {
        summary: 'Convite pendente nao encontrado',
        value: {
            statusCode: 404,
            message: 'Convite pendente nao encontrado.',
            error: 'Nao encontrado',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/family/invitations/1f2f0931-942c-49a7-9f5b-5f946610f16f/resend',
        },
    },
    membroNaoEncontrado: {
        summary: 'Membro nao encontrado na familia',
        value: {
            statusCode: 404,
            message: 'Membro da familia nao encontrado.',
            error: 'Nao encontrado',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/family/members/4c66fc27-37f6-4fdd-b9de-36db78350d7f',
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
    rateLimitSignUp: {
        summary: 'Aguarde antes de solicitar novo codigo',
        value: {
            statusCode: 429,
            message: 'Aguarde 60s para solicitar um novo codigo.',
            error: 'Muitas requisicoes',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/signup/resend',
        },
    },
    rateLimitSignUpVerify: {
        summary: 'Muitas tentativas de verificacao',
        value: {
            statusCode: 429,
            message: 'Muitas tentativas de verificacao. Tente novamente em 900s.',
            error: 'Muitas requisicoes',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/signup/verify',
        },
    },
    rateLimitForgotPassword: {
        summary: 'Muitas requisicoes na recuperacao de senha',
        value: {
            statusCode: 429,
            message: 'Muitas requisicoes. Tente novamente em 60s.',
            error: 'Muitas requisicoes',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/forgot-password/request',
        },
    },
    rateLimitForgotPasswordConfirm: {
        summary: 'Muitas requisicoes na confirmacao de nova senha',
        value: {
            statusCode: 429,
            message: 'Muitas requisicoes. Tente novamente em 60s.',
            error: 'Muitas requisicoes',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/forgot-password/confirm',
        },
    },
    rateLimitRota: {
        summary: 'Limite de requisicoes da rota',
        value: {
            statusCode: 429,
            message: 'Muitas requisicoes. Tente novamente em 60s.',
            error: 'Muitas requisicoes',
            timestamp: '2026-04-17T03:40:12.000Z',
            path: '/api/auth/signup/start',
        },
    },
};
//# sourceMappingURL=swagger-error-examples.js.map