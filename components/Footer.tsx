export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Sistema HOT</h3>
            <p className="text-gray-300 text-sm">
              Sistema de classificação de medidas de segurança em categorias
              Humano, Organizacional e Técnico.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Módulos</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>📥 Entrada de Medidas</li>
              <li>🧩 Classificação Automática</li>
              <li>🧾 Revisão Manual</li>
              <li>📚 Biblioteca</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Desenvolvido para</h3>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <span className="font-medium">GSST</span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          © 2024 Sistema HOT. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}