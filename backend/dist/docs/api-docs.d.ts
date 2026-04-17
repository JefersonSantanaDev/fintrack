import type { NestFastifyApplication } from '@nestjs/platform-fastify';
export interface ApiDocsPaths {
    readonly swaggerPath: string;
    readonly jsonPath: string;
    readonly redocPath: string;
    readonly scalarPath: string;
}
export declare function setupApiDocumentation(app: NestFastifyApplication): ApiDocsPaths;
