"use client"
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredLevel?: 'admin' | 'usuario'
  fallbackPath?: string
}

export default function ProtectedRoute({
  children,
  requiredLevel = 'usuario',
  fallbackPath = '/login'
}: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(fallbackPath)
      return
    }

    if (!loading && user && requiredLevel === 'admin' && !isAdmin) {
      router.push('/unauthorized')
      return
    }
  }, [user, loading, isAdmin, requiredLevel, router, fallbackPath])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verificando acesso...</h2>
          <p className="text-gray-600">Carregando suas credenciais de acesso.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-600">🔒</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso não autorizado</h2>
          <p className="text-gray-600 mb-6">Redirecionando para a página de login...</p>
        </div>
      </div>
    )
  }

  if (requiredLevel === 'admin' && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-yellow-600">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso restrito</h2>
          <p className="text-gray-600 mb-6">Esta área é apenas para administradores.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}