"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const auth_onboarding_controller_1 = require("./auth-onboarding.controller");
const auth_password_controller_1 = require("./auth-password.controller");
const auth_refresh_cookie_service_1 = require("./auth-refresh-cookie.service");
const auth_session_controller_1 = require("./auth-session.controller");
const auth_signup_controller_1 = require("./auth-signup.controller");
const auth_service_1 = require("./auth.service");
const login_attempts_service_1 = require("./login-attempts.service");
const signup_mail_service_1 = require("./signup-mail.service");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, passport_1.PassportModule, jwt_1.JwtModule.register({})],
        controllers: [
            auth_signup_controller_1.AuthSignupController,
            auth_password_controller_1.AuthPasswordController,
            auth_session_controller_1.AuthSessionController,
            auth_onboarding_controller_1.AuthOnboardingController,
        ],
        providers: [
            auth_service_1.AuthService,
            auth_refresh_cookie_service_1.AuthRefreshCookieService,
            login_attempts_service_1.LoginAttemptsService,
            signup_mail_service_1.SignUpMailService,
            jwt_strategy_1.JwtStrategy,
        ],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map