export declare class PublicUserDto {
    id: string;
    name: string;
    email: string;
}
export declare class AuthResponseDto {
    user: PublicUserDto;
    accessToken: string;
}
export declare class SignUpChallengeResponseDto {
    success: boolean;
    message: string;
    email: string;
    expiresInSeconds: number;
    resendAvailableInSeconds: number;
}
export declare class MeResponseDto {
    user: PublicUserDto;
}
export declare class LogoutResponseDto {
    success: boolean;
}
export declare class ApiErrorResponseDto {
    statusCode: number;
    message: string;
    error: string;
    timestamp: string;
    path: string;
}
export declare class ApiValidationErrorResponseDto {
    statusCode: number;
    message: string[];
    error: string;
    timestamp: string;
    path: string;
}
