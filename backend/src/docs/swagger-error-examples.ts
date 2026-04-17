import { getSchemaPath } from '@nestjs/swagger';
import {
  ApiErrorResponseDto,
  ApiValidationErrorResponseDto,
} from '../auth/dto/auth-response.dto';

interface SwaggerExampleValue {
  statusCode: number;
  message: string | readonly string[];
  error: string;
}

interface SwaggerExampleEntry {
  summary: string;
  value: SwaggerExampleValue;
}

function buildContent(schemaRef: string, examples: Record<string, SwaggerExampleEntry>) {
  return {
    'application/json': {
      schema: { $ref: schemaRef },
      examples,
    },
  };
}

export function apiErrorContent(examples: Record<string, SwaggerExampleEntry>) {
  return buildContent(getSchemaPath(ApiErrorResponseDto), examples);
}

export function apiValidationErrorContent(
  examples: Record<string, SwaggerExampleEntry>,
) {
  return buildContent(getSchemaPath(ApiValidationErrorResponseDto), examples);
}

export const swaggerErrorExamples = {
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
} as const;
