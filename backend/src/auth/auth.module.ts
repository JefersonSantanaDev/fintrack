import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginAttemptsService } from './login-attempts.service';
import { SignUpMailService } from './signup-mail.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [ConfigModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, LoginAttemptsService, SignUpMailService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
