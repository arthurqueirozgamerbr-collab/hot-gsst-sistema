// 📄 middleware.ts - SUBSTITUA por esta versão simplificada
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Verificar se existe o cookie de usuário
  const hasUserCookie = request.cookies.has('hot-user')
  
  // Se não tem cookie e não está na página de login, redirecionar para login
  if (!hasUserCookie && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Se tem cookie e está na página de login, redirecionar para home
  if (hasUserCookie && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}