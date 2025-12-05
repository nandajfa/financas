import { TrendingDown, TrendingUp, Wallet2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import type { Transaction } from '../../types/transaction'

interface SummaryCardsProps {
  transactions: Transaction[]
  isLoading?: boolean
  periodLabel: string
}

export function SummaryCards({ transactions, isLoading, periodLabel }: SummaryCardsProps) {
  const normalizeType = (transaction: Transaction) => transaction.tipo?.toLowerCase()

  const totalReceitas = transactions
    .filter(transaction => normalizeType(transaction) === 'receita')
    .reduce((sum, transaction) => sum + (transaction.valor || 0), 0)

  const totalDespesas = transactions
    .filter(transaction => normalizeType(transaction) === 'despesa')
    .reduce((sum, transaction) => sum + (transaction.valor || 0), 0)

  const saldo = totalReceitas - totalDespesas

  const periodSuffix = periodLabel === 'geral' ? 'totais' : periodLabel
  const saldoLabel = periodLabel === 'geral' ? 'Saldo acumulado' : `Saldo ${periodLabel}`

  const cards = [
    {
      key: 'receitas' as const,
      title: `Receitas ${periodSuffix}`,
      value: totalReceitas,
      icon: TrendingUp,
      accent: 'from-emerald-500/20 to-emerald-500/5',
      textColor: 'text-emerald-600 dark:text-emerald-300'
    },
    {
      key: 'despesas' as const,
      title: `Despesas ${periodSuffix}`,
      value: totalDespesas,
      icon: TrendingDown,
      accent: 'from-rose-500/20 to-rose-500/5',
      textColor: 'text-rose-600 dark:text-rose-300'
    },
    {
      key: 'saldo' as const,
      title: saldoLabel,
      value: saldo,
      icon: Wallet2,
      accent: saldo >= 0 ? 'from-sky-500/20 to-sky-500/5' : 'from-orange-500/20 to-orange-500/5',
      textColor:
        saldo >= 0 ? 'text-sky-600 dark:text-sky-300' : 'text-orange-600 dark:text-orange-300'
    }
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(({ key, title, value, icon: Icon, accent, textColor }) => (
        <Card
          key={key}
          className={`relative overflow-hidden border-0 bg-gradient-to-br ${accent} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
        >
          <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-white/40 blur-3xl" aria-hidden />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <div className={`text-3xl font-bold ${textColor}`}>
                R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
