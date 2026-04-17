import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { setupApiDocumentation } from './docs/api-docs';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const frontendUrl = process.env.FRONTEND_URL;

  app.enableCors({
    origin: frontendUrl ? frontendUrl.split(',').map((item) => item.trim()) : true,
    credentials: true,
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
