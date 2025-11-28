import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { medidaId, categoria, userId, justificativa } = await request.json()

    if (!medidaId || !categoria) {
      return NextResponse.json(
        { error: 'ID da medida e categoria são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se medida existe
    const medida = await prisma.medida.findUnique({
      where: { id: medidaId }
    })

    if (!medida) {
      return NextResponse.json(
        { error: 'Medida não encontrada' },
        { status: 404 }
      )
    }

    // 1. Atualizar medida
    await prisma.medida.update({
      where: { id: medidaId },
      data: {
        status: 'validada',
        categoria_sugerida: categoria,
        atualizado_em: new Date()
      }
    })

    // 2. Criar classificação (userId pode ser null)
    await prisma.classificacao.create({
      data: {
        medida_id: medidaId,
        categoria,
        justificativa: justificativa || "Classificação manual",
        usuario_id: userId // Pode ser null
      }
    })

    // 3. SALVAR NA BIBLIOTECA PERMANENTE (APRENDIZADO)
    try {
      await prisma.bibliotecaPermanente.upsert({
        where: { texto: medida.texto },
        update: {
          categoria,
          vezes_utilizada: { increment: 1 },
          atualizado_em: new Date()
        },
        create: {
          texto: medida.texto,
          categoria,
          criado_por: userId, // Pode ser null
          vezes_utilizada: 1
        }
      })
    } catch (bibliotecaError) {
      // Continuar mesmo se houver erro na biblioteca
      console.error('Erro na biblioteca:', bibliotecaError)
    }

    // 4. Registrar histórico (userId pode ser null)
    await prisma.historico.create({
      data: {
        acao: `Medida classificada como ${categoria}`,
        detalhes: JSON.stringify({
          medidaId,
          texto: medida.texto,
          categoria,
          justificativa
        }),
        usuario_id: userId // Pode ser null
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Medida classificada com sucesso'
    })

  } catch (error: any) {
    console.error('Erro na classificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + error.message },
      { status: 500 }
    )
  }
}