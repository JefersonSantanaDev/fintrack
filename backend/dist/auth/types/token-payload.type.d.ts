export interface AccessTokenPayload {
    sub: string;
    email: string;
    name: string;
    type: 'access';
}
export interface RefreshTokenPayload {
    sub: string;
    jti: string;
    type: 'refresh';
    iat?: number;
    exp?: number;
}
