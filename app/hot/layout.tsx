import Link from "next/link"

export default function HotLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar do HOT */}
        <aside className="w-64 bg-gradient-to-b from-green-900 to-green-800 text-white min-h-screen sticky top-0">
          <div className="p-6">
            {/* Header da Sidebar */}
            <div className="mb-8">
              <Link href="/hot" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-white text-green-900 rounded-xl flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                  🔥
                </div>
                <div>
                  <div className="font-bold text-lg">Módulo HOT</div>
                  <div className="text-green-200 text-sm">Classificação Inteligente</div>
                </div>
              </Link>
            </div>

            {/* Navegação */}
            <nav className="space-y-2">
              {[
                { href: "/hot/dashboard", icon: "📊", label: "Dashboard", description: "Estatísticas e analytics" },
                { href: "/hot/entrada", icon: "📥", label: "Entrada", description: "Adicionar medidas" },
                { href: "/hot/classificacao", icon: "🧩", label: "Classificação", description: "Classificar medidas" },
                { href: "/hot/revisao", icon: "🧾", label: "Revisão", description: "Revisar pendentes" },
                { href: "/hot/biblioteca", icon: "📚", label: "Biblioteca", description: "Medidas classificadas" },
                { href: "/hot/historico", icon: "🕓", label: "Histórico", description: "Registro de atividades" }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-green-700 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-lg">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{item.label}</div>
                    <div className="text-green-200 text-xs">{item.description}</div>
                  </div>
                </Link>
              ))}
            </nav>

            {/* Voltar para Home */}
            <div className="mt-8 pt-6 border-t border-green-700">
              <Link
                href="/"
                className="flex items-center gap-3 p-3 text-green-200 hover:text-white hover:bg-green-700 rounded-xl transition-all"
              >
                <span>🏠</span>
                <span>Voltar ao Início</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Área Principal de Conteúdo */}
        <main className="flex-1 min-h-screen">
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}