interface SwaggerExampleValue {
    statusCode: number;
    message: string | readonly string[];
    error: string;
    timestamp: string;
    path: string;
}
interface SwaggerExampleEntry {
    summary: string;
    value: SwaggerExampleValue;
}
export declare function apiErrorContent(examples: Record<string, SwaggerExampleEntry>): {
    'application/json': {
        schema: {
            $ref: string;
        };
        examples: Record<string, SwaggerExampleEntry>;
    };
};
export declare function apiValidationErrorContent(examples: Record<string, SwaggerExampleEntry>): {
    'application/json': {
        schema: {
            $ref: string;
        };
        examples: Record<string, SwaggerExampleEntry>;
    };
};
export declare const swaggerErrorExamples: {
    readonly payloadInvalidoSignUp: {
        readonly summary: "Payload invalido (signup/start)";
        readonly value: {
            readonly statusCode: 400;
            readonly message: readonly ["Email deve ser um email valido.", "Senha deve ter no minimo 6 caracteres."];
            readonly error: "Requisicao invalida";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/signup/start";
        };
    };
    readonly payloadInvalidoSignUpVerify: {
        readonly summary: "Payload invalido (signup/verify)";
        readonly value: {
            readonly statusCode: 400;
            readonly message: readonly ["Codigo deve ter 6 digitos.", "Codigo deve conter apenas numeros."];
            readonly error: "Requisicao invalida";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/signup/verify";
        };
    };
    readonly payloadInvalidoSignUpResend: {
        readonly summary: "Payload invalido (signup/resend)";
        readonly value: {
            readonly statusCode: 400;
            readonly message: readonly ["Email deve ser um email valido."];
            readonly error: "Requisicao invalida";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/signup/resend";
        };
    };
    readonly payloadInvalidoLogin: {
        readonly summary: "Payload invalido (login)";
        readonly value: {
            readonly statusCode: 400;
            readonly message: readonly ["Email deve ser um email valido.", "Senha deve ter no minimo 6 caracteres."];
            readonly error: "Requisicao invalida";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/login";
        };
    };
    readonly payloadInvalidoForgotPasswordRequest: {
        readonly summary: "Payload invalido (forgot-password/request)";
        readonly value: {
            readonly statusCode: 400;
            readonly message: readonly ["Email deve ser um email valido."];
            readonly error: "Requisicao invalida";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/forgot-password/request";
        };
    };
    readonly payloadInvalidoForgotPasswordConfirm: {
        readonly summary: "Payload invalido (forgot-password/confirm)";
        readonly value: {
            readonly statusCode: 400;
            readonly message: readonly ["Token invalido.", "Senha deve ter no minimo 6 caracteres."];
            readonly error: "Requisicao invalida";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/forgot-password/confirm";
        };
    };
    readonly emailEmUso: {
        readonly summary: "Email ja cadastrado";
        readonly value: {
            readonly statusCode: 409;
            readonly message: "Este email ja esta em uso.";
            readonly error: "Conflito";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/signup/start";
        };
    };
    readonly credenciaisInvalidas: {
        readonly summary: "Credenciais invalidas";
        readonly value: {
            readonly statusCode: 401;
            readonly message: "Email ou senha invalidos.";
            readonly error: "Nao autorizado";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/login";
        };
    };
    readonly refreshInvalido: {
        readonly summary: "Token de refresh invalido";
        readonly value: {
            readonly statusCode: 401;
            readonly message: "Refresh token invalido ou expirado.";
            readonly error: "Nao autorizado";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/refresh";
        };
    };
    readonly linkRecuperacaoInvalido: {
        readonly summary: "Link de recuperacao invalido ou expirado";
        readonly value: {
            readonly statusCode: 401;
            readonly message: "Link de recuperacao invalido ou expirado.";
            readonly error: "Nao autorizado";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/forgot-password/confirm";
        };
    };
    readonly codigoInvalido: {
        readonly summary: "Codigo de verificacao invalido";
        readonly value: {
            readonly statusCode: 401;
            readonly message: "Codigo de verificacao invalido.";
            readonly error: "Nao autorizado";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/signup/verify";
        };
    };
    readonly codigoExpirado: {
        readonly summary: "Codigo expirado";
        readonly value: {
            readonly statusCode: 401;
            readonly message: "Codigo expirado. Solicite um novo codigo para continuar.";
            readonly error: "Nao autorizado";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/signup/verify";
        };
    };
    readonly cadastroPendenteNaoEncontrado: {
        readonly summary: "Cadastro pendente nao encontrado";
        readonly value: {
            readonly statusCode: 400;
            readonly message: "Nao existe cadastro pendente para este email.";
            readonly error: "Requisicao invalida";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/signup/resend";
        };
    };
    readonly accessTokenInvalido: {
        readonly summary: "Token de acesso invalido";
        readonly value: {
            readonly statusCode: 401;
            readonly message: "Nao autorizado.";
            readonly error: "Nao autorizado";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/me";
        };
    };
    readonly rateLimitAuth: {
        readonly summary: "Limite de requisicoes de autenticacao";
        readonly value: {
            readonly statusCode: 429;
            readonly message: "Muitas tentativas de login. Tente novamente em 60s.";
            readonly error: "Muitas requisicoes";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/login";
        };
    };
    readonly rateLimitSignUp: {
        readonly summary: "Aguarde antes de solicitar novo codigo";
        readonly value: {
            readonly statusCode: 429;
            readonly message: "Aguarde 60s para solicitar um novo codigo.";
            readonly error: "Muitas requisicoes";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/signup/resend";
        };
    };
    readonly rateLimitSignUpVerify: {
        readonly summary: "Muitas tentativas de verificacao";
        readonly value: {
            readonly statusCode: 429;
            readonly message: "Muitas tentativas de verificacao. Tente novamente em 900s.";
            readonly error: "Muitas requisicoes";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/signup/verify";
        };
    };
    readonly rateLimitForgotPassword: {
        readonly summary: "Muitas requisicoes na recuperacao de senha";
        readonly value: {
            readonly statusCode: 429;
            readonly message: "Muitas requisicoes. Tente novamente em 60s.";
            readonly error: "Muitas requisicoes";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/forgot-password/request";
        };
    };
    readonly rateLimitForgotPasswordConfirm: {
        readonly summary: "Muitas requisicoes na confirmacao de nova senha";
        readonly value: {
            readonly statusCode: 429;
            readonly message: "Muitas requisicoes. Tente novamente em 60s.";
            readonly error: "Muitas requisicoes";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/forgot-password/confirm";
        };
    };
    readonly rateLimitRota: {
        readonly summary: "Limite de requisicoes da rota";
        readonly value: {
            readonly statusCode: 429;
            readonly message: "Muitas requisicoes. Tente novamente em 60s.";
            readonly error: "Muitas requisicoes";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/signup/start";
        };
    };
};
export {};
