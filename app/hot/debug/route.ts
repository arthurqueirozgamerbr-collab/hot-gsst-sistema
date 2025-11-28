import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'  // Caminho correto
import { suggestCategoryForMeasure } from '../../../lib/hotService'  // Caminho correto

export async function GET() {
  try {
    const debugInfo = {
      biblioteca: {
        total: await prisma.bibliotecaPermanente.count(),
        itens: await prisma.bibliotecaPermanente.findMany({
          take: 5,
          orderBy: { atualizado_em: 'desc' }
        })
      },
      remessas: {
        total: await prisma.remessa.count(),
        ultima: await prisma.remessa.findFirst({
          orderBy: { criado_em: 'desc' },
          include: { 
            medidas: {
              where: { status: 'pendente' },
              take: 3
            }
          }
        })
      },
      testeSugestao: {}
    }

    // Testar sugestão se houver itens na biblioteca
    if (debugInfo.biblioteca.itens.length > 0) {
      const textoTeste = debugInfo.biblioteca.itens[0].texto
      debugInfo.testeSugestao = await suggestCategoryForMeasure(textoTeste)
    }

    return NextResponse.json(debugInfo)
  } catch (error: any) {
    console.error('Erro no debug:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}