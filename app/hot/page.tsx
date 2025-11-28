"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getHotAnalytics } from "../../lib/hotService"

export default function HotIndex() {
  const [stats, setStats] = useState({
    totalMedidas: 0,
    taxaClassificacao: 0,
    eficienciaIA: 0,
    biblioteca: 0,
    loading: true
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const analytics = await getHotAnalytics('mes')
      setStats({
        totalMedidas: analytics.totalMedidas,
        taxaClassificacao: analytics.taxaClassificacao,
        eficienciaIA: analytics.eficiencia.ia,
        biblioteca: analytics.biblioteca.total,
        loading: false
      })
    } catch (error) {
      console.error('Erro ao carregar stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          🔥 Módulo HOT
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Sistema inteligente de classificação de medidas de segurança.
          Use a IA para categorizar automaticamente ou revise manualmente as sugestões.
        </p>
      </div>

      {/* Cards de Estatísticas em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          {
            href: "/hot/dashboard",
            icon: "📊",
            value: stats.loading ? "..." : stats.totalMedidas.toLocaleString('pt-BR'),
            label: "Medidas Processadas",
            color: "green",
            description: "Total no último mês"
          },
          {
            href: "/hot/dashboard",
            icon: "🎯",
            value: stats.loading ? "..." : `${stats.taxaClassificacao.toFixed(1)}%`,
            label: "Taxa de Classificação",
            color: "green",
            description: "Eficiência do sistema"
          },
          {
            href: "/hot/dashboard",
            icon: "🤖",
            value: stats.loading ? "..." : `${stats.eficienciaIA.toFixed(1)}%`,
            label: "IA vs Manual",
            color: "purple",
            description: "Automação do processo"
          },
          {
            href: "/hot/dashboard",
            icon: "📚",
            label: "Biblioteca",
            value: stats.loading ? "..." : stats.biblioteca.toLocaleString('pt-BR'),
            color: "orange",
            description: "Conhecimento acumulado"
          }
        ].map((stat, index) => (
          <Link key={index} href={stat.href} className="group">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform ${
                  stat.color === 'green' ? 'bg-green-100 text-green-600' :
                  stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="font-semibold text-gray-900">{stat.label}</div>
                  <div className="text-sm text-gray-500">{stat.description}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center text-green-600 text-sm font-medium">
                <span>Ver detalhes</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Grid de Funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            href: "/hot/dashboard",
            icon: "📊",
            title: "Dashboard Analytics",
            description: "Estatísticas detalhadas e gráficos do sistema",
            color: "green",
            features: ["Dados temporais", "Métricas de eficiência", "Relatórios por período"]
          },
          {
            href: "/hot/entrada",
            icon: "📥",
            title: "Entrada de Medidas",
            description: "Adicione novas medidas para classificação",
            color: "green",
            features: ["Cole texto livre", "Processamento em lote", "Remoção de duplicatas"]
          },
          {
            href: "/hot/classificacao",
            icon: "🧩",
            title: "Classificação",
            description: "Classifique medidas com ajuda da IA",
            color: "purple",
            features: ["Sugestões automáticas", "Classificação manual", "Cópia por categoria"]
          },
          {
            href: "/hot/revisao",
            icon: "🧾",
            title: "Revisão Manual",
            description: "Revise medidas não classificadas",
            color: "yellow",
            features: ["Medidas pendentes", "Classificação manual", "Marcar como não classificada"]
          },
          {
            href: "/hot/biblioteca",
            icon: "📚",
            title: "Biblioteca",
            description: "Todas as medidas já classificadas",
            color: "orange",
            features: ["Busca avançada", "Editar classificações", "Exportar por categoria"]
          },
          {
            href: "/hot/historico",
            icon: "🕓",
            title: "Histórico",
            description: "Registro completo de atividades",
            color: "gray",
            features: ["Auditoria completa", "Detalhes das ações", "Registro temporal"]
          }
        ].map((card, index) => (
          <Link
            key={index}
            href={card.href}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-green-200"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform ${
              card.color === 'green' ? 'bg-green-100 text-green-600' :
              card.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
              card.color === 'purple' ? 'bg-purple-100 text-purple-600' :
              card.color === 'orange' ? 'bg-orange-100 text-orange-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {card.icon}
            </div>
           
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
              {card.title}
            </h3>
           
            <p className="text-gray-600 mb-4">
              {card.description}
            </p>
           
            <ul className="space-y-1">
              {card.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                  {feature}
                </li>
              ))}
            </ul>
           
            <div className="mt-4 flex items-center text-green-600 font-medium">
              <span>Acessar</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Informações Adicionais */}
      <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          🎯 Sobre a Classificação HOT
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            {
              icon: "👤",
              title: "HUMANO",
              description: "Medidas relacionadas a pessoas, treinamento e desenvolvimento",
              examples: "Treinamentos, conscientização, capacitação"
            },
            {
              icon: "🏢",
              title: "ORGANIZACIONAL",
              description: "Processos, políticas e estrutura organizacional",
              examples: "Políticas, procedimentos, governança"
            },
            {
              icon: "💻",
              title: "TÉCNICO",
              description: "Tecnologia, sistemas e infraestrutura",
              examples: "Firewall, backup, criptografia"
            }
          ].map((category, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-3">{category.icon}</div>
              <h4 className="font-bold text-gray-900 mb-2">{category.title}</h4>
              <p className="text-gray-600 text-sm mb-3">{category.description}</p>
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                Ex: {category.examples}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}