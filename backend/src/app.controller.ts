import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @SkipThrottle({ default: true })
  @ApiOperation({
    summary: 'Healthcheck da API',
    description: 'Valida se a aplicacao esta operacional.',
  })
  @ApiOkResponse({
    description: 'Servico em funcionamento.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        service: { type: 'string', example: 'fintrack-backend' },
        timestamp: { type: 'string', format: 'date-time', example: '2026-04-17T07:12:30.000Z' },
      },
      required: ['status', 'service', 'timestamp'],
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
