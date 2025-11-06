import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import type { Transaction } from "../../types/transaction"

interface SummaryCardsProps {
  transactions: Transaction[]
}

export function SummaryCards({ transactions }: SummaryCardsProps) {
  const totalReceitas = transactions.filter((t) => t.tipo === "receita").reduce((sum, t) => sum + (t.valor || 0), 0)

  const totalDespesas = transactions.filter((t) => t.tipo === "despesa").reduce((sum, t) => sum + (t.valor || 0), 0)

  const saldo = totalReceitas - totalDespesas

  const cards = [
    {
      title: "Receitas",
      value: totalReceitas.toFixed(2),
      color: "bg-emerald-50 dark:bg-emerald-950",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Despesas",
      value: totalDespesas.toFixed(2),
      color: "bg-red-50 dark:bg-red-950",
      textColor: "text-red-600 dark:text-red-400",
    },
    {
      title: "Saldo",
      value: saldo.toFixed(2),
      color: saldo >= 0 ? "bg-blue-50 dark:bg-blue-950" : "bg-orange-50 dark:bg-orange-950",
      textColor: saldo >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className={card.color}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.textColor}`}>R$ {card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
