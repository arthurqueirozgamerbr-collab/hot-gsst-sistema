// NOVO ARQUIVO: app/api/analytics/temporal/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get('periodo') || 'mes'

    const dataInicio = getStartDate(periodo)

    // Buscar dados agrupados por data
    const medidasPorDia = await prisma.medida.groupBy({
      by: ['criado_em'],
      where: {
        criado_em: { gte: dataInicio }
      },
      _count: {
        id: true
      }
    })

    const classificacoesPorDia = await prisma.classificacao.groupBy({
      by: ['criado_em'],
      where: {
        criado_em: { gte: dataInicio }
      },
      _count: {
        id: true
      }
    })

    // Processar dados para formato temporal
    const dados = processarDadosTemporais(medidasPorDia, classificacoesPorDia, periodo)

    return NextResponse.json({
      periodo,
      dados,
      totalRegistros: dados.length
    })
  } catch (error: any) {
    console.error('Erro em getTemporalData:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function getStartDate(periodo: string): Date {
  const now = new Date()
  switch (periodo) {
    case 'dia':
      return new Date(now.setDate(now.getDate() - 1))
    case 'semana':
      return new Date(now.setDate(now.getDate() - 7))
    case 'mes':
      return new Date(now.setMonth(now.getMonth() - 1))
    case 'ano':
      return new Date(now.setFullYear(now.getFullYear() - 1))
    default:
      return new Date(now.setMonth(now.getMonth() - 1))
  }
}

function processarDadosTemporais(medidas: any[], classificacoes: any[], periodo: string) {
  // Implementar lógica de agrupamento temporal
  return medidas.map((item, index) => ({
    data: item.criado_em.toISOString().split('T')[0],
    entradas: item._count.id,
    classificacoes: classificacoes[index]?._count.id || 0,
    revisoes: 0 // Implementar lógica específica
  }))
}