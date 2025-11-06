"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { Transaction } from "../../types/transaction"

interface ChartsSectionProps {
  transactions: Transaction[]
}

export function ChartsSection({ transactions }: ChartsSectionProps) {
  // Dados por categoria
  const categoriaData = transactions
    .filter((t) => t.tipo === "despesa")
    .reduce(
      (acc, t) => {
        const existing = acc.find((item) => item.name === t.categoria)
        if (existing) {
          existing.value += t.valor || 0
        } else {
          acc.push({ name: t.categoria, value: t.valor || 0 })
        }
        return acc
      },
      [] as Array<{ name: string; value: number }>,
    )

  // Dados por mês
  const mesData = transactions.reduce(
    (acc, t) => {
      const date = new Date(t.quando)
      const mes = date.toLocaleString("pt-BR", { month: "short" })
      const existing = acc.find((item) => item.name === mes)
      if (existing) {
        if (t.tipo === "despesa") existing.despesas += t.valor || 0
        else existing.receitas += t.valor || 0
      } else {
        acc.push({
          name: mes,
          despesas: t.tipo === "despesa" ? t.valor || 0 : 0,
          receitas: t.tipo === "receita" ? t.valor || 0 : 0,
        })
      }
      return acc
    },
    [] as Array<{ name: string; despesas: number; receitas: number }>,
  )

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Pizza - Despesas por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {categoriaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoriaData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoriaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">Sem dados de despesas</p>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Barras - Receitas vs Despesas por Mês */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Receitas vs Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          {mesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="receitas" fill="#10b981" />
                <Bar dataKey="despesas" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">Sem dados</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
