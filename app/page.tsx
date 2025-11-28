// 📄 app/page.tsx - VERSÃO CORRIGIDA
import Link from "next/link";
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-green-700 mb-4">Painel Geral — Sistema HOT</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sistema inteligente de classificação de medidas de segurança em categorias
          Humano, Organizacional e Técnico.
        </p>
      </div>
     
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* CARD DO MÓDULO HOT - CORRIGIDO */}
        <Card hover className="p-8 group">
          <CardContent className="text-center p-0">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🔥</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Módulo HOT</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Entrada → Classificação por remessa → Revisão → Biblioteca → Histórico
            </p>
            <Link href="/hot" className="block w-full">
              <Button variant="primary" className="w-full">
                Acessar Módulo →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* CARD DE GESTÃO - CORRIGIDO */}
        <Card hover className="p-8 group">
          <CardContent className="text-center p-0">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🛠️</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Gestão do Sistema</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Gerenciamento de usuários e permissões do sistema (acesso administrativo).
            </p>
            <Link href="/gestao" className="block w-full">
              <Button variant="primary" className="w-full">
                Acessar Gestão →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <div className="mt-16 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
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
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
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
  );
}