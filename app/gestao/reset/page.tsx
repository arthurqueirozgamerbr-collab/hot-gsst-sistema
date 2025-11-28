// PATH: /app/gestao/reset/page.tsx
"use client"
import { useState } from "react"
import { useAuth } from "../../../contexts/AuthContext"
import ProtectedRoute from "../../../components/ProtectedRoute"
import Link from "next/link"

export default function ResetPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { user } = useAuth()

  const resetarDados = async (tipo: 'tudo' | 'classificacoes' | 'medidas') => {
    if (!confirm(`⚠️ ATENÇÃO!\n\nVocê está prestes a resetar ${tipo === 'tudo' ? 'TODOS os dados' : tipo === 'classificacoes' ? 'as classificações' : 'as medidas'}.\n\nEsta ação NÃO pode ser desfeita!\n\nConfirma?`)) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo,
          userId: user?.id
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao resetar dados')
      }

      setMessage({
        type: 'success',
        text: `✅ ${data.message || 'Dados resetados com sucesso!'}`
      })

    } catch (error: any) {
      console.error('Erro ao resetar:', error)
      setMessage({
        type: 'error',
        text: `❌ ${error.message || 'Erro ao resetar dados'}`
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute requiredLevel="admin">
      <div className="max-w-4xl mx-auto">
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🔄 Resetar Dados</h1>
              <p className="text-gray-600">
                Gerencie e reset os dados do sistema
              </p>
            </div>
          </div>
        </div>

        {/* Aviso Importante */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Atenção - Operação Destrutiva</h3>
              <p className="text-red-700">
                Estas operações irão <strong>excluir permanentemente</strong> dados do sistema.
                Certifique-se de ter feito backup necessário antes de prosseguir.
              </p>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <span className="text-lg mr-2">{message.type === 'success' ? '✅' : '❌'}</span>
              {message.text}
            </div>
          </div>
        )}

        {/* Opções de Reset */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Reset Medidas */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                📝
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Medidas</h3>
              <p className="text-gray-600 text-sm">
                Remove todas as medidas e classificações, mantém a biblioteca
              </p>
            </div>
            <button
              onClick={() => resetarDados('medidas')}
              disabled={loading}
              className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 font-medium"
            >
              {loading ? '🔄 Processando...' : '🗑️ Resetar Medidas'}
            </button>
          </div>

          {/* Reset Classificações */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                🧩
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Classificações</h3>
              <p className="text-gray-600 text-sm">
                Remove classificações e biblioteca, mantém medidas
              </p>
            </div>
            <button
              onClick={() => resetarDados('classificacoes')}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? '🔄 Processando...' : '🗑️ Resetar Classificações'}
            </button>
          </div>

          {/* Reset Total */}
          <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                💣
              </div>
              <h3 className="text-xl font-semibold text-red-900 mb-2">Reset Total</h3>
              <p className="text-red-600 text-sm">
                Remove TODOS os dados do sistema (exceto usuários)
              </p>
            </div>
            <button
              onClick={() => resetarDados('tudo')}
              disabled={loading}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              {loading ? '🔄 Processando...' : '💣 Resetar Tudo'}
            </button>
          </div>
        </div>

        {/* Estatísticas Atuais */}
        <div className="bg-gray-50 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Estatísticas Atuais</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-gray-900" id="stats-medidas">-</div>
              <div className="text-sm text-gray-600">Medidas</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-gray-900" id="stats-classificacoes">-</div>
              <div className="text-sm text-gray-600">Classificações</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-gray-900" id="stats-biblioteca">-</div>
              <div className="text-sm text-gray-600">Biblioteca</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-gray-900" id="stats-usuarios">-</div>
              <div className="text-sm text-gray-600">Usuários</div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}