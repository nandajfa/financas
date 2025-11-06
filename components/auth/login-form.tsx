"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, LogIn } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const ensureNoActiveSession = async () => {
      try {
        const {
          data: { session },
          error
        } = await supabase.auth.getSession()

        if (!isMounted) {
          return
        }

        if (error) {
          console.error("Erro ao recuperar sessão ativa:", error.message)
        }

        if (session?.user) {
          router.replace("/dashboard")
          router.refresh()
        } else {
          setCheckingSession(false)
        }
      } catch (error) {
        console.error("Erro inesperado ao verificar sessão ativa:", error)
        if (isMounted) {
          setCheckingSession(false)
        }
      }
    }

    void ensureNoActiveSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.replace("/dashboard")
        router.refresh()
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [router])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Informe o e-mail e a senha cadastrados no Supabase.")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        setErrorMessage(
          error.message === "Invalid login credentials"
            ? "Credenciais inválidas. Verifique o e-mail e a senha cadastrados."
            : `Não foi possível autenticar: ${error.message}`
        )
        return
      }

      router.replace("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Erro inesperado ao tentar autenticar:", error)
      setErrorMessage("Ocorreu um erro inesperado ao tentar autenticar. Tente novamente em instantes.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (checkingSession) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-2xl">Verificando sessão</CardTitle>
          <CardDescription>Estamos preparando o formulário de acesso para você.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center pb-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Carregando" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl">Entrar</CardTitle>
        <CardDescription>
          Utilize as credenciais criadas no painel do Supabase para acessar o seu dashboard financeiro.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2 text-left">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="voce@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {errorMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Entrando...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
                Entrar
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <span>Precisa de acesso?</span>
        <Link href="https://app.supabase.com/project/_/auth/users" target="_blank" className="text-primary underline">
          Cadastre o usuário no Supabase
        </Link>
      </CardFooter>
    </Card>
  )
}
