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
var FamilyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const signup_mail_service_1 = require("../auth/signup-mail.service");
const prisma_service_1 = require("../prisma/prisma.service");
let FamilyService = FamilyService_1 = class FamilyService {
    prisma;
    signUpMailService;
    logger = new common_1.Logger(FamilyService_1.name);
    constructor(prisma, signUpMailService) {
        this.prisma = prisma;
        this.signUpMailService = signUpMailService;
    }
    async getWorkspace(userId) {
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
                        status: client_1.FamilyInvitationStatus.PENDING,
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
            throw new common_1.UnauthorizedException('Nao foi possivel carregar a familia da sessao.');
        }
        const members = family.members.map((member) => ({
            id: member.user.id,
            name: member.user.name,
            email: member.user.email,
            role: this.mapRole(member.role),
            isCurrentUser: member.userId === actorContext.user.id,
        }));
        const invitations = family.invitations.map((invitation) => ({
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
                canInviteMembers: actorContext.role !== client_1.FamilyMemberRole.VIEWER,
                canManageMembers: actorContext.role === client_1.FamilyMemberRole.OWNER,
                canManageRoles: actorContext.role === client_1.FamilyMemberRole.OWNER,
            },
        };
    }
    async inviteMembers(userId, dto) {
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
        const memberEmails = new Set(familyMembers.map((entry) => entry.user.email.trim().toLowerCase()));
        let ignoredCount = 0;
        const invitations = [];
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
                    status: client_1.FamilyInvitationStatus.PENDING,
                    sentAt: new Date(),
                    respondedAt: null,
                },
                update: {
                    inviterUserId: actorContext.user.id,
                    inviteeName: invite.name,
                    status: client_1.FamilyInvitationStatus.PENDING,
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
            }
            catch (error) {
                this.logger.warn(`Falha ao enviar convite familiar para ${this.maskEmailForLog(invite.email)}: ${String(error)}`);
            }
        }
        const sentCount = invitations.length;
        const message = sentCount > 0
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
    async resendInvitation(userId, invitationId) {
        const actorContext = await this.getActorContext(userId);
        this.ensureCanInvite(actorContext.role);
        const invitation = await this.prisma.familyInvitation.findFirst({
            where: {
                id: invitationId,
                familyId: actorContext.familyId,
                status: client_1.FamilyInvitationStatus.PENDING,
            },
            select: {
                id: true,
                inviteeName: true,
                inviteeEmail: true,
            },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Convite pendente nao encontrado.');
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
    async cancelInvitation(userId, invitationId) {
        const actorContext = await this.getActorContext(userId);
        this.ensureCanInvite(actorContext.role);
        const canceled = await this.prisma.familyInvitation.updateMany({
            where: {
                id: invitationId,
                familyId: actorContext.familyId,
                status: client_1.FamilyInvitationStatus.PENDING,
            },
            data: {
                status: client_1.FamilyInvitationStatus.CANCELED,
                respondedAt: new Date(),
            },
        });
        if (canceled.count !== 1) {
            throw new common_1.NotFoundException('Convite pendente nao encontrado.');
        }
        return {
            success: true,
            message: 'Convite cancelado com sucesso.',
        };
    }
    async updateMemberRole(userId, memberUserId, dto) {
        const actorContext = await this.getActorContext(userId);
        this.ensureIsOwner(actorContext.role);
        if (memberUserId === actorContext.user.id) {
            throw new common_1.BadRequestException('Nao e permitido alterar o proprio papel do owner.');
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
            throw new common_1.NotFoundException('Membro da familia nao encontrado.');
        }
        if (targetMember.role === client_1.FamilyMemberRole.OWNER) {
            throw new common_1.BadRequestException('Nao e permitido alterar o papel de um owner.');
        }
        const nextRole = dto.role === 'admin' ? client_1.FamilyMemberRole.ADMIN : client_1.FamilyMemberRole.VIEWER;
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
    async removeMember(userId, memberUserId) {
        const actorContext = await this.getActorContext(userId);
        this.ensureIsOwner(actorContext.role);
        if (memberUserId === actorContext.user.id) {
            throw new common_1.BadRequestException('Owner nao pode remover a propria conta da familia.');
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
            throw new common_1.NotFoundException('Membro da familia nao encontrado.');
        }
        if (targetMember.role === client_1.FamilyMemberRole.OWNER) {
            throw new common_1.BadRequestException('Nao e permitido remover um owner da familia.');
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
    mapRole(role) {
        if (role === client_1.FamilyMemberRole.ADMIN) {
            return 'admin';
        }
        if (role === client_1.FamilyMemberRole.VIEWER) {
            return 'viewer';
        }
        return 'owner';
    }
    async getActorContext(userId) {
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
            throw new common_1.UnauthorizedException('Sessao sem familia ativa.');
        }
        return {
            familyId: membership.familyId,
            role: membership.role,
            user: membership.user,
        };
    }
    normalizeEmail(email) {
        return email.trim().toLowerCase();
    }
    normalizeInvites(members) {
        const uniqueInvites = new Map();
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
    ensureCanInvite(role) {
        if (role === client_1.FamilyMemberRole.VIEWER) {
            throw new common_1.ForbiddenException('Seu perfil nao possui permissao para gerenciar convites.');
        }
    }
    ensureIsOwner(role) {
        if (role !== client_1.FamilyMemberRole.OWNER) {
            throw new common_1.ForbiddenException('Apenas owners podem gerenciar membros da familia.');
        }
    }
    maskEmailForLog(email) {
        const [localPart = '', domainPart = ''] = email.split('@');
        if (!domainPart) {
            return '***';
        }
        const visiblePrefix = localPart.slice(0, 2);
        return `${visiblePrefix}***@${domainPart}`;
    }
};
exports.FamilyService = FamilyService;
exports.FamilyService = FamilyService = FamilyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        signup_mail_service_1.SignUpMailService])
], FamilyService);
//# sourceMappingURL=family.service.js.map