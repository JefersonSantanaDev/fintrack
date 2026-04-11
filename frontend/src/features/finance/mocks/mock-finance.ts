import type {
  Account,
  Budget,
  FamilyMember,
  Goal,
  SummaryMetric,
  Transaction,
} from '@/features/finance/types/finance.types'

export const summaryMetrics: SummaryMetric[] = [
  {
    id: 'balance',
    label: 'Saldo consolidado',
    value: 28450,
    change: '+8,2% comparado a marco',
    tone: 'success',
  },
  {
    id: 'income',
    label: 'Receitas do mes',
    value: 13200,
    change: '2 entradas confirmadas',
    tone: 'success',
  },
  {
    id: 'expenses',
    label: 'Despesas do mes',
    value: 9180,
    change: '72% do teto planejado',
    tone: 'warning',
  },
  {
    id: 'reserve',
    label: 'Reserva de emergencia',
    value: 15800,
    change: 'meta de 6 meses em andamento',
    tone: 'neutral',
  },
]

export const accounts: Account[] = [
  {
    id: 'account_1',
    name: 'Conta conjunta',
    institution: 'Nubank',
    type: 'checking',
    owners: 'Jeferson e esposa',
    balance: 12360,
  },
  {
    id: 'account_2',
    name: 'Reserva da familia',
    institution: 'Inter',
    type: 'savings',
    owners: 'Familia',
    balance: 15800,
  },
  {
    id: 'account_3',
    name: 'Carteira diaria',
    institution: 'Fisico',
    type: 'cash',
    owners: 'Casa',
    balance: 290,
  },
  {
    id: 'account_4',
    name: 'Cartao principal',
    institution: 'Nubank Ultravioleta',
    type: 'credit',
    owners: 'Jeferson',
    balance: -2840,
  },
]

export const budgets: Budget[] = [
  {
    id: 'budget_1',
    category: 'Moradia',
    spent: 2450,
    limit: 3000,
  },
  {
    id: 'budget_2',
    category: 'Mercado',
    spent: 1620,
    limit: 1800,
  },
  {
    id: 'budget_3',
    category: 'Transporte',
    spent: 690,
    limit: 1000,
  },
  {
    id: 'budget_4',
    category: 'Lazer',
    spent: 540,
    limit: 900,
  },
]

export const goals: Goal[] = [
  {
    id: 'goal_1',
    name: 'Viagem em familia',
    currentAmount: 4600,
    targetAmount: 9000,
    targetDate: 'dezembro/2026',
    status: 'on_track',
  },
  {
    id: 'goal_2',
    name: 'Fundo de emergencia',
    currentAmount: 15800,
    targetAmount: 30000,
    targetDate: 'junho/2027',
    status: 'on_track',
  },
  {
    id: 'goal_3',
    name: 'Troca de notebook',
    currentAmount: 2400,
    targetAmount: 6500,
    targetDate: 'setembro/2026',
    status: 'attention',
  },
]

export const familyMembers: FamilyMember[] = [
  {
    id: 'member_1',
    name: 'Jeferson',
    role: 'owner',
    focus: 'Planejamento, ajustes de categorias e visao geral.',
  },
  {
    id: 'member_2',
    name: 'Esposa',
    role: 'admin',
    focus: 'Compras, rotina da casa e despesas recorrentes.',
  },
  {
    id: 'member_3',
    name: 'Familia',
    role: 'viewer',
    focus: 'Visibilidade dos objetivos e saldo compartilhado.',
  },
]

export const transactions: Transaction[] = [
  {
    id: 'tx_1',
    description: 'Salario principal',
    category: 'Receita',
    account: 'Conta conjunta',
    date: '11 abr',
    amount: 7800,
    status: 'paid',
  },
  {
    id: 'tx_2',
    description: 'Supermercado da semana',
    category: 'Mercado',
    account: 'Cartao principal',
    date: '10 abr',
    amount: -420.35,
    status: 'paid',
  },
  {
    id: 'tx_3',
    description: 'Internet residencial',
    category: 'Moradia',
    account: 'Conta conjunta',
    date: '09 abr',
    amount: -129.9,
    status: 'paid',
  },
  {
    id: 'tx_4',
    description: 'Transferencia para reserva',
    category: 'Meta',
    account: 'Reserva da familia',
    date: '08 abr',
    amount: 1000,
    status: 'paid',
  },
  {
    id: 'tx_5',
    description: 'Combustivel',
    category: 'Transporte',
    account: 'Conta conjunta',
    date: '07 abr',
    amount: -180,
    status: 'paid',
  },
  {
    id: 'tx_6',
    description: 'Escola infantil',
    category: 'Educacao',
    account: 'Conta conjunta',
    date: '15 abr',
    amount: -650,
    status: 'scheduled',
  },
]

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}
