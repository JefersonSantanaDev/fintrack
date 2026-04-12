import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignUpDto } from './dto/signup.dto';
export interface PublicUser {
    id: string;
    name: string;
    email: string;
}
export interface AuthResponse {
    user: PublicUser;
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly accessSecret;
    private readonly refreshSecret;
    private readonly accessExpiresIn;
    private readonly refreshExpiresIn;
    private readonly bcryptSaltRounds;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    signUp(dto: SignUpDto): Promise<AuthResponse>;
    login(dto: LoginDto): Promise<AuthResponse>;
    refresh(dto: RefreshTokenDto): Promise<AuthResponse>;
    logout(dto: LogoutDto): Promise<{
        success: boolean;
    }>;
    getProfile(userId: string): Promise<{
        user: PublicUser;
    }>;
    private normalizeEmail;
    private toPublicUser;
    private buildAuthResponse;
    private issueTokenPair;
    private verifyRefreshToken;
    private findRefreshToken;
}
