export interface Transaction {
  id: string
  created_at: string
  quando: string
  user_id: string
  estabelecimento: string
  valor: number
  detalhes: string | null
  tipo: string
  categoria: string
  // Mantido para compatibilidade com dados antigos (será removido após migração)
  user?: string
}
