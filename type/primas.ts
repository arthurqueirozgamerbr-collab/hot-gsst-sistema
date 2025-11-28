// PATH: types/prisma.ts
export interface Medida {
  id: string
  remessa_id: string
  texto: string
  status: string
  categoria_sugerida?: string | null
  criado_em: Date
  atualizado_em: Date
}

export interface BibliotecaPermanente {
  id: string
  texto: string
  categoria: string
  vezes_utilizada: number
  criado_por?: string | null
  criado_em: Date
  atualizado_em: Date
}