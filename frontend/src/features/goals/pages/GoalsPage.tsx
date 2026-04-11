import { Badge } from '@/shared/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import { formatCurrency, goals } from '@/features/finance'

export function GoalsPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {goals.map(goal => {
        const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100)

        return (
          <Card key={goal.id} className="rounded-[28px] bg-card/85">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{goal.name}</CardTitle>
                <Badge variant={goal.status === 'on_track' ? 'success' : 'warning'}>
                  {goal.status === 'on_track' ? 'No ritmo' : 'Atencao'}
                </Badge>
              </div>
              <CardDescription>Prazo alvo: {goal.targetDate}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-3xl font-semibold">{formatCurrency(goal.currentAmount)}</p>
                <p className="text-sm text-muted-foreground">
                  de {formatCurrency(goal.targetAmount)} planejados
                </p>
              </div>
              <Progress value={progress} />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
