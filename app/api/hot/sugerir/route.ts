import { NextRequest, NextResponse } from 'next/server'
import { suggestCategoryForMeasure } from '../../../../lib/hotService'

export async function POST(request: NextRequest) {
  try {
    const { texto } = await request.json()
    
    if (!texto) {
      return NextResponse.json(
        { error: 'Texto é obrigatório' },
        { status: 400 }
      )
    }

    const sugestao = await suggestCategoryForMeasure(texto)
    
    return NextResponse.json(sugestao)
  } catch (error: any) {
    console.error('Erro na sugestão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}