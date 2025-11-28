// app/api/historico/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

export async function GET() {
  try {
    const historico = await prisma.historico.findMany({
      orderBy: { criado_em: 'desc' },
      take: 100,
      include: {
        usuario: {
          select: {
            nome: true,
            email: true
          }
        }
      }
    })

    const historicoData = historico.map((item: any) => ({
      id: item.id,
      acao: item.acao,
      detalhes: item.detalhes,
      criado_em: item.criado_em.toISOString(),
      usuario: item.usuario ? {
        nome: item.usuario.nome,
        email: item.usuario.email
      } : null
    }))

    return NextResponse.json({ historico: historicoData })
  } catch (error: any) {
    console.error('Erro ao buscar histórico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}