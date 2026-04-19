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
exports.FamilyOnboardingInviteMembersDto = exports.FamilyOnboardingInviteMemberDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class FamilyOnboardingInviteMemberDto {
    name;
    email;
}
exports.FamilyOnboardingInviteMemberDto = FamilyOnboardingInviteMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome da pessoa convidada.',
        minLength: 2,
        maxLength: 80,
        example: 'Maria Santana',
    }),
    (0, class_validator_1.IsString)({ message: 'Nome do membro deve ser um texto valido.' }),
    (0, class_validator_1.MinLength)(2, { message: 'Nome do membro deve ter no minimo 2 caracteres.' }),
    (0, class_validator_1.MaxLength)(80, { message: 'Nome do membro deve ter no maximo 80 caracteres.' }),
    __metadata("design:type", String)
], FamilyOnboardingInviteMemberDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email da pessoa convidada.',
        format: 'email',
        maxLength: 254,
        example: 'maria@exemplo.com',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email do membro deve ser um email valido.' }),
    (0, class_validator_1.MaxLength)(254, { message: 'Email do membro deve ter no maximo 254 caracteres.' }),
    __metadata("design:type", String)
], FamilyOnboardingInviteMemberDto.prototype, "email", void 0);
class FamilyOnboardingInviteMembersDto {
    members;
}
exports.FamilyOnboardingInviteMembersDto = FamilyOnboardingInviteMembersDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Lista de membros para convite no onboarding.',
        type: [FamilyOnboardingInviteMemberDto],
        minItems: 1,
        maxItems: 8,
    }),
    (0, class_validator_1.IsArray)({ message: 'Membros deve ser uma lista valida.' }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'Adicione ao menos 1 membro para convidar.' }),
    (0, class_validator_1.ArrayMaxSize)(8, { message: 'Voce pode convidar no maximo 8 membros por vez.' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FamilyOnboardingInviteMemberDto),
    __metadata("design:type", Array)
], FamilyOnboardingInviteMembersDto.prototype, "members", void 0);
//# sourceMappingURL=family-onboarding-invite.dto.js.map