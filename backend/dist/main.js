"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const api_docs_1 = require("./docs/api-docs");
function translateValidationMessage(message) {
    const nonWhitelistedMatch = message.match(/^property (.+) should not exist$/);
    if (nonWhitelistedMatch) {
        return `A propriedade "${nonWhitelistedMatch[1]}" nao e permitida.`;
    }
    return message;
}
function collectValidationMessages(errors, bag = []) {
    for (const error of errors) {
        if (error.constraints) {
            bag.push(...Object.values(error.constraints).map(translateValidationMessage));
        }
        if (error.children?.length) {
            collectValidationMessages(error.children, bag);
        }
    }
    return bag;
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (errors) => {
            const messages = collectValidationMessages(errors);
            return new common_1.BadRequestException({
                statusCode: 400,
                message: messages.length ? messages : ['Payload invalido.'],
                error: 'Requisicao invalida',
            });
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const frontendUrl = process.env.FRONTEND_URL;
    app.enableCors({
        origin: frontendUrl ? frontendUrl.split(',').map((item) => item.trim()) : true,
        credentials: true,
    });
    const docsEnabled = process.env.API_DOCS_ENABLED !== 'false';
    const docsPaths = docsEnabled ? (0, api_docs_1.setupApiDocumentation)(app) : null;
    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port, '0.0.0.0');
    if (!docsPaths) {
        common_1.Logger.log('API docs desabilitada (API_DOCS_ENABLED=false).', 'Bootstrap');
        return;
    }
    const appUrl = await app.getUrl();
    const baseUrl = appUrl.replace('0.0.0.0', 'localhost');
    common_1.Logger.log(`Swagger: ${baseUrl}${docsPaths.swaggerPath}`, 'Bootstrap');
    common_1.Logger.log(`OpenAPI JSON: ${baseUrl}${docsPaths.jsonPath}`, 'Bootstrap');
    common_1.Logger.log(`Redoc: ${baseUrl}${docsPaths.redocPath}`, 'Bootstrap');
    common_1.Logger.log(`Scalar: ${baseUrl}${docsPaths.scalarPath}`, 'Bootstrap');
}
bootstrap();
//# sourceMappingURL=main.js.map