'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase/client'

interface Transaction {
  id: string
  descricao: string
  categoria: string
  tipo: string
  valor: number
  data: string
  created_at: string
}
interface Transaction {
  id: string
  descricao: string
  categoria: string
  tipo: string
  valor: number
  created_at: string
}
export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const supabase = createClient()
        const { data, error: supabaseError } = await supabase
          .from('transacoes')
          .select('*')
          .order('created_at', { ascending: false })

        if (supabaseError) throw supabaseError
        setTransactions(data || [])
      } catch (err) {
        console.error('[v0] Error fetching transactions:', err)
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar transações'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando transações...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold">Erro ao carregar dados</p>
          <p className="text-gray-600 text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-2">Dashboard Financeiro</h1>
        <p className="text-gray-600 mb-6">
          Suas transações totais: {transactions.length}
        </p>

        <div className="space-y-4">
          {transactions.map(transaction => (
            <div
              key={transaction.id}
              className="p-4 border rounded-lg bg-white shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{transaction.descricao}</p>
                  <p className="text-sm text-gray-600">
                    {transaction.categoria}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString(
                      'pt-BR'
                    )}
                  </p>
                </div>
                <p
                  className={`font-bold text-lg ${
                    transaction.tipo === 'receita'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {transaction.tipo === 'receita' ? '+' : '-'} R${' '}
                  {transaction.valor.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
