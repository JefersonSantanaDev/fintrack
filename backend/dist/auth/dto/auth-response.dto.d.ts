export declare class PublicUserDto {
    id: string;
    name: string;
    email: string;
}
export declare class AuthResponseDto {
    user: PublicUserDto;
    family: SessionFamilySnapshotDto | null;
    accessToken: string;
}
export declare class SignUpChallengeResponseDto {
    success: boolean;
    message: string;
    email: string;
    expiresInSeconds: number;
    resendAvailableInSeconds: number;
}
export declare class ActionResponseDto {
    success: boolean;
    message: string;
}
export declare class FamilySnapshotDto {
    id: string;
    name: string;
    memberCount: number;
    role: 'owner' | 'admin' | 'viewer';
}
export declare class SessionFamilyMemberSnapshotDto {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'viewer';
    isCurrentUser: boolean;
}
export declare class SessionFamilySnapshotDto {
    id: string;
    name: string;
    memberCount: number;
    role: 'owner' | 'admin' | 'viewer';
    members: SessionFamilyMemberSnapshotDto[];
}
export declare class FamilyOnboardingStatusDto {
    family: FamilySnapshotDto | null;
    shouldShowOnboarding: boolean;
}
export declare class FamilyOnboardingInvitationDto {
    id: string;
    name: string;
    email: string;
    status: 'pending';
}
export declare class FamilyOnboardingInviteMembersResponseDto {
    success: boolean;
    message: string;
    sentCount: number;
    ignoredCount: number;
    invitations: FamilyOnboardingInvitationDto[];
}
export declare class MeResponseDto {
    user: PublicUserDto;
    family: SessionFamilySnapshotDto | null;
}
export declare class LogoutResponseDto {
    success: boolean;
}
export declare class ApiErrorResponseDto {
    statusCode: number;
    message: string;
    error: string;
    timestamp: string;
    path: string;
}
export declare class ApiValidationErrorResponseDto {
    statusCode: number;
    message: string[];
    error: string;
    timestamp: string;
    path: string;
}
