// 📄 components/Header.tsx - CÓDIGO COMPLETO CORRIGIDO
"use client"
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Link from 'next/link'
import { useTheme } from '../hooks/use-theme'

export default function Header() {
  const { user, loading, signOut, isAdmin } = useAuth()
  const { theme, toggleTheme, mounted } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
              <span>Carregando...</span>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-bold text-green-700">GSST</div>
              <div className="text-xs text-gray-600">Sistema HOT</div>
            </div>
          </Link>

          {/* Menu de Navegação */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-green-700 font-medium transition-colors"
            >
              Início
            </Link>
            {user && (
              <>
                <Link
                  href="/hot"
                  className="text-gray-700 hover:text-green-700 font-medium transition-colors"
                >
                  Módulo HOT
                </Link>
                {isAdmin && (
                  <Link
                    href="/gestao"
                    className="text-gray-700 hover:text-green-700 font-medium transition-colors"
                  >
                    Gestão
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Direita: Tema e Usuário */}
          <div className="flex items-center gap-4">
            {/* Botão de Tema */}
            {mounted ? (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            ) : (
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors opacity-50">
                🌙
              </button>
            )}

            {!user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-green-700 font-medium transition-colors flex items-center gap-2"
                >
                  <span>🔐</span>
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">{user.nome}</div>
                    <div className="text-xs text-gray-500 capitalize">{user.nivel}</div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-500 hidden sm:block transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    {/* Header do Menu - Mobile */}
                    <div className="sm:hidden px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{user.nome}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.nivel === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.nivel === 'admin' ? '👑 Administrador' : '👤 Usuário'}
                        </span>
                      </div>
                    </div>

                    {/* Links do Menu */}
                    <div className="py-2">
                      <Link
                        href="/perfil"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <span>👤</span>
                        Meu Perfil
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/gestao"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <span>🛠️</span>
                          Gestão do Sistema
                        </Link>
                      )}

                      <Link
                        href="/hot/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <span>📊</span>
                        Dashboard
                      </Link>
                    </div>

                    {/* Divisor */}
                    <div className="border-t border-gray-100 my-1"></div>

                    {/* Logout */}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span>🚪</span>
                      Sair do Sistema
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Menu Mobile */}
        {user && (
          <div className="md:hidden border-t border-gray-200 pt-4 pb-2">
            <nav className="flex gap-4 overflow-x-auto">
              <Link
                href="/"
                className="text-sm text-gray-700 hover:text-green-700 font-medium whitespace-nowrap"
              >
                Início
              </Link>
              <Link
                href="/hot"
                className="text-sm text-gray-700 hover:text-green-700 font-medium whitespace-nowrap"
              >
                Módulo HOT
              </Link>
              {isAdmin && (
                <Link
                  href="/gestao"
                  className="text-sm text-gray-700 hover:text-green-700 font-medium whitespace-nowrap"
                >
                  Gestão
                </Link>
              )}
              <Link
                href="/perfil"
                className="text-sm text-gray-700 hover:text-green-700 font-medium whitespace-nowrap"
              >
                Perfil
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}