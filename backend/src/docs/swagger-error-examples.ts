import { getSchemaPath } from '@nestjs/swagger';
import {
  ApiErrorResponseDto,
  ApiValidationErrorResponseDto,
} from '../auth/dto/auth-response.dto';

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
} as const;
