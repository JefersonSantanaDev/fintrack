import { AuthService } from './auth.service';
import { ActionResponseDto, FamilyOnboardingInviteMembersResponseDto, FamilyOnboardingStatusDto } from './dto/auth-response.dto';
import { FamilyOnboardingInviteMembersDto } from './dto/family-onboarding-invite.dto';
import type { AuthenticatedUser } from './types/auth-user.type';
export declare class AuthOnboardingController {
    private readonly authService;
    constructor(authService: AuthService);
    familyOnboardingStatus(user: AuthenticatedUser): Promise<FamilyOnboardingStatusDto>;
    dismissFamilyOnboarding(user: AuthenticatedUser): Promise<ActionResponseDto>;
    inviteFamilyMembersFromOnboarding(user: AuthenticatedUser, dto: FamilyOnboardingInviteMembersDto): Promise<FamilyOnboardingInviteMembersResponseDto>;
}
