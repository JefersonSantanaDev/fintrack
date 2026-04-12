import { FormEvent, useState } from 'react'
import { Landmark, Plus, PiggyBank, WalletCards } from 'lucide-react'
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
import { accounts, formatCurrency } from '@/features/finance'
import type { Account } from '@/features/finance'

const accountIcons = {
  checking: Landmark,
  savings: PiggyBank,
  cash: WalletCards,
  credit: WalletCards,
}

type AccountType = Account['type']

interface NewAccountForm {
  name: string
  institution: string
  type: AccountType
  owners: string
  balance: string
}

function initialFormValues(): NewAccountForm {
  return {
    name: '',
    institution: '',
    type: 'checking',
    owners: '',
    balance: '',
  }
}

export function AccountsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [items, setItems] = useState<Account[]>(() => accounts)
  const [formValues, setFormValues] = useState<NewAccountForm>(() => initialFormValues())

  const handleCreateAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedName = formValues.name.trim()
    const normalizedInstitution = formValues.institution.trim()
    const normalizedOwners = formValues.owners.trim()
    const parsedBalance = Number(formValues.balance.replace(',', '.'))

    if (!normalizedName) {
      toast.error('Informe o nome da conta.')
      return
    }

    if (!normalizedInstitution) {
      toast.error('Informe a instituicao.')
      return
    }

    if (!normalizedOwners) {
      toast.error('Informe quem participa dessa conta.')
      return
    }

    if (!Number.isFinite(parsedBalance)) {
      toast.error('Informe um saldo inicial valido.')
      return
    }

    const newAccount: Account = {
      id: `account_${Date.now()}`,
      name: normalizedName,
      institution: normalizedInstitution,
      type: formValues.type,
      owners: normalizedOwners,
      balance: parsedBalance,
    }

    setItems(current => [newAccount, ...current])
    setFormValues(initialFormValues())
    setIsDialogOpen(false)
    toast.success('Conta adicionada com sucesso.')
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-[28px] bg-card/85">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Centro de contas</CardTitle>
            <CardDescription>Cadastre contas, reservas e cartões da família em um só lugar.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 self-start rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                <span className="flex items-center gap-1.5">
                  <span className="grid size-4 place-items-center rounded-full border border-white/35 bg-white/15">
                    <Plus className="size-3" />
                  </span>
                  Nova conta
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl p-0">
              <DialogHeader className="border-b border-emerald-500/12 px-6 py-5">
                <DialogTitle>Nova conta</DialogTitle>
                <DialogDescription>
                  Informe os dados principais para acompanhar saldo e participação familiar.
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-5 px-6 py-5" onSubmit={handleCreateAccount}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="account-name">Nome da conta</Label>
                    <Input
                      id="account-name"
                      value={formValues.name}
                      onChange={event =>
                        setFormValues(current => ({ ...current, name: event.target.value }))
                      }
                      placeholder="Ex: Conta conjunta da familia"
                      maxLength={60}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account-institution">Instituicao</Label>
                    <Input
                      id="account-institution"
                      value={formValues.institution}
                      onChange={event =>
                        setFormValues(current => ({ ...current, institution: event.target.value }))
                      }
                      placeholder="Ex: Nubank"
                      maxLength={40}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={formValues.type}
                      onValueChange={value =>
                        setFormValues(current => ({ ...current, type: value as AccountType }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Conta corrente</SelectItem>
                        <SelectItem value="savings">Reserva/poupanca</SelectItem>
                        <SelectItem value="cash">Carteira</SelectItem>
                        <SelectItem value="credit">Cartao de credito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account-owners">Responsavel(is)</Label>
                    <Input
                      id="account-owners"
                      value={formValues.owners}
                      onChange={event =>
                        setFormValues(current => ({ ...current, owners: event.target.value }))
                      }
                      placeholder="Ex: Jeferson e esposa"
                      maxLength={60}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account-balance">Saldo inicial</Label>
                    <Input
                      id="account-balance"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      value={formValues.balance}
                      onChange={event =>
                        setFormValues(current => ({ ...current, balance: event.target.value }))
                      }
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <DialogFooter className="border-t border-emerald-500/12 pt-5 sm:justify-between">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar conta</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map(account => {
          const Icon = accountIcons[account.type]

          return (
            <Card key={account.id} className="rounded-[28px] bg-card/85">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle>{account.name}</CardTitle>
                    <CardDescription>{account.institution}</CardDescription>
                  </div>
                  <div className="rounded-2xl bg-muted p-3">
                    <Icon className="size-5 text-foreground" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo atual</p>
                  <p className="text-3xl font-semibold">{formatCurrency(account.balance)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{account.type}</Badge>
                  <Badge variant="secondary">{account.owners}</Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
