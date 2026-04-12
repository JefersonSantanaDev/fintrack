import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignUpDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './types/auth-user.type';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signUp(dto: SignUpDto): Promise<import("./auth.service").AuthResponse>;
    login(dto: LoginDto): Promise<import("./auth.service").AuthResponse>;
    refresh(dto: RefreshTokenDto): Promise<import("./auth.service").AuthResponse>;
    logout(dto: LogoutDto): Promise<{
        success: boolean;
    }>;
    me(user: AuthenticatedUser): Promise<{
        user: import("./auth.service").PublicUser;
    }>;
}
