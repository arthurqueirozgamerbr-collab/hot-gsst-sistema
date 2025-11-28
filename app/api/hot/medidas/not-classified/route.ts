// app/api/hot/medidas/not-classified/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/database'

export async function PUT(request: NextRequest) {
  try {
    const { medidaId, userId } = await request.json()

    if (!medidaId) {
      return NextResponse.json(
        { error: 'ID da medida é obrigatório' },
        { status: 400 }
      )
    }

    await prisma.medida.update({
      where: { id: medidaId },
      data: { 
        status: 'nao_classificada'
      }
    })

    await prisma.historico.create({
      data: {
        acao: 'Medida marcada como não classificada',
        detalhes: JSON.stringify({ medidaId, userId }),
        usuario_id: userId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao marcar como não classificada:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}