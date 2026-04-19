import { AuthService } from './auth.service';
import { ActionResponseDto } from './dto/auth-response.dto';
import { ForgotPasswordConfirmDto } from './dto/forgot-password-confirm.dto';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
export declare class AuthPasswordController {
    private readonly authService;
    constructor(authService: AuthService);
    requestPasswordRecovery(dto: ForgotPasswordRequestDto): Promise<ActionResponseDto>;
    confirmPasswordRecovery(dto: ForgotPasswordConfirmDto): Promise<ActionResponseDto>;
}
