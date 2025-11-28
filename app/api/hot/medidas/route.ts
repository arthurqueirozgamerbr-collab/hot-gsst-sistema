// PATH: /app/api/hot/medidas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const remessaId = searchParams.get('remessaId')

    if (!remessaId) {
      return NextResponse.json(
        { error: 'ID da remessa é obrigatório' },
        { status: 400 }
      )
    }

    const medidas = await prisma.medida.findMany({
      where: { remessa_id: remessaId },
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
    console.error('Erro ao buscar medidas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { medidaId, userId } = await request.json()

    if (!medidaId) {
      return NextResponse.json(
        { error: 'ID da medida é obrigatório' },
        { status: 400 }
      )
    }

    await prisma.medida.delete({
      where: { id: medidaId }
    })

    await prisma.historico.create({
      data: {
        acao: 'Medida excluída',
        detalhes: JSON.stringify({ medidaId, userId }),
        usuario_id: userId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao excluir medida:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}