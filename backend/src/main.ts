import {
  BadRequestException,
  Logger,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import fastifyCookie from '@fastify/cookie';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { setupApiDocumentation } from './docs/api-docs';

function translateValidationMessage(message: string) {
  const nonWhitelistedMatch = message.match(/^property (.+) should not exist$/);
  if (nonWhitelistedMatch) {
    return `A propriedade "${nonWhitelistedMatch[1]}" nao e permitida.`;
  }

  return message;
}

function collectValidationMessages(
  errors: ValidationError[],
  bag: string[] = [],
): string[] {
  for (const error of errors) {
    if (error.constraints) {
      bag.push(
        ...Object.values(error.constraints).map(translateValidationMessage),
      );
    }

    if (error.children?.length) {
      collectValidationMessages(error.children, bag);
    }
  }

  return bag;
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.register(fastifyCookie);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = collectValidationMessages(errors);
        return new BadRequestException({
          statusCode: 400,
          message: messages.length ? messages : ['Payload invalido.'],
          error: 'Requisicao invalida',
        });
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const frontendUrl = process.env.FRONTEND_URL;

  app.enableCors({
    origin: frontendUrl ? frontendUrl.split(',').map((item) => item.trim()) : true,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const docsEnabled = process.env.API_DOCS_ENABLED !== 'false';
  const docsPaths = docsEnabled ? setupApiDocumentation(app) : null;

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');

  if (!docsPaths) {
    Logger.log('API docs desabilitada (API_DOCS_ENABLED=false).', 'Bootstrap');
    return;
  }

  const appUrl = await app.getUrl();
  const baseUrl = appUrl.replace('0.0.0.0', 'localhost');

  Logger.log(`Swagger: ${baseUrl}${docsPaths.swaggerPath}`, 'Bootstrap');
  Logger.log(`OpenAPI JSON: ${baseUrl}${docsPaths.jsonPath}`, 'Bootstrap');
  Logger.log(`Redoc: ${baseUrl}${docsPaths.redocPath}`, 'Bootstrap');
  Logger.log(`Scalar: ${baseUrl}${docsPaths.scalarPath}`, 'Bootstrap');
}
bootstrap();
