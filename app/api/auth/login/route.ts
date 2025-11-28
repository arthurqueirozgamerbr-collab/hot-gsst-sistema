// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/database'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário pelo email
    const user = await prisma.usuario.findUnique({
      where: { email: email.trim().toLowerCase() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos' },
        { status: 401 }
      )
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.senha_hash)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos' },
        { status: 401 }
      )
    }

    // Atualizar último login
    await prisma.usuario.update({
      where: { id: user.id },
      data: { ultimo_login: new Date() }
    })

    // Retornar usuário (sem a senha)
    const userData = {
      id: user.id,
      email: user.email,
      nome: user.nome,
      nivel: user.nivel,
      criado_em: user.criado_em.toISOString(),
      ultimo_login: user.ultimo_login?.toISOString()
    }

    return NextResponse.json({ user: userData })
  } catch (error: any) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}