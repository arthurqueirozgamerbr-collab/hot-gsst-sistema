// PATH: /app/gestao/page.tsx
"use client"
import { useEffect, useState } from "react"
import { AuthService } from "../../lib/authService"
import { useAuth } from "../../contexts/AuthContext"
import ProtectedRoute from "../../components/ProtectedRoute"
import Link from "next/link"

interface Usuario {
  id: string
  email: string
  nome: string
  nivel: 'admin' | 'usuario'
  criado_em: string
  ultimo_login?: string
}

export default function GestaoIndex() {
  const [users, setUsers] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { user: currentUser, isAdmin } = useAuth()

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  async function fetchUsers() {
    setLoading(true)
    const { users: usersData, error } = await AuthService.getUsers()
    setUsers(usersData || [])
    setLoading(false)
  }

  const deleteUser = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja remover o usuário "${nome}"?`)) return
   
    if (id === currentUser?.id) {
      alert("Você não pode remover sua própria conta!")
      return
    }

    const { error } = await AuthService.deleteUser(id)
    if (!error) {
      fetchUsers()
    } else {
      alert("Erro ao remover usuário: " + error.message)
    }
  }

  const toggleUserLevel = async (user: Usuario) => {
    if (user.id === currentUser?.id) {
      alert("Você não pode alterar seu próprio nível!")
      return
    }

    const novoNivel = user.nivel === 'admin' ? 'usuario' : 'admin'
   
    const { error } = await AuthService.updateUser(user.id, { nivel: novoNivel })
    if (!error) {
      fetchUsers()
    } else {
      alert("Erro ao atualizar usuário: " + error.message)
    }
  }

  const filteredUsers = users.filter(user =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <ProtectedRoute requiredLevel="admin">
      <div className="max-w-7xl mx-auto">
        {/* Header - mantido igual */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🛠️ Gestão do Sistema</h1>
              <p className="text-gray-600">
                Gerencie usuários e permissões do sistema HOT
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/gestao/novo"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <span>👤</span>
                Novo Usuário
              </Link>
              <button
                onClick={fetchUsers}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
              >
                <span>🔄</span>
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas - mantido igual */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total de Usuários", value: users.length, icon: "👥", color: "green" },
            { label: "Administradores", value: users.filter(u => u.nivel === 'admin').length, icon: "👑", color: "purple" },
            { label: "Usuários Comuns", value: users.filter(u => u.nivel === 'usuario').length, icon: "👤", color: "green" },
            { label: "Você", value: currentUser?.nome || "Admin", icon: "😊", color: "orange" }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                  stat.color === 'green' ? 'bg-green-100 text-green-600' :
                  stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {typeof stat.value === 'number' ? stat.value : stat.value}
                  </div>
                  <div className="font-semibold text-gray-900">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resto do código mantido igual */}
        {/* Busca e Filtros */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar usuários por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              {filteredUsers.length} de {users.length} usuários
            </div>
          </div>
        </div>

        {/* Tabela de Usuários */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando usuários...</p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Tente ajustar os termos da busca."
                : "Comece adicionando o primeiro usuário ao sistema."
              }
            </p>
            {!searchTerm && (
              <Link
                href="/gestao/novo"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium inline-flex items-center gap-2"
              >
                <span>👤</span>
                Adicionar Primeiro Usuário
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Cabeçalho da Tabela */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Usuários do Sistema</h3>
                <div className="text-sm text-gray-600">
                  {filteredUsers.length} usuário(s)
                </div>
              </div>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-900">Usuário</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Nível</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Data de Cadastro</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {user.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.nome}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                     
                      <td className="p-4">
                        <button
                          onClick={() => toggleUserLevel(user)}
                          disabled={user.id === currentUser?.id}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            user.nivel === 'admin'
                              ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          } ${user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {user.nivel === 'admin' ? '👑 Administrador' : '👤 Usuário'}
                          {user.id === currentUser?.id && ' (Você)'}
                        </button>
                      </td>
                     
                      <td className="p-4">
                        <div className="text-sm text-gray-600">
                          {new Date(user.criado_em).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(user.criado_em).toLocaleTimeString('pt-BR')}
                        </div>
                      </td>
                     
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/gestao/editar/${user.id}`}
                            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium flex items-center gap-1"
                          >
                            ✏️ Editar
                          </Link>
                          <button
                            onClick={() => deleteUser(user.id, user.nome)}
                            disabled={user.id === currentUser?.id}
                            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${
                              user.id === currentUser?.id
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                          >
                            🗑️ Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rodapé da Tabela */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Total: {filteredUsers.length} usuário(s)</span>
                <span>
                  👑 {users.filter(u => u.nivel === 'admin').length} admin(s) •
                  👤 {users.filter(u => u.nivel === 'usuario').length} usuário(s)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}