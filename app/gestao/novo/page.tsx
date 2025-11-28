// PATH: /app/gestao/novo/page.tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "../../../lib/authService"
import { useAuth } from "../../../contexts/AuthContext"
import ProtectedRoute from "../../../components/ProtectedRoute"
import Link from "next/link"

export default function NovoUsuario() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [nivel, setNivel] = useState<"admin"|"usuario">("usuario")
  const [senha, setSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success"|"error"; text: string } | null>(null)
 
  const router = useRouter()
  const { isAdmin } = useAuth()

  const criarUsuario = async () => {
    setMessage(null)

    // Validações
    if (!nome || !email || !senha || !confirmarSenha) {
      setMessage({ type: "error", text: "Preencha todos os campos." })
      return
    }

    if (senha.length < 6) {
      setMessage({ type: "error", text: "A senha deve ter pelo menos 6 caracteres." })
      return
    }

    if (senha !== confirmarSenha) {
      setMessage({ type: "error", text: "As senhas não coincidem." })
      return
    }

    if (!email.includes('@')) {
      setMessage({ type: "error", text: "E-mail inválido." })
      return
    }

    setLoading(true)

    try {
      const result = await AuthService.signUpAdmin(email, senha, nome, nivel)
     
      if (result.error) {
        setMessage({ type: "error", text: result.error.message || "Erro ao criar usuário." })
      } else {
        setMessage({
          type: "success",
          text: "Usuário criado com sucesso! Redirecionando..."
        })
       
        // Limpar formulário
        setNome("")
        setEmail("")
        setSenha("")
        setConfirmarSenha("")
       
        setTimeout(() => router.push("/gestao"), 2000)
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Erro ao criar usuário." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute requiredLevel="admin">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/gestao"
              className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              ←
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">👤 Novo Usuário</h1>
              <p className="text-gray-600">
                Adicione um novo usuário ao sistema HOT
              </p>
            </div>
          </div>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
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
                Nome completo *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Nome completo do usuário"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="email@empresa.com"
              />
            </div>

            {/* Nível */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de usuário *
              </label>
              <select
                value={nivel}
                onChange={(e) => setNivel(e.target.value as "admin"|"usuario")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="usuario">👤 Usuário Comum</option>
                <option value="admin">👑 Administrador</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                {nivel === 'admin'
                  ? 'Administradores têm acesso completo ao sistema'
                  : 'Usuários comuns podem usar os módulos HOT'
                }
              </p>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha *
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha *
              </label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Digite a senha novamente"
              />
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={criarUsuario}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    👤 Criar Usuário
                  </>
                )}
              </button>
             
              <Link
                href="/gestao"
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
              >
                ❌ Cancelar
              </Link>
            </div>
          </div>
        </div>

        {/* Informações */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="text-sm font-semibold text-green-800 mb-2">💡 Sobre a criação de usuários</h4>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• Apenas administradores podem criar novos usuários</li>
            <li>• O usuário receberá um e-mail de confirmação</li>
            <li>• Administradores têm acesso completo ao sistema</li>
            <li>• Usuários comuns podem usar todos os módulos HOT</li>
            <li>• Guarde a senha em local seguro para fornecer ao usuário</li>
          </ul>
        </div>
      </div>
    </ProtectedRoute>
  )
}