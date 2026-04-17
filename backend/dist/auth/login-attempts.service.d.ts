import { ConfigService } from '@nestjs/config';
export declare class LoginAttemptsService {
    private readonly configService;
    private readonly attempts;
    private readonly enabled;
    private readonly maxFailedAttempts;
    private readonly attemptWindowMs;
    private readonly lockDurationMs;
    constructor(configService: ConfigService);
    ensureCanAttempt(email: string): void;
    registerFailedAttempt(email: string): void;
    clearAttempts(email: string): void;
    private normalizeEmail;
    private parsePositiveNumber;
    private parseBoolean;
}
