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
exports.ForgotPasswordConfirmDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ForgotPasswordConfirmDto {
    token;
    password;
}
exports.ForgotPasswordConfirmDto = ForgotPasswordConfirmDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Token de recuperacao de senha recebido por email.',
        example: '6f34e9f9b81f24dc53e0918f92f4fe9ef19a4354c19ef12b5f8f6b6ce0f5c7ea',
        minLength: 40,
    }),
    (0, class_validator_1.IsString)({ message: 'Token deve ser um texto valido.' }),
    (0, class_validator_1.MinLength)(40, { message: 'Token invalido.' }),
    (0, class_validator_1.Matches)(/^[a-fA-F0-9]+$/, { message: 'Token invalido.' }),
    __metadata("design:type", String)
], ForgotPasswordConfirmDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nova senha da conta.',
        minLength: 6,
        maxLength: 72,
        example: 'novaSenha@123',
    }),
    (0, class_validator_1.IsString)({ message: 'Senha deve ser um texto valido.' }),
    (0, class_validator_1.MinLength)(6, { message: 'Senha deve ter no minimo 6 caracteres.' }),
    (0, class_validator_1.MaxLength)(72, { message: 'Senha deve ter no maximo 72 caracteres.' }),
    __metadata("design:type", String)
], ForgotPasswordConfirmDto.prototype, "password", void 0);
//# sourceMappingURL=forgot-password-confirm.dto.js.map