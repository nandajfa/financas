'use client'

import type React from 'react'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

type TransacaoInsert = {
  quando: string
  user_id: string
  estabelecimento: string
  valor: number
  detalhes?: string
  tipo: string
  categoria: string
  cartao_credito?: string
}

interface AddTransactionModalProps {
  onSuccess: () => void
}

const CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Saúde',
  'Educação',
  'Diversão',
  'Compras',
  'Serviços',
  'Outros'
]

export function AddTransactionModal({ onSuccess }: AddTransactionModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    estabelecimento: '',
    categoria: 'Alimentação',
    tipo: 'despesa',
    valor: '',
    detalhes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    if (sessionError) {
      alert('Não foi possível validar a sessão do usuário autenticado.')
      console.error(sessionError)
      return
    }

    const user = session?.user

    if (!user || !user.id) {
      alert('Não foi possível identificar o usuário autenticado.')
      return
    }

    setLoading(true)

    try {
      const { data: insertedData, error } = await supabase
        .from<TransacaoInsert>('transacoes')
        .insert({
          quando: form.data,
          user_id: user.id,
          estabelecimento: form.estabelecimento,
          valor: Number.parseFloat(form.valor),
          detalhes: form.detalhes,
          tipo: form.tipo,
          categoria: form.categoria
          // cartao_credito: opcional
        })
        .select()

      if (error) {
        console.error('Erro ao inserir transação:', error)
        throw error
      }

      console.log('Transação inserida com sucesso:', insertedData)

      // Fechar o modal e limpar o formulário
      setOpen(false)
      setForm({
        data: new Date().toISOString().split('T')[0],
        estabelecimento: '',
        categoria: 'Alimentação',
        tipo: 'despesa',
        valor: '',
        detalhes: ''
      })

      // Aguardar um pouco para garantir que o banco processou
      await new Promise(resolve => setTimeout(resolve, 100))

      // Chamar o callback para atualizar a lista
      onSuccess()
    } catch (error) {
      console.error('Erro ao adicionar transação:', error)
      alert('Erro ao adicionar transação. Verifique o console para mais detalhes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={form.data}
              onChange={e => setForm({ ...form, data: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="estabelecimento">Estabelecimento</Label>
            <Input
              id="estabelecimento"
              placeholder="Ex: Supermercado X"
              value={form.estabelecimento}
              onChange={e =>
                setForm({ ...form, estabelecimento: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Select
              value={form.categoria}
              onValueChange={value => setForm({ ...form, categoria: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={form.tipo}
              onValueChange={value => setForm({ ...form, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="despesa">Despesa</SelectItem>
                <SelectItem value="receita">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.valor}
              onChange={e => setForm({ ...form, valor: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="detalhes">Detalhes (Opcional)</Label>
            <Input
              id="detalhes"
              placeholder="Adicione notas..."
              value={form.detalhes}
              onChange={e => setForm({ ...form, detalhes: e.target.value })}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
