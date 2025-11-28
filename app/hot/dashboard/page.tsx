"use client"
import { useEffect, useState } from "react"
import { getHotAnalytics, getTemporalData } from "../../../lib/hotService"
import { SimpleBarChart } from '../../../components/simple-bar-chart'
import { MetricCard } from '../../../components/metric-card'

interface AnalyticsData {
  periodo: string
  totalMedidas: number
  medidasClassificadas: number
  medidasPendentes: number
  taxaClassificacao: number
  distribuicaoCategorias: { H: number; O: number; T: number }
  biblioteca: { total: number; H: number; O: number; T: number; reutilizacoes: number }
  eficiencia: { ia: number; manual: number }
  atividadesRecentes: any[]
  timestamp: string
}

export default function Dashboard() {
  const [periodo, setPeriodo] = useState<'dia' | 'semana' | 'mes' | 'ano' | 'personalizado'>('mes')
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [ano, setAno] = useState(new Date().getFullYear())
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [temporalData, setTemporalData] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [periodo, mes, ano])

  const loadData = async () => {
    setLoading(true)
    try {
      const periodoParaBuscar = periodo === 'personalizado' ? 'mes' : periodo
      const [analyticsData, temporalData] = await Promise.all([
        getHotAnalytics(periodoParaBuscar),
        getTemporalData(periodoParaBuscar)
      ])
      setAnalytics(analyticsData as AnalyticsData)
      setTemporalData(temporalData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando analytics...</p>
      </div>
    </div>
  )

  if (!analytics) return (
    <div className="text-center text-gray-500 p-8">
      Erro ao carregar dados do dashboard.
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Dashboard HOT</h1>
            <p className="text-gray-600">
              Estatísticas e analytics do sistema de classificação
            </p>
          </div>
         
          {/* Seletor de Período */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 bg-white rounded-lg border border-gray-200 p-1">
              {['dia', 'semana', 'mes', 'ano', 'personalizado'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    periodo === p
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {p === 'dia' && '📅 Hoje'}
                  {p === 'semana' && '📅 Semana'}
                  {p === 'mes' && '📅 Mês'}
                  {p === 'ano' && '📅 Ano'}
                  {p === 'personalizado' && '📅 Personalizado'}
                </button>
              ))}
            </div>

            {/* Seletor de Mês/Ano para período personalizado */}
            {periodo === 'personalizado' && (
              <div className="flex gap-3 bg-white rounded-lg border border-gray-200 p-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                  <select
                    value={mes}
                    onChange={(e) => setMes(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {meses.map((nome, index) => (
                      <option key={index + 1} value={index + 1}>
                        {nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                  <select
                    value={ano}
                    onChange={(e) => setAno(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {anos.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={loadData}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    🔄 Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <MetricCard
    title="Total de Medidas"
    value={analytics.totalMedidas.toLocaleString('pt-BR')}
    change="+12%"
    trend="up"
    icon="📥"
    description={`Período: ${periodo}`}
  />
  <MetricCard
    title="Taxa de Classificação"
    value={`${analytics.taxaClassificacao.toFixed(1)}%`}
    change="+5%"
    trend="up"
    icon="🎯"
    description={`${analytics.medidasClassificadas} classificadas`}
  />
  <MetricCard
    title="Eficiência da IA"
    value={`${analytics.eficiencia.ia.toFixed(1)}%`}
    change="+3%"
    trend="up"
    icon="🤖"
    description={`${analytics.eficiencia.manual.toFixed(1)}% manual`}
  />
  <MetricCard
    title="Biblioteca"
    value={analytics.biblioteca.total.toLocaleString('pt-BR')}
    change="+8%"
    trend="up"
    icon="📚"
    description={`${analytics.biblioteca.reutilizacoes} reutilizações`}
  />
</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribuição por Categoria */}
<SimpleBarChart
  title="📈 Distribuição por Categoria"
  data={[
    { 
      label: '👤 Humano', 
      value: analytics.distribuicaoCategorias.H, 
      color: 'bg-green-500' 
    },
    { 
      label: '🏢 Organizacional', 
      value: analytics.distribuicaoCategorias.O, 
      color: 'bg-yellow-500' 
    },
    { 
      label: '💻 Técnico', 
      value: analytics.distribuicaoCategorias.T, 
      color: 'bg-blue-500' 
    }
  ]}
/>
        {/* Eficiência do Sistema */}
<div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover-lift animate-fade-in">          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Eficiência do Sistema</h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {analytics.eficiencia.ia.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Classificações Automáticas</div>
            </div>
           
            <div className="flex gap-4">
              <div className="flex-1 text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-lg font-bold text-green-700">🤖 IA</div>
                <div className="text-2xl font-bold text-green-800">{analytics.eficiencia.ia.toFixed(1)}%</div>
              </div>
              <div className="flex-1 text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-lg font-bold text-blue-700">👤 Manual</div>
                <div className="text-2xl font-bold text-blue-800">{analytics.eficiencia.manual.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Biblioteca e Reutilizações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Biblioteca de Conhecimento</h3>
          <div className="space-y-3">
            {[
              { label: "👤 Humano", value: analytics.biblioteca.H, color: "green" },
              { label: "🏢 Organizacional", value: analytics.biblioteca.O, color: "yellow" },
              { label: "💻 Técnico", value: analytics.biblioteca.T, color: "blue" }
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{item.label}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.color === 'green' ? 'bg-green-100 text-green-800' :
                  item.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {item.value}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <span className="font-medium text-purple-700">🔄 Total de Reutilizações</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {analytics.biblioteca.reutilizacoes}
              </span>
            </div>
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🕓 Atividades Recentes</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {analytics.atividadesRecentes.length > 0 ? (
              analytics.atividadesRecentes.map((atividade, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border-b border-gray-100 last:border-b-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{atividade.acao}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(atividade.criado_em).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                Nenhuma atividade recente
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dados Temporais */}
      {temporalData && temporalData.dados.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Atividade Temporal - {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
          </h3>
          <div className="space-y-4">
            {temporalData.dados.slice(-10).map((item: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.data}</span>
                  <span className="text-gray-500">
                    📥{item.entradas || 0} 🧩{item.classificacoes || 0} 🧾{item.revisoes || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(((item.classificacoes || 0) + (item.revisoes || 0) + (item.entradas || 0)) * 10, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer do Dashboard */}
      <div className="mt-8 text-center text-sm text-gray-500">
        Última atualização: {new Date(analytics.timestamp).toLocaleString('pt-BR')}
        <button
          onClick={loadData}
          className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
        >
          🔄 Atualizar Dados
        </button>
      </div>
    </div>
  )
}