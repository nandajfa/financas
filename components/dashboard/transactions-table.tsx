"use client"

import { useState } from "react"
import { createClient } from "../../lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { MoreVertical, Trash2 } from "lucide-react"
import type { Transaction } from "../../types/transaction"
import { EditTransactionModal } from "./edit-transaction-modal"

interface TransactionsTableProps {
  transactions: Transaction[]
  loading: boolean
  onTransactionsChange: () => void
  filter: {
    period: "month" | "year" | "all"
    type: "all" | "despesa" | "receita"
    category: string
  }
  onFilterChange: (filter: any) => void
}

export function TransactionsTable({
  transactions,
  loading,
  onTransactionsChange,
  filter,
  onFilterChange,
}: TransactionsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const categories = Array.from(new Set(transactions.map((t) => t.categoria))).sort()

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta transação?")) return

    const supabase = createClient()
    const { error } = await supabase.from("transacoes").delete().eq("id", id)

    if (error) {
      alert("Erro ao deletar transação")
    } else {
      onTransactionsChange()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações</CardTitle>
        <div className="flex gap-4 mt-4 flex-wrap">
          <Select
            value={filter.period}
            onValueChange={(value) => onFilterChange({ ...filter, period: value as "month" | "year" | "all" })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mês Atual</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
              <SelectItem value="all">Todas</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter.type}
            onValueChange={(value) => onFilterChange({ ...filter, type: value as "all" | "despesa" | "receita" })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="receita">Receitas</SelectItem>
              <SelectItem value="despesa">Despesas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filter.category} onValueChange={(value) => onFilterChange({ ...filter, category: value })}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Carregando transações...</p>
        ) : transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhuma transação encontrada</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Estabelecimento</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-10">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.quando).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{transaction.estabelecimento}</TableCell>
                    <TableCell>{transaction.categoria}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          transaction.tipo === "receita"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {transaction.tipo === "receita" ? "Receita" : "Despesa"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {transaction.tipo === "receita" ? "+" : "-"} R$ {transaction.valor?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <EditTransactionModal transaction={transaction} onSuccess={onTransactionsChange} />
                          <DropdownMenuItem
                            className="text-destructive cursor-pointer"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deletar
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
      </CardContent>
    </Card>
  )
}
