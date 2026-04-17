import { AuthResponseDto, LogoutResponseDto, MeResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignUpDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './types/auth-user.type';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signUp(dto: SignUpDto): Promise<AuthResponseDto>;
    login(dto: LoginDto): Promise<AuthResponseDto>;
    refresh(dto: RefreshTokenDto): Promise<AuthResponseDto>;
    logout(dto: LogoutDto): Promise<LogoutResponseDto>;
    me(user: AuthenticatedUser): Promise<MeResponseDto>;
}
