import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  FamilyInvitationStatus,
  FamilyMemberRole,
} from '@prisma/client';
import { SignUpMailService } from '../auth/signup-mail.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  FamilyInviteMembersDto,
  FamilyInviteMembersResponseDto,
  FamilyInvitationDto,
  FamilyMemberDto,
  FamilyRoleValue,
  FamilyWorkspaceDto,
  UpdateFamilyMemberRoleDto,
  UpdateFamilyMemberRoleResponseDto,
} from './dto/family.dto';

interface FamilyActorContext {
  familyId: string;
  role: FamilyMemberRole;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

@Injectable()
export class FamilyService {
  private readonly logger = new Logger(FamilyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly signUpMailService: SignUpMailService,
  ) {}

  async getWorkspace(userId: string): Promise<FamilyWorkspaceDto> {
    const actorContext = await this.getActorContext(userId);

    const family = await this.prisma.family.findUnique({
      where: { id: actorContext.familyId },
      select: {
        id: true,
        name: true,
        members: {
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            userId: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        invitations: {
          where: {
            status: FamilyInvitationStatus.PENDING,
          },
          orderBy: {
            sentAt: 'desc',
          },
          select: {
            id: true,
            inviteeName: true,
            inviteeEmail: true,
            sentAt: true,
            inviter: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!family) {
      throw new UnauthorizedException('Nao foi possivel carregar a familia da sessao.');
    }

    const members = family.members.map<FamilyMemberDto>((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: this.mapRole(member.role),
      isCurrentUser: member.userId === actorContext.user.id,
    }));

    const invitations = family.invitations.map<FamilyInvitationDto>((invitation) => ({
      id: invitation.id,
      name: invitation.inviteeName,
      email: invitation.inviteeEmail,
      status: 'pending',
      sentAt: invitation.sentAt.toISOString(),
      inviterName: invitation.inviter.name,
    }));

    return {
      id: family.id,
      name: family.name,
      memberCount: members.length,
      currentUserRole: this.mapRole(actorContext.role),
      members,
      invitations,
      permissions: {
        canInviteMembers: actorContext.role !== FamilyMemberRole.VIEWER,
        canManageMembers: actorContext.role === FamilyMemberRole.OWNER,
        canManageRoles: actorContext.role === FamilyMemberRole.OWNER,
      },
    };
  }

  async inviteMembers(
    userId: string,
    dto: FamilyInviteMembersDto,
  ): Promise<FamilyInviteMembersResponseDto> {
    const actorContext = await this.getActorContext(userId);
    this.ensureCanInvite(actorContext.role);

    const normalizedInvites = this.normalizeInvites(dto.members);

    if (!normalizedInvites.length) {
      return {
        success: true,
        message: 'Nenhum convite novo foi preparado nesta tentativa.',
        sentCount: 0,
        ignoredCount: dto.members.length,
        invitations: [],
      };
    }

    const familyMembers = await this.prisma.familyMember.findMany({
      where: { familyId: actorContext.familyId },
      select: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    const memberEmails = new Set(
      familyMembers.map((entry) => entry.user.email.trim().toLowerCase()),
    );

    let ignoredCount = 0;
    const invitations: FamilyInvitationDto[] = [];

    for (const invite of normalizedInvites) {
      if (invite.email === this.normalizeEmail(actorContext.user.email)) {
        ignoredCount += 1;
        continue;
      }

      if (memberEmails.has(invite.email)) {
        ignoredCount += 1;
        continue;
      }

      const upsertedInvitation = await this.prisma.familyInvitation.upsert({
        where: {
          familyId_inviteeEmail: {
            familyId: actorContext.familyId,
            inviteeEmail: invite.email,
          },
        },
        create: {
          familyId: actorContext.familyId,
          inviterUserId: actorContext.user.id,
          inviteeName: invite.name,
          inviteeEmail: invite.email,
          status: FamilyInvitationStatus.PENDING,
          sentAt: new Date(),
          respondedAt: null,
        },
        update: {
          inviterUserId: actorContext.user.id,
          inviteeName: invite.name,
          status: FamilyInvitationStatus.PENDING,
          sentAt: new Date(),
          respondedAt: null,
        },
        select: {
          id: true,
          inviteeName: true,
          inviteeEmail: true,
          sentAt: true,
        },
      });

      invitations.push({
        id: upsertedInvitation.id,
        name: upsertedInvitation.inviteeName,
        email: upsertedInvitation.inviteeEmail,
        status: 'pending',
        sentAt: upsertedInvitation.sentAt.toISOString(),
        inviterName: actorContext.user.name,
      });

      try {
        await this.signUpMailService.sendFamilyInvitation({
          email: invite.email,
          name: invite.name,
          inviterName: actorContext.user.name,
        });
      } catch (error) {
        this.logger.warn(
          `Falha ao enviar convite familiar para ${this.maskEmailForLog(invite.email)}: ${String(error)}`,
        );
      }
    }

    const sentCount = invitations.length;
    const message =
      sentCount > 0
        ? sentCount === 1
          ? '1 convite preparado com sucesso.'
          : `${sentCount} convites preparados com sucesso.`
        : 'Nenhum convite novo foi preparado nesta tentativa.';

    return {
      success: true,
      message,
      sentCount,
      ignoredCount,
      invitations,
    };
  }

  async resendInvitation(userId: string, invitationId: string) {
    const actorContext = await this.getActorContext(userId);
    this.ensureCanInvite(actorContext.role);

    const invitation = await this.prisma.familyInvitation.findFirst({
      where: {
        id: invitationId,
        familyId: actorContext.familyId,
        status: FamilyInvitationStatus.PENDING,
      },
      select: {
        id: true,
        inviteeName: true,
        inviteeEmail: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Convite pendente nao encontrado.');
    }

    await this.prisma.familyInvitation.update({
      where: { id: invitation.id },
      data: {
        inviterUserId: actorContext.user.id,
        sentAt: new Date(),
      },
    });

    await this.signUpMailService.sendFamilyInvitation({
      email: invitation.inviteeEmail,
      name: invitation.inviteeName,
      inviterName: actorContext.user.name,
    });

    return {
      success: true,
      message: 'Convite reenviado com sucesso.',
    };
  }

  async cancelInvitation(userId: string, invitationId: string) {
    const actorContext = await this.getActorContext(userId);
    this.ensureCanInvite(actorContext.role);

    const canceled = await this.prisma.familyInvitation.updateMany({
      where: {
        id: invitationId,
        familyId: actorContext.familyId,
        status: FamilyInvitationStatus.PENDING,
      },
      data: {
        status: FamilyInvitationStatus.CANCELED,
        respondedAt: new Date(),
      },
    });

    if (canceled.count !== 1) {
      throw new NotFoundException('Convite pendente nao encontrado.');
    }

    return {
      success: true,
      message: 'Convite cancelado com sucesso.',
    };
  }

  async updateMemberRole(
    userId: string,
    memberUserId: string,
    dto: UpdateFamilyMemberRoleDto,
  ): Promise<UpdateFamilyMemberRoleResponseDto> {
    const actorContext = await this.getActorContext(userId);
    this.ensureIsOwner(actorContext.role);

    if (memberUserId === actorContext.user.id) {
      throw new BadRequestException('Nao e permitido alterar o proprio papel do owner.');
    }

    const targetMember = await this.prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId: actorContext.familyId,
          userId: memberUserId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!targetMember) {
      throw new NotFoundException('Membro da familia nao encontrado.');
    }

    if (targetMember.role === FamilyMemberRole.OWNER) {
      throw new BadRequestException('Nao e permitido alterar o papel de um owner.');
    }

    const nextRole =
      dto.role === 'admin' ? FamilyMemberRole.ADMIN : FamilyMemberRole.VIEWER;

    const updatedMember = await this.prisma.familyMember.update({
      where: { id: targetMember.id },
      data: {
        role: nextRole,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Papel do membro atualizado com sucesso.',
      member: {
        id: updatedMember.user.id,
        name: updatedMember.user.name,
        email: updatedMember.user.email,
        role: this.mapRole(updatedMember.role),
        isCurrentUser: updatedMember.user.id === actorContext.user.id,
      },
    };
  }

  async removeMember(userId: string, memberUserId: string) {
    const actorContext = await this.getActorContext(userId);
    this.ensureIsOwner(actorContext.role);

    if (memberUserId === actorContext.user.id) {
      throw new BadRequestException('Owner nao pode remover a propria conta da familia.');
    }

    const targetMember = await this.prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId: actorContext.familyId,
          userId: memberUserId,
        },
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!targetMember) {
      throw new NotFoundException('Membro da familia nao encontrado.');
    }

    if (targetMember.role === FamilyMemberRole.OWNER) {
      throw new BadRequestException('Nao e permitido remover um owner da familia.');
    }

    await this.prisma.familyMember.delete({
      where: {
        id: targetMember.id,
      },
    });

    return {
      success: true,
      message: 'Membro removido da familia com sucesso.',
    };
  }

  private mapRole(role: FamilyMemberRole): FamilyRoleValue {
    if (role === FamilyMemberRole.ADMIN) {
      return 'admin';
    }

    if (role === FamilyMemberRole.VIEWER) {
      return 'viewer';
    }

    return 'owner';
  }

  private async getActorContext(userId: string): Promise<FamilyActorContext> {
    const membership = await this.prisma.familyMember.findFirst({
      where: { userId },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        familyId: true,
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!membership) {
      throw new UnauthorizedException('Sessao sem familia ativa.');
    }

    return {
      familyId: membership.familyId,
      role: membership.role,
      user: membership.user,
    };
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private normalizeInvites(members: FamilyInviteMembersDto['members']) {
    const uniqueInvites = new Map<string, { name: string; email: string }>();

    for (const member of members) {
      const name = member.name.trim();
      const email = this.normalizeEmail(member.email);

      if (!name || !email) {
        continue;
      }

      if (uniqueInvites.has(email)) {
        continue;
      }

      uniqueInvites.set(email, {
        name,
        email,
      });
    }

    return Array.from(uniqueInvites.values());
  }

  private ensureCanInvite(role: FamilyMemberRole) {
    if (role === FamilyMemberRole.VIEWER) {
      throw new ForbiddenException('Seu perfil nao possui permissao para gerenciar convites.');
    }
  }

  private ensureIsOwner(role: FamilyMemberRole) {
    if (role !== FamilyMemberRole.OWNER) {
      throw new ForbiddenException('Apenas owners podem gerenciar membros da familia.');
    }
  }

  private maskEmailForLog(email: string) {
    const [localPart = '', domainPart = ''] = email.split('@');

    if (!domainPart) {
      return '***';
    }

    const visiblePrefix = localPart.slice(0, 2);
    return `${visiblePrefix}***@${domainPart}`;
  }
}
