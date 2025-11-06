'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'

import type { Transaction } from '@/types/transaction'
import { DashboardHeader } from './dashboard-header'
import { SummaryCards } from './summary-cards'
import { ChartsSection } from './charts-section'
import { TransactionsTable } from './transactions-table'
import { createClient } from '@/lib/supabase/client'
import { getUserIdentifier } from '@/lib/utils'

export type DashboardFilters = {
  month: string
  year: string
  type: 'all' | 'despesa' | 'receita'
  category: string
}

const now = new Date()
const initialFilters: DashboardFilters = {
  month: String(now.getMonth() + 1),
  year: String(now.getFullYear()),
  type: 'all',
  category: 'all'
}

export function DashboardContent({ user }: { user: User }) {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const userIdentifier = getUserIdentifier(user)
      if (!userIdentifier) {
        console.error('Nenhum identificador de usuário disponível para buscar transações')
        setAllTransactions([])
        return
      }

      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user', userIdentifier)
        .order('quando', { ascending: false })

      if (error) {
        throw error
      }

      setAllTransactions(data ?? [])
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
      setAllTransactions([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadTransactions()
  }, [loadTransactions])

  const filteredTransactions = useMemo(() => {
    const monthFilter = filters.month === 'all' ? null : Number.parseInt(filters.month, 10)
    const yearFilter = filters.year === 'all' ? null : Number.parseInt(filters.year, 10)

    return allTransactions.filter(transaction => {
      const baseDate = transaction.quando ?? transaction.created_at
      const transactionDate = baseDate ? new Date(baseDate) : null

      const matchMonth =
        monthFilter === null || !transactionDate
          ? monthFilter === null
          : transactionDate.getMonth() + 1 === monthFilter

      const matchYear =
        yearFilter === null || !transactionDate
          ? yearFilter === null
          : transactionDate.getFullYear() === yearFilter

      const matchType =
        filters.type === 'all' ? true : transaction.tipo?.toLowerCase() === filters.type

      const matchCategory =
        filters.category === 'all'
          ? true
          : transaction.categoria?.toLowerCase() === filters.category.toLowerCase()

      return matchMonth && matchYear && matchType && matchCategory
    })
  }, [allTransactions, filters])

  const availableCategories = useMemo(() => {
    const categories = new Set(
      allTransactions
        .map(transaction => transaction.categoria)
        .filter((categoria): categoria is string => Boolean(categoria))
    )

    return Array.from(categories).sort((a, b) => a.localeCompare(b))
  }, [allTransactions])

  const availableYears = useMemo(() => {
    const years = new Set<string>()
    allTransactions.forEach(transaction => {
      const baseDate = transaction.quando ?? transaction.created_at
      if (!baseDate) return
      const year = new Date(baseDate).getFullYear()
      years.add(String(year))
    })

    if (years.size === 0) {
      years.add(String(now.getFullYear()))
    }

    return Array.from(years).sort((a, b) => Number(b) - Number(a))
  }, [allTransactions])

  const summaryPeriodLabel = useMemo(() => {
    const currentMonth = String(now.getMonth() + 1)
    const currentYear = String(now.getFullYear())

    if (filters.month === currentMonth && filters.year === currentYear) {
      return 'do mês'
    }

    if (filters.month !== 'all') {
      const monthIndex = Number.parseInt(filters.month, 10) - 1
      const formatter = new Date(2020, monthIndex).toLocaleString('pt-BR', { month: 'long' })
      const capitalized = formatter.charAt(0).toUpperCase() + formatter.slice(1)
      const yearSegment = filters.year !== 'all' ? `/${filters.year}` : ''
      return `de ${capitalized}${yearSegment}`
    }

    if (filters.year !== 'all') {
      return `de ${filters.year}`
    }

    return 'geral'
  }, [filters.month, filters.year])

  return (
    <div className="flex flex-col gap-6 bg-gradient-to-b from-background via-background/60 to-background p-4 md:p-10">
      <DashboardHeader user={user} onTransactionsChange={loadTransactions} />
      <SummaryCards transactions={filteredTransactions} isLoading={loading} periodLabel={summaryPeriodLabel} />
      <ChartsSection transactions={filteredTransactions} isLoading={loading} />
      <TransactionsTable
        transactions={filteredTransactions}
        loading={loading}
        onTransactionsChange={loadTransactions}
        filters={filters}
        onFilterChange={setFilters}
        availableYears={availableYears}
        availableCategories={availableCategories}
      />
    </div>
  )
}
