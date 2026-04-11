import { Landmark, PiggyBank, WalletCards } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { accounts, formatCurrency } from '@/features/finance'

const accountIcons = {
  checking: Landmark,
  savings: PiggyBank,
  cash: WalletCards,
  credit: WalletCards,
}

export function AccountsPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {accounts.map(account => {
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
  )
}
