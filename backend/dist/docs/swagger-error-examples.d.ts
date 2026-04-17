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
        readonly summary: "Payload invalido (signup)";
        readonly value: {
            readonly statusCode: 400;
            readonly message: readonly ["Email deve ser um email valido.", "Senha deve ter no minimo 6 caracteres."];
            readonly error: "Requisicao invalida";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/signup";
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
    readonly payloadInvalidoRefresh: {
        readonly summary: "Payload invalido (refresh)";
        readonly value: {
            readonly statusCode: 400;
            readonly message: readonly ["Refresh token deve ter no minimo 16 caracteres."];
            readonly error: "Requisicao invalida";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/refresh";
        };
    };
    readonly payloadInvalidoLogout: {
        readonly summary: "Payload invalido (logout)";
        readonly value: {
            readonly statusCode: 400;
            readonly message: readonly ["Refresh token deve ter no minimo 16 caracteres."];
            readonly error: "Requisicao invalida";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/logout";
        };
    };
    readonly emailEmUso: {
        readonly summary: "Email ja cadastrado";
        readonly value: {
            readonly statusCode: 409;
            readonly message: "Este email ja esta em uso.";
            readonly error: "Conflito";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/signup";
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
    readonly rateLimitRota: {
        readonly summary: "Limite de requisicoes da rota";
        readonly value: {
            readonly statusCode: 429;
            readonly message: "Muitas requisicoes. Tente novamente em 60s.";
            readonly error: "Muitas requisicoes";
            readonly timestamp: "2026-04-17T03:40:12.000Z";
            readonly path: "/api/auth/signup";
        };
    };
};
export {};
