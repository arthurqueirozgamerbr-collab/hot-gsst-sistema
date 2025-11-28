// PATH: /app/hot/historico/page.tsx
"use client"
import { useEffect, useState } from "react"

interface HistoricoItem {
  id: string
  acao: string
  detalhes: any
  criado_em: string
}

export default function Historico() {
  const [items, setItems] = useState<HistoricoItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchHistorico() }, [])

  async function fetchHistorico() {
    setLoading(true)
    try {
      const response = await fetch('/api/historico')
      if (response.ok) {
        const data = await response.json()
        setItems(data.historico || [])
      } else {
        setItems([])
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando histórico...</p>
      </div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🕓 Histórico do Sistema</h1>
        <p className="text-gray-600">Registro completo de todas as ações realizadas no módulo HOT</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum Registro no Histórico</h3>
          <p className="text-gray-600">As ações realizadas no sistema aparecerão aqui.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Cabeçalho */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Registros de Atividade</h3>
              <div className="text-sm text-gray-600">
                {items.length} registro(s)
              </div>
            </div>
          </div>

          {/* Lista */}
          <div className="divide-y divide-gray-200">
            {items.map(item => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-lg mb-2">{item.acao}</div>
                    <div className="text-sm text-gray-500">
                      📅 {new Date(item.criado_em).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
               
                {item.detalhes && Object.keys(item.detalhes).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Detalhes:</div>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(item.detalhes, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Rodapé */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 text-center">
              Mostrando os {items.length} registros mais recentes
            </div>
          </div>
        </div>
      )}
    </div>
  )
}