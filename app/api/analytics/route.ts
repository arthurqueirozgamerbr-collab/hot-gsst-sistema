// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get('periodo') || 'mes'

    const dataInicio = getStartDate(periodo)
   
    const [
      totalMedidas,
      medidasClassificadas,
      medidasPendentes,
      classificacoesData,
      bibliotecaData,
      historicoData
    ] = await Promise.all([
      prisma.medida.count({ where: { criado_em: { gte: dataInicio } } }),
      prisma.medida.count({ where: { status: 'validada', criado_em: { gte: dataInicio } } }),
      prisma.medida.count({ where: { status: 'pendente', criado_em: { gte: dataInicio } } }),
      prisma.classificacao.findMany({ where: { criado_em: { gte: dataInicio } } }),
      prisma.bibliotecaPermanente.findMany({ where: { criado_em: { gte: dataInicio } } }),
      prisma.historico.findMany({ 
        where: { criado_em: { gte: dataInicio } },
        orderBy: { criado_em: 'desc' },
        take: 10
      })
    ])

    // Calcular distribuição por categoria
    const categoriasCount = {
      H: classificacoesData.filter((item: any) => item.categoria === 'H').length,
      O: classificacoesData.filter((item: any) => item.categoria === 'O').length,
      T: classificacoesData.filter((item: any) => item.categoria === 'T').length
    }

    // Calcular eficiência da IA
    const totalSugestoes = historicoData.filter((h: any) =>
      h.acao.includes('automática') || h.acao.includes('sugestão')
    ).length
   
    const totalClassificacoes = historicoData.filter((h: any) =>
      h.acao.includes('classificada')
    ).length

    const eficienciaIA = totalClassificacoes > 0
      ? (totalSugestoes / totalClassificacoes) * 100
      : 0

    const analyticsData = {
      periodo,
      totalMedidas,
      medidasClassificadas,
      medidasPendentes,
      taxaClassificacao: totalMedidas > 0 ? (medidasClassificadas / totalMedidas) * 100 : 0,
      distribuicaoCategorias: categoriasCount,
      biblioteca: {
        total: bibliotecaData.length,
        H: bibliotecaData.filter((item: any) => item.categoria === 'H').length,
        O: bibliotecaData.filter((item: any) => item.categoria === 'O').length,
        T: bibliotecaData.filter((item: any) => item.categoria === 'T').length,
        reutilizacoes: bibliotecaData.reduce((sum: number, item: any) => sum + item.vezes_utilizada, 0)
      },
      eficiencia: {
        ia: Math.min(eficienciaIA, 100),
        manual: Math.max(100 - eficienciaIA, 0)
      },
      atividadesRecentes: historicoData,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(analyticsData)
  } catch (error: any) {
    console.error('Erro em getHotAnalytics:', error)
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