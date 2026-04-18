import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class LoginAttemptsService {
    private readonly configService;
    private readonly prisma;
    private readonly enabled;
    private readonly maxFailedAttempts;
    private readonly attemptWindowMs;
    private readonly lockDurationMs;
    constructor(configService: ConfigService, prisma: PrismaService);
    ensureCanAttempt(email: string): Promise<void>;
    registerFailedAttempt(email: string): Promise<void>;
    clearAttempts(email: string): Promise<void>;
    private normalizeEmail;
    private parsePositiveNumber;
    private parseBoolean;
}
