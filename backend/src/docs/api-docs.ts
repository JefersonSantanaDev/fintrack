import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export interface ApiDocsPaths {
  readonly swaggerPath: string;
  readonly jsonPath: string;
  readonly redocPath: string;
  readonly scalarPath: string;
}

const API_DOCS_PATH = '/api/docs';
const API_DOCS_JSON_PATH = '/api/docs-json';
const API_REDOC_PATH = '/api/redoc';
const API_SCALAR_PATH = '/api/scalar';

function redocHtml(specUrl: string) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>FinTrack API - Redoc</title>
    <style>
      body { margin: 0; background: #0b0c10; color: #f5f5f5; font-family: Arial, sans-serif; }
      #redoc-container { min-height: 100vh; }
      .redoc-fallback {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        text-align: center;
        color: #d4d4d4;
      }
      .redoc-fallback a { color: #e7ef63; }
    </style>
  </head>
  <body>
    <div id="redoc-container"></div>
    <div id="redoc-fallback" class="redoc-fallback" style="display:none">
      <div>
        <h2>Nao foi possivel carregar o ReDoc agora.</h2>
        <p>Tente usar o <a href="/api/docs">Swagger</a> ou o <a href="/api/scalar">Scalar</a>.</p>
      </div>
    </div>
    <script src="https://cdn.redoc.ly/redoc/v2.1.5/bundles/redoc.standalone.js"></script>
    <script>
      (function () {
        const container = document.getElementById('redoc-container');
        const fallback = document.getElementById('redoc-fallback');
        if (!window.Redoc || !container) {
          if (fallback) fallback.style.display = 'flex';
          return;
        }
        window.Redoc.init('${specUrl}', {}, container);
      })();
    </script>
  </body>
</html>`;
}

function scalarHtml(specUrl: string) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>FinTrack API - Scalar</title>
  </head>
  <body>
    <script
      id="api-reference"
      data-url="${specUrl}"
      data-theme="kepler"
    ></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;
}

export function setupApiDocumentation(app: NestFastifyApplication): ApiDocsPaths {
  const openApiConfig = new DocumentBuilder()
    .setTitle('FinTrack API')
    .setDescription('Documentacao OpenAPI da API do FinTrack.')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT de acesso',
      },
      'access-token',
    )
    .build();

  const openApiDocument = SwaggerModule.createDocument(app, openApiConfig);

  SwaggerModule.setup(API_DOCS_PATH, app, openApiDocument, {
    customSiteTitle: 'FinTrack API - Swagger',
    explorer: true,
    jsonDocumentUrl: API_DOCS_JSON_PATH,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
    },
  });

  const fastify = app.getHttpAdapter().getInstance() as FastifyInstance;

  fastify.get(API_REDOC_PATH, (_request: FastifyRequest, reply: FastifyReply) => {
    reply.type('text/html; charset=utf-8').send(redocHtml(API_DOCS_JSON_PATH));
  });

  fastify.get(API_SCALAR_PATH, (_request: FastifyRequest, reply: FastifyReply) => {
    reply.type('text/html; charset=utf-8').send(scalarHtml(API_DOCS_JSON_PATH));
  });

  return {
    swaggerPath: API_DOCS_PATH,
    jsonPath: API_DOCS_JSON_PATH,
    redocPath: API_REDOC_PATH,
    scalarPath: API_SCALAR_PATH,
  };
}
