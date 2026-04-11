import { Badge } from '@/shared/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'

const sections = [
  {
    title: 'Tema e identidade',
    description: 'O shell inicial ja suporta alternancia claro/escuro e tema verde como base.',
    status: 'Ativo',
  },
  {
    title: 'Alertas',
    description: 'Reservado para vencimentos, estouro de orcamento e recorrencias.',
    status: 'Planejado',
  },
  {
    title: 'Importacao',
    description: 'Espaco para CSV, OFX e conciliacao de extratos em versoes futuras.',
    status: 'Planejado',
  },
]

export function SettingsPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {sections.map(section => (
        <Card key={section.title} className="rounded-[28px] bg-card/85">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{section.title}</CardTitle>
              <Badge variant={section.status === 'Ativo' ? 'success' : 'outline'}>
                {section.status}
              </Badge>
            </div>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Esta area vira util quando a gente ligar backend, preferencia por familia e
            automacoes.
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
