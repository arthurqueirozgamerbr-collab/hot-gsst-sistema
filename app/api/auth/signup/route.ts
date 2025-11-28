// NOVO ARQUIVO: app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/database'
import { HashService } from '../../../../lib/hashService'

export async function POST(request: NextRequest) {
  try {
    const { email, password, nome, nivel = 'usuario' } = await request.json()

    if (!email || !password || !nome) {
      return NextResponse.json(
        { error: 'E-mail, senha e nome são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email: email.trim().toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'E-mail já cadastrado' },
        { status: 400 }
      )
    }

    // Criar usuário
    const senha_hash = await HashService.hashPassword(password)
    
    const user = await prisma.usuario.create({
      data: {
        email: email.trim().toLowerCase(),
        nome,
        senha_hash,
        nivel
      }
    })

    // Retornar usuário (sem senha)
    const userData = {
      id: user.id,
      email: user.email,
      nome: user.nome,
      nivel: user.nivel,
      criado_em: user.criado_em.toISOString()
    }

    return NextResponse.json({ user: userData })
  } catch (error: any) {
    console.error('Erro no cadastro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}