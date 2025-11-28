// PATH: /app/login/page.tsx
"use client"
import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<{ type: "success"|"error"; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
 
  const { user, signIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    if (!email || !password) {
      setMessage({ type: "error", text: "Preencha todos os campos." })
      setLoading(false)
      return
    }

    try {
      const result = await signIn(email, password)
      if (result.error) {
        setMessage({ type: "error", text: result.error.message || "E-mail ou senha incorretos." })
      } else {
        setMessage({ type: "success", text: "Login realizado com sucesso!" })
        setTimeout(() => router.push("/"), 1000)
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Erro no login." })
    } finally {
      setLoading(false)
    }
  }

  const clearForm = () => {
    setEmail("")
    setPassword("")
    setMessage(null)
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Você já está logado!</h2>
          <p className="text-gray-600 mb-6">Redirecionando para a página inicial...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-green-700">GSST</div>
              <div className="text-sm text-gray-600">Sistema HOT</div>
            </div>
          </Link>
         
          <h2 className="text-3xl font-bold text-gray-900">
            Acesse o Sistema
          </h2>
          <p className="mt-2 text-gray-600">
            Entre com suas credenciais para acessar o sistema de classificação HOT
          </p>
        </div>

        {/* Card do Formulário */}
<div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
  <h4 className="text-sm font-semibold text-blue-800 mb-2">⏰ Sessão Temporária</h4>
  <ul className="text-xs text-blue-700 space-y-1">
    <li>• Sua sessão expira automaticamente após 4 horas</li>
    <li>• Você será avisado 30 minutos antes da expiração</li>
    <li>• Faça login novamente se for desconectado</li>
    <li>• Salve seu trabalho regularmente</li>
  </ul>
</div>
        <Card className="p-8">
  <CardContent className="p-0">
    {/* O conteúdo permanece igual, só mudamos a estrutura */}
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

    <form onSubmit={handleSignIn} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          placeholder="seu@email.com"
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          placeholder="Sua senha"
          autoComplete="current-password"
        />
      </div>

      <Button 
        type="submit" 
        variant="primary" 
        size="lg" 
        loading={loading}
        className="w-full"
      >
        🚪 Entrar no Sistema
      </Button>
    </form>

    {/* Resto do conteúdo permanece igual */}
  </CardContent>
</Card>

        {/* Informações adicionais */}
        <div className="text-center text-sm text-gray-500">
          <p>🔐 Sistema seguro • 📊 Analytics em tempo real • 🚀 Classificação inteligente</p>
        </div>
      </div>
    </div>
  )
}