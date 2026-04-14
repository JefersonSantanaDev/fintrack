import { ArrowUpRight, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import {
  budgets,
  familyMembers,
  formatCurrency,
  goals,
  summaryMetrics,
  transactions,
} from '@/features/finance'

const metricIcons = {
  success: TrendingUp,
  warning: TrendingDown,
  neutral: PiggyBank,
}

const metricBadge = {
  success: 'success' as const,
  warning: 'warning' as const,
  neutral: 'secondary' as const,
}

export function DashboardPage() {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-primary/25 py-0">
        <CardContent className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div className="space-y-4">
            <Badge variant="success">Panorama do mes</Badge>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Uma base forte para controlar dinheiro da casa sem planilha espalhada.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Este shell inicial já organiza o que vamos precisar no MVP: contas, transacoes,
                orcamentos, metas e colaboracao familiar.
              </p>
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border border-border bg-background p-4 shadow-[var(--shadow-level-1)]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ritmo financeiro</span>
              <ArrowUpRight className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-semibold">{formatCurrency(4020)}</p>
              <p className="text-sm text-muted-foreground">
                sobra projetada do mes considerando gastos ja previstos
              </p>
            </div>
            <Progress value={72} />
            <p className="text-sm text-muted-foreground">
              72% do orcamento mensal comprometido, com espaco para ajustes antes do fechamento.
            </p>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryMetrics.map(metric => {
          const Icon = metricIcons[metric.tone]

          return (
            <Card key={metric.id} className="rounded-lg bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardDescription>{metric.label}</CardDescription>
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl">{formatCurrency(metric.value)}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Badge
                  variant={metricBadge[metric.tone]}
                  className="w-full justify-start whitespace-normal px-3 py-1 text-left leading-relaxed"
                >
                  {metric.change}
                </Badge>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-lg bg-card">
          <CardHeader>
            <CardTitle>Orcamentos ativos</CardTitle>
            <CardDescription>Visao rapida das categorias mais sensiveis da rotina.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {budgets.map(budget => {
              const usage = Math.round((budget.spent / budget.limit) * 100)

              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{budget.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(budget.spent)} de {formatCurrency(budget.limit)}
                      </p>
                    </div>
                    <Badge variant={usage >= 85 ? 'warning' : 'success'}>{usage}% usado</Badge>
                  </div>
                  <Progress value={Math.min(usage, 100)} />
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-lg bg-card">
            <CardHeader>
              <CardTitle>Metas prioritarias</CardTitle>
              <CardDescription>Objetivos que vao guiar a primeira versao.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {goals.map(goal => {
                const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100)

                return (
                  <div key={goal.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{goal.name}</p>
                      <Badge variant={goal.status === 'on_track' ? 'success' : 'warning'}>
                        {goal.status === 'on_track' ? 'No ritmo' : 'Pedir atencao'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)} ate{' '}
                      {goal.targetDate}
                    </p>
                    <Progress className="mt-3" value={progress} />
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card className="rounded-lg bg-card">
            <CardHeader>
              <CardTitle>Quem participa</CardTitle>
              <CardDescription>Permissoes iniciais para a familia.</CardDescription>
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
        </div>
      </section>

      <Card className="rounded-lg bg-card">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Ultimas transacoes</CardTitle>
            <CardDescription>Lancamentos que representam bem o dominio do produto.</CardDescription>
          </div>
          <Button variant="outline">Ver todos os lancamentos</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descricao</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 5).map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.account}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.status === 'paid' ? 'success' : 'warning'}>
                      {transaction.status === 'paid' ? 'Pago' : 'Agendado'}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={
                      transaction.amount >= 0
                        ? 'text-right font-medium text-primary'
                        : 'text-right font-medium text-foreground'
                    }
                  >
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
