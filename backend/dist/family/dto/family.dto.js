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
exports.ActionResponseDto = exports.UpdateFamilyMemberRoleResponseDto = exports.UpdateFamilyMemberRoleDto = exports.FamilyInviteMembersResponseDto = exports.FamilyInviteMembersDto = exports.FamilyInviteMemberInputDto = exports.FamilyWorkspaceDto = exports.FamilyPermissionsDto = exports.FamilyInvitationDto = exports.FamilyMemberDto = exports.manageableFamilyRoleValues = exports.familyRoleValues = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
exports.familyRoleValues = ['owner', 'admin', 'viewer'];
exports.manageableFamilyRoleValues = ['admin', 'viewer'];
class FamilyMemberDto {
    id;
    name;
    email;
    role;
    isCurrentUser;
}
exports.FamilyMemberDto = FamilyMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Identificador unico do usuario membro da familia.',
        example: 'c5cef748-09ad-4704-85e7-9a25eaf8789b',
    }),
    __metadata("design:type", String)
], FamilyMemberDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome do membro da familia.',
        example: 'Jeferson Santana',
    }),
    __metadata("design:type", String)
], FamilyMemberDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email do membro da familia.',
        format: 'email',
        example: 'jeferson@fintrack.app',
    }),
    __metadata("design:type", String)
], FamilyMemberDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Papel atual do membro na familia.',
        enum: exports.familyRoleValues,
        example: 'owner',
    }),
    __metadata("design:type", String)
], FamilyMemberDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Indica se esse membro e o usuario logado.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], FamilyMemberDto.prototype, "isCurrentUser", void 0);
class FamilyInvitationDto {
    id;
    name;
    email;
    status;
    sentAt;
    inviterName;
}
exports.FamilyInvitationDto = FamilyInvitationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Identificador unico do convite.',
        example: '1f2f0931-942c-49a7-9f5b-5f946610f16f',
    }),
    __metadata("design:type", String)
], FamilyInvitationDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome do convidado.',
        example: 'Malena Silva',
    }),
    __metadata("design:type", String)
], FamilyInvitationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email do convidado.',
        format: 'email',
        example: 'malena@exemplo.com',
    }),
    __metadata("design:type", String)
], FamilyInvitationDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Status do convite.',
        enum: ['pending'],
        example: 'pending',
    }),
    __metadata("design:type", String)
], FamilyInvitationDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data do ultimo envio do convite.',
        format: 'date-time',
        example: '2026-04-19T03:40:12.000Z',
    }),
    __metadata("design:type", String)
], FamilyInvitationDto.prototype, "sentAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome de quem enviou o convite por ultimo.',
        example: 'Jeferson Santana',
    }),
    __metadata("design:type", String)
], FamilyInvitationDto.prototype, "inviterName", void 0);
class FamilyPermissionsDto {
    canInviteMembers;
    canManageMembers;
    canManageRoles;
}
exports.FamilyPermissionsDto = FamilyPermissionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Permissao para convidar/cancelar/reenviar convites.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], FamilyPermissionsDto.prototype, "canInviteMembers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Permissao para remover membros.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], FamilyPermissionsDto.prototype, "canManageMembers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Permissao para alterar papeis de membros.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], FamilyPermissionsDto.prototype, "canManageRoles", void 0);
class FamilyWorkspaceDto {
    id;
    name;
    currentUserRole;
    memberCount;
    members;
    invitations;
    permissions;
}
exports.FamilyWorkspaceDto = FamilyWorkspaceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Identificador da familia ativa.',
        example: '7f047e08-3abf-4dc0-a814-c87d46f4f66f',
    }),
    __metadata("design:type", String)
], FamilyWorkspaceDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome da familia ativa.',
        example: 'Familia de Jeferson',
    }),
    __metadata("design:type", String)
], FamilyWorkspaceDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Papel do usuario logado dentro da familia.',
        enum: exports.familyRoleValues,
        example: 'owner',
    }),
    __metadata("design:type", String)
], FamilyWorkspaceDto.prototype, "currentUserRole", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantidade de membros ativos na familia.',
        example: 2,
    }),
    __metadata("design:type", Number)
], FamilyWorkspaceDto.prototype, "memberCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Lista de membros da familia.',
        type: [FamilyMemberDto],
    }),
    __metadata("design:type", Array)
], FamilyWorkspaceDto.prototype, "members", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Lista de convites pendentes da familia.',
        type: [FamilyInvitationDto],
    }),
    __metadata("design:type", Array)
], FamilyWorkspaceDto.prototype, "invitations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Permissoes efetivas do usuario logado para a tela de familia.',
        type: FamilyPermissionsDto,
    }),
    __metadata("design:type", FamilyPermissionsDto)
], FamilyWorkspaceDto.prototype, "permissions", void 0);
class FamilyInviteMemberInputDto {
    name;
    email;
}
exports.FamilyInviteMemberInputDto = FamilyInviteMemberInputDto;
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
], FamilyInviteMemberInputDto.prototype, "name", void 0);
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
], FamilyInviteMemberInputDto.prototype, "email", void 0);
class FamilyInviteMembersDto {
    members;
}
exports.FamilyInviteMembersDto = FamilyInviteMembersDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Lista de membros para convite na tela de familia.',
        type: [FamilyInviteMemberInputDto],
        minItems: 1,
        maxItems: 8,
    }),
    (0, class_validator_1.IsArray)({ message: 'Membros deve ser uma lista valida.' }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'Adicione ao menos 1 membro para convidar.' }),
    (0, class_validator_1.ArrayMaxSize)(8, { message: 'Voce pode convidar no maximo 8 membros por vez.' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FamilyInviteMemberInputDto),
    __metadata("design:type", Array)
], FamilyInviteMembersDto.prototype, "members", void 0);
class FamilyInviteMembersResponseDto {
    success;
    message;
    sentCount;
    ignoredCount;
    invitations;
}
exports.FamilyInviteMembersResponseDto = FamilyInviteMembersResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Indica processamento bem sucedido da operacao.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], FamilyInviteMembersResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Mensagem de retorno para o frontend.',
        example: '2 convites preparados com sucesso.',
    }),
    __metadata("design:type", String)
], FamilyInviteMembersResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantidade de convites criados/atualizados.',
        example: 2,
    }),
    __metadata("design:type", Number)
], FamilyInviteMembersResponseDto.prototype, "sentCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantidade de itens ignorados por duplicidade, auto-convite ou membro ja existente.',
        example: 1,
    }),
    __metadata("design:type", Number)
], FamilyInviteMembersResponseDto.prototype, "ignoredCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Lista final de convites preparados.',
        type: [FamilyInvitationDto],
    }),
    __metadata("design:type", Array)
], FamilyInviteMembersResponseDto.prototype, "invitations", void 0);
class UpdateFamilyMemberRoleDto {
    role;
}
exports.UpdateFamilyMemberRoleDto = UpdateFamilyMemberRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Novo papel do membro da familia.',
        enum: exports.manageableFamilyRoleValues,
        example: 'viewer',
    }),
    (0, class_validator_1.IsEnum)(exports.manageableFamilyRoleValues, {
        message: 'Papel deve ser admin ou viewer.',
    }),
    __metadata("design:type", String)
], UpdateFamilyMemberRoleDto.prototype, "role", void 0);
class UpdateFamilyMemberRoleResponseDto {
    success;
    message;
    member;
}
exports.UpdateFamilyMemberRoleResponseDto = UpdateFamilyMemberRoleResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Indica processamento bem sucedido da operacao.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], UpdateFamilyMemberRoleResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Mensagem de retorno para o frontend.',
        example: 'Papel do membro atualizado com sucesso.',
    }),
    __metadata("design:type", String)
], UpdateFamilyMemberRoleResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Membro atualizado apos a mudanca de papel.',
        type: FamilyMemberDto,
    }),
    __metadata("design:type", FamilyMemberDto)
], UpdateFamilyMemberRoleResponseDto.prototype, "member", void 0);
class ActionResponseDto {
    success;
    message;
}
exports.ActionResponseDto = ActionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Indica processamento bem sucedido da operacao.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], ActionResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Mensagem de retorno para o frontend.',
        example: 'Operacao concluida com sucesso.',
    }),
    __metadata("design:type", String)
], ActionResponseDto.prototype, "message", void 0);
//# sourceMappingURL=family.dto.js.map