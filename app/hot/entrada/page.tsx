// PATH: /app/hot/entrada/page.tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../contexts/AuthContext"
import { createRemessaAndInsertMedidas } from "../../../lib/hotService"
import { useRecentMeasures } from '../../../hooks/use-recent-measures'
import { useToast } from "../../../hooks/use-toast"

export default function Entrada() {
  const [texto, setTexto] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()
  const { user } = useAuth()
  const { recentMeasures, addRecentMeasure } = useRecentMeasures() // 🔄 ADICIONE
  const { toast } = useToast()


  const enviar = async () => {
if (!texto.trim()) {
  toast({ type: 'error', title: 'Erro', description: 'Cole as medidas primeiro.' })
  return
}

    setLoading(true)
    setMessage(null)
   
    try {
      const { remessaId, count } = await createRemessaAndInsertMedidas(texto, user?.id || null)
    addRecentMeasure(texto)
    
    toast({ 
      type: 'success', 
      title: 'Sucesso!', 
      description: `${count} medidas processadas com sucesso!` 
    })
    
    setTexto("")
   
    setTimeout(() => router.push(`/hot/classificacao?remessa=${remessaId}`), 1500)
  } catch (e: any) {
    toast({ 
      type: 'error', 
      title: 'Erro', 
      description: e.message || 'Erro ao processar medidas.' 
    })
  } finally {
    setLoading(false)
  }
}

  const limpar = () => {
    setTexto("")
    setMessage(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📥 Entrada de Medidas</h1>
        <p className="text-gray-600">Cole as medidas abaixo para iniciar o processo de classificação HOT</p>
      </div>

      {/* Alert Message */}
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

      {/* Text Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Medidas para Classificar
        </label>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="w-full h-72 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
          placeholder={`Exemplo:
Treinamento de segurança
Política de senhas fortes
Atualização do firewall
Backup de dados
Curso de conscientização

Separe as medidas por linha, vírgula ou ponto e vírgula.`}
        />

        {/* 🔄 ADICIONE ESTA SEÇÃO - Histórico de Entradas */}
{recentMeasures.length > 0 && (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      📝 Entradas Recentes
    </h3>
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {recentMeasures.map((measure, index) => (
        <div
          key={index}
          className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          onClick={() => setTexto(measure)}
        >
          <span className="text-sm text-gray-700 truncate flex-1">
            {measure.substring(0, 100)}...
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setTexto(measure)
            }}
            className="ml-2 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
          >
            Usar
          </button>
        </div>
      ))}
    </div>
  </div>
)}
       
        <div className="flex justify-between items-center mt-3">
          <span className="text-sm text-gray-500">
            {texto.split(/[\n,;]/).filter(line => line.trim().length > 0).length} medidas detectadas
          </span>
          <button
            onClick={limpar}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            🗑️ Limpar
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={enviar}
          disabled={loading || !texto.trim()}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processando...
            </>
          ) : (
            <>
              🚀 Enviar para Classificação
            </>
          )}
        </button>
       
        <div className="text-sm text-gray-600">
          <div>💡 Dica: O sistema removerá automaticamente medidas duplicadas</div>
        </div>
      </div>
    </div>
  )
}