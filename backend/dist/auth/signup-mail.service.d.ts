import { ConfigService } from '@nestjs/config';
interface SendSignUpCodeParams {
    email: string;
    name: string;
    code: string;
    expiresInMinutes: number;
}
export declare class SignUpMailService {
    private readonly configService;
    private readonly logger;
    private readonly transporter;
    private readonly from;
    private readonly logCodeInDev;
    constructor(configService: ConfigService);
    sendSignUpCode({ email, name, code, expiresInMinutes, }: SendSignUpCodeParams): Promise<void>;
    private parsePositiveNumber;
    private parseBoolean;
    private escapeHtml;
}
export {};
