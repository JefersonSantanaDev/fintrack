export declare const familyRoleValues: readonly ["owner", "admin", "viewer"];
export type FamilyRoleValue = (typeof familyRoleValues)[number];
export declare const manageableFamilyRoleValues: readonly ["admin", "viewer"];
export type ManageableFamilyRoleValue = (typeof manageableFamilyRoleValues)[number];
export declare class FamilyMemberDto {
    id: string;
    name: string;
    email: string;
    role: FamilyRoleValue;
    isCurrentUser: boolean;
}
export declare class FamilyInvitationDto {
    id: string;
    name: string;
    email: string;
    status: 'pending';
    sentAt: string;
    inviterName: string;
}
export declare class FamilyPermissionsDto {
    canInviteMembers: boolean;
    canManageMembers: boolean;
    canManageRoles: boolean;
}
export declare class FamilyWorkspaceDto {
    id: string;
    name: string;
    currentUserRole: FamilyRoleValue;
    memberCount: number;
    members: FamilyMemberDto[];
    invitations: FamilyInvitationDto[];
    permissions: FamilyPermissionsDto;
}
export declare class FamilyInviteMemberInputDto {
    name: string;
    email: string;
}
export declare class FamilyInviteMembersDto {
    members: FamilyInviteMemberInputDto[];
}
export declare class FamilyInviteMembersResponseDto {
    success: boolean;
    message: string;
    sentCount: number;
    ignoredCount: number;
    invitations: FamilyInvitationDto[];
}
export declare class UpdateFamilyMemberRoleDto {
    role: ManageableFamilyRoleValue;
}
export declare class UpdateFamilyMemberRoleResponseDto {
    success: boolean;
    message: string;
    member: FamilyMemberDto;
}
export declare class ActionResponseDto {
    success: boolean;
    message: string;
}
