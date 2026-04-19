import type { AuthenticatedUser } from '../auth/types/auth-user.type';
import { ActionResponseDto, FamilyInviteMembersDto, FamilyInviteMembersResponseDto, FamilyWorkspaceDto, UpdateFamilyMemberRoleDto, UpdateFamilyMemberRoleResponseDto } from './dto/family.dto';
import { FamilyService } from './family.service';
export declare class FamilyController {
    private readonly familyService;
    constructor(familyService: FamilyService);
    workspace(user: AuthenticatedUser): Promise<FamilyWorkspaceDto>;
    inviteMembers(user: AuthenticatedUser, dto: FamilyInviteMembersDto): Promise<FamilyInviteMembersResponseDto>;
    resendInvitation(user: AuthenticatedUser, invitationId: string): Promise<ActionResponseDto>;
    cancelInvitation(user: AuthenticatedUser, invitationId: string): Promise<ActionResponseDto>;
    updateMemberRole(user: AuthenticatedUser, memberUserId: string, dto: UpdateFamilyMemberRoleDto): Promise<UpdateFamilyMemberRoleResponseDto>;
    removeMember(user: AuthenticatedUser, memberUserId: string): Promise<ActionResponseDto>;
}
