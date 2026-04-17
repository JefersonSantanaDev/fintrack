"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiErrorResponseDto = exports.LogoutResponseDto = exports.MeResponseDto = exports.AuthResponseDto = exports.PublicUserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class PublicUserDto {
    id;
    name;
    email;
}
exports.PublicUserDto = PublicUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Identificador unico do usuario.',
        example: 'clyf5q4ny0000mj08f3f1a2b3',
    }),
    __metadata("design:type", String)
], PublicUserDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome de exibicao do usuario.',
        example: 'Jeferson Santana',
    }),
    __metadata("design:type", String)
], PublicUserDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email da conta.',
        format: 'email',
        example: 'jeferson@fintrack.app',
    }),
    __metadata("design:type", String)
], PublicUserDto.prototype, "email", void 0);
class AuthResponseDto {
    user;
    accessToken;
    refreshToken;
}
exports.AuthResponseDto = AuthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Dados publicos do usuario autenticado.',
        type: PublicUserDto,
    }),
    __metadata("design:type", PublicUserDto)
], AuthResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'JWT de acesso para endpoints protegidos.',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token-payload.signature',
    }),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'JWT de refresh para renovar sessao.',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token-payload.signature',
    }),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "refreshToken", void 0);
class MeResponseDto {
    user;
}
exports.MeResponseDto = MeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Dados publicos da sessao atual.',
        type: PublicUserDto,
    }),
    __metadata("design:type", PublicUserDto)
], MeResponseDto.prototype, "user", void 0);
class LogoutResponseDto {
    success;
}
exports.LogoutResponseDto = LogoutResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Indica que o logout foi processado com sucesso.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], LogoutResponseDto.prototype, "success", void 0);
class ApiErrorResponseDto {
    statusCode;
    message;
    error;
}
exports.ApiErrorResponseDto = ApiErrorResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Codigo HTTP retornado no erro.',
        example: 401,
    }),
    __metadata("design:type", Number)
], ApiErrorResponseDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Mensagem de erro da API.',
        example: 'Email ou senha invalidos.',
    }),
    __metadata("design:type", String)
], ApiErrorResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de erro HTTP.',
        example: 'Unauthorized',
    }),
    __metadata("design:type", String)
], ApiErrorResponseDto.prototype, "error", void 0);
//# sourceMappingURL=auth-response.dto.js.map