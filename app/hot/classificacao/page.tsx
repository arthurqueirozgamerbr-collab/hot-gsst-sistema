// 📄 app/hot/classificacao/page.tsx - CÓDIGO COMPLETO CORRIGIDO
"use client"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "../../../contexts/AuthContext"
import { getLatestRemessa, getMedidasByRemessa, validateMeasure, markPending, processMeasure } from "../../../lib/hotService"
import { useToast } from "../../../hooks/use-toast"
import { useDebounce } from "../../../hooks/use-debounce"
import Link from "next/link"

interface Medida {
  id: string
  texto: string
  status: string
  categoria_sugerida?: "H" | "O" | "T"
  suggestion?: "H" | "O" | "T" | null
  suggestionReason?: string
  suggestionScore?: number
  autoClassified?: boolean
  criado_em: string
}

// Componente principal
function ClassificacaoContent() {
  const params = useSearchParams()
  const remParam = params.get("remessa")
  const [remessaId, setRemessaId] = useState<string | null>(remParam)
  const [medidas, setMedidas] = useState<Medida[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [copiedCategory, setCopiedCategory] = useState<string | null>(null)
  const { user } = useAuth()

  // Estados para busca e paginação
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [filteredMedidas, setFilteredMedidas] = useState<Medida[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Calcular medidas para exibir
  const medidasParaExibir = searchTerm ? filteredMedidas : medidas
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const medidasPagina = medidasParaExibir.slice(startIndex, endIndex)
  const totalPages = Math.ceil(medidasParaExibir.length / itemsPerPage)

  // Estatísticas
  const stats = {
    H: medidasParaExibir.filter(m => m.status === "validada" && m.categoria_sugerida === "H").length,
    O: medidasParaExibir.filter(m => m.status === "validada" && m.categoria_sugerida === "O").length,
    T: medidasParaExibir.filter(m => m.status === "validada" && m.categoria_sugerida === "T").length,
    pendentes: medidasParaExibir.filter(m => m.status !== "validada").length,
    auto: medidasParaExibir.filter(m => m.autoClassified && m.status !== 'validada').length,
    total: medidasParaExibir.length
  }

  useEffect(() => {
    loadMeasures()
  }, [remessaId])

  useEffect(() => {
    if (debouncedSearch) {
      const filtered = medidas.filter(medida =>
        medida.texto.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
      setFilteredMedidas(filtered)
    } else {
      setFilteredMedidas(medidas)
    }
    setCurrentPage(1)
  }, [debouncedSearch, medidas])

  const loadMeasures = async () => {
    try {
      setError(null)
      let rid = remessaId
     
      if (!rid) {
        const latest = await getLatestRemessa()
        rid = latest?.id ?? null
        setRemessaId(rid)
      }
     
      if (!rid) {
        setError("Nenhuma remessa encontrada. Vá para 'Entrada' para criar uma nova remessa de medidas.")
        return
      }
     
      setLoading(true)
      const items = await getMedidasByRemessa(rid)
     
      const processed = await Promise.all(items.map(processMeasure))
      setMedidas(processed)
    } catch (e: any) {
      setError(e.message || "Erro ao carregar medidas.")
    } finally {
      setLoading(false)
    }
  }

  const confirmar = async (id: string, cat: "H"|"O"|"T") => {
    try {
      await validateMeasure(id, cat, user?.id || null, "Classificação manual")
      toast({ type: 'success', title: 'Sucesso!', description: 'Medida classificada com sucesso!' })
      await loadMeasures()
    } catch (e: any) {
      toast({ type: 'error', title: 'Erro', description: e.message || 'Erro ao validar medida' })
    }
  }

  const enviarRevisao = async (id: string) => {
    try {
      await markPending(id, user?.id || null)
      toast({ type: 'success', title: 'Sucesso!', description: 'Medida enviada para revisão!' })
      await loadMeasures()
    } catch (e: any) {
      toast({ type: 'error', title: 'Erro', description: e.message || 'Erro ao enviar para revisão' })
    }
  }

  const classificarAutomaticamente = async () => {
    try {
      setLoading(true)
     
      // Encontrar medidas que podem ser classificadas automaticamente
      const medidasParaClassificar = medidas.filter(m =>
        m.autoClassified && m.suggestion && m.status !== 'validada'
      )
     
      console.log(`🚀 Classificando ${medidasParaClassificar.length} medidas automaticamente...`)
     
      // Classificar cada medida
      for (const medida of medidasParaClassificar) {
        try {
          if (medida.suggestion) {
            await validateMeasure(
              medida.id,
              medida.suggestion,
              user?.id || null,
              "Classificação automática baseada em biblioteca"
            )
            console.log(`✅ Classificada: ${medida.texto.substring(0, 30)}...`)
           
            // Pequena pausa para evitar timeout
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        } catch (error) {
          console.error(`❌ Erro ao classificar ${medida.texto}:`, error)
        }
      }
     
      // Recarregar as medidas
      await loadMeasures()
     
      toast({
        type: 'success',
        title: 'Sucesso!',
        description: `✅ ${medidasParaClassificar.length} medidas classificadas automaticamente!`
      })
     
    } catch (error: any) {
      console.error('Erro na classificação automática:', error)
      toast({ type: 'error', title: 'Erro', description: 'Erro ao classificar automaticamente' })
    } finally {
      setLoading(false)
    }
  }

  const copiarCategoria = async (categoria: "H" | "O" | "T") => {
    const medidasCategoria = medidasParaExibir.filter(m =>
      m.status === "validada" && m.categoria_sugerida === categoria
    )
   
    if (medidasCategoria.length === 0) {
      toast({ type: 'error', title: 'Erro', description: `Nenhuma medida classificada como ${categoria} para copiar.` })
      return
    }
   
    const texto = medidasCategoria.map(m => m.texto).join(", ")
    const cabecalho = categoria === "H" ? "HUMANO" : categoria === "O" ? "ORGANIZACIONAL" : "TÉCNICO"
    const textoCompleto = `${cabecalho}: ${texto}`
   
    try {
      await navigator.clipboard.writeText(textoCompleto)
      setCopiedCategory(categoria)
      toast({ type: 'success', title: 'Sucesso!', description: `Categoria ${cabecalho} copiada com sucesso!` })
      setTimeout(() => setCopiedCategory(null), 2000)
    } catch {
      prompt(`Copie as medidas ${cabecalho}:`, textoCompleto)
    }
  }

  const copiarTodas = async () => {
    const categorias = ["H", "O", "T"] as const
    let textoCompleto = ""
   
    categorias.forEach(cat => {
      const medidasCat = medidasParaExibir.filter(m => m.status === "validada" && m.categoria_sugerida === cat)
      if (medidasCat.length > 0) {
        const cabecalho = cat === "H" ? "HUMANO" : cat === "O" ? "ORGANIZACIONAL" : "TÉCNICO"
        const texto = medidasCat.map(m => m.texto).join(", ")
        textoCompleto += `${cabecalho}: ${texto}\n\n`
      }
    })
   
    const pendentes = medidasParaExibir.filter(m => m.status !== "validada")
    if (pendentes.length > 0) {
      textoCompleto += `PENDENTES: ${pendentes.map(m => m.texto).join(", ")}`
    }
   
    if (!textoCompleto.trim()) {
      toast({ type: 'error', title: 'Erro', description: "Nenhuma medida para copiar." })
      return
    }
   
    try {
      await navigator.clipboard.writeText(textoCompleto.trim())
      setCopiedCategory("TODAS")
      toast({ type: 'success', title: 'Sucesso!', description: "Todas as classificações copiadas com sucesso!" })
      setTimeout(() => setCopiedCategory(null), 2000)
    } catch {
      prompt("Copie o resultado completo:", textoCompleto.trim())
    }
  }

  const copiarPendentes = async () => {
    const pendentes = medidasParaExibir.filter(m => m.status !== "validada")
   
    if (pendentes.length === 0) {
      toast({ type: 'error', title: 'Erro', description: "Nenhuma medida pendente para copiar." })
      return
    }
   
    const texto = pendentes.map(m => m.texto).join(", ")
    const textoCompleto = `PENDENTES: ${texto}`
   
    try {
      await navigator.clipboard.writeText(textoCompleto)
      setCopiedCategory("PENDENTE")
      toast({ type: 'success', title: 'Sucesso!', description: "Medidas pendentes copiadas com sucesso!" })
      setTimeout(() => setCopiedCategory(null), 2000)
    } catch {
      prompt("Copie as medidas pendentes:", textoCompleto)
    }
  }

  if (loading && medidas.length === 0) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando medidas...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <div className="text-red-600 text-lg mb-2">❌ Erro</div>
      <p className="text-red-700">{error}</p>
      <button
        onClick={() => window.location.href = '/hot/entrada'}
        className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        📥 Criar Nova Remessa
      </button>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🧩 Classificação HOT</h1>
            <p className="text-gray-600">
              Remessa: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{remessaId ? remessaId.substring(0, 8) + "..." : "—"}</span>
            </p>
          </div>
          <button
            onClick={loadMeasures}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Busca em Tempo Real */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Buscar Medidas</h3>
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Digite para buscar medidas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="text-sm text-gray-500">
            {medidasParaExibir.length} de {medidas.length} medidas
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        {[
          { label: "👤 Humano", value: stats.H, color: "green", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
          { label: "🏢 Organizacional", value: stats.O, color: "yellow", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
          { label: "💻 Técnico", value: stats.T, color: "blue", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
          { label: "⏳ Pendentes", value: stats.pendentes, color: "red", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
          { label: "🤖 Automáticas", value: stats.auto, color: "purple", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
          { label: "📊 Total", value: stats.total, color: "gray", bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" }
        ].map((stat, index) => (
          <div key={index} className={`${stat.bg} ${stat.border} border rounded-xl p-4 text-center`}>
            <div className={`text-2xl font-bold ${stat.text}`}>{stat.value}</div>
            <div className={`text-sm ${stat.text} font-medium`}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Botões de Cópia */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Copiar Resultados</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={copiarTodas}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
          >
            {copiedCategory === "TODAS" ? "✅" : "📋"} Copiar Tudo
          </button>
          <button
            onClick={() => copiarCategoria("H")}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            {copiedCategory === "H" ? "✅" : "👤"} Humano
            <span className="bg-green-700 px-2 py-1 rounded text-xs font-medium">{stats.H}</span>
          </button>
          <button
            onClick={() => copiarCategoria("O")}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2"
          >
            {copiedCategory === "O" ? "✅" : "🏢"} Organizacional
            <span className="bg-yellow-700 px-2 py-1 rounded text-xs font-medium">{stats.O}</span>
          </button>
          <button
            onClick={() => copiarCategoria("T")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            {copiedCategory === "T" ? "✅" : "💻"} Técnico
            <span className="bg-blue-700 px-2 py-1 rounded text-xs font-medium">{stats.T}</span>
          </button>
          <button
            onClick={copiarPendentes}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
          >
            {copiedCategory === "PENDENTE" ? "✅" : "⏳"} Pendentes
            <span className="bg-red-700 px-2 py-1 rounded text-xs font-medium">{stats.pendentes}</span>
          </button>
        </div>
      </div>

      {/* Classificação Automática */}
      {medidas.filter(m => m.autoClassified && m.status !== 'validada').length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                🤖 Classificação Automática Disponível
              </h3>
              <p className="text-green-700">
                {medidas.filter(m => m.autoClassified && m.status !== 'validada').length} medidas podem ser classificadas automaticamente baseadas na biblioteca.
              </p>
            </div>
            <button
              onClick={classificarAutomaticamente}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Classificando...
                </>
              ) : (
                <>
                  🚀 Classificar Automaticamente
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo */}
      {medidasParaExibir.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma Medida Encontrada</h3>
          <p className="text-gray-600 mb-6">Esta remessa não contém medidas ou todas foram processadas.</p>
          <button
            onClick={() => window.location.href = '/hot/entrada'}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            📥 Criar Nova Remessa
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Medidas Classificadas */}
          {(stats.H > 0 || stats.O > 0 || stats.T > 0) && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">✅ Medidas Classificadas</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {["H","O","T"].map(cat => {
                  const validadas = medidasPagina.filter(m => m.status === "validada" && m.categoria_sugerida === cat)
                  if (validadas.length === 0) return null
                 
                  const categoryConfigs = {
                    H: { title: "👤 Humano", color: "green", bg: "bg-green-50", border: "border-green-200" },
                    O: { title: "🏢 Organizacional", color: "yellow", bg: "bg-yellow-50", border: "border-yellow-200" },
                    T: { title: "💻 Técnico", color: "blue", bg: "bg-blue-50", border: "border-blue-200" }
                  } as const

                  const categoryConfig = categoryConfigs[cat as keyof typeof categoryConfigs]
                 
                  if (!categoryConfig) return null

                  return (
                    <div key={cat} className={`${categoryConfig.bg} ${categoryConfig.border} border rounded-xl p-5`}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">{categoryConfig.title}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copiarCategoria(cat as "H" | "O" | "T")}
                            className="text-sm bg-white px-3 py-1 rounded-lg border hover:bg-gray-50"
                            title="Copiar categoria"
                          >
                            📋
                          </button>
                          <span className="bg-white px-2 py-1 rounded text-xs font-medium">
                            {validadas.length}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {validadas.map(m => (
                          <div
                            key={m.id}
                            className={`bg-white p-3 rounded-lg border ${
                              m.autoClassified ? 'border-purple-300' : 'border-green-300'
                            }`}
                          >
                            <div className="font-medium text-sm text-gray-900">{m.texto}</div>
                            <div className="flex justify-between items-center mt-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                m.autoClassified
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {m.autoClassified ? '🤖 Automática' : '👤 Manual'}
                              </span>
                              {m.suggestionScore && (
                                <span className="text-xs text-gray-500">
                                  {(m.suggestionScore * 100).toFixed(0)}%
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Medidas Pendentes */}
          {stats.pendentes > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">🎯 Medidas para Classificar ({stats.pendentes})</h2>
                <button
                  onClick={copiarPendentes}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2 text-sm"
                >
                  📋 Copiar Pendentes
                </button>
              </div>
              <div className="space-y-6">
                {medidasPagina.filter(m => m.status !== "validada").map((medida) => (
                  <div key={medida.id} className={`
                    bg-white rounded-xl shadow-lg border p-6
                    ${medida.autoClassified ? 'border-green-300 bg-green-50' : 'border-yellow-200 bg-yellow-50'}
                  `}>
                   
                    {/* Cabeçalho com indicador de auto-classificação */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-lg mb-2">
                          {medida.texto}
                          {medida.autoClassified && (
                            <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                              🤖 Pode classificar automaticamente
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          📅 {new Date(medida.criado_em).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    {/* Sugestão */}
                    {medida.suggestion && (
                      <div className={`p-4 rounded-lg mb-4 ${
                        medida.autoClassified
                          ? 'bg-green-100 border border-green-300'
                          : 'bg-blue-50 border border-blue-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`font-medium text-sm ${
                              medida.autoClassified ? 'text-green-800' : 'text-blue-800'
                            }`}>
                              {medida.autoClassified ? '✅ ' : '🤖 '}
                              {medida.autoClassified ? 'CLASSIFICAR COMO: ' : 'Sugestão: '}
                              <span className="font-bold">
                                {medida.suggestion === 'H' && '👤 HUMANO'}
                                {medida.suggestion === 'O' && '🏢 ORGANIZACIONAL'}
                                {medida.suggestion === 'T' && '💻 TÉCNICO'}
                              </span>
                            </div>
                            <div className={`text-sm mt-1 ${
                              medida.autoClassified ? 'text-green-700' : 'text-blue-700'
                            }`}>
                              {medida.suggestionReason}
                            </div>
                          </div>
                          {medida.suggestionScore && (
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              medida.autoClassified
                                ? 'bg-green-200 text-green-800'
                                : 'bg-blue-200 text-blue-800'
                            }`}>
                              {(medida.suggestionScore * 100).toFixed(0)}% confiança
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => confirmar(medida.id, "H")}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${
                          medida.suggestion === 'H' && medida.autoClassified
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        👤 Humano
                      </button>
                      <button
                        onClick={() => confirmar(medida.id, "O")}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${
                          medida.suggestion === 'O' && medida.autoClassified
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                            : 'bg-yellow-600 text-white hover:bg-yellow-700'
                        }`}
                      >
                        🏢 Organizacional
                      </button>
                      <button
                        onClick={() => confirmar(medida.id, "T")}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${
                          medida.suggestion === 'T' && medida.autoClassified
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        💻 Técnico
                      </button>
                      <button
                        onClick={() => enviarRevisao(medida.id)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 text-sm font-medium"
                      >
                        📝 Revisão
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paginação */}
          {medidasParaExibir.length > 0 && (
            <div className="flex justify-between items-center mt-8 bg-white rounded-xl p-4 border">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1}-{Math.min(endIndex, medidasParaExibir.length)} de {medidasParaExibir.length} medidas
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ← Anterior
                </button>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 border rounded-lg ${
                        currentPage === pageNum 
                          ? 'bg-green-600 text-white border-green-600' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Próximo →
                </button>
              </div>
              
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="5">5 por página</option>
                <option value="10">10 por página</option>
                <option value="20">20 por página</option>
                <option value="50">50 por página</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Componente de Loading
function ClassificacaoLoading() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando classificação...</p>
      </div>
    </div>
  )
}

// Export principal
export default function Classificacao() {
  return (
    <Suspense fallback={<ClassificacaoLoading />}>
      <ClassificacaoContent />
    </Suspense>
  )
}