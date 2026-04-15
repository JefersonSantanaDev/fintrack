import { FinTrackLoading } from '@/shared/ui/fintrack-loading'

interface AuthLoadingScreenProps {
  message?: string
  description?: string
}

export function AuthLoadingScreen({
  message: _message = 'Carregando sua sessao',
  description: _description = 'Sincronizando dados da sua conta',
}: AuthLoadingScreenProps) {
  return <FinTrackLoading />
}
