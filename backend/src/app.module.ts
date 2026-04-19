import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { FamilyModule } from './family/family.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      errorMessage: (_context, throttlerLimitDetail) => {
        const retryInSeconds = Math.max(
          throttlerLimitDetail.timeToBlockExpire ?? 0,
          throttlerLimitDetail.timeToExpire ?? 0,
          1,
        );
        return `Muitas requisicoes. Tente novamente em ${retryInSeconds}s.`;
      },
      throttlers: [
        {
          name: 'default',
          ttl: 60_000,
          limit: 120,
          blockDuration: 60_000,
        },
      ],
    }),
    PrismaModule,
    AuthModule,
    FamilyModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
