export interface Transaction {
  id: string
  created_at: string
  quando: string
  user: string
  estabelecimento: string
  valor: number
  detalhes: string | null
  tipo: string
  categoria: string
}
