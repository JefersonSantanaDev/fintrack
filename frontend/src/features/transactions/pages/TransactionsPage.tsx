import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { formatCurrency, transactions } from '@/features/finance'

export function TransactionsPage() {
  return (
    <div className="space-y-4">
      <Card className="rounded-[28px] bg-card/85">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Centro de lancamentos</CardTitle>
            <CardDescription>
              Esta tela ja prepara o fluxo para receitas, despesas, agendamentos e transferencias.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Abril</Badge>
            <Badge variant="success">Pago</Badge>
            <Badge variant="warning">Agendado</Badge>
            <Button>Novo lancamento</Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="rounded-[28px] bg-card/85">
        <CardContent className="pt-6">
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
              {transactions.map(transaction => (
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
                        ? 'text-right font-medium text-emerald-600 dark:text-emerald-400'
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
