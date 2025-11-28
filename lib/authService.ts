// lib/authService.ts

// ========== TIPOS ==========
export interface User {
  id: string
  email: string
  nome: string
  nivel: 'admin' | 'usuario'
  criado_em: string
  ultimo_login?: string
}

interface AuthResponse {
  data: any
  error: Error | null
}

// ========== SERVIÇO DE AUTENTICAÇÃO CLIENT-SIDE ==========
export class AuthService {
  
  // ========== LOGIN ==========
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { 
          data: null, 
          error: new Error(data.error || 'E-mail ou senha incorretos.') 
        }
      }

      return { data, error: null }
    } catch (error: any) {
      console.error('Erro no login:', error)
      return { 
        data: null, 
        error: new Error('Erro de conexão. Tente novamente.') 
      }
    }
  }

  // ========== CADASTRO ADMIN ==========
  static async signUpAdmin(email: string, password: string, nome: string, nivel: 'admin' | 'usuario' = 'usuario'): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, nome, nivel }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { 
          data: null, 
          error: new Error(data.error || 'Erro ao criar usuário.') 
        }
      }

      return { data, error: null }
    } catch (error: any) {
      console.error('Erro no cadastro:', error)
      return { 
        data: null, 
        error: new Error('Erro de conexão. Tente novamente.') 
      }
    }
  }

  // ========== OBTER USUÁRIO ATUAL ==========
  static async getCurrentUser(userId: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      // Buscar do localStorage (simplificado para demo)
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('hot-user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          return { user: userData, error: null }
        }
      }
      return { user: null, error: new Error('Usuário não encontrado') }
    } catch (error: any) {
      console.error('Erro ao buscar usuário:', error)
      return { user: null, error: new Error('Erro ao carregar dados do usuário') }
    }
  }

  // ========== ATUALIZAR PERFIL ==========
  static async updateProfile(userId: string, updates: { nome?: string; nivel?: 'admin' | 'usuario' }): Promise<{ error: Error | null }> {
    try {
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: new Error(data.error || 'Erro ao atualizar perfil.') }
      }

      return { error: null }
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error)
      return { error: new Error('Erro de conexão. Tente novamente.') }
    }
  }

  // ========== LISTAR USUÁRIOS (APENAS ADMIN) ==========
  static async getUsers(): Promise<{ users: User[]; error: Error | null }> {
    try {
      const response = await fetch('/api/usuarios')
      const data = await response.json()

      if (!response.ok) {
        return { users: [], error: new Error(data.error || 'Erro ao carregar usuários') }
      }

      return { users: data.users, error: null }
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error)
      return { users: [], error: new Error('Erro de conexão') }
    }
  }

  // ========== ATUALIZAR USUÁRIO ==========
  static async updateUser(userId: string, updates: { nome?: string; nivel?: 'admin' | 'usuario' }): Promise<{ error: Error | null }> {
    try {
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: new Error(data.error || 'Erro ao atualizar usuário.') }
      }

      return { error: null }
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error)
      return { error: new Error('Erro de conexão. Tente novamente.') }
    }
  }

  // ========== EXCLUIR USUÁRIO ==========
  static async deleteUser(userId: string): Promise<{ error: Error | null }> {
    try {
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: new Error(data.error || 'Erro ao excluir usuário.') }
      }

      return { error: null }
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error)
      return { error: new Error('Erro de conexão. Tente novamente.') }
    }
  }

  // ========== VERIFICAR SE É ADMIN ==========
  static async isAdmin(): Promise<boolean> {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('hot-user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        return userData.nivel === 'admin'
      }
    }
    return false
  }
}