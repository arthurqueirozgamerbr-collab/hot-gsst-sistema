// PATH: /app/perfil/page.tsx
"use client"
import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import ProtectedRoute from "../../components/ProtectedRoute"
import { AuthService } from "../../lib/authService"

export default function PerfilPage() {
  const { user, signOut } = useAuth()
  const [editing, setEditing] = useState(false)
  const [nome, setNome] = useState(user?.nome || "")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success"|"error"; text: string } | null>(null)

  const handleSave = async () => {
    if (!user || !nome.trim()) return

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await AuthService.updateProfile(user.id, { nome: nome.trim() })
     
      if (error) {
        setMessage({ type: "error", text: error.message || "Erro ao atualizar perfil." })
      } else {
        setMessage({ type: "success", text: "Perfil atualizado com sucesso!" })
        setEditing(false)
        // Recarregar a página para atualizar os dados
        window.location.reload()
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Erro ao atualizar perfil." })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setNome(user?.nome || "")
    setEditing(false)
    setMessage(null)
  }

  if (!user) return null

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">👤 Meu Perfil</h1>
          <p className="text-gray-600">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações do Perfil */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações Pessoais</h2>

              {/* Mensagens */}
              {message && (
                <div className={`p-4 rounded-lg mb-6 ${
                  message.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}>
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{message.type === "success" ? "✅" : "❌"}</span>
                    {message.text}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome completo
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Seu nome completo"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-medium text-gray-900">{user.nome}</div>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="font-medium text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      O e-mail não pode ser alterado
                    </div>
                  </div>
                </div>

                {/* Nível */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de usuário
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.nivel === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.nivel === 'admin' ? '👑 Administrador' : '👤 Usuário'}
                    </span>
                    <div className="text-sm text-gray-500 mt-2">
                      {user.nivel === 'admin'
                        ? 'Você tem acesso completo ao sistema'
                        : 'Você pode usar todos os módulos do HOT'
                      }
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-3 pt-4">
                  {editing ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={loading || !nome.trim()}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                      >
                        {loading ? "Salvando..." : "💾 Salvar"}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                      >
                        ❌ Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      ✏️ Editar Perfil
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar de Ações */}
          <div className="space-y-6">
            {/* Estatísticas Pessoais */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Suas Estatísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-800">Data de Cadastro</span>
                  <span className="text-sm text-green-600">
                    {new Date(user.criado_em).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-800">Módulo Favorito</span>
                  <span className="text-sm text-blue-600">🔥 HOT</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-purple-800">Status</span>
                  <span className="text-sm text-purple-600">✅ Ativo</span>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Ações Rápidas</h3>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/hot'}
                  className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-left flex items-center gap-3"
                >
                  <span>🔥</span>
                  Ir para Módulo HOT
                </button>
               
                {user.nivel === 'admin' && (
                  <button
                    onClick={() => window.location.href = '/gestao'}
                    className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-left flex items-center gap-3"
                  >
                    <span>🛠️</span>
                    Gerenciar Sistema
                  </button>
                )}

                <button
                  onClick={() => signOut()}
                  className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 text-left flex items-center gap-3"
                >
                  <span>🚪</span>
                  Sair do Sistema
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}