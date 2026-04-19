import { SignUpMailService } from '../auth/signup-mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyInviteMembersDto, FamilyInviteMembersResponseDto, FamilyWorkspaceDto, UpdateFamilyMemberRoleDto, UpdateFamilyMemberRoleResponseDto } from './dto/family.dto';
export declare class FamilyService {
    private readonly prisma;
    private readonly signUpMailService;
    private readonly logger;
    constructor(prisma: PrismaService, signUpMailService: SignUpMailService);
    getWorkspace(userId: string): Promise<FamilyWorkspaceDto>;
    inviteMembers(userId: string, dto: FamilyInviteMembersDto): Promise<FamilyInviteMembersResponseDto>;
    resendInvitation(userId: string, invitationId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    cancelInvitation(userId: string, invitationId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updateMemberRole(userId: string, memberUserId: string, dto: UpdateFamilyMemberRoleDto): Promise<UpdateFamilyMemberRoleResponseDto>;
    removeMember(userId: string, memberUserId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private mapRole;
    private getActorContext;
    private normalizeEmail;
    private normalizeInvites;
    private ensureCanInvite;
    private ensureIsOwner;
    private maskEmailForLog;
}
