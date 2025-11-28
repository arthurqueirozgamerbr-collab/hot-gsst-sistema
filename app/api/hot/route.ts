// app/api/hot/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

// GET - Listar todas as remessas
export async function GET() {
  try {
    const remessas = await prisma.remessa.findMany({
      include: {
        medidas: true,
        usuario: {
          select: {
            nome: true,
            email: true
          }
        }
      },
      orderBy: { criado_em: 'desc' }
    })

    return NextResponse.json({ remessas })
  } catch (error: any) {
    console.error('Erro ao buscar remessas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova remessa - VERSÃO CORRIGIDA
export async function POST(request: NextRequest) {
  try {
    const { texto, userId } = await request.json()

    if (!texto || typeof texto !== 'string') {
      return NextResponse.json(
        { error: 'Texto é obrigatório e deve ser uma string' },
        { status: 400 }
      )
    }

    // Criar remessa
    const remessa = await prisma.remessa.create({
      data: {
        usuario_id: userId
      }
    })

    // Processar texto - garantir que é string
    const textoString = String(texto)
    const linhas = textoString
      .split(/[\n,;]/)
      .map((linha: string) => linha.trim())
      .filter((linha: string) => linha.length > 0)

    const medidasUnicas = [...new Set(linhas)]

    if (medidasUnicas.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma medida válida encontrada' },
        { status: 400 }
      )
    }

    // Inserir medidas - garantindo que texto é string
    const medidas = []
    for (const textoMedida of medidasUnicas) {
      const novaMedida = await prisma.medida.create({
        data: {
          remessa_id: remessa.id,
          texto: String(textoMedida), // 🔥 CORREÇÃO: Garantir que é string
          status: 'pendente'
        }
      })
      medidas.push(novaMedida)
    }

    // Registrar histórico
    await prisma.historico.create({
      data: {
        acao: 'Nova remessa criada',
        detalhes: JSON.stringify({
          remessaId: remessa.id,
          count: medidasUnicas.length,
          userId
        }),
        usuario_id: userId
      }
    })

    return NextResponse.json({
      remessaId: remessa.id,
      count: medidasUnicas.length,
      medidas
    })
  } catch (error: any) {
    console.error('Erro ao criar remessa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + error.message },
      { status: 500 }
    )
  }
}