'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'

import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const loadUser = async () => {
      setLoading(true)

      try {
        const {
          data: { user },
          error
        } = await supabase.auth.getUser()

        if (error) {
          console.error('Erro ao recuperar usuário autenticado:', error.message)
        }

        setUser(user ?? null)
      } catch (error) {
        console.error('Erro inesperado ao buscar usuário:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    void loadUser()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-label="Carregando" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-dashed">
          <CardContent className="space-y-4 py-10 text-center">
            <h1 className="text-2xl font-semibold">Acesso restrito</h1>
            <p className="text-muted-foreground">
              É necessário autenticar-se para visualizar o seu painel financeiro e gerenciar suas
              transações.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <DashboardContent user={user} />
}
