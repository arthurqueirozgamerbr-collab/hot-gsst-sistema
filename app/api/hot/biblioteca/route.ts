// PATH: /app/api/hot/biblioteca/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/database'

// 📄 app/api/hot/biblioteca/route.ts - ATUALIZE a função GET
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get('search')
    const categoria = searchParams.get('categoria')
    const ordenacao = searchParams.get('ordenacao') || 'vezes_utilizada'

    let whereCondition: any = {}
   
    if (searchTerm && searchTerm.trim()) {
      whereCondition.texto = {
        contains: searchTerm
      }
    }

    if (categoria && categoria.trim()) {
      whereCondition.categoria = categoria
    }

    let orderBy: any = {}
    
    switch (ordenacao) {
      case 'texto':
        orderBy = { texto: 'asc' }
        break
      case 'data':
        orderBy = { atualizado_em: 'desc' }
        break
      case 'vezes_utilizada':
      default:
        orderBy = [{ vezes_utilizada: 'desc' }, { atualizado_em: 'desc' }]
        break
    }

    const data = await prisma.bibliotecaPermanente.findMany({
      where: whereCondition,
      orderBy: orderBy
    })

    const libraryItems = data.map((item: any) => ({
      id: item.id,
      texto: item.texto,
      categoria: item.categoria,
      vezes_utilizada: item.vezes_utilizada,
      data: item.atualizado_em.toISOString() || item.criado_em.toISOString()
    }))

    return NextResponse.json({ items: libraryItems })
  } catch (error: any) {
    console.error('Erro ao buscar biblioteca:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { measureId, novaCategoria, userId, justificativa } = await request.json()

    if (!measureId || !novaCategoria) {
      return NextResponse.json(
        { error: 'ID da medida e nova categoria são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar medida original
    const medidaData = await prisma.bibliotecaPermanente.findUnique({
      where: { id: measureId }
    })

    if (!medidaData) {
      return NextResponse.json(
        { error: 'Medida não encontrada' },
        { status: 404 }
      )
    }

    const textoMedida = medidaData.texto
    const categoriaAntiga = medidaData.categoria

    // Atualizar biblioteca
    await prisma.bibliotecaPermanente.update({
      where: { id: measureId },
      data: {
        categoria: novaCategoria
      }
    })

    // Histórico
    await prisma.historico.create({
      data: {
        acao: `Medida reclassificada: ${categoriaAntiga} → ${novaCategoria}`,
        detalhes: JSON.stringify({
          measureId,
          texto: textoMedida,
          categoriaAntiga,
          novaCategoria,
          justificativa,
          userId
        }),
        usuario_id: userId
      }
    })

    return NextResponse.json({ success: true, message: 'Medida reclassificada com sucesso' })
  } catch (error: any) {
    console.error('Erro ao atualizar biblioteca:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const measureId = searchParams.get('measureId')
    const userId = searchParams.get('userId')

    if (!measureId) {
      return NextResponse.json(
        { error: 'ID da medida é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar dados da medida antes de excluir (para histórico)
    const medidaData = await prisma.bibliotecaPermanente.findUnique({
      where: { id: measureId }
    })

    if (!medidaData) {
      return NextResponse.json(
        { error: 'Medida não encontrada' },
        { status: 404 }
      )
    }

    // Excluir a medida
    await prisma.bibliotecaPermanente.delete({
      where: { id: measureId }
    })

    // Registrar histórico
    if (userId) {
      await prisma.historico.create({
        data: {
          acao: 'Medida removida da biblioteca',
          detalhes: JSON.stringify({
            measureId,
            texto: medidaData.texto,
            userId
          }),
          usuario_id: userId
        }
      })
    }

    // RETORNAR RESPOSTA SIMPLES SEM CORPO
    return new NextResponse(null, {
      status: 204, // No Content - resposta vazia
      statusText: 'Medida removida com sucesso'
    })

  } catch (error: any) {
    console.error('Erro ao excluir da biblioteca:', error)
    
    // Se a medida não existe, retornar 404
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Medida não encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}