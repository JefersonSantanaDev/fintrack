import { FormEvent, useMemo, useState } from 'react'
import { toast } from 'sonner'

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { DatePicker } from '@/shared/ui/date-picker'
import { accounts, formatCurrency, transactions } from '@/features/finance'
import type { Transaction } from '@/features/finance/types/finance.types'

type TransactionKind = 'income' | 'expense' | 'transfer'
type TransactionStatus = Transaction['status']

interface NewTransactionForm {
  description: string
  kind: TransactionKind
  category: string
  account: string
  date: Date | undefined
  amount: string
  status: TransactionStatus
}

const categoriesByKind: Record<TransactionKind, string[]> = {
  income: ['Receita', 'Freelance', 'Bonus', 'Rendimentos'],
  expense: ['Moradia', 'Mercado', 'Transporte', 'Lazer', 'Educacao', 'Saude'],
  transfer: ['Reserva', 'Transferencia interna', 'Meta'],
}

function initialFormValues(): NewTransactionForm {
  return {
    description: '',
    kind: 'expense',
    category: categoriesByKind.expense[0],
    account: accounts[0]?.name ?? '',
    date: new Date(),
    amount: '',
    status: 'paid',
  }
}

function toDisplayDate(selectedDate: Date) {
  const dayLabel = new Intl.DateTimeFormat('pt-BR', { day: '2-digit' }).format(selectedDate)
  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
    .format(selectedDate)
    .replace('.', '')

  return `${dayLabel} ${monthLabel}`
}

export function TransactionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formValues, setFormValues] = useState<NewTransactionForm>(() => initialFormValues())
  const [items, setItems] = useState<Transaction[]>(() => transactions)

  const categoryOptions = useMemo(() => {
    return categoriesByKind[formValues.kind]
  }, [formValues.kind])

  const handleKindChange = (nextKind: TransactionKind) => {
    setFormValues(current => ({
      ...current,
      kind: nextKind,
      category: categoriesByKind[nextKind][0],
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedDescription = formValues.description.trim()
    const parsedAmount = Number(formValues.amount.replace(',', '.'))

    if (!normalizedDescription) {
      toast.error('Informe a descricao do lancamento.')
      return
    }

    if (!formValues.account) {
      toast.error('Selecione a conta do lancamento.')
      return
    }

    if (!formValues.date) {
      toast.error('Informe a data do lancamento.')
      return
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error('Informe um valor valido maior que zero.')
      return
    }

    const signedAmount = formValues.kind === 'expense' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount)

    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      description: normalizedDescription,
      category: formValues.category,
      account: formValues.account,
      date: toDisplayDate(formValues.date),
      amount: signedAmount,
      status: formValues.status,
    }

    setItems(current => [newTransaction, ...current])
    setFormValues(initialFormValues())
    setIsDialogOpen(false)
    toast.success('Lancamento adicionado com sucesso.')
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-lg bg-card">
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Novo lancamento</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl p-0">
                <DialogHeader className="border-b border-border px-6 py-5">
                  <DialogTitle className="text-2xl">Novo lancamento</DialogTitle>
                  <DialogDescription>
                    Registre receitas, despesas e transferencias da familia em um unico fluxo.
                  </DialogDescription>
                </DialogHeader>

                <form className="space-y-5 px-6 py-5" onSubmit={handleSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="transaction-description">Descricao</Label>
                      <Input
                        id="transaction-description"
                        value={formValues.description}
                        onChange={event =>
                          setFormValues(current => ({ ...current, description: event.target.value }))
                        }
                        placeholder="Ex: Compra do mercado da semana"
                        maxLength={80}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={formValues.kind} onValueChange={value => handleKindChange(value as TransactionKind)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">Despesa</SelectItem>
                          <SelectItem value="income">Receita</SelectItem>
                          <SelectItem value="transfer">Transferencia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select
                        value={formValues.category}
                        onValueChange={value => setFormValues(current => ({ ...current, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Conta</Label>
                      <Select
                        value={formValues.account}
                        onValueChange={value => setFormValues(current => ({ ...current, account: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a conta" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map(account => (
                            <SelectItem key={account.id} value={account.name}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transaction-date">Data</Label>
                      <DatePicker
                        id="transaction-date"
                        value={formValues.date}
                        onChange={selectedDate =>
                          setFormValues(current => ({ ...current, date: selectedDate }))
                        }
                        placeholder="Selecione a data"
                        toDate={new Date('2035-12-31')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transaction-amount">Valor</Label>
                      <Input
                        id="transaction-amount"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={formValues.amount}
                        onChange={event =>
                          setFormValues(current => ({ ...current, amount: event.target.value }))
                        }
                        placeholder="0,00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={formValues.status}
                        onValueChange={value =>
                          setFormValues(current => ({ ...current, status: value as TransactionStatus }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Pago</SelectItem>
                          <SelectItem value="scheduled">Agendado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter className="border-t border-border pt-5 sm:justify-between">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar lancamento</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Card className="rounded-lg bg-card">
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
              {items.map(transaction => (
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
