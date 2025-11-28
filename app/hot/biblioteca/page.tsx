// 📄 app/hot/biblioteca/page.tsx - VERSÃO COMPLETA E CORRIGIDA
"use client"
import { useEffect, useState } from "react"
import { useAuth } from "../../../contexts/AuthContext"
import { getLibraryItems, updateLibraryMeasure, deleteLibraryMeasure } from "../../../lib/hotService"
import { useToast } from "../../../hooks/use-toast"
import { useDebounce } from "../../../hooks/use-debounce"
import { Card, CardContent } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { LoadingSpinner } from "../../../components/loading-spinner"

interface LibraryItem {
  id: string
  texto: string
  categoria: "H" | "O" | "T"
  vezes_utilizada: number
  data: string
}

export default function Biblioteca() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [term, setTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState<"H" | "O" | "T">("H")
  const [justificativa, setJustificativa] = useState("")
  const { toast } = useToast()
  const { user } = useAuth()

  // Estados para busca avançada
  const [filters, setFilters] = useState({
    categoria: '' as string,
    ordenacao: 'vezes_utilizada' as 'vezes_utilizada' | 'texto' | 'data'
  })
  
  const debouncedTerm = useDebounce(term, 500)
  const debouncedFilters = useDebounce(filters, 300)

  useEffect(() => {
    fetchLibrary()
  }, [debouncedTerm, debouncedFilters])

 // 📄 app/hot/biblioteca/page.tsx - ATUALIZE a função fetchLibrary
 const fetchLibrary = async () => {
  setLoading(true)
  try {
    let url = '/api/hot/biblioteca'
    const params = new URLSearchParams()
    
    if (debouncedTerm) params.append('search', debouncedTerm)
    if (filters.categoria) params.append('categoria', filters.categoria)
    if (filters.ordenacao) params.append('ordenacao', filters.ordenacao)
    
    if (params.toString()) url += `?${params.toString()}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar biblioteca')
    }
    
    setItems(data.items || [])
  } catch (e: any) {
    toast({ type: 'error', title: 'Erro', description: 'Erro ao carregar biblioteca: ' + e.message })
  } finally {
    setLoading(false)
  }
}

  const showMessage = (type: 'success' | 'error', text: string) => {
    toast({ type, title: type === 'success' ? 'Sucesso!' : 'Erro', description: text })
  }

  // Edição
  const iniciarEdicao = (item: LibraryItem) => {
    setEditingId(item.id)
    setNewCategory(item.categoria)
    setJustificativa("")
  }

  const cancelarEdicao = () => {
    setEditingId(null)
    setNewCategory("H")
    setJustificativa("")
  }

  const salvarEdicao = async (itemId: string) => {
    if (!justificativa.trim()) {
      showMessage('error', 'Informe uma justificativa para a reclassificação')
      return
    }

    try {
      setLoading(true)
      await updateLibraryMeasure(itemId, newCategory, user?.id || null, justificativa)
     
      setItems(prev => prev.map(item =>
        item.id === itemId
          ? { ...item, categoria: newCategory, data: new Date().toISOString() }
          : item
      ))
     
      showMessage('success', 'Medida reclassificada com sucesso!')
      cancelarEdicao()
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao reclassificar medida')
    } finally {
      setLoading(false)
    }
  }

  const excluirMedida = async (itemId: string, texto: string) => {
    if (!confirm(`Tem certeza que deseja excluir permanentemente a medida:\n\n"${texto}"\n\nEsta ação não pode ser desfeita.`)) return

    try {
      setLoading(true)
     
      await deleteLibraryMeasure(itemId, user?.id || null)
     
      setItems(prev => prev.filter(item => item.id !== itemId))
     
      showMessage('success', 'Medida excluída da biblioteca!')
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao excluir medida')
    } finally {
      setLoading(false)
    }
  }

  // Cópia
  const copiarMedida = (texto: string) => {
    navigator.clipboard.writeText(texto)
    showMessage('success', 'Texto copiado para a área de transferência!')
  }

  const copiarCategoria = async (categoria: "H" | "O" | "T") => {
    const medidasCat = items.filter(item => item.categoria === categoria)
   
    if (medidasCat.length === 0) {
      showMessage('error', `Nenhuma medida encontrada na categoria ${categoria}`)
      return
    }
   
    const cabecalho = categoria === "H" ? "HUMANO" : categoria === "O" ? "ORGANIZACIONAL" : "TÉCNICO"
    const texto = medidasCat.map(item => item.texto).join(", ")
    const textoCompleto = `${cabecalho}: ${texto}`
   
    try {
      await navigator.clipboard.writeText(textoCompleto)
      showMessage('success', `Categoria ${cabecalho} copiada com sucesso!`)
    } catch {
      prompt(`Copie as medidas da categoria ${cabecalho}:`, textoCompleto)
    }
  }

  // Estatísticas
  const stats = {
    total: items.length,
    H: items.filter(item => item.categoria === "H").length,
    O: items.filter(item => item.categoria === "O").length,
    T: items.filter(item => item.categoria === "T").length,
    reutilizacoes: items.reduce((total, item) => total + item.vezes_utilizada, 0)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Biblioteca de Classificações</h1>
        <p className="text-gray-600">Gerencie e edite todas as medidas classificadas do sistema</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "📊 Total", value: stats.total, color: "green", bg: "bg-green-50", border: "border-green-200" },
          { label: "👤 Humano", value: stats.H, color: "green", bg: "bg-green-50", border: "border-green-200" },
          { label: "🏢 Organizacional", value: stats.O, color: "yellow", bg: "bg-yellow-50", border: "border-yellow-200" },
          { label: "💻 Técnico", value: stats.T, color: "blue", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "🔄 Reutilizações", value: stats.reutilizacoes, color: "purple", bg: "bg-purple-50", border: "border-purple-200" }
        ].map((stat, index) => (
          <Card key={index} className={`${stat.border} border-2`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-700 font-medium">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Botões de Cópia */}
      <Card className="p-6 mb-6">
        <CardContent className="p-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Copiar por Categoria</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => copiarCategoria("H")}
              variant="success"
              className="flex items-center gap-2"
            >
              👤 Copiar Humano
              <span className="bg-green-700 px-2 py-1 rounded text-xs font-medium">{stats.H}</span>
            </Button>
            <Button
              onClick={() => copiarCategoria("O")}
              variant="success"
              className="flex items-center gap-2"
            >
              🏢 Copiar Organizacional
              <span className="bg-yellow-700 px-2 py-1 rounded text-xs font-medium">{stats.O}</span>
            </Button>
            <Button
              onClick={() => copiarCategoria("T")}
              variant="success"
              className="flex items-center gap-2"
            >
              💻 Copiar Técnico
              <span className="bg-blue-700 px-2 py-1 rounded text-xs font-medium">{stats.T}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Busca Avançada */}
      <Card className="p-6 mb-6">
        <CardContent className="p-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Busca Avançada</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Busca por texto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar texto
              </label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Digite para buscar..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Filtro por categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={filters.categoria}
                onChange={(e) => setFilters(prev => ({ ...prev, categoria: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todas categorias</option>
                <option value="H">👤 Humano</option>
                <option value="O">🏢 Organizacional</option>
                <option value="T">💻 Técnico</option>
              </select>
            </div>

            {/* Ordenação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={filters.ordenacao}
                onChange={(e) => setFilters(prev => ({ ...prev, ordenacao: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="vezes_utilizada">Mais utilizadas</option>
                <option value="texto">Ordem alfabética</option>
                <option value="data">Mais recentes</option>
              </select>
            </div>

            {/* Ações */}
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setTerm("")
                  setFilters({ categoria: '', ordenacao: 'vezes_utilizada' })
                }}
                variant="secondary"
                className="w-full"
              >
                🗑️ Limpar Filtros
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {items.length} medida(s) encontrada(s)
            </div>
            <Button
              onClick={fetchLibrary}
              variant="primary"
              loading={loading}
              className="flex items-center gap-2"
            >
              🔄 Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Carregando biblioteca..." />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <CardContent className="p-0">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {term ? "Nenhuma Medida Encontrada" : "Biblioteca Vazia"}
            </h3>
            <p className="text-gray-600 mb-6">
              {term
                ? "Nenhuma medida corresponde à sua pesquisa."
                : "Classifique algumas medidas no módulo de Classificação para preencher a biblioteca."
              }
            </p>
            {!term && (
              <Button
                onClick={() => window.location.href = '/hot/classificacao'}
                variant="primary"
              >
                🧩 Ir para Classificação
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Cabeçalho da Tabela */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Medidas Classificadas</h3>
                <div className="text-sm text-gray-600">
                  {items.length} medida(s) • 🟩 {stats.H} • 🟨 {stats.O} • 🟦 {stats.T}
                </div>
              </div>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-900">Medida</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Categoria</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Estatísticas</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{item.texto}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          📅 {new Date(item.data).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                     
                      <td className="p-4">
                        {editingId === item.id ? (
                          <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value as "H" | "O" | "T")}
                            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="H">👤 HUMANO</option>
                            <option value="O">🏢 ORGANIZACIONAL</option>
                            <option value="T">💻 TÉCNICO</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            item.categoria === 'H'
                              ? 'bg-green-100 text-green-800'
                              : item.categoria === 'O'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.categoria === 'H' && '👤 HUMANO'}
                            {item.categoria === 'O' && '🏢 ORGANIZACIONAL'}
                            {item.categoria === 'T' && '💻 TÉCNICO'}
                          </span>
                        )}
                      </td>
                     
                      <td className="p-4">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-1 mb-1">
                            <span>🔄</span>
                            <span>{item.vezes_utilizada} uso(s)</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Última: {new Date(item.data).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </td>
                     
                      <td className="p-4">
                        {editingId === item.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={justificativa}
                              onChange={(e) => setJustificativa(e.target.value)}
                              placeholder="Justifique a reclassificação..."
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => salvarEdicao(item.id)}
                                variant="success"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                ✅ Salvar
                              </Button>
                              <Button
                                onClick={cancelarEdicao}
                                variant="secondary"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                ❌ Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => iniciarEdicao(item)}
                              variant="secondary"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              ✏️ Editar
                            </Button>
                            <Button
                              onClick={() => copiarMedida(item.texto)}
                              variant="success"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              📋 Copiar
                            </Button>
                            <Button
                              onClick={() => excluirMedida(item.id, item.texto)}
                              variant="danger"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              🗑️ Excluir
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rodapé da Tabela */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Total: {items.length} medida(s) na biblioteca</span>
                <span>
                  👤 {stats.H} • 🏢 {stats.O} • 💻 {stats.T} • 🔄 {stats.reutilizacoes} reutilizações
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}