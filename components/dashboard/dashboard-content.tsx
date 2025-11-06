'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Transaction } from '@/types/transaction'
import { DashboardHeader } from './dashboard-header'
import { SummaryCards } from './summary-cards'
import { ChartsSection } from './charts-section'
import { TransactionsTable } from './transactions-table'
import { getUserIdentifier } from '@/lib/utils'

export function DashboardContent({ user }: { user: User }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<{
    period: 'month' | 'year' | 'all'
    type: 'all' | 'despesa' | 'receita'
    category: string
  }>({
    period: 'month',
    type: 'all',
    category: 'all'
  })

  useEffect(() => {
    loadTransactions()
  }, [filter])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const userIdentifier = getUserIdentifier(user)

      if (!userIdentifier) {
        console.error('Nenhum identificador de usuário disponível para buscar transações')
        setTransactions([])
        return
      }

      let query = supabase.from('transacoes').select('*').eq('user', userIdentifier)

      // Apply filters
      if (filter.type !== 'all') {
        query = query.eq('tipo', filter.type)
      }

      if (filter.category !== 'all') {
        query = query.eq('categoria', filter.category)
      }

      const { data, error } = await query.order('quando', {
        ascending: false
      })

      if (error) throw error

      // Apply period filter
      const filteredData = filterByPeriod(data || [], filter.period)
      setTransactions(filteredData)
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterByPeriod = (data: Transaction[], period: string) => {
    const now = new Date()
    return data.filter(t => {
      const transDate = new Date(t.quando)
      if (period === 'month') {
        return (
          transDate.getMonth() === now.getMonth() &&
          transDate.getFullYear() === now.getFullYear()
        )
      }
      if (period === 'year') {
        return transDate.getFullYear() === now.getFullYear()
      }
      return true
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-10">
      <DashboardHeader user={user} onTransactionsChange={loadTransactions} />
      <SummaryCards transactions={transactions} />
      <ChartsSection transactions={transactions} />
      <TransactionsTable
        transactions={transactions}
        loading={loading}
        onTransactionsChange={loadTransactions}
        filter={filter}
        onFilterChange={setFilter}
      />
    </div>
  )
}
