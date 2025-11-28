// PATH: /app/gestao/editar/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import Link from "next/link";

// Use useParams hook para acessar parâmetros no client
export default function EditarUsuario({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success"|"error"; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Resolve os parâmetros async
    const resolveParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  async function fetchUser() {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/usuarios/${id}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const salvar = async () => {
    if (!user?.nome.trim()) {
      setMessage({ type: "error", text: "O nome é obrigatório." });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: user.nome,
          nivel: user.nivel
        })
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Usuário atualizado com sucesso!" });
        setTimeout(() => router.push("/gestao"), 1500);
      } else {
        const errorData = await response.json();
        setMessage({ type: "error", text: errorData.error || "Erro ao atualizar usuário." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao atualizar usuário." });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando usuário...</p>
      </div>
    </div>
  );

  if (!user && !loading) return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">❌</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Usuário não encontrado</h2>
      <p className="text-gray-600 mb-6">O usuário solicitado não existe ou foi removido.</p>
      <Link
        href="/gestao"
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
      >
        Voltar para Gestão
      </Link>
    </div>
  );

  return (
    <ProtectedRoute requiredLevel="admin">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/gestao"
              className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              ←
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">✏️ Editar Usuário</h1>
              <p className="text-gray-600">
                Atualize as informações do usuário
              </p>
            </div>
          </div>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          {/* Mensagens */}
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              <div className="flex items-center">
                <span className="text-lg mr-2">{message.type === "success" ? "✅" : "❌"}</span>
                {message.text}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome completo *
              </label>
              <input 
                value={user?.nome || ""} 
                onChange={(e) => setUser({...user, nome: e.target.value})} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input 
                value={user?.email || ""} 
                disabled 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500" 
              />
              <p className="text-xs text-gray-500 mt-2">O e-mail não pode ser alterado</p>
            </div>

            {/* Nível */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de usuário *
              </label>
              <select 
                value={user?.nivel || "usuario"} 
                onChange={(e) => setUser({...user, nivel: e.target.value})} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="usuario">👤 Usuário Comum</option>
                <option value="admin">👑 Administrador</option>
              </select>
            </div>

            {/* Data de Criação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Cadastro
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                <div className="text-gray-900">
                  {user?.criado_em ? new Date(user.criado_em).toLocaleDateString('pt-BR') + ' às ' + new Date(user.criado_em).toLocaleTimeString('pt-BR') : 'Carregando...'}
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-4">
              <button 
                onClick={salvar} 
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    💾 Salvar Alterações
                  </>
                )}
              </button>
             
              <Link
                href="/gestao"
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
              >
                ❌ Cancelar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}