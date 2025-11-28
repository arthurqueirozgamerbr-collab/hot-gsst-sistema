// PATH: /app/api/admin/reset/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { tipo, userId } = await request.json()

    if (!tipo) {
      return NextResponse.json(
        { error: 'Tipo de reset é obrigatório' },
        { status: 400 }
      )
    }

    let message = ''

    switch (tipo) {
      case 'medidas':
        // Remove apenas medidas e classificações
        await prisma.classificacao.deleteMany({})
        await prisma.medida.deleteMany({})
        await prisma.remessa.deleteMany({})
        message = 'Medidas, classificações e remessas removidas'
        break

      case 'classificacoes':
        // Remove classificações e biblioteca
        await prisma.classificacao.deleteMany({})
        await prisma.bibliotecaPermanente.deleteMany({})
        await prisma.historico.deleteMany({})
        message = 'Classificações, biblioteca e histórico removidos'
        break

      case 'tudo':
        // Remove tudo (exceto usuários)
        await prisma.historico.deleteMany({})
        await prisma.classificacao.deleteMany({})
        await prisma.bibliotecaPermanente.deleteMany({})
        await prisma.medida.deleteMany({})
        await prisma.remessa.deleteMany({})
        message = 'Todos os dados resetados (exceto usuários)'
        break

      default:
        return NextResponse.json(
          { error: 'Tipo de reset inválido' },
          { status: 400 }
        )
    }

    // Registrar no histórico
    if (userId) {
      await prisma.historico.create({
        data: {
          acao: `Reset de dados: ${tipo}`,
          detalhes: JSON.stringify({ tipo, userId }),
          usuario_id: userId
        }
      })
    }

    return NextResponse.json({
      success: true,
      message
    })

  } catch (error: any) {
    console.error('Erro no reset:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + error.message },
      { status: 500 }
    )
  }
}

// GET para estatísticas
export async function GET() {
  try {
    const [
      totalMedidas,
      totalClassificacoes,
      totalBiblioteca,
      totalUsuarios,
      totalRemessas
    ] = await Promise.all([
      prisma.medida.count(),
      prisma.classificacao.count(),
      prisma.bibliotecaPermanente.count(),
      prisma.usuario.count(),
      prisma.remessa.count()
    ])

    return NextResponse.json({
      medidas: totalMedidas,
      classificacoes: totalClassificacoes,
      biblioteca: totalBiblioteca,
      usuarios: totalUsuarios,
      remessas: totalRemessas
    })
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}