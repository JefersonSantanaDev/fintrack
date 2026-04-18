"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SignUpMailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignUpMailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer_1 = __importDefault(require("nodemailer"));
let SignUpMailService = SignUpMailService_1 = class SignUpMailService {
    configService;
    logger = new common_1.Logger(SignUpMailService_1.name);
    transporter;
    from;
    logCodeInDev;
    constructor(configService) {
        this.configService = configService;
        const smtpHost = this.configService.get('SMTP_HOST');
        const smtpPort = this.parsePositiveNumber(this.configService.get('SMTP_PORT'), 587);
        const smtpSecure = this.parseBoolean(this.configService.get('SMTP_SECURE'), false);
        const smtpUser = this.configService.get('SMTP_USER');
        const smtpPass = this.configService.get('SMTP_PASS');
        this.from = this.configService.get('SMTP_FROM', 'FinTrack <no-reply@fintrack.local>');
        this.logCodeInDev = this.parseBoolean(this.configService.get('AUTH_SIGNUP_LOG_CODE'), true);
        if (!smtpHost) {
            this.transporter = null;
            this.logger.warn('SMTP_HOST nao configurado. Codigos de cadastro serao apenas registrados no log.');
            return;
        }
        this.transporter = nodemailer_1.default.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
        });
    }
    async sendSignUpCode({ email, name, code, expiresInMinutes, }) {
        if (!this.transporter) {
            if (this.logCodeInDev) {
                this.logger.log(`Codigo de cadastro para ${email}: ${code} (expira em ${expiresInMinutes} min)`);
            }
            return;
        }
        const message = {
            from: this.from,
            to: email,
            subject: 'FinTrack - Codigo de verificacao do cadastro',
            text: [
                `Ola, ${name}.`,
                '',
                `Seu codigo de verificacao do FinTrack e: ${code}`,
                `Ele expira em ${expiresInMinutes} minutos.`,
                '',
                'Se voce nao solicitou esse cadastro, ignore este email.',
            ].join('\n'),
            html: [
                `<p>Ola, ${this.escapeHtml(name)}.</p>`,
                '<p>Seu codigo de verificacao do FinTrack e:</p>',
                `<p style="font-size: 28px; font-weight: 700; letter-spacing: 0.2em;">${code}</p>`,
                `<p>Ele expira em <strong>${expiresInMinutes} minutos</strong>.</p>`,
                '<p>Se voce nao solicitou esse cadastro, ignore este email.</p>',
            ].join(''),
        };
        try {
            await this.transporter.sendMail(message);
        }
        catch (error) {
            this.logger.error('Falha ao enviar email de verificacao de cadastro.', error);
            throw new common_1.InternalServerErrorException('Nao foi possivel enviar o codigo de verificacao. Tente novamente.');
        }
    }
    parsePositiveNumber(input, fallback) {
        const parsed = Number(input);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return fallback;
        }
        return parsed;
    }
    parseBoolean(input, fallback) {
        if (typeof input !== 'string') {
            return fallback;
        }
        const normalized = input.trim().toLowerCase();
        if (normalized === 'true') {
            return true;
        }
        if (normalized === 'false') {
            return false;
        }
        return fallback;
    }
    escapeHtml(value) {
        return value
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }
};
exports.SignUpMailService = SignUpMailService;
exports.SignUpMailService = SignUpMailService = SignUpMailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SignUpMailService);
//# sourceMappingURL=signup-mail.service.js.map