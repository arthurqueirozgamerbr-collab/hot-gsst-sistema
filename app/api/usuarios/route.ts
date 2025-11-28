// app/api/usuarios/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

export async function GET() {
  try {
    const users = await prisma.usuario.findMany({
      orderBy: { criado_em: 'desc' }
    })

    const usersData = users.map((user: any) => ({
      id: user.id,
      email: user.email,
      nome: user.nome,
      nivel: user.nivel,
      criado_em: user.criado_em.toISOString(),
      ultimo_login: user.ultimo_login?.toISOString()
    }))

    return NextResponse.json({ users: usersData })
  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}