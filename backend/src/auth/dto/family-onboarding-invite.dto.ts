import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class FamilyOnboardingInviteMemberDto {
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

export class FamilyOnboardingInviteMembersDto {
  @ApiProperty({
    description: 'Lista de membros para convite no onboarding.',
    type: [FamilyOnboardingInviteMemberDto],
    minItems: 1,
    maxItems: 8,
  })
  @IsArray({ message: 'Membros deve ser uma lista valida.' })
  @ArrayMinSize(1, { message: 'Adicione ao menos 1 membro para convidar.' })
  @ArrayMaxSize(8, { message: 'Voce pode convidar no maximo 8 membros por vez.' })
  @ValidateNested({ each: true })
  @Type(() => FamilyOnboardingInviteMemberDto)
  members!: FamilyOnboardingInviteMemberDto[];
}
