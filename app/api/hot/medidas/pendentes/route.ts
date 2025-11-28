// PATH: /app/api/hot/medidas/pendentes/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/database'

export async function GET() {
  try {
    const medidas = await prisma.medida.findMany({
      where: {
        OR: [
          { status: 'pendente' },
          { status: 'nao_classificada' }
        ]
      },
      orderBy: { criado_em: 'asc' }
    })

    // Converter datas para string com tipagem explícita
    const medidasData = medidas.map((medida: any) => ({
      id: medida.id,
      texto: medida.texto,
      status: medida.status,
      categoria_sugerida: medida.categoria_sugerida,
      criado_em: medida.criado_em.toISOString(),
      atualizado_em: medida.atualizado_em.toISOString()
    }))

    return NextResponse.json({ medidas: medidasData })
  } catch (error: any) {
    console.error('Erro ao buscar medidas pendentes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}