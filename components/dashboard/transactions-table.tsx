'use client'

import { useEffect, useMemo, useState } from 'react'
import { MoreVertical, Trash2 } from 'lucide-react'

import { createClient } from '../../lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '../ui/pagination'
import { Skeleton } from '../ui/skeleton'
import type { Transaction } from '../../types/transaction'
import { EditTransactionModal } from './edit-transaction-modal'
import type { DashboardFilters } from './dashboard-content'

interface TransactionsTableProps {
  transactions: Transaction[]
  loading: boolean
  onTransactionsChange: () => void
  filters: DashboardFilters
  onFilterChange: (filters: DashboardFilters) => void
  availableYears: string[]
  availableCategories: string[]
}

const MONTH_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Todos os meses' },
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' }
]

const PAGE_SIZE = 8

export function TransactionsTable({
  transactions,
  loading,
  onTransactionsChange,
  filters,
  onFilterChange,
  availableYears,
  availableCategories
}: TransactionsTableProps) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [transactions.length])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return transactions.slice(start, start + PAGE_SIZE)
  }, [transactions, page])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta transação?')) return

    const supabase = createClient()
    const { error } = await supabase.from('transacoes').delete().eq('id', id)

    if (error) {
      alert('Erro ao deletar transação')
    } else {
      onTransactionsChange()
    }
  }

  const monthValue = filters.month
  const yearValue = filters.year
  const typeValue = filters.type
  const categoryValue = filters.category

  return (
    <Card className="border border-border/60 shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-xl font-semibold">Transações</CardTitle>
          <span className="text-sm text-muted-foreground">
            {transactions.length} transação{transactions.length === 1 ? '' : 'es'} encontradas
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            value={monthValue}
            onValueChange={value => onFilterChange({ ...filters, month: value })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {MONTH_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={yearValue}
            onValueChange={value => onFilterChange({ ...filters, year: value })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anos</SelectItem>
              {availableYears.map(year => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={typeValue}
            onValueChange={value => onFilterChange({ ...filters, type: value as DashboardFilters['type'] })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="receita">Receitas</SelectItem>
              <SelectItem value="despesa">Despesas</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={categoryValue}
            onValueChange={value => onFilterChange({ ...filters, category: value })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {availableCategories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted-foreground/40 py-12 text-center">
            <p className="text-lg font-medium">Nenhuma transação encontrada</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Ajuste os filtros selecionados ou adicione novas entradas para começar a acompanhar suas finanças.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-14">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.map(transaction => (
                  <TableRow key={transaction.id} className="transition-colors hover:bg-muted/40">
                    <TableCell>{new Date(transaction.quando ?? transaction.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{transaction.estabelecimento}</span>
                        {transaction.detalhes ? (
                          <span className="text-xs text-muted-foreground">{transaction.detalhes}</span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{transaction.categoria}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                          transaction.tipo === 'receita'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200'
                        }`}
                      >
                        {transaction.tipo === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {transaction.tipo === 'receita' ? '+' : '-'} R$ {transaction.valor?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <EditTransactionModal transaction={transaction} onSuccess={onTransactionsChange} />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && transactions.length > 0 ? (
          <Pagination className="pt-2">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={event => {
                    event.preventDefault()
                    setPage(prev => Math.max(prev - 1, 1))
                  }}
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={pageNumber === page}
                      onClick={event => {
                        event.preventDefault()
                        setPage(pageNumber)
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={event => {
                    event.preventDefault()
                    setPage(prev => Math.min(prev + 1, totalPages))
                  }}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </CardContent>
    </Card>
  )
}
