
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'

import type { Transaction } from '@/types/transaction'
import { DashboardHeader } from './dashboard-header'
import { SummaryCards } from './summary-cards'
import { ChartsSection } from './charts-section'
import { TransactionsTable } from './transactions-table'
import { createClient } from '@/lib/supabase/client'
import { parseTransactionDate } from '@/lib/utils'

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

      if (!user?.id) {
        console.error('ID do usuário não disponível para buscar transações')
        setAllTransactions([])
        return
      }

      console.log('Buscando transações para o usuário:', user.id)

      // Buscar transações usando user_id (referência ao auth.users)
      const { data: transactionsWithUserId, error: errorWithUserId } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('quando', { ascending: false })

      if (errorWithUserId) {
        console.error('Erro na query do Supabase (com user_id):', errorWithUserId)
        throw errorWithUserId
      }

      // Buscar transações sem user_id (vindas do n8n/WhatsApp) e associá-las ao usuário
      const { data: transactionsWithoutUserId, error: errorWithoutUserId } = await supabase
        .from('transacoes')
        .select('*')
        .is('user_id', null)
        .order('quando', { ascending: false })

      if (errorWithoutUserId) {
        console.error('Erro ao buscar transações sem user_id:', errorWithoutUserId)
      }

      // Associar transações sem user_id ao usuário atual
      if (transactionsWithoutUserId && transactionsWithoutUserId.length > 0) {
        console.log(`Encontradas ${transactionsWithoutUserId.length} transações sem user_id, associando ao usuário atual...`)

        const transactionIds = transactionsWithoutUserId.map((t: Transaction) => t.id)

        const { error: updateError } = await supabase
          .from('transacoes')
          .update({ user_id: user.id })
          .in('id', transactionIds)

        if (updateError) {
          console.error('Erro ao associar transações ao usuário:', updateError)
        } else {
          console.log(`Transações associadas com sucesso ao usuário ${user.id}`)
        }
      }

      // Combinar ambas as listas
      const allData = [
        ...(transactionsWithUserId || []),
        ...(transactionsWithoutUserId || [])
      ]

      // Remover duplicatas (caso alguma transação tenha sido associada durante a busca)
      const uniqueTransactions = allData.filter((transaction, index, self) =>
        index === self.findIndex(t => t.id === transaction.id)
      )

      // Ordenar por data (mais recente primeiro)
      uniqueTransactions.sort((a, b) => {
        const dateA = parseTransactionDate(a.quando || a.created_at)?.getTime() ?? 0
        const dateB = parseTransactionDate(b.quando || b.created_at)?.getTime() ?? 0
        return dateB - dateA
      })

      console.log('Transações encontradas:', uniqueTransactions.length, uniqueTransactions)
      setAllTransactions(uniqueTransactions)
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

  // Adicionar subscription para atualização em tempo real
  useEffect(() => {
    if (!user?.id) return

    const supabase = createClient()

    // Criar subscription para escutar mudanças na tabela transacoes
    const channel = supabase
      .channel('transacoes-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'transacoes',
          filter: `user_id=eq.${user.id}`
        },
        (payload: unknown) => {
          console.log('Mudança detectada na tabela transacoes:', payload)
          // Recarregar transações quando houver mudanças
          void loadTransactions()
        }
      )
      .subscribe()

    // Cleanup: remover subscription quando o componente desmontar
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [user?.id, loadTransactions])

  const filteredTransactions = useMemo(() => {
    const monthFilter = filters.month === 'all' ? null : Number.parseInt(filters.month, 10)
    const yearFilter = filters.year === 'all' ? null : Number.parseInt(filters.year, 10)

    return allTransactions.filter(transaction => {
      const baseDate = transaction.quando ?? transaction.created_at
      const transactionDate = parseTransactionDate(baseDate)

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
      const parsedDate = parseTransactionDate(baseDate)
      if (!parsedDate) return
      const year = parsedDate.getFullYear()
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
    <div className="flex flex-col gap-6 bg-gradient-to-br from-background via-background/60 to-background p-4 md:p-10">
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
