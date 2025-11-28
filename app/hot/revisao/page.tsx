// PATH: /app/hot/revisao/page.tsx
"use client"
import { useEffect, useState } from "react"
import { useAuth } from "../../../contexts/AuthContext"
import { validateMeasure, markNotClassified, getMedidasPendentes } from "../../../lib/hotService"

interface MedidaRevisao {
  id: string
  texto: string
  status: string
  criado_em: string
  suggestion?: "H" | "O" | "T" | null
  suggestionReason?: string
  suggestionScore?: number
}

export default function RevisaoPage() {
  const [medidas, setMedidas] = useState<MedidaRevisao[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    loadMedidasPendentes()
  }, [])

  const loadMedidasPendentes = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const medidasPendentes = await getMedidasPendentes()
      setMedidas(medidasPendentes)
    } catch (error: any) {
      console.error('Erro ao carregar medidas pendentes:', error)
      setMessage({ type: 'error', text: error.message || 'Erro ao carregar medidas para revisão' })
    } finally {
      setLoading(false)
    }
  }

  const classificarMedida = async (medidaId: string, categoria: "H" | "O" | "T") => {
    try {
      await validateMeasure(medidaId, categoria, user?.id || null, "Classificação manual na revisão")
      setMessage({ type: 'success', text: 'Medida classificada com sucesso!' })
      
      // Remover a medida da lista localmente (otimista)
      setMedidas(prev => prev.filter(m => m.id !== medidaId))
      
      // Recarregar para garantir sincronização
      setTimeout(() => loadMedidasPendentes(), 500)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao classificar medida' })
    }
  }

  const marcarNaoClassificada = async (medidaId: string) => {
    try {
      await markNotClassified(medidaId, user?.id || null)
      setMessage({ type: 'success', text: 'Medida marcada como não classificada!' })
      
      // Remover a medida da lista localmente (otimista)
      setMedidas(prev => prev.filter(m => m.id !== medidaId))
      
      // Recarregar para garantir sincronização
      setTimeout(() => loadMedidasPendentes(), 500)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao marcar medida' })
    }
  }

  const copiarTexto = (texto: string) => {
    navigator.clipboard.writeText(texto)
    setMessage({ type: 'success', text: 'Texto copiado para a área de transferência!' })
  }

  const copiarTodasPendentes = async () => {
    const texto = medidas.map(m => m.texto).join('\n')
    if (!texto) {
      setMessage({ type: 'error', text: 'Nenhuma medida para copiar' })
      return
    }
    
    try {
      await navigator.clipboard.writeText(texto)
      setMessage({ type: 'success', text: `${medidas.length} medidas copiadas!` })
    } catch {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea')
      textArea.value = texto
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setMessage({ type: 'success', text: `${medidas.length} medidas copiadas!` })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando medidas para revisão...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🧾 Revisão Manual</h1>
        <p className="text-gray-600">
          Revise e classifique medidas que precisam de análise manual
        </p>
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

      {/* Estatísticas e Ações */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">{medidas.length}</div>
          <div className="text-sm text-gray-600">Total Pendentes</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {medidas.filter(m => m.suggestion).length}
          </div>
          <div className="text-sm text-gray-600">Com Sugestão IA</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {medidas.filter(m => !m.suggestion).length}
          </div>
          <div className="text-sm text-gray-600">Sem Sugestão</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
          <button
            onClick={copiarTodasPendentes}
            disabled={medidas.length === 0}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            📋 Copiar Todas
          </button>
        </div>
      </div>

      {/* Lista de Medidas */}
      {medidas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma Medida para Revisar!</h3>
          <p className="text-gray-600 mb-6">
            Todas as medidas foram classificadas. Volte ao módulo de classificação para processar mais medidas.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.href = '/hot/classificacao'}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              🧩 Ir para Classificação
            </button>
            <button
              onClick={loadMedidasPendentes}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              🔄 Recarregar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {medidas.map((medida) => (
            <div key={medida.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              {/* Cabeçalho da Medida */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-lg mb-2">{medida.texto}</div>
                  <div className="text-sm text-gray-500">
                    📅 {new Date(medida.criado_em).toLocaleDateString('pt-BR')} • 
                    Status: <span className="font-medium">{medida.status}</span>
                  </div>
                </div>
                <button
                  onClick={() => copiarTexto(medida.texto)}
                  className="ml-4 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center gap-1"
                  title="Copiar texto"
                >
                  📋 Copiar
                </button>
              </div>

              {/* Sugestão da IA */}
              {medida.suggestion && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-blue-800 text-sm">
                        🤖 Sugestão da IA: 
                        <span className="ml-2 font-bold">
                          {medida.suggestion === 'H' && '👤 HUMANO'}
                          {medida.suggestion === 'O' && '🏢 ORGANIZACIONAL'}
                          {medida.suggestion === 'T' && '💻 TÉCNICO'}
                        </span>
                      </div>
                      {medida.suggestionReason && (
                        <div className="text-blue-700 text-sm mt-1">
                          {medida.suggestionReason}
                        </div>
                      )}
                    </div>
                    {medida.suggestionScore && (
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {(medida.suggestionScore * 100).toFixed(0)}% confiança
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-wrap gap-3">
                {/* Botões de Classificação */}
                <button
                  onClick={() => classificarMedida(medida.id, "H")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
                >
                  👤 Humano
                </button>
                <button
                  onClick={() => classificarMedida(medida.id, "O")}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2 font-medium"
                >
                  🏢 Organizacional
                </button>
                <button
                  onClick={() => classificarMedida(medida.id, "T")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
                >
                  💻 Técnico
                </button>

                {/* Botão de Não Classificada */}
                <button
                  onClick={() => marcarNaoClassificada(medida.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium"
                >
                  ❌ Não Classificada
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legenda das Categorias */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Guia de Classificação</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">👤 HUMANO</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Treinamentos e capacitação</li>
              <li>• Desenvolvimento de habilidades</li>
              <li>• Conscientização e educação</li>
              <li>• Comportamento e motivação</li>
            </ul>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">🏢 ORGANIZACIONAL</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Políticas e procedimentos</li>
              <li>• Estrutura e governança</li>
              <li>• Processos administrativos</li>
              <li>• Controles e auditoria</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">💻 TÉCNICO</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Tecnologia e sistemas</li>
              <li>• Infraestrutura e hardware</li>
              <li>• Segurança digital</li>
              <li>• Ferramentas e softwares</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}