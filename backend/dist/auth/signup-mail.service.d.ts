import { ConfigService } from '@nestjs/config';
interface SendSignUpCodeParams {
    email: string;
    name: string;
    code: string;
    expiresInMinutes: number;
}
interface SendPasswordRecoveryRequestParams {
    email: string;
    name: string;
    token: string;
    expiresInMinutes: number;
}
interface SendFamilyInvitationParams {
    email: string;
    name: string;
    inviterName: string;
}
export declare class SignUpMailService {
    private readonly configService;
    private readonly logger;
    private readonly transporter;
    private readonly from;
    private readonly logCodeInDev;
    private readonly frontendUrl;
    constructor(configService: ConfigService);
    sendSignUpCode({ email, name, code, expiresInMinutes, }: SendSignUpCodeParams): Promise<void>;
    sendPasswordRecoveryRequest({ email, name, token, expiresInMinutes, }: SendPasswordRecoveryRequestParams): Promise<void>;
    sendFamilyInvitation({ email, name, inviterName, }: SendFamilyInvitationParams): Promise<void>;
    private parsePositiveNumber;
    private parseBoolean;
    private buildSignupCodeText;
    private buildSignupCodeHtml;
    private buildPasswordRecoveryText;
    private buildPasswordRecoveryHtml;
    private buildFamilyInvitationText;
    private buildFamilyInvitationHtml;
    private buildResetPasswordUrl;
    private buildSignUpInvitationUrl;
    private buildLogoMarkSvg;
    private escapeHtml;
}
export {};
