'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Legend
} from 'recharts'

import type { Transaction } from '../../types/transaction'

interface ChartsSectionProps {
  transactions: Transaction[]
  isLoading?: boolean
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#14b8a6']

export function ChartsSection({ transactions, isLoading }: ChartsSectionProps) {
  const categoriaData = transactions
    .filter(transaction => transaction.tipo === 'despesa')
    .reduce((acc, transaction) => {
      const categoryName = transaction.categoria ?? 'Sem categoria'
      const existing = acc.find(item => item.name === categoryName)
      if (existing) {
        existing.value += transaction.valor || 0
      } else {
        acc.push({ name: categoryName, value: transaction.valor || 0 })
      }
      return acc
    }, [] as Array<{ name: string; value: number }>)

  const mesData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.quando ?? transaction.created_at)
    if (Number.isNaN(date.getTime())) {
      return acc
    }

    const mes = date.toLocaleString('pt-BR', { month: 'short' })
    const existing = acc.find(item => item.name === mes)

    if (existing) {
      if (transaction.tipo === 'despesa') {
        existing.despesas += transaction.valor || 0
      } else {
        existing.receitas += transaction.valor || 0
      }
    } else {
      acc.push({
        name: mes,
        despesas: transaction.tipo === 'despesa' ? transaction.valor || 0 : 0,
        receitas: transaction.tipo === 'receita' ? transaction.valor || 0 : 0
      })
    }

    return acc
  }, [] as Array<{ name: string; despesas: number; receitas: number }>)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Distribuição de despesas</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[320px] items-center justify-center">
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : categoriaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoriaData} cx="50%" cy="50%" dataKey="value" innerRadius={60} outerRadius={100} paddingAngle={4}>
                  {categoriaData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={value => `R$ ${Number(value).toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-sm text-muted-foreground">Nenhuma despesa registrada no período selecionado.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Receitas x Despesas</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[320px] items-center justify-center">
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : mesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mesData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis dataKey="name" stroke="currentColor" />
                <YAxis stroke="currentColor" tickFormatter={value => `R$ ${Number(value).toFixed(0)}`} />
                <Tooltip formatter={value => `R$ ${Number(value).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="receitas" fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="despesas" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-sm text-muted-foreground">Sem movimentações para exibir.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
