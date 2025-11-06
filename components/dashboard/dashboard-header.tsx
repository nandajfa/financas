"use client"

import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { AddTransactionModal } from "./add-transaction-modal"

interface DashboardHeaderProps {
  user: User
  onTransactionsChange: () => void
}

export function DashboardHeader({ user, onTransactionsChange }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>
      <div className="flex gap-3">
        <AddTransactionModal onSuccess={onTransactionsChange} />
        <Button variant="outline" onClick={handleLogout}>
          Sair
        </Button>
      </div>
    </div>
  )
}
