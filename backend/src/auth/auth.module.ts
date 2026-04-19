import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthOnboardingController } from './auth-onboarding.controller';
import { AuthPasswordController } from './auth-password.controller';
import { AuthRefreshCookieService } from './auth-refresh-cookie.service';
import { AuthSessionController } from './auth-session.controller';
import { AuthSignupController } from './auth-signup.controller';
import { AuthService } from './auth.service';
import { LoginAttemptsService } from './login-attempts.service';
import { SignUpMailService } from './signup-mail.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [ConfigModule, PassportModule, JwtModule.register({})],
  controllers: [
    AuthSignupController,
    AuthPasswordController,
    AuthSessionController,
    AuthOnboardingController,
  ],
  providers: [
    AuthService,
    AuthRefreshCookieService,
    LoginAttemptsService,
    SignUpMailService,
    JwtStrategy,
  ],
  exports: [AuthService, SignUpMailService],
})
export class AuthModule {}
