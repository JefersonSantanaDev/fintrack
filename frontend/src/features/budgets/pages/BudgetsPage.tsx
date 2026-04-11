import { Badge } from '@/shared/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import { budgets, formatCurrency } from '@/features/finance'

export function BudgetsPage() {
  return (
    <div className="space-y-4">
      <Card className="rounded-[28px] bg-card/85">
        <CardHeader>
          <CardTitle>Planejamento por categoria</CardTitle>
          <CardDescription>
            Aqui vamos conectar depois alertas de estouro, historico mensal e automacoes.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {budgets.map(budget => {
          const progress = Math.round((budget.spent / budget.limit) * 100)

          return (
            <Card key={budget.id} className="rounded-[28px] bg-card/85">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>{budget.category}</CardTitle>
                    <CardDescription>
                      {formatCurrency(budget.spent)} de {formatCurrency(budget.limit)}
                    </CardDescription>
                  </div>
                  <Badge variant={progress >= 85 ? 'warning' : 'success'}>{progress}%</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={Math.min(progress, 100)} />
                <p className="text-sm text-muted-foreground">
                  Restante planejado: {formatCurrency(Math.max(budget.limit - budget.spent, 0))}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
