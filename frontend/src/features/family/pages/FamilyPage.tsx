import { Badge } from '@/shared/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { familyMembers } from '@/features/finance'

export function FamilyPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
      <Card className="rounded-lg bg-card">
        <CardHeader>
          <CardTitle>Membros da familia</CardTitle>
          <CardDescription>
            A modelagem vai girar em torno de `family_id`, com papeis simples no inicio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {familyMembers.map(member => (
            <div key={member.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{member.name}</p>
                <Badge variant="outline">{member.role}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{member.focus}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-card">
        <CardHeader>
          <CardTitle>Regras de colaboracao</CardTitle>
          <CardDescription>Boas decisoes para nao complicar o MVP.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="rounded-lg border p-4">
            <p className="font-medium text-foreground">Owner</p>
            <p className="mt-2">Gerencia familia, categorias, metas e membros.</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="font-medium text-foreground">Admin</p>
            <p className="mt-2">Lanca despesas, receitas e acompanha o planejamento.</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="font-medium text-foreground">Viewer</p>
            <p className="mt-2">Enxerga dashboard e metas, sem alterar dados sensiveis.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
