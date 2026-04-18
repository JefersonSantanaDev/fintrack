import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

interface SendSignUpCodeParams {
  email: string;
  name: string;
  code: string;
  expiresInMinutes: number;
}

@Injectable()
export class SignUpMailService {
  private readonly logger = new Logger(SignUpMailService.name);
  private readonly transporter: nodemailer.Transporter | null;
  private readonly from: string;
  private readonly logCodeInDev: boolean;

  constructor(private readonly configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.parsePositiveNumber(
      this.configService.get<string>('SMTP_PORT'),
      587,
    );

    const smtpSecure = this.parseBoolean(
      this.configService.get<string>('SMTP_SECURE'),
      false,
    );

    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    this.from = this.configService.get<string>(
      'SMTP_FROM',
      'FinTrack <no-reply@fintrack.local>',
    );

    this.logCodeInDev = this.parseBoolean(
      this.configService.get<string>('AUTH_SIGNUP_LOG_CODE'),
      true,
    );

    if (!smtpHost) {
      this.transporter = null;
      this.logger.warn(
        'SMTP_HOST nao configurado. Codigos de cadastro serao apenas registrados no log.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
    });
  }

  async sendSignUpCode({
    email,
    name,
    code,
    expiresInMinutes,
  }: SendSignUpCodeParams) {
    if (!this.transporter) {
      if (this.logCodeInDev) {
        this.logger.log(
          `Codigo de cadastro para ${email}: ${code} (expira em ${expiresInMinutes} min)`,
        );
      }
      return;
    }

    const message: Mail.Options = {
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
    } catch (error) {
      this.logger.error('Falha ao enviar email de verificacao de cadastro.', error);
      throw new InternalServerErrorException(
        'Nao foi possivel enviar o codigo de verificacao. Tente novamente.',
      );
    }
  }

  private parsePositiveNumber(input: string | undefined, fallback: number) {
    const parsed = Number(input);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }

    return parsed;
  }

  private parseBoolean(input: string | undefined, fallback: boolean) {
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

  private escapeHtml(value: string) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
