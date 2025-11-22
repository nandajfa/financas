'use client'

import type React from 'react'

import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { DropdownMenuItem } from '../ui/dropdown-menu'
import { Edit2 } from 'lucide-react'
import type { Transaction } from '../../types/transaction'

interface EditTransactionModalProps {
  transaction: Transaction
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

export function EditTransactionModal({
  transaction,
  onSuccess
}: EditTransactionModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    data: transaction.quando,
    estabelecimento: transaction.estabelecimento,
    categoria: transaction.categoria,
    tipo: transaction.tipo,
    valor: transaction.valor?.toString() || '',
    detalhes: transaction.detalhes || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    setLoading(true)

    try {
      // Validate valor before sending
      const parsedValor = Number.parseFloat(form.valor)
      if (!Number.isFinite(parsedValor)) {
        alert('Valor inválido')
        setLoading(false)
        return
      }

      // Build payload and cast via the client to bypass strict table typings in this setup
      const payload = {
        quando: form.data,
        estabelecimento: form.estabelecimento,
        categoria: form.categoria,
        tipo: form.tipo as string,
        valor: parsedValor,
        detalhes: form.detalhes
      }

      const { data: updatedData, error } = await (supabase as any)
        .from('transacoes')
        .update(payload)
        .eq('id', transaction.id)
        .select()

      if (error) {
        console.error('Erro ao atualizar transação:', error)
        throw error
      }

      console.log('Transação atualizada com sucesso:', updatedData)

      setOpen(false)

      // Aguardar um pouco para garantir que o banco processou
      await new Promise(resolve => setTimeout(resolve, 100))

      onSuccess()
    } catch (error) {
      alert('Erro ao atualizar transação')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={() => {
            setOpen(true)
          }}
        >
          <Edit2 className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
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
              value={form.valor}
              onChange={e => setForm({ ...form, valor: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="detalhes">Detalhes (Opcional)</Label>
            <Input
              id="detalhes"
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
              {loading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
