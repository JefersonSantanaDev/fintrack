import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export const familyRoleValues = ['owner', 'admin', 'viewer'] as const;
export type FamilyRoleValue = (typeof familyRoleValues)[number];

export const manageableFamilyRoleValues = ['admin', 'viewer'] as const;
export type ManageableFamilyRoleValue = (typeof manageableFamilyRoleValues)[number];

export class FamilyMemberDto {
  @ApiProperty({
    description: 'Identificador unico do usuario membro da familia.',
    example: 'c5cef748-09ad-4704-85e7-9a25eaf8789b',
  })
  id!: string;

  @ApiProperty({
    description: 'Nome do membro da familia.',
    example: 'Jeferson Santana',
  })
  name!: string;

  @ApiProperty({
    description: 'Email do membro da familia.',
    format: 'email',
    example: 'jeferson@fintrack.app',
  })
  email!: string;

  @ApiProperty({
    description: 'Papel atual do membro na familia.',
    enum: familyRoleValues,
    example: 'owner',
  })
  role!: FamilyRoleValue;

  @ApiProperty({
    description: 'Indica se esse membro e o usuario logado.',
    example: true,
  })
  isCurrentUser!: boolean;
}

export class FamilyInvitationDto {
  @ApiProperty({
    description: 'Identificador unico do convite.',
    example: '1f2f0931-942c-49a7-9f5b-5f946610f16f',
  })
  id!: string;

  @ApiProperty({
    description: 'Nome do convidado.',
    example: 'Malena Silva',
  })
  name!: string;

  @ApiProperty({
    description: 'Email do convidado.',
    format: 'email',
    example: 'malena@exemplo.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Status do convite.',
    enum: ['pending'],
    example: 'pending',
  })
  status!: 'pending';

  @ApiProperty({
    description: 'Data do ultimo envio do convite.',
    format: 'date-time',
    example: '2026-04-19T03:40:12.000Z',
  })
  sentAt!: string;

  @ApiProperty({
    description: 'Nome de quem enviou o convite por ultimo.',
    example: 'Jeferson Santana',
  })
  inviterName!: string;
}

export class FamilyPermissionsDto {
  @ApiProperty({
    description: 'Permissao para convidar/cancelar/reenviar convites.',
    example: true,
  })
  canInviteMembers!: boolean;

  @ApiProperty({
    description: 'Permissao para remover membros.',
    example: true,
  })
  canManageMembers!: boolean;

  @ApiProperty({
    description: 'Permissao para alterar papeis de membros.',
    example: true,
  })
  canManageRoles!: boolean;
}

export class FamilyWorkspaceDto {
  @ApiProperty({
    description: 'Identificador da familia ativa.',
    example: '7f047e08-3abf-4dc0-a814-c87d46f4f66f',
  })
  id!: string;

  @ApiProperty({
    description: 'Nome da familia ativa.',
    example: 'Familia de Jeferson',
  })
  name!: string;

  @ApiProperty({
    description: 'Papel do usuario logado dentro da familia.',
    enum: familyRoleValues,
    example: 'owner',
  })
  currentUserRole!: FamilyRoleValue;

  @ApiProperty({
    description: 'Quantidade de membros ativos na familia.',
    example: 2,
  })
  memberCount!: number;

  @ApiProperty({
    description: 'Lista de membros da familia.',
    type: [FamilyMemberDto],
  })
  members!: FamilyMemberDto[];

  @ApiProperty({
    description: 'Lista de convites pendentes da familia.',
    type: [FamilyInvitationDto],
  })
  invitations!: FamilyInvitationDto[];

  @ApiProperty({
    description: 'Permissoes efetivas do usuario logado para a tela de familia.',
    type: FamilyPermissionsDto,
  })
  permissions!: FamilyPermissionsDto;
}

export class FamilyInviteMemberInputDto {
  @ApiProperty({
    description: 'Nome da pessoa convidada.',
    minLength: 2,
    maxLength: 80,
    example: 'Maria Santana',
  })
  @IsString({ message: 'Nome do membro deve ser um texto valido.' })
  @MinLength(2, { message: 'Nome do membro deve ter no minimo 2 caracteres.' })
  @MaxLength(80, { message: 'Nome do membro deve ter no maximo 80 caracteres.' })
  name!: string;

  @ApiProperty({
    description: 'Email da pessoa convidada.',
    format: 'email',
    maxLength: 254,
    example: 'maria@exemplo.com',
  })
  @IsEmail({}, { message: 'Email do membro deve ser um email valido.' })
  @MaxLength(254, { message: 'Email do membro deve ter no maximo 254 caracteres.' })
  email!: string;
}

export class FamilyInviteMembersDto {
  @ApiProperty({
    description: 'Lista de membros para convite na tela de familia.',
    type: [FamilyInviteMemberInputDto],
    minItems: 1,
    maxItems: 8,
  })
  @IsArray({ message: 'Membros deve ser uma lista valida.' })
  @ArrayMinSize(1, { message: 'Adicione ao menos 1 membro para convidar.' })
  @ArrayMaxSize(8, { message: 'Voce pode convidar no maximo 8 membros por vez.' })
  @ValidateNested({ each: true })
  @Type(() => FamilyInviteMemberInputDto)
  members!: FamilyInviteMemberInputDto[];
}

export class FamilyInviteMembersResponseDto {
  @ApiProperty({
    description: 'Indica processamento bem sucedido da operacao.',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Mensagem de retorno para o frontend.',
    example: '2 convites preparados com sucesso.',
  })
  message!: string;

  @ApiProperty({
    description: 'Quantidade de convites criados/atualizados.',
    example: 2,
  })
  sentCount!: number;

  @ApiProperty({
    description: 'Quantidade de itens ignorados por duplicidade, auto-convite ou membro ja existente.',
    example: 1,
  })
  ignoredCount!: number;

  @ApiProperty({
    description: 'Lista final de convites preparados.',
    type: [FamilyInvitationDto],
  })
  invitations!: FamilyInvitationDto[];
}

export class UpdateFamilyMemberRoleDto {
  @ApiProperty({
    description: 'Novo papel do membro da familia.',
    enum: manageableFamilyRoleValues,
    example: 'viewer',
  })
  @IsEnum(manageableFamilyRoleValues, {
    message: 'Papel deve ser admin ou viewer.',
  })
  role!: ManageableFamilyRoleValue;
}

export class UpdateFamilyMemberRoleResponseDto {
  @ApiProperty({
    description: 'Indica processamento bem sucedido da operacao.',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Mensagem de retorno para o frontend.',
    example: 'Papel do membro atualizado com sucesso.',
  })
  message!: string;

  @ApiProperty({
    description: 'Membro atualizado apos a mudanca de papel.',
    type: FamilyMemberDto,
  })
  member!: FamilyMemberDto;
}

export class ActionResponseDto {
  @ApiProperty({
    description: 'Indica processamento bem sucedido da operacao.',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Mensagem de retorno para o frontend.',
    example: 'Operacao concluida com sucesso.',
  })
  message!: string;
}
