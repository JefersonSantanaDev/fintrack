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
exports.SignUpVerifyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SignUpVerifyDto {
    email;
    code;
}
exports.SignUpVerifyDto = SignUpVerifyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email usado no inicio do cadastro.',
        format: 'email',
        example: 'jeferson@fintrack.app',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email deve ser um email valido.' }),
    __metadata("design:type", String)
], SignUpVerifyDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Codigo numerico de verificacao enviado por email.',
        example: '482931',
        minLength: 6,
        maxLength: 6,
    }),
    (0, class_validator_1.IsString)({ message: 'Codigo deve ser um texto valido.' }),
    (0, class_validator_1.Length)(6, 6, { message: 'Codigo deve ter 6 digitos.' }),
    (0, class_validator_1.Matches)(/^\d{6}$/, { message: 'Codigo deve conter apenas numeros.' }),
    __metadata("design:type", String)
], SignUpVerifyDto.prototype, "code", void 0);
//# sourceMappingURL=signup-verify.dto.js.map