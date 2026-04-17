interface SwaggerExampleValue {
    statusCode: number;
    message: string | readonly string[];
    error: string;
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
    readonly payloadInvalido: {
        readonly summary: "Payload invalido";
        readonly value: {
            readonly statusCode: 400;
            readonly message: readonly ["email must be an email", "password must be longer than or equal to 6 characters"];
            readonly error: "Bad Request";
        };
    };
    readonly emailEmUso: {
        readonly summary: "Email ja cadastrado";
        readonly value: {
            readonly statusCode: 409;
            readonly message: "Este email ja esta em uso.";
            readonly error: "Conflict";
        };
    };
    readonly credenciaisInvalidas: {
        readonly summary: "Credenciais invalidas";
        readonly value: {
            readonly statusCode: 401;
            readonly message: "Email ou senha invalidos.";
            readonly error: "Unauthorized";
        };
    };
    readonly refreshInvalido: {
        readonly summary: "Refresh token invalido";
        readonly value: {
            readonly statusCode: 401;
            readonly message: "Refresh token invalido ou expirado.";
            readonly error: "Unauthorized";
        };
    };
    readonly accessTokenInvalido: {
        readonly summary: "Access token invalido";
        readonly value: {
            readonly statusCode: 401;
            readonly message: "Unauthorized";
            readonly error: "Unauthorized";
        };
    };
    readonly rateLimitAuth: {
        readonly summary: "Rate limit de autenticacao";
        readonly value: {
            readonly statusCode: 429;
            readonly message: "Muitas tentativas de login. Tente novamente em 60s.";
            readonly error: "Too Many Requests";
        };
    };
    readonly rateLimitRota: {
        readonly summary: "Rate limit da rota";
        readonly value: {
            readonly statusCode: 429;
            readonly message: "ThrottlerException: Too Many Requests";
            readonly error: "Too Many Requests";
        };
    };
};
export {};
