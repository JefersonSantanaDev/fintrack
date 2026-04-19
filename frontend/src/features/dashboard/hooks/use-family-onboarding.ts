import { useCallback, useEffect, useMemo, useState } from 'react'

import { ApiRequestError } from '@/shared/lib/api-client'
import {
  dismissFamilyOnboarding,
  getFamilyOnboardingStatus,
  inviteFamilyOnboardingMembers,
  type FamilyOnboardingInviteMemberInput,
  type FamilyOnboardingInviteMembersResponse,
  type FamilyOnboardingStatus,
} from '@/features/auth/services/auth.service'

interface UseFamilyOnboardingResult {
  onboarding: FamilyOnboardingStatus | null
  isLoading: boolean
  isDismissing: boolean
  isInviting: boolean
  hasLoadedSuccessfully: boolean
  errorMessage: string | null
  dismiss: () => Promise<boolean>
  inviteMembers: (
    members: FamilyOnboardingInviteMemberInput[],
  ) => Promise<FamilyOnboardingInviteMembersResponse | null>
  reload: () => Promise<void>
}

function resolveErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiRequestError) {
    return error.message
  }

  return fallback
}

export function useFamilyOnboarding(): UseFamilyOnboardingResult {
  const [onboarding, setOnboarding] = useState<FamilyOnboardingStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDismissing, setIsDismissing] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [hasLoadedSuccessfully, setHasLoadedSuccessfully] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadOnboarding = useCallback(async () => {
    setIsLoading(true)

    try {
      setErrorMessage(null)
      const payload = await getFamilyOnboardingStatus()
      setOnboarding(payload)
      setHasLoadedSuccessfully(true)
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error, 'Nao foi possivel carregar o onboarding familiar.'))
      setHasLoadedSuccessfully(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadOnboarding()
  }, [loadOnboarding])

  const dismiss = useCallback(async () => {
    setIsDismissing(true)

    try {
      setErrorMessage(null)
      await dismissFamilyOnboarding()
      setOnboarding(current => {
        if (!current) {
          return current
        }

        return {
          ...current,
          shouldShowOnboarding: false,
        }
      })
      return true
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error, 'Nao foi possivel ocultar o onboarding agora.'))
      return false
    } finally {
      setIsDismissing(false)
    }
  }, [])

  const inviteMembers = useCallback(async (members: FamilyOnboardingInviteMemberInput[]) => {
    setIsInviting(true)

    try {
      setErrorMessage(null)
      const result = await inviteFamilyOnboardingMembers(members)
      return result
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error, 'Nao foi possivel enviar os convites agora.'))
      return null
    } finally {
      setIsInviting(false)
    }
  }, [])

  return useMemo(
    () => ({
      onboarding,
      isLoading,
      isDismissing,
      isInviting,
      hasLoadedSuccessfully,
      errorMessage,
      dismiss,
      inviteMembers,
      reload: loadOnboarding,
    }),
    [
      onboarding,
      isLoading,
      isDismissing,
      isInviting,
      hasLoadedSuccessfully,
      errorMessage,
      dismiss,
      inviteMembers,
      loadOnboarding,
    ],
  )
}
