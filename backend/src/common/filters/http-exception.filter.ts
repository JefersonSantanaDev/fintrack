import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

type ExceptionResponsePayload =
  | string
  | {
      message?: string | string[];
      error?: string;
      statusCode?: number;
    };

function statusErrorLabel(statusCode: number) {
  switch (statusCode) {
    case HttpStatus.BAD_REQUEST:
      return 'Requisicao invalida';
    case HttpStatus.UNAUTHORIZED:
      return 'Nao autorizado';
    case HttpStatus.FORBIDDEN:
      return 'Acesso negado';
    case HttpStatus.NOT_FOUND:
      return 'Nao encontrado';
    case HttpStatus.CONFLICT:
      return 'Conflito';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'Muitas requisicoes';
    case HttpStatus.INTERNAL_SERVER_ERROR:
      return 'Erro interno';
    default:
      return 'Erro HTTP';
  }
}

function translateKnownMessage(message: string) {
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

function normalizeMessage(value: string | string[] | undefined) {
  if (!value) {
    return 'Erro inesperado.';
  }

  if (Array.isArray(value)) {
    return value.map(translateKnownMessage);
  }

  return translateKnownMessage(value);
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<FastifyReply>();
    const request = http.getRequest<FastifyRequest>();

    const statusCode = exception.getStatus();
    const payload = exception.getResponse() as ExceptionResponsePayload;

    const normalizedPayload =
      typeof payload === 'string'
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
}
