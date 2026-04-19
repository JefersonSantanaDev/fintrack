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
    frontendUrl;
    constructor(configService) {
        this.configService = configService;
        const smtpHost = this.configService.get('SMTP_HOST');
        const smtpPort = this.parsePositiveNumber(this.configService.get('SMTP_PORT'), 587);
        const smtpSecure = this.parseBoolean(this.configService.get('SMTP_SECURE'), false);
        const smtpUser = this.configService.get('SMTP_USER');
        const smtpPass = this.configService.get('SMTP_PASS');
        this.from = this.configService.get('SMTP_FROM', 'FinTrack <no-reply@fintrack.local>');
        this.logCodeInDev = this.parseBoolean(this.configService.get('AUTH_SIGNUP_LOG_CODE'), true);
        this.frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173');
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
        if (this.logCodeInDev) {
            this.logger.log(`Codigo de cadastro para ${email}: ${code} (expira em ${expiresInMinutes} min)`);
        }
        if (!this.transporter) {
            return;
        }
        const message = {
            from: this.from,
            to: email,
            subject: 'FinTrack - Codigo de verificacao do cadastro',
            text: this.buildSignupCodeText(name, code, expiresInMinutes),
            html: this.buildSignupCodeHtml(name, code, expiresInMinutes),
        };
        try {
            await this.transporter.sendMail(message);
        }
        catch (error) {
            this.logger.error('Falha ao enviar email de verificacao de cadastro.', error);
            throw new common_1.InternalServerErrorException('Nao foi possivel enviar o codigo de verificacao. Tente novamente.');
        }
    }
    async sendPasswordRecoveryRequest({ email, name, token, expiresInMinutes, }) {
        if (this.logCodeInDev) {
            this.logger.log(`Solicitacao de recuperacao de senha para ${email} (expira em ${expiresInMinutes} min)`);
        }
        if (!this.transporter) {
            return;
        }
        const resetUrl = this.buildResetPasswordUrl(token);
        const message = {
            from: this.from,
            to: email,
            subject: 'FinTrack - Recuperacao de senha',
            text: this.buildPasswordRecoveryText(name, resetUrl, expiresInMinutes),
            html: this.buildPasswordRecoveryHtml(name, resetUrl, expiresInMinutes),
        };
        try {
            await this.transporter.sendMail(message);
        }
        catch (error) {
            this.logger.error('Falha ao enviar email de recuperacao de senha.', error);
            throw new common_1.InternalServerErrorException('Nao foi possivel enviar o email de recuperacao agora.');
        }
    }
    async sendFamilyInvitation({ email, name, inviterName, }) {
        if (this.logCodeInDev) {
            this.logger.log(`Convite familiar preparado para ${email}.`);
        }
        if (!this.transporter) {
            return;
        }
        const message = {
            from: this.from,
            to: email,
            subject: 'FinTrack - Convite para sua familia financeira',
            text: this.buildFamilyInvitationText(name, inviterName),
            html: this.buildFamilyInvitationHtml(name, inviterName),
        };
        try {
            await this.transporter.sendMail(message);
        }
        catch (error) {
            this.logger.error('Falha ao enviar email de convite familiar.', error);
            throw new common_1.InternalServerErrorException('Nao foi possivel enviar o convite familiar agora.');
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
    buildSignupCodeText(name, code, expiresInMinutes) {
        return [
            `Ola, ${name}.`,
            '',
            'Seu cadastro no FinTrack esta quase pronto.',
            `Codigo de verificacao: ${code}`,
            `Expira em ${expiresInMinutes} minutos.`,
            '',
            `Acesse: ${this.frontendUrl}`,
            '',
            'Se voce nao solicitou este cadastro, ignore este email.',
        ].join('\n');
    }
    buildSignupCodeHtml(name, code, expiresInMinutes) {
        const safeName = this.escapeHtml(name);
        const safeCode = this.escapeHtml(code);
        const safeFrontendUrl = this.escapeHtml(this.frontendUrl);
        return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>FinTrack - Codigo de verificacao</title>
  </head>
  <body style="margin:0;padding:0;background:#000000;color:#ffffff;font-family:Inter,Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      Seu codigo do FinTrack e ${safeCode}. Expira em ${expiresInMinutes} minutos.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#000000;border:1px solid #414141;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 8px 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      ${this.buildLogoMarkSvg()}
                    </td>
                    <td style="width:12px;"></td>
                    <td style="vertical-align:middle;">
                      <p style="margin:0;font-size:28px;line-height:1;font-weight:800;color:#ffffff;">FinTrack</p>
                      <p style="margin:6px 0 0 0;font-size:11px;line-height:1.4;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:#a0a0a0;">Familia e Planejamento</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 6px 28px;">
                <h1 style="margin:0;font-size:34px;line-height:1.08;font-weight:900;color:#ffffff;">
                  Confirme seu cadastro no FinTrack
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 0 28px;">
                <p style="margin:0 0 8px 0;font-size:16px;line-height:1.55;color:#a0a0a0;">
                  Ola, ${safeName}. Recebemos seu pedido para criar conta. Use o codigo abaixo para finalizar com seguranca.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #faff69;border-radius:8px;">
                  <tr>
                    <td align="center" style="padding:18px 14px;">
                      <p style="margin:0 0 10px 0;font-size:12px;line-height:1.4;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:#f4f692;">
                        Codigo de verificacao
                      </p>
                      <p style="margin:0;font-size:40px;line-height:1;font-weight:900;letter-spacing:0.28em;color:#faff69;">
                        ${safeCode}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px;">
                <p style="margin:0 0 16px 0;font-size:14px;line-height:1.55;color:#a0a0a0;">
                  Este codigo expira em <span style="color:#ffffff;font-weight:700;">${expiresInMinutes} minutos</span>.
                  Se o prazo acabar, solicite um novo codigo na tela de cadastro.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 22px 28px;">
                <a href="${safeFrontendUrl}" style="display:inline-block;padding:12px 18px;border-radius:4px;border:1px solid #faff69;background:#faff69;color:#151515;font-size:15px;font-weight:700;text-decoration:none;">
                  Abrir FinTrack
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 26px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #414141;border-radius:8px;">
                  <tr>
                    <td style="padding:14px 16px;">
                      <p style="margin:0 0 8px 0;font-size:13px;line-height:1.45;color:#ffffff;font-weight:700;">
                        Nao foi voce?
                      </p>
                      <p style="margin:0;font-size:13px;line-height:1.55;color:#a0a0a0;">
                        Ignore este email se voce nao solicitou cadastro. Nenhuma acao sera concluida sem esse codigo.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
    }
    buildPasswordRecoveryText(name, resetUrl, expiresInMinutes) {
        return [
            `Ola, ${name}.`,
            '',
            'Recebemos um pedido de recuperacao de senha no FinTrack.',
            'Se foi voce, abra o link abaixo para definir uma nova senha.',
            `Este link expira em ${expiresInMinutes} minutos.`,
            '',
            `Redefinir senha: ${resetUrl}`,
            '',
            'Se voce nao solicitou, ignore este email.',
        ].join('\n');
    }
    buildPasswordRecoveryHtml(name, resetUrl, expiresInMinutes) {
        const safeName = this.escapeHtml(name);
        const safeResetUrl = this.escapeHtml(resetUrl);
        return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>FinTrack - Recuperacao de senha</title>
  </head>
  <body style="margin:0;padding:0;background:#000000;color:#ffffff;font-family:Inter,Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#000000;border:1px solid #414141;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 8px 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      ${this.buildLogoMarkSvg()}
                    </td>
                    <td style="width:12px;"></td>
                    <td style="vertical-align:middle;">
                      <p style="margin:0;font-size:28px;line-height:1;font-weight:800;color:#ffffff;">FinTrack</p>
                      <p style="margin:6px 0 0 0;font-size:11px;line-height:1.4;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:#a0a0a0;">Familia e Planejamento</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 6px 28px;">
                <h1 style="margin:0;font-size:34px;line-height:1.08;font-weight:900;color:#ffffff;">
                  Recuperacao de senha
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px;">
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.55;color:#a0a0a0;">
                  Ola, ${safeName}. Recebemos um pedido de recuperacao de senha da sua conta FinTrack.
                  Se foi voce, clique no botao abaixo para definir uma nova senha com seguranca.
                </p>
                <p style="margin:0 0 16px 0;font-size:14px;line-height:1.55;color:#a0a0a0;">
                  Este link expira em <span style="color:#ffffff;font-weight:700;">${expiresInMinutes} minutos</span>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 22px 28px;">
                <a href="${safeResetUrl}" style="display:inline-block;padding:12px 18px;border-radius:4px;border:1px solid #faff69;background:#faff69;color:#151515;font-size:15px;font-weight:700;text-decoration:none;">
                  Abrir FinTrack
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 26px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #414141;border-radius:8px;">
                  <tr>
                    <td style="padding:14px 16px;">
                      <p style="margin:0 0 8px 0;font-size:13px;line-height:1.45;color:#ffffff;font-weight:700;">
                        Nao foi voce?
                      </p>
                      <p style="margin:0;font-size:13px;line-height:1.55;color:#a0a0a0;">
                        Ignore este email se nao reconhece esta solicitacao. Nenhuma mudanca sera feita sem confirmacao.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
    }
    buildFamilyInvitationText(name, inviterName) {
        return [
            `Ola, ${name}.`,
            '',
            `${inviterName} convidou voce para participar da familia no FinTrack.`,
            'Ao criar sua conta com este email, voce podera colaborar no painel financeiro.',
            '',
            `Acesse: ${this.frontendUrl}`,
            '',
            'Se voce nao reconhece este convite, ignore este email.',
        ].join('\n');
    }
    buildFamilyInvitationHtml(name, inviterName) {
        const safeName = this.escapeHtml(name);
        const safeInviterName = this.escapeHtml(inviterName);
        const safeFrontendUrl = this.escapeHtml(this.frontendUrl);
        return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>FinTrack - Convite familiar</title>
  </head>
  <body style="margin:0;padding:0;background:#000000;color:#ffffff;font-family:Inter,Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#000000;border:1px solid #414141;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 8px 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      ${this.buildLogoMarkSvg()}
                    </td>
                    <td style="width:12px;"></td>
                    <td style="vertical-align:middle;">
                      <p style="margin:0;font-size:28px;line-height:1;font-weight:800;color:#ffffff;">FinTrack</p>
                      <p style="margin:6px 0 0 0;font-size:11px;line-height:1.4;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:#a0a0a0;">Familia e Planejamento</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 6px 28px;">
                <h1 style="margin:0;font-size:34px;line-height:1.08;font-weight:900;color:#ffffff;">
                  Voce recebeu um convite familiar
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px;">
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.55;color:#a0a0a0;">
                  Ola, ${safeName}. ${safeInviterName} convidou voce para participar da familia financeira no FinTrack.
                </p>
                <p style="margin:0 0 16px 0;font-size:14px;line-height:1.55;color:#a0a0a0;">
                  Crie sua conta com este email para entrar na colaboracao familiar.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 22px 28px;">
                <a href="${safeFrontendUrl}" style="display:inline-block;padding:12px 18px;border-radius:4px;border:1px solid #faff69;background:#faff69;color:#151515;font-size:15px;font-weight:700;text-decoration:none;">
                  Abrir FinTrack
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 26px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #414141;border-radius:8px;">
                  <tr>
                    <td style="padding:14px 16px;">
                      <p style="margin:0 0 8px 0;font-size:13px;line-height:1.45;color:#ffffff;font-weight:700;">
                        Nao reconhece este convite?
                      </p>
                      <p style="margin:0;font-size:13px;line-height:1.55;color:#a0a0a0;">
                        Ignore este email. Nenhuma acao sera tomada sem cadastro e autenticacao.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
    }
    buildResetPasswordUrl(token) {
        const baseUrl = this.frontendUrl.endsWith('/')
            ? this.frontendUrl.slice(0, -1)
            : this.frontendUrl;
        const url = new URL(baseUrl);
        const normalizedPath = url.pathname.endsWith('/')
            ? url.pathname.slice(0, -1)
            : url.pathname;
        url.pathname = `${normalizedPath}/reset-password`;
        url.searchParams.set('token', token);
        return url.toString();
    }
    buildLogoMarkSvg() {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 64 64" fill="none" role="img" aria-label="FinTrack">
  <rect width="64" height="64" rx="12" fill="#000000"/>
  <rect x="6" y="6" width="52" height="52" rx="10" fill="#141414" stroke="#414141" stroke-opacity="0.8" stroke-width="2"/>
  <rect x="20" y="34" width="6" height="14" rx="3" fill="#166534"/>
  <rect x="29" y="26" width="6" height="22" rx="3" fill="#f4f692"/>
  <rect x="38" y="18" width="6" height="30" rx="3" fill="#faff69"/>
</svg>`;
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