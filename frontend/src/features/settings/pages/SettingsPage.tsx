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
    description: 'Design system oficial em preto puro, neon e bordas charcoal conforme DESIGN.md.',
    status: 'Ativo',
  },
  {
    title: 'Alertas',
    description: 'Reservado para vencimentos, estouro de orcamento e recorrencias.',
    status: 'Planejado',
  },
]

export function SettingsPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {sections.map(section => (
        <Card key={section.title} className="rounded-lg bg-card">
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
