// 📄 contexts/AuthContext.tsx - VERSÃO COMPLETA COM 4 HORAS
"use client"
import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService } from '../lib/authService'

interface User {
  id: string
  email: string
  nome: string
  nivel: 'admin' | 'usuario'
  criado_em: string
  ultimo_login?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  isAdmin: boolean
  sessionTimeLeft: number // Tempo restante da sessão em segundos
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SESSION_DURATION = 4 * 60 * 60 * 1000 // 🔥 4 HORAS em milissegundos

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionTimeLeft, setSessionTimeLeft] = useState(SESSION_DURATION)

  useEffect(() => {
    checkStoredUser()
  }, [])

  // Contador regressivo da sessão
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      setSessionTimeLeft(prev => {
        if (prev <= 1000) {
          // Sessão expirada
          handleSessionExpired()
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [user])

  const handleSessionExpired = () => {
    signOut()
    alert('Sessão expirada. Por favor, faça login novamente.')
  }

  const checkStoredUser = async () => {
    try {
      if (typeof window === 'undefined') {
        setLoading(false)
        return
      }

      const storedUser = localStorage.getItem('hot-user')
      const sessionStart = localStorage.getItem('hot-session-start')
     
      if (storedUser && sessionStart) {
        const sessionAge = Date.now() - parseInt(sessionStart)
        
        // Verificar se a sessão ainda é válida (4 horas)
        if (sessionAge < SESSION_DURATION) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setSessionTimeLeft(SESSION_DURATION - sessionAge)
        } else {
          // Sessão expirada
          localStorage.removeItem('hot-user')
          localStorage.removeItem('hot-session-start')
        }
      }
    } catch (error) {
      console.error('Erro ao verificar usuário armazenado:', error)
      localStorage.removeItem('hot-user')
      localStorage.removeItem('hot-session-start')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // 📄 contexts/AuthContext.tsx - ATUALIZE a função signIn
const signIn = async (email: string, password: string) => {
  setLoading(true)
  try {
    const result = await AuthService.signIn(email, password)
   
    if (!result.error && result.data?.user) {
      const userData = result.data.user
      setUser(userData)
      setSessionTimeLeft(SESSION_DURATION)
     
      // Salvar no localStorage E cookies
      if (typeof window !== 'undefined') {
        localStorage.setItem('hot-user', JSON.stringify(userData))
        localStorage.setItem('hot-session-start', Date.now().toString())
        
        // Também setar cookie para o middleware
        document.cookie = `hot-user=${JSON.stringify(userData)}; path=/; max-age=${4 * 60 * 60}` // 4 horas
        document.cookie = `hot-session-start=${Date.now()}; path=/; max-age=${4 * 60 * 60}`
      }
    }
   
    return result
  } catch (error: any) {
    console.error('Erro no signIn:', error)
    return { data: null, error: new Error('Erro durante o login') }
  } finally {
    setLoading(false)
  }
}

 // ATUALIZE também a função signOut:
const signOut = async () => {
  setLoading(true)
  try {
    // Limpar localStorage E cookies
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hot-user')
      localStorage.removeItem('hot-session-start')
      
      // Limpar cookies
      document.cookie = 'hot-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'hot-session-start=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
   
    setUser(null)
    setSessionTimeLeft(SESSION_DURATION)
  } catch (error) {
    console.error('Erro no logout:', error)
  } finally {
    setLoading(false)
  }
}

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isAdmin: user?.nivel === 'admin',
    sessionTimeLeft
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}